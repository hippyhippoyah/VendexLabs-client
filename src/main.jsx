import { Buffer } from 'buffer';
import process from 'process';

// Make Buffer, process, and global available globally for amazon-cognito-identity-js
window.Buffer = Buffer;
window.process = process;
if (typeof global === 'undefined') {
  window.global = globalThis;
}

import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from "react-router-dom";
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')).render(
  <Router>
    <App />
  </Router>
)