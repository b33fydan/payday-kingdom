import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const BUDGET_STORAGE_KEY = 'payday-kingdom-budget';
const KINGDOM_STORAGE_KEY = 'payday-kingdom-kingdom';
const DEFAULT_KINGDOM_NAME = 'My Payday Kingdom';
const DEFAULT_BANNER_COLOR = 'gold';

function formatMonth(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function toNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function getNextMonth(monthString) {
  const [year, month] = monthString.split('-').map(Number);
  const next = new Date(year, month, 1);
  return formatMonth(next);
}

function getStorage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

function sanitizeKingdomName(value) {
  const next = String(value ?? '').trim();
  return next || DEFAULT_KINGDOM_NAME;
}

function sanitizeBannerColor(value) {
  const next = String(value ?? '').trim().toLowerCase();
  return next || DEFAULT_BANNER_COLOR;
}

function readKingdomMetadata() {
  const storage = getStorage();
  if (!storage) {
    return {
      kingdomName: DEFAULT_KINGDOM_NAME,
      bannerColor: DEFAULT_BANNER_COLOR
    };
  }

  try {
    const raw = storage.getItem(KINGDOM_STORAGE_KEY);
    if (!raw) {
      return {
        kingdomName: DEFAULT_KINGDOM_NAME,
        bannerColor: DEFAULT_BANNER_COLOR
      };
    }

    const parsed = JSON.parse(raw);
    return {
      kingdomName: sanitizeKingdomName(parsed?.kingdomName),
      bannerColor: sanitizeBannerColor(parsed?.bannerColor)
    };
  } catch {
    return {
      kingdomName: DEFAULT_KINGDOM_NAME,
      bannerColor: DEFAULT_BANNER_COLOR
    };
  }
}

function writeKingdomMetadata({ kingdomName, bannerColor }) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      KINGDOM_STORAGE_KEY,
      JSON.stringify({
        kingdomName: sanitizeKingdomName(kingdomName),
        bannerColor: sanitizeBannerColor(bannerColor)
      })
    );
  } catch {
    // Ignore localStorage write failures.
  }
}

const initialMonth = formatMonth(new Date());
const initialKingdom = readKingdomMetadata();

export const useBudgetStore = create(
  persist(
    (set, get) => ({
      income: 0,
      bills: [],
      paydayDate: 1,
      currentMonth: initialMonth,
      history: [],
      kingdomName: initialKingdom.kingdomName,
      bannerColor: initialKingdom.bannerColor,
      setIncome: (amount) => {
        set({ income: Math.max(0, toNumber(amount, 0)) });
      },
      addBill: ({ name, amount, category, dueDay }) => {
        const safeName = String(name ?? '').trim();
        if (!safeName) {
          return;
        }

        const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
        const safeCategory = String(category ?? 'other');
        const safeDueDay = Math.max(1, Math.min(31, Math.round(toNumber(dueDay, 1))));
        const safeAmount = Math.max(0, toNumber(amount, 0));

        set((state) => ({
          bills: [
            ...state.bills,
            {
              id,
              name: safeName,
              amount: safeAmount,
              category: safeCategory,
              icon: safeCategory,
              isPaid: false,
              dueDay: safeDueDay
            }
          ]
        }));
      },
      removeBill: (id) => {
        set((state) => ({
          bills: state.bills.filter((bill) => bill.id !== id)
        }));
      },
      updateBill: (id, updates) => {
        set((state) => ({
          bills: state.bills.map((bill) => {
            if (bill.id !== id) {
              return bill;
            }

            const next = { ...bill, ...updates };

            if (updates?.amount !== undefined) {
              next.amount = Math.max(0, toNumber(updates.amount, bill.amount));
            }

            if (updates?.dueDay !== undefined) {
              next.dueDay = Math.max(1, Math.min(31, Math.round(toNumber(updates.dueDay, bill.dueDay))));
            }

            if (updates?.name !== undefined) {
              next.name = String(updates.name).trim() || bill.name;
            }

            if (updates?.category !== undefined) {
              next.category = String(updates.category || bill.category);
              next.icon = next.category;
            }

            return next;
          })
        }));
      },
      markBillPaid: (id) => {
        set((state) => ({
          bills: state.bills.map((bill) => (bill.id === id ? { ...bill, isPaid: true } : bill))
        }));
      },
      triggerPayday: () => {
        set((state) => {
          const totalBills = state.bills.reduce((sum, bill) => sum + bill.amount, 0);
          const totalPaid = state.bills.reduce((sum, bill) => sum + (bill.isPaid ? bill.amount : 0), 0);
          const surplus = state.income - totalBills;

          return {
            history: [
              ...state.history,
              {
                month: state.currentMonth,
                totalBills,
                totalPaid,
                surplus
              }
            ],
            currentMonth: getNextMonth(state.currentMonth),
            bills: state.bills.map((bill) => ({ ...bill, isPaid: false }))
          };
        });
      },
      getSurplus: () => {
        const { income, bills } = get();
        const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
        return income - totalBills;
      },
      getMonthsCompleted: () => get().history.length,
      setKingdomName: (name) => {
        const nextName = sanitizeKingdomName(name);
        set((state) => {
          const next = {
            ...state,
            kingdomName: nextName
          };
          writeKingdomMetadata({
            kingdomName: next.kingdomName,
            bannerColor: next.bannerColor
          });
          return {
            kingdomName: next.kingdomName
          };
        });
      },
      setBannerColor: (color) => {
        const nextColor = sanitizeBannerColor(color);
        set((state) => {
          const next = {
            ...state,
            bannerColor: nextColor
          };
          writeKingdomMetadata({
            kingdomName: next.kingdomName,
            bannerColor: next.bannerColor
          });
          return {
            bannerColor: next.bannerColor
          };
        });
      }
    }),
    {
      name: BUDGET_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const merged = {
          ...currentState,
          ...(persistedState ?? {})
        };
        const kingdomFromLocal = readKingdomMetadata();
        return {
          ...merged,
          kingdomName: sanitizeKingdomName(kingdomFromLocal.kingdomName || merged.kingdomName),
          bannerColor: sanitizeBannerColor(kingdomFromLocal.bannerColor || merged.bannerColor)
        };
      }
    }
  )
);
