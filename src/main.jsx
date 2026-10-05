import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // 이 한 줄이 핵심이다. Tailwind CSS를 앱 전체에 혈관처럼 쫙 주입해 준다.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);