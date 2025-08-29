// VERSÃO CORRETA para o arquivo src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // <-- 1. Importe o componente App
import './index.css';     // (ou seu arquivo de CSS global)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App /> {/* <-- 2. Renderize o componente App */}
  </React.StrictMode>,
);