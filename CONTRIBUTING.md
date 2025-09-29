# 🤝 Guía de Contribución - Healthynola POS System

¡Gracias por tu interés en contribuir al sistema Healthynola POS! Este documento te guiará a través del proceso de contribución.

## 📋 Antes de Contribuir

### Requisitos
- Cuenta de Google
- Conocimiento básico de Google Apps Script
- Comprensión del negocio de granola/inventario
- Acceso a Google Sheets

### Configuración del Entorno
1. Clona o descarga el repositorio
2. Crea una nueva hoja de cálculo en Google Sheets
3. Abre el editor de Apps Script
4. Copia los archivos .gs al editor
5. Ejecuta `configurarSistemaPOSCompleto()` para inicializar

## 🚀 Cómo Contribuir

### 1. Reportar Problemas
- Usa el sistema de issues de GitHub
- Incluye descripción detallada del problema
- Especifica pasos para reproducir
- Incluye capturas de pantalla si es necesario

### 2. Sugerir Mejoras
- Usa el sistema de issues con etiqueta "enhancement"
- Describe la funcionalidad deseada
- Explica el beneficio para el negocio
- Incluye casos de uso específicos

### 3. Contribuir Código
- Fork del repositorio
- Crea una rama para tu feature
- Implementa los cambios
- Prueba exhaustivamente
- Envía un Pull Request

## 📝 Estándares de Código

### Estructura de Archivos
```
google-apps-script/
├── menu.gs          # Sistema de menús
├── is.gs            # Inicialización
├── rvm.gs           # Ventas móviles
├── rp.gs            # Producción
├── ri.gs            # Inventario
├── rps.gs           # Productos
├── tea.gs           # Transferencias
├── rc.gs            # Consignaciones
├── rcs.gs           # Clientes
├── rvd.gs           # Reportes ventas
├── vxv.gs           # Reportes vendedores
└── rii.gs           # Reportes inventario
```

### Convenciones de Nomenclatura
- **Funciones**: `camelCase` (ej: `registrarVenta`)
- **Variables**: `camelCase` (ej: `totalVentas`)
- **Constantes**: `UPPER_CASE` (ej: `MAX_PRODUCTOS`)
- **Archivos**: `snake_case.gs` (ej: `registrar_venta.gs`)

### Documentación
- Comentarios en español
- Documentación de funciones
- Ejemplos de uso
- Descripción de parámetros

## 🧪 Proceso de Pruebas

### Pruebas Requeridas
1. **Pruebas de Funcionalidad**
   - Todas las funciones principales
   - Validación de datos
   - Manejo de errores

2. **Pruebas de Integración**
   - Flujo completo de ventas
   - Actualización de inventario
   - Generación de reportes

3. **Pruebas de Usuario**
   - Interfaz de usuario
   - Experiencia móvil
   - Rendimiento

### Datos de Prueba
- Usa datos de prueba realistas
- No uses datos de producción
- Incluye casos edge
- Prueba con diferentes tipos de usuario

## 📋 Checklist de Contribución

### Antes de Enviar
- [ ] Código probado localmente
- [ ] Documentación actualizada
- [ ] Sin errores de sintaxis
- [ ] Funciones comentadas
- [ ] Logs implementados

### Pull Request
- [ ] Descripción clara del cambio
- [ ] Referencia a issues relacionados
- [ ] Capturas de pantalla si aplica
- [ ] Lista de cambios
- [ ] Instrucciones de prueba

## 🏗️ Arquitectura del Sistema

### Módulos Principales
1. **Sistema**: Inicialización y configuración
2. **Ventas**: Procesamiento de ventas
3. **Inventario**: Control de stock
4. **Producción**: Gestión de lotes
5. **Reportes**: Análisis y estadísticas

### Flujo de Datos
```
Ventas → Inventario → Reportes
  ↓         ↓
Producción → Lotes
  ↓
Transferencias
```

## 🔧 Desarrollo

### Herramientas Recomendadas
- Google Apps Script Editor
- Google Sheets
- GitHub Desktop
- Visual Studio Code (con extensión de Apps Script)

### Debugging
- Usa `console.log()` para debugging
- Revisa el log del sistema
- Usa breakpoints en el editor
- Valida datos paso a paso

## 📚 Recursos

### Documentación
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

### Comunidad
- [Google Apps Script Community](https://developers.google.com/apps-script/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-apps-script)

## 🎯 Roadmap

### Versión Actual (1.0)
- ✅ Sistema básico de POS
- ✅ Gestión de inventario
- ✅ Reportes básicos
- ✅ Interfaz móvil

### Próxima Versión (2.0)
- [ ] Backend web
- [ ] API REST
- [ ] Dashboard en tiempo real
- [ ] Notificaciones push

## 📞 Contacto

Para preguntas sobre contribuciones:
- Abre un issue en GitHub
- Contacta al mantenedor del proyecto
- Revisa la documentación existente

---

**¡Gracias por contribuir a Healthynola POS!** 🥣

*Tu contribución ayuda a mejorar el sistema de gestión de granola para todos los usuarios.*
