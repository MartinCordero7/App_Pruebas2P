# Administración de Condominios - Aplicación Web

Sistema completo de administración de condominios y edificios bajo el régimen de propiedad horizontal.

## Características Principales

### 1. Gestión de Copropietarios y Residentes
- Registro de propietarios, arrendatarios y residentes
- Gestión de datos de contacto
- Historial de unidades/departamentos
- Almacenamiento de documentos (escrituras, contratos, cédulas)
- Estado de cuenta individual
- Asignación de parqueaderos y bodegas

### 2. Gestión de Unidades Inmobiliarias
- Registro de casas, departamentos, locales, oficinas
- Cálculo de metraje y alícuotas
- Estados de ocupación
- Relación con propietarios

### 3. Cobranza y Cartera
- Generación automática de cuotas mensuales
- Expensas ordinarias y extraordinarias
- Cálculo de intereses por mora
- Convenios de pago
- Reportes de morosos
- Recibos y comprobantes

### 4. Contabilidad y Finanzas
- Registro de ingresos y egresos
- Caja chica y bancos
- Presupuestos anuales
- Balance general y estado de resultados
- Flujo de caja
- Reportes financieros
- Exportación a Excel/PDF

### 5. Gestión de Proveedores y Compras
- Registro de proveedores
- Cotizaciones y órdenes de compra
- Control de facturas y pagos
- Evaluación de proveedores

### 6. Mantenimiento e Incidencias
- Sistema de tickets de soporte
- Seguimiento de reparaciones
- Mantenimiento preventivo
- Cronograma de servicios

### 7. Seguridad y Accesos
- Registro de visitantes
- Bitácora de guardias
- Vehículos autorizados
- Alertas de incidentes

### 8. Comunicación Interna
- Envío de comunicados
- Notificaciones de deuda
- Convocatorias a asambleas
- Circulares

### 9. Asambleas y Decisiones
- Convocatorias con orden del día
- Registro de asistencia
- Cálculo automático de quórum
- Votaciones en línea
- Actas digitales

## Estructura del Proyecto

```
Aplicacion/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── package.json
│   ├── .env
│   └── .gitignore
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── context/
    │   ├── hooks/
    │   └── utils/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html
```

## Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **SQLite** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas

### Frontend
- **React** - Librería de UI
- **Vite** - Build tool
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilos
- **Recharts** - Gráficos
- **Lucide React** - Iconos

## Instalación y Uso

### Backend

```bash
cd backend
npm install
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

### Residentes
- `GET /api/residents` - Listar residentes
- `POST /api/residents` - Crear residente
- `GET /api/residents/:id` - Obtener residente
- `PUT /api/residents/:id` - Actualizar residente
- `DELETE /api/residents/:id` - Eliminar residente
- `GET /api/residents/:id/balance` - Saldo del residente

### Unidades
- `GET /api/units` - Listar unidades
- `POST /api/units` - Crear unidad
- `GET /api/units/:id` - Obtener unidad
- `PUT /api/units/:id` - Actualizar unidad
- `DELETE /api/units/:id` - Eliminar unidad

### Cobranza
- `GET /api/billing` - Listar facturación
- `POST /api/billing` - Crear facturación
- `POST /api/billing/generate-monthly` - Generar cuotas mensuales
- `POST /api/billing/payment` - Registrar pago
- `GET /api/billing/delinquent-report` - Reporte de morosos

### Transacciones
- `GET /api/transactions` - Listar transacciones
- `POST /api/transactions` - Crear transacción
- `GET /api/transactions/report/financial` - Reporte financiero
- `GET /api/transactions/report/cash-flow` - Flujo de caja
- `GET /api/transactions/report/balance-sheet` - Balance general

### Mantenimiento
- `GET /api/maintenance` - Listar solicitudes
- `POST /api/maintenance` - Crear solicitud
- `PUT /api/maintenance/:id` - Actualizar solicitud

### Proveedores
- `GET /api/suppliers` - Listar proveedores
- `POST /api/suppliers` - Crear proveedor
- `GET /api/suppliers/orders` - Listar órdenes de compra
- `POST /api/suppliers/order` - Crear orden de compra

### Comunicaciones
- `GET /api/communications` - Listar comunicados
- `POST /api/communications` - Crear comunicado
- `POST /api/communications/:id/publish` - Publicar comunicado

### Asambleas
- `GET /api/assemblies` - Listar asambleas
- `POST /api/assemblies` - Crear asamblea
- `POST /api/assemblies/vote` - Registrar voto
- `GET /api/assemblies/:id/results` - Resultados de votación
- `POST /api/assemblies/minutes` - Registrar acta

## Cuentas de Prueba

Por defecto, puedes crear nuevas cuentas en el formulario de registro. Los roles disponibles son:
- **admin**: Acceso total a todas las funciones
- **syndic**: Acceso a gestión y reportes
- **resident**: Acceso a información personal
- **security**: Acceso a seguridad y visitantes

## Próximas Características

- [ ] Exportación a PDF/Excel
- [ ] Integración con WhatsApp/SMS
- [ ] Integración con cámaras CCTV
- [ ] App móvil
- [ ] Pagos en línea
- [ ] Sincronización en tiempo real

## Licencia

Este proyecto está bajo licencia MIT.
