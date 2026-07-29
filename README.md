# AI Code Review Assistant

![AI Code Review Logo](frontend/public/logo.jpg)

An advanced, modern AI-powered code review platform built with React & Vite. It provides real-time analysis, smart vulnerability detection, and a premium Glassmorphism dashboard for developers.

## Features

- **Real-Time Code Analysis**: Get instant AI feedback while writing code inside the browser with Monaco Editor integration.
- **Repository Scanning**: Upload files or paste a GitHub URL to perform full-scale static analysis.
- **Glassmorphism UI**: A highly polished, modern user interface built from scratch using custom CSS with smooth Framer Motion animations.
- **Dynamic Dashboard**: View security vulnerabilities, performance metrics, and maintainability scores in beautiful charts.
- **Developer Settings**: Seamless light/dark mode toggles, code editor configuration (Minimap, Word Wrap), and interactive account preferences.

## Technology Stack

- **Frontend**: React 18, Vite
- **Routing**: React Router DOM
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charting**: Recharts
- **Styling**: Vanilla CSS (CSS Variables, Grid, Flexbox, Glassmorphism)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/LazmodBerk/AI-Code-Review-Assistant.git
   cd AI-Code-Review-Assistant/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```text
frontend/
├── src/
│   ├── api/            # API client configurations (axios)
│   ├── components/     # Reusable UI components
│   │   ├── dashboard/  # Dashboard specific components (Charts, Tables)
│   │   ├── layout/     # Structural components (TopNav)
│   │   └── ui/         # Base UI components (Button, Card, Badge)
│   ├── pages/          # Full page views (Upload, Results, Profile, Settings)
│   ├── App.tsx         # Main application router
│   ├── index.css       # Global stylesheet (Theme definitions & Shims)
│   └── main.tsx        # Application entry point
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Contributing

Contributions are always welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.
