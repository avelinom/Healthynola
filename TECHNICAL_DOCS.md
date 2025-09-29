# 📚 Documentación Técnica - Healthynola POS System

## 🏗️ Arquitectura del Sistema

### Diagrama de Arquitectura
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Google Sheets │    │  Google Apps    │    │   Google Drive  │
│                 │    │     Script      │    │                 │
│  ┌───────────┐  │    │                 │    │  ┌───────────┐  │
│  │   Ventas  │  │◄──►│  ┌───────────┐  │    │  │  Backups  │  │
│  └───────────┘  │    │  │   Core    │  │    │  └───────────┘  │
│  ┌───────────┐  │    │  │ Functions │  │    │                 │
│  │Inventario │  │◄──►│  └───────────┘  │    │                 │
│  └───────────┘  │    │  ┌───────────┐  │    │                 │
│  ┌───────────┐  │    │  │  Reports  │  │    │                 │
│  │Productos  │  │◄──►│  └───────────┘  │    │                 │
│  └───────────┘  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Componentes Principales

#### 1. **Capa de Datos (Google Sheets)**
- **Ventas**: Registro de transacciones
- **Inventario**: Control de stock
- **Productos**: Catálogo de productos
- **Clientes**: Base de datos de clientes
- **Lotes**: Control de producción
- **Log**: Sistema de logging

#### 2. **Capa de Lógica (Google Apps Script)**
- **Sistema**: Inicialización y configuración
- **Ventas**: Procesamiento de transacciones
- **Inventario**: Gestión de stock
- **Reportes**: Análisis y estadísticas
- **Validaciones**: Control de integridad

#### 3. **Capa de Presentación (Google Sheets UI)**
- **Menús**: Navegación del sistema
- **Formularios**: Interfaz de usuario
- **Reportes**: Visualización de datos
- **Alertas**: Notificaciones al usuario

## 🔧 Funciones Principales

### Sistema de Inicialización (`is.gs`)

```javascript
function configurarSistemaPOSCompleto() {
  // Configura todas las hojas del sistema
  // Establece menús y validaciones
  // Inicializa el sistema de logging
}
```

**Características:**
- Creación automática de hojas
- Configuración de formatos
- Establecimiento de validaciones
- Inicialización de menús

### Gestión de Ventas (`rvm.gs`)

```javascript
function registrarVentaMovil() {
  // Procesa venta móvil
  // Valida inventario
  // Actualiza stock
  // Registra transacción
}
```

**Flujo de Ventas:**
1. Validación de datos
2. Verificación de inventario
3. Cálculo de totales
4. Actualización de stock
5. Registro de transacción

### Control de Inventario (`ri.gs`)

```javascript
function actualizarInventarioDinamico() {
  // Actualiza inventario
  // Valida operaciones
  // Registra movimientos
  // Actualiza estados
}
```

**Operaciones de Inventario:**
- Adición de stock
- Reducción de stock
- Transferencias entre almacenes
- Alertas de inventario bajo

### Gestión de Producción (`rp.gs`)

```javascript
function registrarProduccion() {
  // Registra lote de producción
  // Actualiza inventario
  // Crea registro de lote
  // Registra transferencia
}
```

**Flujo de Producción:**
1. Registro de lote
2. Actualización de inventario
3. Creación de registro de lote
4. Registro de transferencia

## 📊 Sistema de Reportes

### Reportes de Ventas (`rvd.gs`)

```javascript
function generarResumenVentasDiario(fechaStr) {
  // Obtiene ventas del día
  // Calcula estadísticas
  // Genera reporte HTML
  // Muestra resultados
}
```

**Tipos de Reportes:**
- Ventas diarias
- Ventas por rango
- Ventas por vendedor
- Análisis de productos

### Reportes de Inventario (`rii.gs`)

```javascript
function reporteInventarioCompleto() {
  // Obtiene datos de inventario
  // Calcula estadísticas
  // Genera reporte HTML
  // Muestra resultados
}
```

**Tipos de Reportes:**
- Inventario completo
- Inventario bajo
- Movimientos de inventario
- Valoración de inventario

## 🔍 Sistema de Validaciones

### Validaciones de Datos

```javascript
function validarDatosVenta(datos) {
  // Valida campos obligatorios
  // Verifica formatos
  // Comprueba rangos
  // Retorna resultado
}
```

**Tipos de Validaciones:**
- Campos obligatorios
- Formatos de datos
- Rangos de valores
- Integridad referencial

### Validaciones de Negocio

```javascript
function validarInventarioDisponible(producto, cantidad, almacen) {
  // Verifica stock disponible
  // Comprueba almacén
  // Valida cantidad
  // Retorna disponibilidad
}
```

**Reglas de Negocio:**
- Stock mínimo
- Disponibilidad por almacén
- Límites de transferencia
- Validaciones de consignación

## 📝 Sistema de Logging

### Estructura del Log

```javascript
function registrarLog(funcion, tipo, mensaje, nivel) {
  // Registra entrada en log
  // Formatea timestamp
  // Almacena en hoja Log
  // Mantiene límite de entradas
}
```

**Niveles de Log:**
- **INFO**: Información general
- **WARNING**: Advertencias
- **ERROR**: Errores del sistema
- **SUCCESS**: Operaciones exitosas

### Formato del Log

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Timestamp | Fecha y hora | 2024-01-15 10:30:45 |
| Función | Función ejecutada | registrarVentaMovil |
| Tipo | Tipo de operación | INICIO, FIN, ERROR |
| Mensaje | Descripción detallada | Venta registrada exitosamente |
| Nivel | Nivel de log | INFO, WARNING, ERROR |

## 🔄 Flujos de Datos

### Flujo de Venta

```
1. Usuario ingresa datos
   ↓
2. Validación de campos
   ↓
3. Verificación de inventario
   ↓
4. Cálculo de totales
   ↓
5. Actualización de inventario
   ↓
6. Registro en hoja Ventas
   ↓
7. Confirmación al usuario
```

### Flujo de Producción

```
1. Registro de lote
   ↓
2. Validación de producto
   ↓
3. Actualización de inventario
   ↓
4. Creación de registro de lote
   ↓
5. Registro de transferencia
   ↓
6. Confirmación de producción
```

### Flujo de Transferencia

```
1. Selección de producto
   ↓
2. Validación de disponibilidad
   ↓
3. Actualización de almacén origen
   ↓
4. Actualización de almacén destino
   ↓
5. Registro de transferencia
   ↓
6. Confirmación de transferencia
```

## 🛠️ Configuración del Sistema

### Variables de Configuración

```javascript
// Almacenes del sistema
const ALMACENES = ['Principal', 'MMM', 'DVP'];

// Tipos de cliente
const TIPOS_CLIENTE = ['Regular', 'Mayorista', 'Consignación', 'VIP'];

// Métodos de pago
const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Regalo', 'Consignación'];

// Configuración de reportes
const CONFIG_REPORTES = {
  maxItems: 1000,
  formatoFecha: 'dd/MM/yyyy',
  formatoMoneda: '$#,##0.00'
};
```

### Configuración de Hojas

```javascript
// Configuración de hoja Ventas
const CONFIG_VENTAS = {
  headers: ['Fecha', 'Cliente', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal', 'Método de Pago', 'Total', 'Vendedor', 'Almacén', 'Notas'],
  columnWidths: [100, 150, 200, 80, 100, 100, 120, 100, 120, 100, 200],
  frozenRows: 1
};
```

## 🔒 Seguridad y Permisos

### Permisos Requeridos

```javascript
// Permisos de Google Sheets
const PERMISOS_SHEETS = [
  'spreadsheets.readonly',
  'spreadsheets.write'
];

// Permisos de Google Drive
const PERMISOS_DRIVE = [
  'drive.file'
];
```

### Validaciones de Seguridad

```javascript
function validarPermisos() {
  // Verifica permisos de lectura
  // Verifica permisos de escritura
  // Valida acceso a hojas
  // Retorna estado de permisos
}
```

## 📱 Optimización Móvil

### Interfaz Responsive

```javascript
function configurarInterfazMovil() {
  // Configura columnas para móvil
  // Ajusta tamaños de fuente
  // Optimiza formularios
  // Mejora navegación
}
```

### Funciones Móviles

```javascript
// Funciones optimizadas para móvil
function ventaRapida() { /* ... */ }
function consultarStock() { /* ... */ }
function reporteBasico() { /* ... */ }
```

## 🚀 Rendimiento

### Optimizaciones Implementadas

1. **Lazy Loading**: Carga de datos bajo demanda
2. **Caching**: Almacenamiento temporal de datos
3. **Batch Operations**: Operaciones en lote
4. **Indexing**: Índices para búsquedas rápidas

### Métricas de Rendimiento

```javascript
function medirRendimiento(funcion) {
  const inicio = new Date().getTime();
  // Ejecutar función
  const fin = new Date().getTime();
  const duracion = fin - inicio;
  // Registrar métrica
}
```

## 🔧 Mantenimiento

### Funciones de Mantenimiento

```javascript
function limpiarLogs() {
  // Limpia logs antiguos
  // Mantiene solo últimos 1000 registros
}

function validarIntegridad() {
  // Verifica integridad de datos
  // Valida referencias
  // Reporta inconsistencias
}

function hacerRespaldo() {
  // Crea respaldo de datos
  // Almacena en Google Drive
  // Registra operación
}
```

### Monitoreo del Sistema

```javascript
function monitorearSistema() {
  // Verifica estado de hojas
  // Valida funciones
  // Reporta errores
  // Sugiere mantenimiento
}
```

## 📈 Escalabilidad

### Limitaciones Actuales

- **Hojas**: Máximo 5,000,000 celdas por hoja
- **Scripts**: Máximo 6 minutos de ejecución
- **Triggers**: Máximo 20 triggers por script
- **Usuarios**: Limitado por permisos de Google

### Estrategias de Escalabilidad

1. **Particionamiento**: Dividir datos por período
2. **Archivado**: Mover datos antiguos
3. **Optimización**: Mejorar consultas
4. **Caching**: Implementar caché inteligente

## 🔮 Próximas Mejoras

### Versión 2.0

- **Backend Web**: API REST
- **Base de Datos**: PostgreSQL/MySQL
- **Frontend**: React/Vue.js
- **Mobile App**: React Native/Flutter

### Funcionalidades Futuras

- **IA/ML**: Análisis predictivo
- **IoT**: Sensores de inventario
- **Blockchain**: Trazabilidad de productos
- **API**: Integraciones externas

---

**Documentación Técnica v1.0** 📚
*Sistema Healthynola POS - Google Apps Script*
