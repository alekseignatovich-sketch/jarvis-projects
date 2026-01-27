// src/App.jsx
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Routes, Route } from 'react-router-dom';

function ProtectedRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = sessionStorage.getItem('authenticated');
    if (!auth) {
      navigate('/');
    }
  }, [navigate]);

  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
