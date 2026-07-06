# Guía de Uso - Aplicación Web de Administración de Condominios

## Cómo funciona

La web consume la API Spring Boot de producción mediante `/api/v1`. Los datos que se crean desde aquí quedan disponibles para los otros clientes porque comparten la misma base PostgreSQL.

## Módulos disponibles en la web

- Autenticación
- Condominios
- Residentes
- Tickets
- Comunicados
- Cuotas y pagos

## Flujo de uso

1. Inicia sesión con `POST /api/v1/auth/login`.
2. Usa el menú para abrir el módulo que necesites.
3. Guarda o consulta datos desde el servicio correspondiente.
4. Los cambios se reflejan en móvil y escritorio porque apuntan a la misma API.

## Endpoints más usados

- `GET /api/v1/condominios`
- `POST /api/v1/condominios`
- `POST /api/v1/residentes`
- `POST /api/v1/tickets`
- `POST /api/v1/comunicados`
- `GET /api/v1/cuotas`
- `POST /api/v1/pagos`

## Reglas importantes

- No usar rutas antiguas.
- No forzar una base URL diferente a `/api/v1` si se trabaja con el proxy local.
- Los formularios deben respetar el contrato `ApiResponse`.

## Roles disponibles

- `admin`
- `syndic`
- `resident`
- `security`

## Resultado esperado

Todo lo que se registre desde la web debe quedar en PostgreSQL y ser visible para móvil y escritorio sin duplicar lógica.
