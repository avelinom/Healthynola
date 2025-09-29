# 🚀 Guía de Instalación - Healthynola POS System

## 📋 Requisitos Previos

### Cuentas y Servicios Necesarios
- ✅ **Cuenta de Google** (Gmail, Google Workspace)
- ✅ **Acceso a Google Sheets**
- ✅ **Acceso a Google Apps Script**
- ✅ **Permisos de edición** en Google Sheets

### Navegadores Compatibles
- ✅ **Google Chrome** (recomendado)
- ✅ **Mozilla Firefox**
- ✅ **Safari**
- ✅ **Microsoft Edge**

### Dispositivos Soportados
- 💻 **Computadora** (Windows, Mac, Linux)
- 📱 **Tablet** (iPad, Android)
- 📱 **Smartphone** (iOS, Android)

## 🛠️ Instalación Paso a Paso

### Paso 1: Crear Nueva Hoja de Cálculo

1. **Abrir Google Sheets**
   - Ir a [sheets.google.com](https://sheets.google.com)
   - Iniciar sesión con tu cuenta de Google

2. **Crear Nueva Hoja**
   - Hacer clic en "Blank" (Hoja en blanco)
   - Nombrar la hoja: "Healthynola POS System"
   - Guardar en Google Drive

### Paso 2: Abrir Editor de Apps Script

1. **Acceder al Editor**
   - En la hoja de cálculo, ir a "Extensions" (Extensiones)
   - Seleccionar "Apps Script"

2. **Configurar el Proyecto**
   - Cambiar el nombre del proyecto a "Healthynola POS"
   - Eliminar el código predeterminado

### Paso 3: Instalar Archivos del Sistema

#### 3.1 Instalar Archivo Principal (menu.gs)
```javascript
// Copiar y pegar el contenido de menu.gs
// Este archivo contiene el sistema de menús principal
```

#### 3.2 Instalar Sistema de Inicialización (is.gs)
```javascript
// Copiar y pegar el contenido de is.gs
// Este archivo configura todas las hojas del sistema
```

#### 3.3 Instalar Módulos de Funcionalidad
Instalar en este orden:

1. **rvm.gs** - Ventas móviles
2. **rp.gs** - Producción
3. **ri.gs** - Inventario
4. **rps.gs** - Productos
5. **tea.gs** - Transferencias
6. **rc.gs** - Consignaciones
7. **rcs.gs** - Clientes
8. **rvd.gs** - Reportes de ventas
9. **vxv.gs** - Reportes de vendedores
10. **rii.gs** - Reportes de inventario

### Paso 4: Configurar el Sistema

1. **Ejecutar Inicialización**
   - En el editor de Apps Script, seleccionar función `configurarSistemaPOSCompleto`
   - Hacer clic en "Run" (Ejecutar)
   - Autorizar permisos cuando se soliciten

2. **Verificar Configuración**
   - Seleccionar función `validarSistemaCompleto`
   - Ejecutar para verificar que todo esté configurado correctamente

3. **Configurar Menús**
   - Seleccionar función `onOpen`
   - Ejecutar para crear los menús del sistema

### Paso 5: Configuración Inicial

#### 5.1 Configurar Productos
1. Ir a la hoja "Productos"
2. Agregar productos básicos:
   ```
   Código: GR1KG
   Nombre: Granola 1kg regular
   Descripción: Granola tradicional 1kg
   Precio: 25000
   Costo: 15000
   Categoría: Granola
   Unidad: 1kg
   Estado: Activo
   ```

#### 5.2 Configurar Clientes
1. Ir a la hoja "Clientes"
2. Agregar clientes básicos:
   ```
   Nombre: Cliente Demo
   Teléfono: 3001234567
   Email: demo@email.com
   Dirección: Calle 123 #45-67
   Ciudad: Bogotá
   Tipo: Regular
   Estado: Activo
   ```

#### 5.3 Configurar Inventario Inicial
1. Ir a la hoja "Inventario"
2. Agregar stock inicial:
   ```
   Producto: Granola 1kg regular
   Almacén: Principal
   Cantidad Actual: 100
   Cantidad Mínima: 10
   Estado: Disponible
   ```

## ✅ Verificación de Instalación

### Checklist de Verificación

- [ ] **Hojas Creadas**: Verificar que existen todas las hojas del sistema
- [ ] **Menús Funcionando**: Los menús aparecen en la barra superior
- [ ] **Funciones Ejecutándose**: Las funciones principales funcionan sin errores
- [ ] **Datos de Prueba**: Se pueden crear registros de prueba
- [ ] **Reportes Generándose**: Los reportes se generan correctamente

### Pruebas Básicas

#### Prueba 1: Registro de Venta
1. Ir a "Ventas" → "Registrar Venta Móvil"
2. Completar formulario de venta
3. Verificar que se registra en la hoja "Ventas"
4. Verificar que se actualiza el inventario

#### Prueba 2: Registro de Producción
1. Ir a "Producción" → "Registrar Producción"
2. Completar formulario de producción
3. Verificar que se registra en la hoja "Producción"
4. Verificar que se actualiza el inventario

#### Prueba 3: Generación de Reportes
1. Ir a "Reportes" → "Resumen Ventas Diario"
2. Verificar que se genera el reporte
3. Verificar que se muestran los datos correctamente

## 🔧 Configuración Avanzada

### Configuración de Permisos

#### Permisos de Google Sheets
```javascript
// Verificar permisos de lectura
function verificarPermisosLectura() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const data = sheet.getDataRange().getValues();
    return true;
  } catch (error) {
    return false;
  }
}
```

#### Permisos de Google Drive
```javascript
// Verificar permisos de escritura
function verificarPermisosEscritura() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    sheet.appendRow(['Test']);
    return true;
  } catch (error) {
    return false;
  }
}
```

### Configuración de Triggers

#### Trigger de Apertura
```javascript
// Configurar trigger onOpen
function configurarTriggerApertura() {
  ScriptApp.newTrigger('onOpen')
    .for(SpreadsheetApp.getActiveSpreadsheet())
    .onOpen()
    .create();
}
```

#### Trigger de Edición
```javascript
// Configurar trigger onEdit
function configurarTriggerEdicion() {
  ScriptApp.newTrigger('procesarAccionVentaMovil')
    .for(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();
}
```

## 🚨 Solución de Problemas

### Problemas Comunes

#### Error: "Hoja no encontrada"
**Solución:**
1. Ejecutar `configurarSistemaPOSCompleto()`
2. Verificar que todas las hojas se crearon
3. Revisar nombres de hojas

#### Error: "Permisos insuficientes"
**Solución:**
1. Autorizar todos los permisos solicitados
2. Verificar que la cuenta tiene permisos de edición
3. Revisar configuración de Google Workspace

#### Error: "Función no encontrada"
**Solución:**
1. Verificar que todos los archivos .gs están instalados
2. Revisar nombres de funciones
3. Verificar sintaxis del código

#### Error: "Datos no se actualizan"
**Solución:**
1. Verificar triggers configurados
2. Revisar permisos de escritura
3. Verificar integridad de datos

### Logs de Error

#### Verificar Log del Sistema
1. Ir a la hoja "Log"
2. Revisar entradas de error
3. Identificar función problemática
4. Corregir error específico

#### Limpiar Logs
```javascript
// Limpiar logs antiguos
function limpiarLogs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');
  const lastRow = sheet.getLastRow();
  if (lastRow > 1000) {
    sheet.deleteRows(1, lastRow - 1000);
  }
}
```

## 📱 Configuración Móvil

### Optimización para Móvil

#### Configurar Interfaz Móvil
1. Ir a la hoja "Venta Movil"
2. Ajustar tamaños de columna
3. Configurar validaciones
4. Probar en dispositivo móvil

#### Funciones Móviles
```javascript
// Función optimizada para móvil
function ventaRapidaMovil() {
  // Implementar venta rápida
  // Optimizar para pantalla pequeña
  // Simplificar interfaz
}
```

## 🔄 Actualizaciones

### Actualizar Sistema

#### Verificar Versión
```javascript
// Verificar versión actual
function verificarVersion() {
  const version = "1.0.0";
  console.log("Versión actual: " + version);
  return version;
}
```

#### Actualizar Código
1. Descargar nueva versión
2. Reemplazar archivos .gs
3. Ejecutar `configurarSistemaPOSCompleto()`
4. Verificar funcionamiento

### Respaldo de Datos

#### Crear Respaldo
```javascript
// Crear respaldo de datos
function crearRespaldo() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const backup = sheet.copy("Backup " + new Date().toISOString());
  return backup.getUrl();
}
```

#### Restaurar Respaldo
1. Abrir respaldo de Google Drive
2. Copiar datos a hoja principal
3. Verificar integridad de datos
4. Actualizar referencias

## 📞 Soporte

### Recursos de Ayuda

- **Documentación**: README.md
- **Documentación Técnica**: TECHNICAL_DOCS.md
- **Guía de Contribución**: CONTRIBUTING.md
- **Configuración del Proyecto**: project-config.json

### Contacto

- **Issues**: GitHub Issues
- **Discusiones**: GitHub Discussions
- **Email**: soporte@healthynola.com

---

**Guía de Instalación v1.0** 🚀
*Sistema Healthynola POS - Google Apps Script*
