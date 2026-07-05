# 🚀 Guía Rápida de Inicio

## Inicio Rápido (5 minutos)

### 1. Iniciar la Aplicación

**Windows:**
```bash
cd Aplicacion
start.bat
```

**Linux/Mac:**
```bash
cd Aplicacion
chmod +x start.sh
./start.sh
```

### 2. Acceder a la Aplicación
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

### 3. Login
```
Usuario: admin
Contraseña: admin123
```

---

## 📱 Navegación Principal

### Menú Superior
El menú superior tiene 6 categorías principales:

```
🏢 Condominios
├── 📊 Dashboard
├── 👥 Gestión
│   ├── Residentes
│   ├── Unidades
│   ├── Parqueaderos
│   ├── Bodegas
│   └── Documentos
├── 💰 Financiero
│   ├── Cobranza
│   ├── Contabilidad
│   └── Presupuesto
├── 🔧 Operaciones
│   ├── Mantenimiento
│   ├── Proveedores
│   └── Compras
├── 📢 Comunicación
│   ├── Comunicados
│   ├── Asambleas
│   ├── Visitantes
│   └── Seguridad
└── ⚙️ Administración
    ├── Personal
    └── Reportes
```

---

## 💡 Funciones Principales

### 👥 Gestión de Residentes
1. Haz clic en **Gestión → Residentes**
2. Haz clic en **"Nuevo Residente"**
3. Completa: Nombre, Apellido, Email, Teléfono, Cédula
4. Selecciona tipo: Residente, Propietario, Arrendatario
5. Haz clic en **"Guardar"**

**Ver Detalles:**
- Haz clic en el ícono 🏠 para ver documentos y deuda

### 🏠 Gestión de Unidades
1. Haz clic en **Gestión → Unidades**
2. Completa datos: Número, Tipo, Piso, Metraje, Alícuota
3. Asigna propietario
4. Define estado

### 💰 Cobranza
1. Haz clic en **Financiero → Cobranza**
2. Tab **"Facturación"**: Crear facturas mensuales
3. Tab **"Morosos"**: Ver residentes con deuda

### 📊 Reportes
1. Haz clic en **Administración → Reportes**
2. Selecciona tipo de reporte:
   - Morosidad
   - Financiero
   - Flujo de Caja
   - KPIs
3. Haz clic en **"PDF"** o **"Excel"** para descargar

### 🔧 Mantenimiento
1. Haz clic en **Operaciones → Mantenimiento**
2. Haz clic en **"Nuevo Ticket"**
3. Describe el problema
4. Selecciona prioridad (Bajo, Normal, Alto, Urgente)
5. Los filtros muestran estado del ticket

### 📅 Asambleas
1. Haz clic en **Comunicación → Asambleas**
2. Haz clic en **"Convocar Asamblea"**
3. Define fecha, hora y orden del día
4. Los resultados de votación aparecen en tab "Votaciones"

### 👤 Personal
1. Haz clic en **Administración → Personal**
2. Haz clic en **"Contratar Empleado"**
3. Completa datos de empleado
4. Tab **"Nómina"**: Ver salarios mensuales
5. Tab **"Turnos"**: Asignar horarios

---

## 📊 Dashboard

El dashboard muestra:
- **Total de Residentes**: Número total registrado
- **Total de Unidades**: Unidades inmobiliarias
- **Cartera Vencida**: Deuda morosa total
- **Ingresos Mensuales**: Recaudación actual
- **Gráfico de Ingresos vs Egresos**
- **Tendencia Mensual**: Línea de ingresos

---

## 🔍 Búsqueda y Filtros

Casi todas las páginas incluyen:
- 🔎 **Búsqueda**: Filtro por nombre/código
- 🏷️ **Filtros**: Por estado, categoría, etc.
- 📅 **Fecha**: Filtro por mes/período

**Ejemplo:**
```
Residentes:
- Buscar por nombre, email o cédula
- Filtrar por tipo (Residente, Propietario, Arrendatario)
```

---

## 📋 Validaciones Comunes

Si ves un mensaje en rojo, significa:
- ❌ Campo requerido vacío
- ❌ Email inválido
- ❌ Teléfono inválido (debe tener 7-15 dígitos)
- ❌ Monto negativo o no numérico
- ❌ Texto muy corto (mínimo caracteres)

**Solución**: Completa correctamente el campo y vuelve a intentar

---

## 💾 Exportar Datos

**Exportar a Excel:**
1. Ve a Administración → Reportes
2. Haz clic en botón **"Excel"** (esquina superior derecha)
3. El archivo se descargará como CSV

**Exportar a PDF:**
1. Ve a Administración → Reportes
2. Haz clic en botón **"PDF"** (esquina superior derecha)
3. Se abrirá el diálogo de impresión
4. Elige "Guardar como PDF" o "Imprimir"

---

## 🔐 Seguridad

### Cerrar Sesión
- Haz clic en botón **"Salir"** (esquina superior derecha)

### Cambiar Contraseña
- Función disponible en futuras actualizaciones

### Roles y Permisos
- **Admin**: Acceso total
- **Syndic**: Gestión y reportes
- **Resident**: Solo información personal
- **Security**: Seguridad y visitantes

---

## ⚠️ Troubleshooting

### "Conexión rechazada"
- ✅ Asegúrate de que backend esté corriendo (`npm run dev`)
- ✅ Verifica puerto 5000 disponible

### "Datos no se cargan"
- ✅ Recarga la página (Ctrl+R o Cmd+R)
- ✅ Verifica conexión a internet
- ✅ Limpia caché del navegador

### "Validación fallida"
- ✅ Lee el mensaje de error
- ✅ Revisa que los datos sean correctos
- ✅ Intenta de nuevo

### "No puedo acceder a un módulo"
- ✅ Verifica tu rol de usuario
- ✅ Pide permisos al administrador

---

## 🎯 Casos de Uso Comunes

### Caso 1: Generar Factura Mensual
1. Ve a **Financiero → Cobranza**
2. Haz clic en **"Nueva Factura"**
3. Selecciona mes y unidades
4. Define monto y categoría
5. Haz clic en **"Generar"**

### Caso 2: Reportar Deuda Morosa
1. Ve a **Financiero → Cobranza**
2. Abre tab **"Morosos"**
3. Busca residente con deuda
4. Haz clic en email para contactar
5. O descarga el reporte en **Administración → Reportes**

### Caso 3: Registrar Visitante
1. Ve a **Comunicación → Visitantes**
2. Haz clic en **"Registrar Visitante"**
3. Completa: Nombre, Unidad, Teléfono
4. Elige propósito (Visita, Entrega, etc.)
5. Al salir, haz clic en **"Registrar Salida"**

### Caso 4: Crear Mantenimiento
1. Ve a **Operaciones → Mantenimiento**
2. Haz clic en **"Nuevo Ticket"**
3. Describe el problema
4. Elige prioridad
5. Sistema asigna automáticamente a empleado

### Caso 5: Convocar Asamblea
1. Ve a **Comunicación → Asambleas**
2. Haz clic en **"Convocar Asamblea"**
3. Define fecha y hora
4. Escribe orden del día
5. Define quórum esperado
6. Publica la convocatoria

---

## 📞 Contacto y Soporte

Para reportar problemas:
1. Toma screenshot del error
2. Anota los pasos que hiciste
3. Contacta al administrador

---

## ✨ Consejos y Trucos

### 💡 Tip 1: Usar Búsqueda
La mayoría de listas son largas. Usa la búsqueda para encontrar rápidamente.

### 💡 Tip 2: Exportar Reportes
Los reportes en Excel son útiles para análisis en Google Sheets o Excel.

### 💡 Tip 3: Ver Detalles
Muchas páginas tienen botones para ver detalles completos. ¡Úsalos!

### 💡 Tip 4: Validar Antes de Guardar
Lee los mensajes de error rojo - te indican qué corregir.

### 💡 Tip 5: Refrescar Datos
Si los datos no se actualizan, recarga la página.

---

## 🎓 Próximos Pasos

1. ✅ Crear algunos residentes
2. ✅ Asignar unidades a residentes
3. ✅ Generar facturas mensuales
4. ✅ Registrar empleados
5. ✅ Generar reportes
6. ✅ Explorar todos los módulos

---

## 📖 Documentación Completa

Para más detalles, consulta:
- `README.md` - Información general
- `DEVELOPMENT.md` - Guía para desarrolladores
- `USAGE_GUIDE.md` - Guía completa de uso
- `CHANGELOG.md` - Historial de cambios

---

**¡Disfruta usando la aplicación de Administración de Condominios!** 🏢✨
