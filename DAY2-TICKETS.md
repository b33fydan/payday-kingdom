# Day 2 Tickets: Budget System & UI Wiring

## TICKET 4: PK-004 — Zustand Budget Store

Create src/store/budgetStore.js with Zustand state management.

State shape:
```javascript
{
  income: 0,
  bills: [
    {
      id: 'uuid',
      name: 'Rent',
      amount: 1200,
      category: 'housing',
      icon: 'rent',
      isPaid: false,
      dueDay: 1,
    }
  ],
  paydayDate: 1,
  currentMonth: '2026-02',
  history: [
    { month: '2026-01', totalBills: 2400, totalPaid: 2400, surplus: 600 }
  ],
}
```

Actions needed:
- setIncome(amount)
- addBill({ name, amount, category, dueDay })
- removeBill(id)
- updateBill(id, updates)
- markBillPaid(id)
- triggerPayday() - resets unpaid state for new month
- getSurplus() - computed: income - total bills
- getMonthsCompleted() - computed: history.length

Persist to localStorage with a 'payday-kingdom-budget' key.

---

## TICKET 5: PK-005 — Budget Entry UI

Create src/components/ui/BudgetPanel.jsx

This is the left panel (40vw width). It should have:

Layout:
- Title: '💰 Your Kingdom Treasury' (gold text)
- Income input section:
  - Label: 'Monthly Income'
  - Text input with $ prefix, placeholder '$ 0'
  - onChange updates the store in real-time
- Bills section:
  - Label: '📋 Bills (Monsters to Slay)'
  - List of existing bills:
    - Each bill shows: color dot (category), name, amount, delete button (✕)
    - Color dots match the monster colors from voxelBuilder.js (red for rent, yellow for electric, etc.)
  - [+ Add Bill] button opens a form
- Bill form modal/panel:
  - Input: Bill name (placeholder: 'e.g., Rent')
  - Input: Amount (number, $ prefix)
  - Select: Category (housing, utilities, phone, transport, food, entertainment, other)
  - Buttons: [Save] [Cancel]
- Summary section:
  - Display: 'Surplus: $X,XXX'
  - Display: 'Months Survived: N'
- Large button: '[⚔️ TRIGGER PAYDAY]' (gold background, glowing effect)

Styling:
- Dark slate background (slate-900)
- Use pixel/retro font for headings (import 'Press Start 2P' from Google Fonts if available, fallback to monospace)
- Color-coded categories matching monster colors
- Hover animations on bills (slight scale up)
- Use Tailwind for all styling

Wire to budgetStore — all inputs should update store in real-time.

---

## TICKET 6: PK-006 — Connect Budget Store to Scene

Update src/components/scene/IslandScene.jsx to render dynamic content based on budgetStore state.

Rules:
- Each bill → one monster on the island, sized by amount:
  - < $100 → small (0.7 scale)
  - $100-500 → medium (1.0 scale)
  - $500+ → large (1.3 scale)
- Monster color matches bill category (use the category-to-color mapping from voxelBuilder COLORS)
- Monsters positioned in a semi-circle around the island center
- Income value → a gold pile (use createVoxel with gold color) near center, size scales with income ($5k = 2.0 scale, $1k = 0.5 scale, min 0.3)
- If no bills entered → show a '?' block (gray) in center
- Scene updates reactively when bills are added/removed/updated

Implementation:
- Use a useEffect hook that watches budgetStore state
- When state changes, rebuild the monsters group and income pile
- Use createMonster() and createVoxel() from voxelBuilder.js
- Position monsters in a semi-circle: loop through bills, space them around a circle radius of 3-4 units
- Position income pile at (0, 0.5, 0)

Make sure the scene cleans up old objects before adding new ones (to prevent memory leaks).

---

## Acceptance Criteria (All Tickets)

1. PK-004: budgetStore persists to localStorage, all actions work correctly, computed values calculate properly
2. PK-005: Budget panel renders on left side, income input works, bills can be added/removed, UI is responsive
3. PK-006: Monsters appear on island when bills are added, colors/sizes match amounts, gold pile appears for income, scene updates reactively

Test by: entering income of $4500, adding 4 bills (Rent $1200, Electric $150, Phone $85, Insurance $200), and verifying monsters spawn correctly with correct colors and sizes.
