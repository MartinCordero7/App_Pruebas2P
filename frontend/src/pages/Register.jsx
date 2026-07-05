import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Alert, Select } from '../components/UI';
import { validateForm } from '../utils/validation';

export function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'resident'
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    const rules = {
      username: { required: true, minLength: 3 },
      email: { required: true, type: 'email' },
      password: { required: true, minLength: 6 }
    };

    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Crear Cuenta
        </h1>

        {error && <Alert type="error" message={error} />}

        <form data-cy="register-form" onSubmit={handleSubmit}>
          <Input
            label="Nombre de Usuario"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={validationErrors.username}
            required
            data-cy="register-username"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
            required
            data-cy="register-email"
          />

          <Input
            label="Nombre"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            data-cy="register-firstName"
          />

          <Input
            label="Apellido"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            data-cy="register-lastName"
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
            required
            data-cy="register-password"
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            data-cy="register-confirmPassword"
          />

          <Select
            label="Rol"
            name="role"
            value={formData.role}
            onChange={handleChange}
            data-cy="register-role"
          >
            <option value="resident">Residente</option>
            <option value="syndic">Síndico</option>
            <option value="admin">Administrador</option>
          </Select>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mb-4"
            data-cy="register-submit"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>

        <p className="text-center text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
