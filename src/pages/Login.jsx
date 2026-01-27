import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkPassword } from '../utils/auth';

export default function Login() {
  const [pwd, setPwd] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checkPassword(pwd)) {
      sessionStorage.setItem('authenticated', 'true');
      navigate('/dashboard');
    } else {
      alert('Неверный пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-xl mb-4 text-center">Доступ к проектам</h2>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white mb-3 outline-none"
          placeholder="Пароль"
          autoFocus
        />
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded font-medium"
        >
          Войти
        </button>
      </form>
    </div>
  );
}
