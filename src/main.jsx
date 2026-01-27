// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'; // ← Подключаем стили

// Страницы
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Обёртка для защищённых маршрутов
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const authenticated = sessionStorage.getItem('authenticated');
    if (!authenticated) {
      navigate('/');
    }
  }, [navigate]);

  return children;
}

// Основной компонент приложения
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// Запуск приложения
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
