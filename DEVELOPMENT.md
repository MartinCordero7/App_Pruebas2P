# Guía de Desarrollo - Administración de Condominios

Este documento proporciona instrucciones detalladas para desarrolladores que deseen trabajar en esta aplicación.

## Tabla de Contenidos

1. [Arquitectura](#arquitectura)
2. [Backend](#backend)
3. [Frontend](#frontend)
4. [Base de Datos](#base-de-datos)
5. [Flujo de Datos](#flujo-de-datos)
6. [Autenticación](#autenticación)
7. [Agregar Nuevas Funcionalidades](#agregar-nuevas-funcionalidades)

## Arquitectura

La aplicación sigue una arquitectura cliente-servidor:

```
┌─────────────────────┐
│   React Frontend    │
│  (Puerto 5173)      │
└──────────┬──────────┘
           │ HTTP/REST
           ↓
┌──────────────────────┐
│  Express Backend     │
│  (Puerto 5000)       │
└──────────┬───────────┘
           │ SQL
           ↓
┌──────────────────────┐
│   SQLite Database    │
│  (data/condominio.db)│
└──────────────────────┘
```

## Backend

### Estructura de Carpetas

```
backend/src/
├── server.js              # Punto de entrada
├── config/
│   └── database.js        # Configuración e inicialización de BD
├── controllers/           # Lógica de negocio
│   ├── authController.js
│   ├── residentsController.js
│   ├── unitsController.js
│   ├── billingController.js
│   ├── transactionsController.js
│   ├── maintenanceController.js
│   ├── suppliersController.js
│   ├── communicationsController.js
│   └── assembliesController.js
├── routes/               # Definición de endpoints
│   ├── authRoutes.js
│   ├── residentsRoutes.js
│   ├── unitsRoutes.js
│   ├── billingRoutes.js
│   ├── transactionsRoutes.js
│   ├── maintenanceRoutes.js
│   ├── suppliersRoutes.js
│   ├── communicationsRoutes.js
│   └── assembliesRoutes.js
├── middleware/           # Middlewares
│   └── auth.js
└── utils/               # Funciones utilitarias
```

### Crear un Nuevo Endpoint

1. **Crear el controlador** (`controllers/newModule.js`):

```javascript
import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function createNewItem(req, res) {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nombre requerido' });
    }

    const db = await getDatabase();
    const itemId = uuidv4();

    await db.run(
      'INSERT INTO new_items (id, name, description) VALUES (?, ?, ?)',
      [itemId, name, description]
    );

    res.status(201).json({ success: true, id: itemId });
  } catch (error) {
    console.error('Error creando item:', error);
    res.status(500).json({ error: 'Error creando item' });
  }
}

export async function getNewItems(req, res) {
  try {
    const db = await getDatabase();
    const items = await db.all('SELECT * FROM new_items');
    res.json(items);
  } catch (error) {
    console.error('Error obteniendo items:', error);
    res.status(500).json({ error: 'Error obteniendo items' });
  }
}
```

2. **Crear las rutas** (`routes/newModuleRoutes.js`):

```javascript
import express from 'express';
import { createNewItem, getNewItems } from '../controllers/newModule.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['admin', 'syndic']), createNewItem);
router.get('/', authenticateToken, getNewItems);

export default router;
```

3. **Registrar la ruta en server.js**:

```javascript
import newModuleRoutes from './routes/newModuleRoutes.js';
app.use('/api/new-module', newModuleRoutes);
```

### Roles y Permisos

```
admin      - Acceso total
syndic     - Gestión y reportes
resident   - Información personal
security   - Seguridad y visitantes
```

## Frontend

### Estructura de Carpetas

```
frontend/src/
├── main.jsx              # Punto de entrada
├── App.jsx               # Componente principal
├── index.css             # Estilos globales
├── components/           # Componentes reutilizables
│   ├── Navbar.jsx
│   ├── PrivateRoute.jsx
│   └── UI.jsx
├── pages/                # Páginas principales
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Residents.jsx
│   ├── Units.jsx
│   ├── Billing.jsx
│   └── Finance.jsx
├── services/             # Llamadas a API
│   ├── api.js
│   ├── authService.js
│   ├── residentsService.js
│   ├── unitsService.js
│   ├── billingService.js
│   └── transactionsService.js
├── context/              # Context API
│   └── AuthContext.jsx
├── hooks/                # Custom hooks
│   └── useAuth.js
└── utils/                # Funciones utilitarias
```

### Crear una Nueva Página

1. **Crear el servicio** (`services/newModuleService.js`):

```javascript
import api from './api';

const newModuleService = {
  getItems: async (params) => {
    const response = await api.get('/new-module', { params });
    return response.data;
  },

  createItem: async (data) => {
    const response = await api.post('/new-module', data);
    return response.data;
  },

  updateItem: async (id, data) => {
    const response = await api.put(`/new-module/${id}`, data);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/new-module/${id}`);
    return response.data;
  }
};

export default newModuleService;
```

2. **Crear la página** (`pages/NewModule.jsx`):

```javascript
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card, Button, Input, Table, Alert } from '../components/UI';
import newModuleService from '../services/newModuleService';

export function NewModule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await newModuleService.getItems({});
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error cargando items');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await newModuleService.createItem(formData);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      loadItems();
    } catch (err) {
      setError('Error creando item');
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Nuevo Módulo</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Nuevo Item
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-bold mb-4">Crear Item</h2>
          <form onSubmit={handleSubmit}>
            <Input
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            <div className="flex gap-2 mt-4">
              <Button type="submit">Guardar</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <Table
          columns={['Nombre', 'Descripción']}
          data={items.map((item) => ({
            Nombre: item.name,
            Descripción: item.description || '-'
          }))}
          loading={loading}
        />
      </Card>
    </div>
  );
}
```

3. **Registrar la ruta en App.jsx**:

```javascript
import { NewModule } from './pages/NewModule';

// En el componente App, agregar:
<Route path="/new-module" element={<NewModule />} />
```

## Base de Datos

### Agregar una Nueva Tabla

Editar `backend/src/config/database.js` y agregar en la sección de `CREATE TABLE`:

```javascript
CREATE TABLE IF NOT EXISTS new_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Consultas Comunes

```javascript
// Crear
await db.run(
  'INSERT INTO table_name (id, field1, field2) VALUES (?, ?, ?)',
  [uuid, value1, value2]
);

// Leer
const item = await db.get('SELECT * FROM table_name WHERE id = ?', [id]);
const items = await db.all('SELECT * FROM table_name WHERE field1 = ?', [value]);

// Actualizar
await db.run(
  'UPDATE table_name SET field1 = ?, field2 = ? WHERE id = ?',
  [value1, value2, id]
);

// Eliminar
await db.run('DELETE FROM table_name WHERE id = ?', [id]);
```

## Flujo de Datos

### Crear un Residente (Ejemplo Completo)

```
Frontend (Residents.jsx)
    ↓ handleSubmit() con formData
    ↓
Frontend (residentsService.js)
    ↓ POST /api/residents
    ↓
Backend (residentsRoutes.js)
    ↓ /api/residents POST handler
    ↓
Backend (residentsController.js)
    ↓ createResident() function
    ↓
Backend (database.js)
    ↓ INSERT INTO residents
    ↓
SQLite Database
    ↓ 201 Created + { id: uuid }
    ↓
Frontend (residentsService.js)
    ↓
Frontend (Residents.jsx)
    ↓ setResidents([...residentes, newResident])
    ↓
UI actualizado
```

## Autenticación

### Flujo de Login

```
1. Usuario ingresa credenciales en Login.jsx
2. authService.login(credentials)
3. POST /api/auth/login
4. Backend verifica contraseña con bcrypt
5. Genera JWT token
6. Retorna { user, token }
7. Frontend guarda token en localStorage
8. AuthContext actualiza estado
9. Usuario redirigido al dashboard
```

### Usar useAuth en Componentes

```javascript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <p>Bienvenido {user.username}</p>
      <button onClick={logout}>Salir</button>
    </div>
  );
}
```

## Agregar Nuevas Funcionalidades

### Checklist para Agregar un Nuevo Módulo

- [ ] Crear tablas en `database.js`
- [ ] Crear controlador en `controllers/`
- [ ] Crear rutas en `routes/`
- [ ] Registrar rutas en `server.js`
- [ ] Crear servicio en `frontend/services/`
- [ ] Crear página en `frontend/pages/`
- [ ] Actualizar `App.jsx` con la nueva ruta
- [ ] Agregar link en `Navbar.jsx`
- [ ] Probar endpoints con Postman/Thunder Client
- [ ] Probar interfaz en el navegador
- [ ] Documentar cambios

### Ejemplo: Agregar Módulo de Eventos

1. Base de datos:
```sql
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATETIME NOT NULL,
  location TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

2. Controlador: `controllers/eventsController.js`

3. Rutas: `routes/eventsRoutes.js`

4. Servicio: `frontend/services/eventsService.js`

5. Página: `frontend/pages/Events.jsx`

## Variables de Entorno

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_PATH=./data/condominio.db
JWT_SECRET=tu_clave_secreta_segura
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Testing

Para probar la API, usa Postman o Thunder Client:

1. Crear usuario:
   - `POST http://localhost:5000/api/auth/register`
   - Body: `{ "username": "test", "email": "test@example.com", "password": "pass123" }`

2. Login:
   - `POST http://localhost:5000/api/auth/login`
   - Body: `{ "username": "test", "password": "pass123" }`

3. Guardar token y usarlo en Authorization header:
   - Header: `Authorization: Bearer <token>`

## Troubleshooting

### Base de datos no inicializa
- Eliminar `backend/data/condominio.db`
- Reiniciar servidor

### Token inválido
- Limpiar localStorage: `localStorage.clear()`
- Hacer login nuevamente

### CORS error
- Verificar `vite.config.js` proxy
- Verificar `server.js` CORS configuration

### Puerto ocupado
- Cambiar puerto en `.env` o config file
- O matar proceso: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)

## Recursos

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [SQLite Docs](https://www.sqlite.org/docs.html)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Contacto

Para preguntas o sugerencias, contacta al equipo de desarrollo.
