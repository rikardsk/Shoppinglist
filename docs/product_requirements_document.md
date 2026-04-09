# Product Requirements Document (PRD): Mina Inköp (Shopping List)

**Live Application**: [https://rikardsk.github.io/Shoppinglist/](https://rikardsk.github.io/Shoppinglist/)

## 1. Vision & Purpose
**Mina Inköp** (My Shopping) is a premium, mobile-first Progressive Web App (PWA) designed to make grocery shopping frictionless and visually delightful. It combines a high-end "glassmorphism" aesthetic with powerful organizational tools like cross-category drag-and-drop and a dedicated "Shopping Mode."

---

## 2. Target Audience
- **Everyday Shoppers**: Users who need a quick way to manage their groceries on the go.
- **Organized Households**: Families who want to categorize items by store aisle.
- **Offline Users**: People in stores with poor connectivity who need their list to be reliable.

---

## 3. Key Functional Requirements

### 3.1 Item Management
- **Smart Adding**: Fast input with category suggestions.
- **Quantity & Units**: Support for adjusting counts and specific units (st, kg, l, etc.).
- **Quick-Add (Vanliga varor)**: A customizable shelf of frequently bought items for one-tap addition.
- **Duplicate Prevention**: Intelligently updates quantities if an item is added twice.

### 3.2 Categorization & Reordering
- **Auto-Grouping**: Items are visually grouped by categories (Mejeri, Frukt & Grönt, etc.).
- **Drag-and-Drop**: Full support for reordering items within a list or moving them between categories.
- **Category Customization**: Users can add, rename, recolor, or delete categories.

### 3.3 Application Modes
- **Edit Mode (Default)**: Full control over adding, deleting, and reordering.
- **Shopping Mode (Locked)**: Disables destructive UI elements (delete/reorder) to prevent accidental taps while navigating a physical store.
- **Table View**: A compact, sortable alternative to the category-based layout.

### 3.4 Sharing & Persistence
- **URL Sharing**: Entire lists can be encoded into a URL and shared via message/email.
- **Import/Merge**: Ability to merge shared lists into existing ones.
- **Local Persistence**: Data is stored locally; history restoration is available if the list is cleared.

---

## 4. Design & UX Requirements
- **Aesthetic**: Premium "Glassmorphism" (frosted glass, vibrant gradients, subtle shadows).
- **Animations**: Smooth transitions using Framer Motion for list changes and completions.
- **Theme Support**: First-class support for both Light and Dark modes.
- **Celebration**: Visual feedback (confetti) upon completing all items in a list.

---

## 5. Technical Requirements
- **Core Stack**: React, TypeScript, Vite/CRA.
- **Offline Support**: Full PWA capabilities (Service Workers) for offline reliability.
- **Storage**: LocalStorage-based persistence (No backend required for core privacy).
- **Print-Friendly**: Dedicated CSS for clean, multi-column physical prints.

---

## 6. Future Scope (Roadmap)
- **Collaborative Sync**: Real-time multi-user synchronization.
- **Price Tracking**: Estimated total calculation.
- **Recipe Integration**: Import ingredients directly from recipe URLs.
- **Haptic Feedback**: Improved mobile feel on item toggle.
