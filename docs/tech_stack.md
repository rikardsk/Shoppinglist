# Shopping List Application Tech Stack

This document outlines the primary frameworks, libraries, and tools used to build the Shopping List application.

## Core Frameworks & Languages

### [React](https://react.dev/)
- **Description**: The core library for building the user interface. It manages the component-based architecture and state of the application.
- **Role**: Handles all UI rendering, list management, and overall application logic.

### [TypeScript](https://www.typescriptlang.org/)
- **Description**: A strongly typed superset of JavaScript.
- **Role**: Ensures code quality and provides better developer tooling (autocompletion, error checking) throughout the project.

### [Create React App (CRA)](https://create-react-app.dev/)
- **Description**: The build system and environment setup tool.
- **Role**: Provides the development server, manages dependencies, and handles the production build process (using `react-scripts`).

---

## UI & User Experience

### [@dnd-kit](https://dndkit.com/)
- **Description**: A modern, modular drag-and-drop toolkit.
- **Role**: Powers the ability to reorder items within categories and move items between different category sections.

### [Framer Motion](https://www.framer.com/motion/)
- **Description**: A production-ready motion library for React.
- **Role**: Used for smooth transitions, list animations, and enhancing the "glassmorphism" aesthetic with subtle motion effects.

### [Lucide React](https://lucide.dev/)
- **Description**: A clean and consistent icon library.
- **Role**: Provides the visual icons for actions like deleting, editing, moving, and checking off items.

### [Canvas Confetti](https://www.kirilv.com/canvas-confetti/)
- **Description**: A lightweight confetti animation library.
- **Role**: Adds a "wow" factor by triggering animations when the user successfully completes their shopping list.

---

## Performance & Offline Support

### [Workbox](https://developer.chrome.com/docs/workbox/)
- **Description**: A set of libraries for adding PWA (Progressive Web App) support.
- **Role**: Handles service worker management, precaching assets, and ensuring the app works offline or on slow network connections.

---

## Testing & Quality Assurance

### [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) & [Jest](https://jestjs.io/)
- **Description**: Tools for testing React components.
- **Role**: Used to verify that components render correctly and that user interactions (like adding/deleting items) behave as intended.
