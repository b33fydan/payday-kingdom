import { useMemo, useState } from 'react';
import { useBudgetStore } from '../../store/budgetStore.js';
import { useGameStore } from '../../store/gameStore.js';
import { BILL_CATEGORY_COLORS } from '../../utils/voxelBuilder.js';
import { soundManager } from '../../utils/soundManager.js';

const BILL_CATEGORIES = [
  { value: 'housing', label: 'Housing' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'phone', label: 'Phone' },
  { value: 'transport', label: 'Transport' },
  { value: 'food', label: 'Food' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' }
];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function toNumber(value) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

export default function BudgetPanel({ className = '', mobile = false }) {
  const income = useBudgetStore((state) => state.income);
  const bills = useBudgetStore((state) => state.bills);
  const setIncome = useBudgetStore((state) => state.setIncome);
  const addBill = useBudgetStore((state) => state.addBill);
  const removeBill = useBudgetStore((state) => state.removeBill);
  const getSurplus = useBudgetStore((state) => state.getSurplus);

  const isInBattle = useGameStore((state) => state.isInBattle);
  const requestBattle = useGameStore((state) => state.requestBattle);

  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    amount: '',
    category: 'housing'
  });

  const surplus = useMemo(() => getSurplus(), [income, bills, getSurplus]);

  const handleIncomeChange = (event) => {
    setIncome(toNumber(event.target.value));
  };

  const handleSaveBill = () => {
    const trimmedName = formState.name.trim();
    if (!trimmedName) {
      return;
    }

    addBill({
      name: trimmedName,
      amount: toNumber(formState.amount),
      category: formState.category,
      dueDay: 1
    });

    soundManager.playBillAdd();

    setFormState({
      name: '',
      amount: '',
      category: 'housing'
    });
    setShowForm(false);
  };

  const handleRemoveBill = (billId) => {
    removeBill(billId);
    soundManager.playBillRemove();
  };

  const handleTriggerPayday = () => {
    if (isInBattle || bills.length === 0) {
      return;
    }

    soundManager.playPaydayStart();
    requestBattle(bills);
  };

  return (
    <aside className={`h-full w-full overflow-hidden bg-slate-900 text-slate-100 ${className}`}>
      <div className="flex h-full flex-col">
        <div className={`flex-1 overflow-y-auto px-4 ${mobile ? 'pb-5 pt-2' : 'pb-6 pt-5'} lg:px-6`}>
          <h1 className="font-pixel text-lg leading-tight text-amber-300 md:text-[1.15rem]">💰 Your Kingdom Treasury</h1>

          <section className="mt-4 rounded-xl border border-slate-700 bg-slate-800/65 p-4">
            <label htmlFor={`income-input-${mobile ? 'mobile' : 'desktop'}`} className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Monthly Income
            </label>
            <div className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-600 bg-slate-950 px-3 py-2">
              <span className="text-amber-300">$</span>
              <input
                id={`income-input-${mobile ? 'mobile' : 'desktop'}`}
                type="number"
                min="0"
                inputMode="decimal"
                value={income || ''}
                onChange={handleIncomeChange}
                placeholder="0"
                className="w-full bg-transparent text-lg text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-slate-700 bg-slate-800/65 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-100">📋 Bills (Monsters to Slay)</p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="min-h-11 rounded-lg border border-slate-500 bg-slate-700 px-3 text-sm font-semibold text-slate-100 transition-colors hover:border-amber-300 hover:bg-slate-600"
              >
                + Add Bill
              </button>
            </div>

            <div className="space-y-2">
              {bills.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-600 px-3 py-4 text-sm text-slate-400">
                  No bills yet. Add one to spawn a monster.
                </p>
              ) : (
                bills.map((bill) => {
                  const billColor = BILL_CATEGORY_COLORS[bill.category] ?? BILL_CATEGORY_COLORS.other;

                  return (
                    <div
                      key={bill.id}
                      className="flex min-h-11 items-center justify-between rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: billColor }} aria-hidden="true" />
                        <span className="text-sm text-slate-100">
                          {bill.name} <span className="text-slate-400">{formatCurrency(bill.amount)}</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBill(bill.id)}
                        className="min-h-11 rounded px-2 py-1 text-sm text-rose-300 transition-colors hover:bg-rose-500/20 hover:text-rose-100"
                        aria-label={`Delete ${bill.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {showForm && (
              <div className="mt-4 rounded-lg border border-slate-600 bg-slate-900 p-3">
                <label htmlFor={`bill-name-${mobile ? 'mobile' : 'desktop'}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Bill Name
                </label>
                <input
                  id={`bill-name-${mobile ? 'mobile' : 'desktop'}`}
                  type="text"
                  placeholder="e.g., Rent"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  className="mb-3 min-h-11 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-300"
                />

                <label htmlFor={`bill-amount-${mobile ? 'mobile' : 'desktop'}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Amount
                </label>
                <div className="mb-3 flex min-h-11 items-center gap-2 rounded border border-slate-600 bg-slate-950 px-3 py-2">
                  <span className="text-amber-300">$</span>
                  <input
                    id={`bill-amount-${mobile ? 'mobile' : 'desktop'}`}
                    type="number"
                    min="0"
                    inputMode="decimal"
                    placeholder="0"
                    value={formState.amount}
                    onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>

                <label htmlFor={`bill-category-${mobile ? 'mobile' : 'desktop'}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Category
                </label>
                <select
                  id={`bill-category-${mobile ? 'mobile' : 'desktop'}`}
                  value={formState.category}
                  onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
                  className="min-h-11 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-300"
                >
                  {BILL_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveBill}
                    className="min-h-11 flex-1 rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="min-h-11 flex-1 rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="mt-4 rounded-xl border border-slate-700 bg-slate-800/65 p-4 text-sm">
            <p className="font-semibold text-amber-200">Surplus: {formatCurrency(surplus)}</p>
          </section>
        </div>

        <div className="border-t border-slate-700 bg-slate-900/95 p-4">
          <button
            type="button"
            onClick={handleTriggerPayday}
            disabled={isInBattle || bills.length === 0}
            className="min-h-11 w-full rounded-xl bg-amber-400 px-4 py-3 text-base font-black tracking-wide text-slate-950 shadow-[0_0_20px_rgba(250,204,21,0.55)] transition-all hover:-translate-y-0.5 hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-200 disabled:shadow-none"
          >
            {isInBattle ? '⚔️ BATTLE IN PROGRESS...' : '⚔️ TRIGGER PAYDAY'}
          </button>
        </div>
      </div>
    </aside>
  );
}
