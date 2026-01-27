import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const authenticated = sessionStorage.getItem('authenticated');
    if (!authenticated) {
      navigate('/');
    }
  }, [navigate]);

  return <Outlet />;
}
