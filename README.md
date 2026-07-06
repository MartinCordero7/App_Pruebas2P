# Administración de Condominios - Aplicación Web

Frontend React conectado a una API Spring Boot compartida por web, móvil y escritorio.

## Stack Actual

- **Frontend**: React, Vite, React Router, Axios, Tailwind CSS, Recharts, Lucide React.
- **Backend**: Spring Boot, Spring Security, JWT, PostgreSQL.
- **Contrato de API**: `/api/v1/...` con respuestas envueltas en `ApiResponse`.

## Uso Local

```bash
cd frontend
npm install
npm run dev
```

La app se abre en `http://localhost:5173` y consume la API por `/api/v1`.

## Endpoints de Producción

### Autenticación

- `POST /api/v1/auth/login`
- Persistencia: `usuario`, `rol`, `usuario_rol`, `permiso`.

### Condominios e infraestructura

- `GET /api/v1/condominios`
- `POST /api/v1/condominios`
- `GET /api/v1/condominios/{id}/torres`
- Persistencia: `condominio`, `torre`, `unidad`.

### Residentes y personas

- `POST /api/v1/residentes`
- Persistencia: `persona`, `persona_unidad`, `unidad`.

### Tickets e incidencias

- `POST /api/v1/tickets`
- `GET /api/v1/tickets/{id}/comentarios`
- Persistencia: `ticket`, `historial_ticket`, `ticket_comentario`, `categoria`.

### Comunicados

- `POST /api/v1/comunicados`
- Persistencia: `comunicado` y tabla de lecturas/destinatarios si aplica.

### Finanzas

- `GET /api/v1/cuotas`
- `POST /api/v1/pagos`
- Persistencia: `cuota`, `pago`, `recibo`, `multa`.

## Mapa Sección por Sección

Esta tabla marca, módulo por módulo, qué parte del frontend sí tiene endpoint directo, cuál debe adaptarse con otros controladores existentes y qué controladores backend deberían usarse.

| Módulo Web | ¿Existe Endpoint Directo? | Adaptación Propuesta | Controladores Backend a Utilizar |
| --- | --- | --- | --- |
| Dashboard | ⚠️ Parcial | Construir el dashboard consumiendo varios módulos existentes (estadísticas, conteos, pagos pendientes, tickets abiertos, etc.). | `DashboardController` + `CuotaController` + `PagoController` + `TicketController` + `ComunicadoController` |
| Finance | ❌ No | Eliminar como módulo independiente. Integrarlo dentro de **Cuotas y Pagos**. | `CuotaController` + `PagoController` |
| Reports | ⚠️ Parcial | Generar reportes desde datos existentes sin crear nuevas tablas. | `CuotaController` + `PagoController` + `TicketController` + `ComunicadoController` |
| Maintenance | ⚠️ Parcial | Todo mantenimiento se registra como **Ticket**. Las prioridades y categorías ya las maneja el backend. | `TicketController` + `CategoriaController` |
| Visitors | ⚠️ Parcial | Utilizar el flujo oficial de visitantes y visitantes preautorizados. | `VisitanteController` + `VisitantePreautorizadoController` |
| Security | ❌ No | Convertir el módulo en una vista de control de accesos utilizando visitantes y registros de acceso. | `AccesoController` + `VisitanteController` |
| Documents | ❌ No | Mostrar documentos existentes (actas, recibos y adjuntos de tickets). No crear un gestor documental nuevo. | `ActaController` + `ReciboController` + `TicketController` |
| Parking | ⚠️ Parcial | Administrar parqueaderos junto con los vehículos registrados. | `ParqueaderoController` + `VehiculoController` |
| Storage | ❌ No | Representar bodegas o espacios como una extensión de las unidades o áreas comunes, sin crear un módulo nuevo. | `UnidadController` + `AreaComunController` |
| Employees | ❌ No | Gestionar empleados como usuarios del sistema con sus respectivos roles y datos personales. | `UsuarioController` + `RolController` + `PersonaController` |
| Suppliers | ❌ No | Igual que en Escritorio: registrar un Ticket con categoría "Proveedor" o "Contratista". | `TicketController` + `CategoriaController` |
| Purchases | ❌ No | Registrar la compra como un Ticket (solicitud de compra) y asociar posteriormente el Pago correspondiente. | `TicketController` + `PagoController` |
| Budget | ❌ No | Mostrar un presupuesto calculado dinámicamente a partir de cuotas, pagos y multas. No crear tablas nuevas. | `DashboardController` + `CuotaController` + `PagoController` + `MultaController` |

### Lectura rápida

- **Sí con endpoint directo o casi directo**: Dashboard parcial, Parking parcial, Maintenance parcial, Visitors parcial.
- **No como módulo independiente**: Finance, Security, Documents, Storage, Employees, Suppliers, Purchases, Budget.
- **Debe componerse desde datos existentes**: Reports, Dashboard.

### Regla práctica

Si un módulo del frontend no tiene un endpoint directo confirmado, no debe inventar tablas ni escritura local: debe reutilizar los controladores existentes o quedar marcado como vista compuesta.

## Contrato JSON Base

```json
{
    "success": true,
    "timestamp": "2026-07-05T00:00:00.000",
    "status": 200,
    "message": "Mensaje de éxito",
    "data": {}
}
```

## Relación Funcional

- `auth/login` habilita el resto de módulos.
- `condominios` define la estructura principal.
- `residentes` conecta personas con unidades.
- `tickets` guarda incidencias y comentarios.
- `comunicados` publica mensajes para todos los clientes.
- `cuotas` y `pagos` comparten la misma base de producción para estado financiero.

## Cuentas de Prueba

Por defecto, puedes crear nuevas cuentas en el formulario de registro. Los roles disponibles son:
- **admin**: Acceso total a todas las funciones
- **syndic**: Acceso a gestión y reportes
- **resident**: Acceso a información personal
- **security**: Acceso a seguridad y visitantes

## Próximas Características

- [ ] Mejoras de reportes y exportación
- [ ] Más automatización financiera
- [ ] Integración con notificaciones externas

## Incidente de Login - Resumen Corto

El login de la web fallaba aunque Swagger, Flutter y la app de escritorio funcionaban. Se descartó que el problema fuera el formulario, las credenciales o el controlador de autenticación.

### Qué se probó

- Login con `fetch` directo.
- Login usando el cliente HTTP compartido `api`.
- URL absoluta a Render desde `.env`.
- Proxy local de Vite.
- Desbloqueo de `/error` para ver el fallo real.

### Qué falló

- El backend devolvía un `401` enmascarado por Spring Security.
- Luego apareció el error real de CORS: `allowCredentials(true)` no puede coexistir con `allowedOrigins("*")`.
- También se confirmó que el `OPTIONS` del navegador necesitaba estar permitido.

### Qué lo solucionó

- Permitir `/error` y `/api/v1/auth/**` en Spring Security.
- Permitir `OPTIONS`.
- Cambiar CORS a `allowedOriginPatterns(...)` o a orígenes explícitos.
- Dejar el frontend usando `/api/v1` y el proxy local de Vite en desarrollo.

## Relación de Módulos y Persistencia en Producción

Con la información de la API y del flujo funcional, las secciones del sistema sí están relacionadas entre sí y deberían persistirse en tablas/colecciones separadas pero vinculadas por llaves foráneas o relaciones internas. El nombre exacto de las tablas depende del backend real, pero la relación funcional esperada es esta:

| Módulo | Relación funcional | Dónde se guarda en producción |
| --- | --- | --- |
| Autenticación | Usuarios, roles y permisos del sistema | `users`, `roles`, `user_roles` o equivalente |
| Condominios e infraestructura | Entidad raíz del proyecto: un condominio agrupa torres, unidades y servicios | `condominios`, `torres`, `unidades` o equivalente |
| Residentes y personas | Persona asociada a una unidad y, opcionalmente, a un rol de propietario o residente | `personas`, `residentes`, tabla pivote con `unidades` o `propietarios` |
| Tickets / incidencias | Caso creado por un usuario y vinculado a una categoría, prioridad y comentarios | `tickets`, `ticket_comentarios`, `ticket_categorias` |
| Comunicados | Publicaciones dirigidas a uno o varios condominios / unidades / roles | `comunicados`, `comunicado_destinatarios` o equivalente |
| Financiero | Cuotas generadas por unidad y pagos asociados a una cuota | `cuotas`, `pagos`, `recibos`, `movimientos_financieros` |

### Verificación rápida de coherencia

- `Auth` alimenta al resto del sistema porque los módulos protegidos dependen del usuario autenticado.
- `Condominios` es la entidad padre de `torres`, `unidades`, residentes y distribución de cobros.
- `Residentes` debe quedar amarrado a una `unidad` para que el estado de cuenta y la comunicación funcionen.
- `Tickets` debe guardar el autor, la categoría y los comentarios para trazabilidad.
- `Comunicados` debe poder publicarse y asociarse a un condominio, a una unidad o a un grupo de usuarios.
- `Financiero` debe referenciar la `unidad` y la `cuota` para que los pagos cuadren con la cartera.

### Observación importante

No puedo confirmar los nombres físicos exactos de las tablas de producción porque el backend no está en este workspace. Esta validación es funcional y de relaciones; si el backend usa otros nombres, la estructura lógica sigue siendo la misma.

## Licencia

Este proyecto está bajo licencia MIT.
