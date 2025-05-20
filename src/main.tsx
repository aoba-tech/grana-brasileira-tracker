
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  const storedTheme = localStorage.getItem('theme');
  const root = window.document.documentElement;
  
  if (storedTheme) {
    root.classList.add(storedTheme);
  } else {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  }
};

initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
