# 🏪 Healthynola POS System

Sistema completo de gestión de inventario y ventas para granola, desarrollado en Google Apps Script con versión web móvil.

## 📋 Características Principales

### 🏭 **Gestión de Producción**
- Registro de lotes de producción (25kg)
- Control de fechas de vencimiento
- Distribución automática a almacenes
- Cálculo de costos de producción

### 💰 **Sistema de Ventas**
- Ventas móviles con validación de inventario
- Múltiples métodos de pago (Efectivo, Transferencia, Consignación)
- Cancelación de ventas con devolución de inventario
- Integración automática con inventario

### 📦 **Control de Inventario**
- 3 almacenes: Principal, MMM, DVP
- Alertas de inventario bajo
- Historial completo de movimientos
- Transferencias entre almacenes

### 📊 **Reportes y Análisis**
- Reportes de ventas diarios
- Análisis por vendedor
- Reportes de inventario
- Historial de lotes y vencimientos
- Valoración de inventario

### 🤝 **Gestión de Clientes**
- Base de datos de clientes
- Ventas a consignación
- Seguimiento de vencimientos
- Clasificación por tipo de cliente

## 🚀 Instalación

### Requisitos
- Cuenta de Google
- Google Sheets
- Google Apps Script

### Pasos de Instalación

1. **Crear una nueva hoja de cálculo en Google Sheets**
2. **Abrir el editor de Apps Script** (Extensiones > Apps Script)
3. **Copiar y pegar cada archivo .gs** en el editor
4. **Ejecutar la función `configurarSistemaPOSCompleto()`** para inicializar el sistema
5. **El sistema creará automáticamente todas las hojas necesarias**

## 📁 Estructura del Sistema

### Archivos Principales

| Archivo | Descripción |
|---------|-------------|
| `menu.gs` | Sistema de menús principal |
| `is.gs` | Inicialización y configuración del sistema |
| `rvm.gs` | Registro de ventas móviles |
| `rp.gs` | Gestión de producción |
| `ri.gs` | Control de inventario |
| `rps.gs` | Gestión de productos |
| `tea.gs` | Transferencias entre almacenes |
| `rc.gs` | Gestión de consignaciones |
| `rcs.gs` | Gestión de clientes |
| `rvd.gs` | Reportes de ventas diarias |
| `vxv.gs` | Reportes de ventas por vendedor |
| `rii.gs` | Reportes de inventario |

### Hojas del Sistema

| Hoja | Descripción |
|------|-------------|
| **Ventas** | Registro de todas las ventas |
| **Inventario** | Control de stock por almacén |
| **Productos** | Catálogo de productos |
| **Producción** | Registro de lotes producidos |
| **Transferencias** | Movimientos entre almacenes |
| **Consignaciones** | Ventas a consignación |
| **Clientes** | Base de datos de clientes |
| **Lotes** | Control de lotes y vencimientos |
| **Gastos** | Registro de gastos del negocio |
| **Venta Movil** | Interfaz para ventas móviles |
| **Log** | Registro de actividades del sistema |

## 🎯 Funcionalidades por Módulo

### 🚀 Sistema
- ✅ Inicialización completa del sistema
- ✅ Validación de configuración
- ✅ Log de actividades
- ✅ Respaldo de datos

### 💰 Ventas
- ✅ Registro de ventas móviles
- ✅ Validación de inventario
- ✅ Múltiples métodos de pago
- ✅ Cancelación de ventas
- ✅ Limpieza de formularios

### 🏭 Producción
- ✅ Registro de lotes
- ✅ Control de fechas de vencimiento
- ✅ Distribución a almacenes
- ✅ Cálculo de costos

### 📦 Inventario
- ✅ Control de stock por almacén
- ✅ Alertas de inventario bajo
- ✅ Historial de movimientos
- ✅ Reportes de valoración

### 🛍️ Productos
- ✅ Catálogo de productos
- ✅ Control de precios y costos
- ✅ Categorización
- ✅ Estados de productos

### 🔄 Transferencias
- ✅ Movimientos entre almacenes
- ✅ Validación de disponibilidad
- ✅ Historial de transferencias
- ✅ Motivos de transferencia

### 🤝 Consignaciones
- ✅ Ventas a consignación
- ✅ Control de vencimientos
- ✅ Gestión de clientes
- ✅ Seguimiento de pagos

### 👥 Clientes
- ✅ Base de datos completa
- ✅ Clasificación por tipo
- ✅ Validación de datos
- ✅ Historial de compras

### 📋 Lotes
- ✅ Control de fechas de vencimiento
- ✅ Seguimiento de lotes
- ✅ Alertas de vencimiento
- ✅ Estados de lotes

### 💸 Gastos
- ✅ Registro de gastos
- ✅ Categorización
- ✅ Métodos de pago
- ✅ Responsables

### 📊 Reportes
- ✅ Ventas diarias
- ✅ Ventas por vendedor
- ✅ Reportes de inventario
- ✅ Análisis de productos
- ✅ Comparativas de vendedores

## 🔧 Configuración

### Almacenes Configurados
- **Principal**: Almacén central
- **MMM**: Almacén de Mariana
- **DVP**: Almacén de Dana

### Tipos de Cliente
- **Regular**: Cliente estándar
- **Mayorista**: Cliente con descuentos
- **Consignación**: Cliente a consignación
- **VIP**: Cliente preferencial

### Métodos de Pago
- **Efectivo**: Pago en efectivo
- **Transferencia**: Transferencia bancaria
- **Regalo**: Producto regalado
- **Consignación**: Venta a consignación

## 📱 Uso Móvil

El sistema incluye una interfaz móvil optimizada para:
- ✅ Registro rápido de ventas
- ✅ Consulta de inventario
- ✅ Reportes básicos
- ✅ Validación de stock

## 🛠️ Mantenimiento

### Funciones de Limpieza
- Limpiar hojas de datos
- Respaldo automático
- Validación de integridad
- Log de errores

### Monitoreo
- Sistema de logs completo
- Alertas de errores
- Validación de datos
- Seguimiento de actividades

## 📈 Próximas Mejoras

### Versión Web
- [ ] Frontend móvil responsive
- [ ] Backend con base de datos
- [ ] API REST para integraciones
- [ ] Dashboard en tiempo real

### Funcionalidades Adicionales
- [ ] Notificaciones push
- [ ] Sincronización en la nube
- [ ] Análisis predictivo
- [ ] Integración con contabilidad

## 🤝 Soporte

Para soporte técnico o consultas:
- Revisar el log del sistema
- Validar la configuración
- Verificar la integridad de los datos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

---

**Desarrollado para Healthynola** 🥣
*Sistema de gestión de inventario y ventas de granola*