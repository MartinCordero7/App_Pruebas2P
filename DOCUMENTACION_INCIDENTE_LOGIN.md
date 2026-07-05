# Documentación del incidente de login

## Resumen ejecutivo

El login de la aplicación web fallaba mientras que Swagger, Flutter y la app de escritorio sí funcionaban. Durante la investigación se descartaron varias hipótesis y se comprobó que el problema no estaba en el formulario, ni en el endpoint de autenticación como tal, sino en la interacción entre el cliente web, Vite, CORS y la capa de seguridad del backend.

La resolución final consistió en:

- Mantener el login web pasando por el proxy local de Vite durante el desarrollo.
- Corregir la configuración de CORS en el backend para que no usara `allowedOrigins("*")` junto con `allowCredentials(true)`.
- Permitir correctamente `OPTIONS` en Spring Security.
- Dejar `/error` y `/api/v1/auth/**` fuera de protección para evitar que los errores reales quedaran enmascarados.

## Contexto inicial

La situación de partida era esta:

- Swagger funcionaba.
- Flutter funcionaba.
- La app de escritorio funcionaba.
- La web fallaba al intentar iniciar sesión.

Eso indicaba que el problema no estaba en las credenciales en sí ni en la lógica base del controlador de autenticación, sino en diferencias del flujo HTTP entre clientes.

## Archivos del frontend revisados

Los archivos del frontend que se revisaron y ajustaron fueron:

- [frontend/src/services/authService.js](frontend/src/services/authService.js)
- [frontend/src/services/api.js](frontend/src/services/api.js)
- [frontend/vite.config.js](frontend/vite.config.js)
- [frontend/.env](frontend/.env)

## Cronología de pruebas y fallos descartados

### 1. Login con `fetch` nativo

El login de la web inicialmente usaba `fetch` directo contra `/api/v1/auth/login`.

Se comprobó que:

- La petición sí salía desde el navegador.
- El navegador recibía un `401` con el mensaje:
  - `No autenticado. Proporciona un JWT válido en el header Authorization.`

Esto sugería que la petición no estaba llegando al controlador de login de forma limpia.

### 2. Sustitución de `fetch` por el cliente compartido `api`

Se cambió el login para que usara el mismo cliente HTTP que el resto de la aplicación, en lugar de hacer una petición aislada con `fetch`.

Esto ayudó a homogeneizar el comportamiento, pero no resolvió el problema de fondo.

### 3. Prueba con URL absoluta a Render desde `.env`

Se probó configurar el frontend con:

- `VITE_API_URL=https://condominio-api-2aef.onrender.com/api/v1`

El resultado fue que el navegador empezó a llamar directamente a Render, pero apareció un error de CORS.

El error real capturado fue:

- `No 'Access-Control-Allow-Origin' header is present on the requested resource`

Eso confirmó que el problema ya no era el login en sí, sino la política CORS del backend cuando se accedía desde la web directamente.

### 4. Prueba con proxy local de Vite

Se volvió a usar Vite como intermediario para evitar el choque directo con CORS en el navegador.

Se ajustó el proxy para que la ruta relevante fuera `/api/v1`.

Con esto la request volvió a salir como:

- `POST /api/v1/auth/login`

Pero seguía respondiendo el backend con errores de seguridad o de infraestructura interna.

### 5. Eliminación del enmascaramiento de errores con `/error`

Se detectó en logs del backend que Spring Security estaba interceptando el dispatch interno a `/error`.

Se añadió `/error` como ruta pública para que el error real dejara de quedar oculto detrás del `JwtAuthenticationEntryPoint`.

Esto fue clave para ver el problema verdadero y no un `401` genérico.

### 6. Descubrimiento del error real de CORS en backend

Cuando ya no se enmascaraba el error, el backend mostró este fallo real:

- `When allowCredentials is true, allowedOrigins cannot contain the special value "*"`

Esto confirmó que el backend tenía una configuración CORS inválida.

## Logs clave que se observaron

### Log de enmascaramiento

Se vio este mensaje en los logs de Render:

- `Acceso no autorizado a '/error': Full authentication is required to access this resource`

Eso indicó que la aplicación estaba intentando renderizar un error y que Spring Security estaba bloqueando el endpoint `/error`.

### Log definitivo de CORS

Más adelante apareció este error:

- `When allowCredentials is true, allowedOrigins cannot contain the special value "*"`

Ese fue el origen real del problema después de quitar el enmascaramiento.

## Soluciones que se probaron y no resolvieron por sí solas el incidente

### A. Cambiar solo el frontend a URL absoluta de Render

No fue suficiente por sí solo, porque disparó CORS en el navegador.

### B. Mantener el login con `fetch`

No resolvió el problema, porque el flujo seguía dependiendo de cómo el backend validaba y respondía.

### C. Cambiar el proxy de Vite sin corregir backend

Ayudó a aislar el problema, pero no era la solución definitiva.

### D. Añadir solo `/error` a rutas públicas

Sirvió para destapar el error real, pero no corregía la causa raíz de CORS.

## Solución final aplicada

### Backend

En el backend se corrigió la configuración de seguridad para que:

- `/error` fuera público.
- `/api/v1/auth/**` fuera público.
- `OPTIONS` se permitiera.
- La configuración CORS dejara de usar `allowedOrigins("*")` con `allowCredentials(true)`.
- Se usaran `allowedOriginPatterns(...)` o una lista explícita de orígenes válidos.

### Frontend

El frontend quedó ajustado para desarrollo local así:

- [frontend/vite.config.js](frontend/vite.config.js) mantiene el proxy hacia Render para `/api/v1`.
- [frontend/.env](frontend/.env) usa `VITE_API_URL=/api/v1`.
- [frontend/src/services/api.js](frontend/src/services/api.js) usa esa URL base relativa.
- [frontend/src/services/authService.js](frontend/src/services/authService.js) usa el cliente `api` compartido para login.

## Resultado final

Después de aplicar los cambios correctos en backend y frontend:

- El login dejó de fallar.
- El usuario pudo ingresar correctamente.
- Se descartaron de forma práctica las hipótesis de rewrite de Vite, doble slash en la URL, y bloqueo en el controlador de autenticación.

## Lecciones aprendidas

1. Un `401` no siempre significa que el problema esté en credenciales o controlador.
2. Spring Security puede enmascarar errores reales si `/error` no está permitido.
3. `allowCredentials(true)` no es compatible con `allowedOrigins("*")`.
4. Cuando un cliente funciona y otro no, hay que comparar el flujo completo: URL, proxy, CORS, headers y preflight.
5. El error visible puede no ser el error raíz.

## Estado final del frontend

- Login usa el cliente compartido `api`.
- `API_URL` por defecto es `/api/v1`.
- Vite proxy está configurado para `/api/v1`.
- `.env` usa ruta relativa para desarrollo local.

## Estado final del backend

- `/error` está permitido.
- `/api/v1/auth/**` está permitido.
- `OPTIONS` está permitido.
- CORS usa patrones de origen compatibles con credenciales.

## Conclusión

El problema no estaba en un solo punto aislado. Fue una combinación de:

- Enmascaramiento de error por `/error`.
- Configuración CORS incorrecta en el backend.
- Diferencias entre petición directa al backend y petición pasando por Vite.

La solución definitiva fue corregir la seguridad y CORS en el backend y dejar el frontend alineado con el flujo correcto de desarrollo.
