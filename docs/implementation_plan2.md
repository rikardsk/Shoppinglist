# Finalized Grocery App Features Plan

We have an incredible blueprint! This incorporates all 8 of your requests. These updates will turn the app into an incredibly powerful and polished tool.

## Proposed Changes

### 1. Collapsible Categories (Filter / Minimize)
**Component UI (`src/components/GroceryList.tsx`)**
- Instead of a flat list, we will visually **group items by category**.
- Each category will have a slick header, e.g., `🍎 Frukt & Grönt (3)`.
- **Minimize feature**: Clicking the header will smoothly collapse or expand that category's items, letting you hide sections you are done with or don't want to see right now!

### 2. Item Quantities & Duplicate Prevention
**Data Model (`src/types.ts`)**
- Add an optional `quantity?: number` property to `GroceryItem` (defaults to 1).

**State Management (`src/App.tsx`)**
- **Duplicate Handling**: In `handleAddItem`, if you type an item that already exists, it won't create a duplicate row. Instead, it will neatly **increment its quantity**.
- **Quantity Controls**: Add `+` and `-` buttons on the right side of line items. The quantity will be displayed inline (e.g. `2x Bananer`).

### 3. Quick-Add Shortcut Buttons (Toggle On/Off)
**Component UI (`src/components/AddItemForm.tsx`)**
- Below the input form, we'll add a scrollable row of "Vanliga varor" (Common Items) chips (like Mjölk 🥛, Bröd 🍞, Ägg 🥚, Kaffe ☕, Bananer 🍌, Smör 🧈).
- **Toggle Logic**: Clicking a chip adds it to your list (and it lights up). Clicking it again removes it!

### 4. Category Icons
**Component UI (`src/components/GroceryItem.tsx`)**
- We'll inject beautiful Lucide icons directly into the category pills:
  - `Frukt & Grönt` -> 🍎 Apple
  - `Mejeri` -> 🥛 Milk
  - `Kött` -> 🥩 Beef
  - `Bageri` -> 🥐 Croissant
  - `Frysvaror` -> ❄️ Snowflake
  - `Skafferi` -> 🥫 Package
  - `Övrigt` -> 🛍️ ShoppingBag

### 5. "Clear All" & History Restore
**State Management (`src/App.tsx`)**
- **Clear All**: A `handleClearAll` function wipes the list after a `window.confirm` warning, while saving the old list to `localStorage`.
- **Restore**: When the list is completely empty, a gorgeous "Återställ senaste listan" (Restore last list) button appears to instantly bring back your previous shopping trip so you don't have to start from scratch.

### 6. Printer Button (Clean Text)
**Component UI (`src/App.tsx` & `src/index.css`)**
- A subtle Printer icon up in the top header triggers `window.print()`.
- An aggressive `@media print` CSS block will strip away all buttons, backgrounds, forms, and shadows, transforming the page into a strict, black-and-white plain text list perfect for a physical printout.

## Open Questions
> [!IMPORTANT]
> **This is the complete roadmap!** Do you approve of:
> 1. Auto-incrementing the quantity when a duplicate item is added?
> 2. The 6 common items chosen for the quick-add shortcuts (Mjölk, Bröd, osv)?
> 
> *Once you give me the green light on this plan, I will immediately begin coding these out!*

## Verification Plan
1. Check grouped categories can be clicked to minimize/collapse.
2. Verify adding duplicates increments the inline quantity counter, and test `+`/`-` buttons.
3. Verify toggle behavior of Quick-add chips.
4. Test "Clear All", verify the prompt, and ensure "Restore History" successfully brings them back.
5. Hit the Print button and inspect the plain-text print preview.
