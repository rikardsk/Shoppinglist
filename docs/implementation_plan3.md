# Implementation Plan – Dark Mode & Copy as Text

I've outlined a plan to bring Dark Mode and a "Copy to Clipboard" feature to the shopping list.

## User Review Required

> [!IMPORTANT]
> - **Theme State**: The theme will be toggleable via a Sun/Moon icon in the header. Should it follow system settings (auto) initially, or just default to light?
> - **Copy Format**: I suggest the following format:
>   ```
>   🛒 Mina Inköp (2024-04-01)
>   -----------------------
>   GRÖNSAKER
>   - Tomater (2st)
>   - Gurka
>   ...
>   ```
>   Is this format acceptable?

## Proposed Changes

### Core Styling

#### [MODIFY] [index.css](file:///c:/Users/rikar/OneDrive/Skrivbord/Shoppinglist/src/index.css)
- Add `:root[data-theme='dark']` variables.
- Design a deep navy/slate palette for dark mode.
- Ensure the background gradient adapts.

### UI Components

#### [MODIFY] [App.tsx](file:///c:/Users/rikar/OneDrive/Skrivbord/Shoppinglist/src/App.tsx)
- **Theme Handling**:
    - Add `theme` state and persistence in `localStorage`.
    - Apply `data-theme` to `document.documentElement` via `useEffect`.
- **Clipboard Functionality**:
    - Add `handleCopyAsText` to group items by category and copy to clipboard.
- **Header Updates**:
    - Add a button group for Print, Theme, and Copy.
    - Import `Sun`, `Moon`, and `ClipboardCopy` icons.

#### [MODIFY] [App.module.css](file:///c:/Users/rikar/OneDrive/Skrivbord/Shoppinglist/src/App.module.css)
- Style the header button group.
- Ensure consistent hover effects and glassmorphism styling.

## Verification Plan

### Manual Verification
- **Dark Mode**: Toggle theme, verify color changes and persistence across refreshes.
- **Copy**: Click copy, paste in another app, and verify formatting and item count.
- **Responsiveness**: Ensure the header buttons stay centered or properly aligned on narrow screens.
