# Guía de Desarrollo - Administración de Condominios

Este proyecto es un frontend React que consume una API Spring Boot externa compartida con móvil y escritorio.

## Arquitectura Actual

- **Frontend**: React + Vite + Axios.
- **Backend**: Spring Boot + Spring Security + JWT.
- **Base de datos**: PostgreSQL en producción.
- **Prefijo de API**: `/api/v1`.

## Flujo de Datos

1. El usuario interactúa desde una página React.
2. El frontend llama a la API con `api.js`.
3. La API autentica, valida permisos y persiste en PostgreSQL.
4. Web, móvil y escritorio leen la misma información desde la misma API.

## Endpoints Clave

- `POST /api/v1/auth/login`
- `GET /api/v1/condominios`
- `POST /api/v1/residentes`
- `POST /api/v1/tickets`
- `POST /api/v1/comunicados`
- `GET /api/v1/cuotas`
- `POST /api/v1/pagos`

## Reglas de Integración

- No usar rutas antiguas.
- No apuntar a un backend diferente al de producción.
- Mantener `VITE_API_URL=/api/v1` en desarrollo local cuando se use el proxy de Vite.

## Agregar una Nueva Pantalla

1. Crear el servicio en `frontend/src/services/`.
2. Consumir la API con `api.get/post/put/delete`.
3. Guardar los datos en el módulo correcto para que los demás clientes los vean.
4. Verificar que el endpoint use `/api/v1` y que la respuesta respete `ApiResponse`.

## Agregar un Nuevo Endpoint

Cuando el backend agregue un nuevo recurso, el frontend debe mapearlo en:

- `services/`
- `pages/`
- `context/` o `hooks/` si aplica
