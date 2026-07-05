import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Alert } from '../components/UI';

export function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Condominio Manager
        </h1>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit}>
          <Input
            label="Usuario"
            type="text"
            name="username"
            data-cy="username"
            value={credentials.username}
            onChange={handleChange}
            placeholder="Tu usuario"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            data-cy="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Tu contraseña"
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full mb-4"
            data-cy="login-btn"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <p className="text-center text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
