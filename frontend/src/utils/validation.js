// Validation utilities

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\d{7,15}$/;
  return re.test(phone.replace(/\D/g, ''));
};

export const validateID = (id) => {
  return id && id.length >= 5;
};

export const validateCurrency = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

export const validateForm = (formData, rules) => {
  const errors = {};

  Object.entries(rules).forEach(([field, rule]) => {
    const value = formData[field];

    if (rule.required && !validateRequired(value)) {
      errors[field] = `${field} es requerido`;
    }

    if (rule.type === 'email' && value && !validateEmail(value)) {
      errors[field] = 'Email inválido';
    }

    if (rule.type === 'phone' && value && !validatePhone(value)) {
      errors[field] = 'Teléfono inválido';
    }

    if (rule.type === 'currency' && value && !validateCurrency(value)) {
      errors[field] = 'Valor debe ser numérico positivo';
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `Mínimo ${rule.minLength} caracteres`;
    }

    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `Máximo ${rule.maxLength} caracteres`;
    }
  });

  return errors;
};
