// ============================================================================
// HEALTHYNOLA POS SYSTEM - INICIALIZAR SISTEMA (is.gs)
// System Initialization and Configuration Script
// Combines: Healthynola-POS-v1.gs, onOpen-v1.gs
// ============================================================================

// ============================================================================
// MAIN SYSTEM INITIALIZATION
// ============================================================================

/**
 * Complete POS System Configuration
 * This is the main function that sets up the entire system
 */
function configurarSistemaPOSCompleto() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  registrarLog("configurarSistemaPOSCompleto", "INICIO", "Iniciando configuración completa del sistema POS", "INFO");
  
  try {
    // Show progress to user
    SpreadsheetApp.getUi().alert(
      'Inicializando Sistema Healthynola POS',
      'El sistema se está configurando. Este proceso puede tomar unos minutos.\n\nPor favor espere...',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    // Configure all system sheets in order
    configurarHojaVentas();
    configurarHojaInventario();
    configurarHojaProductos();
    configurarHojaProduccion();
    configurarHojaTransferencias();
    configurarHojaConsignaciones();
    configurarHojaClientes();
    configurarHojaLotes();
    configurarHojaGastos();
    configurarHojaVentaMovil(); // From rvm.gs
    configurarHojaLog();
    
    // Set up the menu system
    is_onOpen();
    
    // Final system validation
    validarSistemaCompleto();
    
    registrarLog("configurarSistemaPOSCompleto", "FIN", "Sistema POS configurado completamente", "ÉXITO");
    
    SpreadsheetApp.getUi().alert(
      'Sistema Configurado',
      'El sistema Healthynola POS ha sido configurado exitosamente.\n\n' +
      'Todas las hojas y menús están listos para usar.\n\n' +
      'Revise la hoja "Log" para detalles de la configuración.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    registrarLog("configurarSistemaPOSCompleto", "ERROR", "Error en configuración: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error al configurar el sistema: ' + error.toString());
  }
}

// ============================================================================
// MENU SYSTEM
// ============================================================================

/**
 * Create the main menu system when spreadsheet opens
 * Renamed to make it uniquely identifiable
 */
function is_onOpen() {
  var ui = SpreadsheetApp.getUi();
  
  registrarLog("onOpen", "INICIO", "Creando sistema de menús", "INFO");
  
  try {
    ui.createMenu('🏪 Healthynola POS')
      .addSubMenu(ui.createMenu('🚀 Sistema')
        .addItem('Inicializar Sistema Completo', 'configurarSistemaPOSCompleto')
        .addSeparator()
        .addItem('Listar Hojas Existentes', 'listarHojasExistentes')
        .addItem('Configurar Hoja Ventas', 'configurarHojaVentas')
        .addItem('Configurar Hoja Inventario', 'configurarHojaInventario')
        .addItem('Configurar Hoja Productos', 'configurarHojaProductos')
        .addItem('Configurar Hoja Producción', 'configurarHojaProduccion')
        .addSeparator()
        .addItem('Validar Sistema', 'validarSistemaCompleto')
        .addItem('Ver Log del Sistema', 'mostrarLogSistema'))
      
      .addSubMenu(ui.createMenu('💰 Ventas')
        .addItem('Configurar Hoja Ventas', 'configurarHojaVentas')
        .addItem('Registrar Venta Móvil', 'registrarVentaMovil')
        .addItem('Configurar Venta Móvil', 'configurarHojaVentaMovil')
        .addSeparator()
        .addItem('Cancelar Venta', 'mostrarDialogoCancelarVenta')
        .addItem('Limpiar Formulario', 'limpiarFormularioVentaMovil'))
      
      .addSubMenu(ui.createMenu('🏭 Producción')
        .addItem('Configurar Hoja Producción', 'configurarHojaProduccion')
        .addItem('Registrar Producción', 'registrarProduccion')
        .addItem('Limpiar Hoja Producción', 'limpiarHojaProduccion'))
      
      .addSubMenu(ui.createMenu('📦 Inventario')
        .addItem('Configurar Hoja Inventario', 'configurarHojaInventario')
        .addItem('Actualizar Inventario', 'actualizarInventarioDinamico')
        .addItem('Ver Inventario Bajo', 'mostrarInventarioBajo')
        .addSubMenu(ui.createMenu('Reportes de Inventario')
          .addItem('Reporte Completo', 'reporteInventarioCompleto')
          .addItem('Reporte de Inventario Bajo', 'reporteInventarioBajo')
          .addItem('Reporte de Movimiento', 'reporteMovimientoInventario')
          .addItem('Reporte de Valoración', 'reporteValoracionInventario')
          .addItem('Reporte de Vencimiento de Lotes', 'reporteVencimientoLotes')
          .addItem('Reporte de Rotación', 'reporteRotacionInventario')))
      
      .addSubMenu(ui.createMenu('🛍️ Productos')
        .addItem('Configurar Hoja Productos', 'configurarHojaProductos')
        .addItem('Registrar Producto', 'registrarProducto')
        .addItem('Ver Todos los Productos', 'mostrarTodosLosProductos'))
      
      .addSubMenu(ui.createMenu('🔄 Transferencias')
        .addItem('Configurar Hoja Transferencias', 'configurarHojaTransferencias')
        .addItem('Transferir Entre Almacenes', 'transferirEntreAlmacenes')
        .addItem('Limpiar Hoja Transferencias', 'limpiarHojaTransferencias'))
      
      .addSubMenu(ui.createMenu('🤝 Consignaciones')
        .addItem('Configurar Hoja Consignaciones', 'configurarHojaConsignaciones')
        .addItem('Registrar Consignación', 'registrarConsignacion')
        .addItem('Limpiar Hoja Consignaciones', 'limpiarHojaConsignaciones'))
      
      .addSubMenu(ui.createMenu('👥 Clientes')
        .addItem('Configurar Hoja Clientes', 'configurarHojaClientes')
        .addItem('Registrar Cliente', 'registrarCliente'))
      
      .addSubMenu(ui.createMenu('📋 Lotes')
        .addItem('Configurar Hoja Lotes', 'configurarHojaLotes')
        .addItem('Registrar Lote', 'registrarLote'))
      
      .addSubMenu(ui.createMenu('💸 Gastos')
        .addItem('Configurar Hoja Gastos', 'configurarHojaGastos')
        .addItem('Registrar Gasto', 'registrarGasto')
        .addItem('Limpiar Hoja Gastos', 'limpiarHojaGastos'))
      
      .addSubMenu(ui.createMenu('📊 Reportes')
        .addItem('Resumen Ventas Diario', 'generarResumenVentasDiario')
        .addItem('Reporte Inventario', 'generarReporteInventario')
        .addSeparator()
        .addSubMenu(ui.createMenu('📈 Ventas por Vendedor')
          .addItem('Reporte General de Vendedores', 'reporteVentasPorVendedor')
          .addItem('Comparar Vendedores', 'compararVendedores')
          .addItem('Reporte Individual de Vendedor', 'reporteVendedorIndividual')
          .addItem('Seguimiento de Metas y Comisiones', 'seguimientoMetasComisiones')
          .addItem('Productos por Vendedor', 'reporteProductosPorVendedor'))
        .addSeparator()
        .addItem('Hacer Respaldo', 'hacerRespaldoSistema'))
      
      .addToUi();
    
    registrarLog("onOpen", "FIN", "Sistema de menús creado exitosamente", "ÉXITO");
    
  } catch (error) {
    registrarLog("onOpen", "ERROR", "Error creando menús: " + error.toString(), "ERROR");
    console.error('Error creando menú principal:', error);
  }
}

// ============================================================================
// SHEET CONFIGURATION FUNCTIONS
// ============================================================================

/**
 * Configure the Ventas sheet
 */
function configurarHojaVentas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaVentas = ss.getSheetByName("Ventas");
  
  registrarLog("configurarHojaVentas", "INICIO", "Configurando hoja Ventas", "INFO");
  
  if (!hojaVentas) {
    hojaVentas = ss.insertSheet("Ventas");
    registrarLog("configurarHojaVentas", "DETALLE", "Hoja Ventas creada", "INFO");
  }
  
  // Clear existing content
  hojaVentas.clear();
  
  // Set headers
  var headers = [
    "Fecha", "Cliente", "Producto", "Cantidad", "Precio Unitario", 
    "Subtotal", "Método de Pago", "Total", "Vendedor", "Almacén", "Notas"
  ];
  
  hojaVentas.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  var headerRange = hojaVentas.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#4285F4")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  
  // Set column widths
  var columnWidths = [100, 150, 200, 80, 100, 100, 120, 100, 120, 100, 200];
  for (var i = 0; i < columnWidths.length; i++) {
    hojaVentas.setColumnWidth(i + 1, columnWidths[i]);
  }
  
  // Freeze header row
  hojaVentas.setFrozenRows(1);
  
  registrarLog("configurarHojaVentas", "FIN", "Hoja Ventas configurada exitosamente", "ÉXITO");
}

/**
 * Configure the Inventario sheet
 */
function configurarHojaInventario() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaInventario = ss.getSheetByName("Inventario");
  
  registrarLog("configurarHojaInventario", "INICIO", "Configurando hoja Inventario", "INFO");
  
  if (!hojaInventario) {
    hojaInventario = ss.insertSheet("Inventario");
    registrarLog("configurarHojaInventario", "DETALLE", "Hoja Inventario creada", "INFO");
  }
  
  // Clear existing content
  hojaInventario.clear();
  
  // Set headers
  var headers = [
    "Producto", "Almacén", "Cantidad Actual", "Cantidad Mínima", 
    "Última Actualización", "Estado", "Notas"
  ];
  
  hojaInventario.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  var headerRange = hojaInventario.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#4285F4")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  
  // Set column widths
  var columnWidths = [200, 120, 100, 100, 120, 100, 200];
  for (var i = 0; i < columnWidths.length; i++) {
    hojaInventario.setColumnWidth(i + 1, columnWidths[i]);
  }
  
  // Freeze header row
  hojaInventario.setFrozenRows(1);
  
  registrarLog("configurarHojaInventario", "FIN", "Hoja Inventario configurada exitosamente", "ÉXITO");
}

/**
 * Configure the Productos sheet
 */
function configurarHojaProductos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaProductos = ss.getSheetByName("Productos");
  
  registrarLog("configurarHojaProductos", "INICIO", "Configurando hoja Productos", "INFO");
  
  if (!hojaProductos) {
    hojaProductos = ss.insertSheet("Productos");
    registrarLog("configurarHojaProductos", "DETALLE", "Hoja Productos creada", "INFO");
  }
  
  // Clear existing content
  hojaProductos.clear();
  
  // Set headers
  var headers = [
    "Código", "Nombre", "Descripción", "Precio", "Costo", 
    "Categoría", "Unidad", "Estado", "Fecha Creación"
  ];
  
  hojaProductos.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  var headerRange = hojaProductos.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#4285F4")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  
  // Set column widths
  var columnWidths = [100, 200, 250, 100, 100, 120, 80, 100, 120];
  for (var i = 0; i < columnWidths.length; i++) {
    hojaProductos.setColumnWidth(i + 1, columnWidths[i]);
  }
  
  // Freeze header row
  hojaProductos.setFrozenRows(1);
  
  registrarLog("configurarHojaProductos", "FIN", "Hoja Productos configurada exitosamente", "ÉXITO");
}

/**
 * Configure the Producción sheet
 */
function configurarHojaProduccion() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaProduccion = ss.getSheetByName("Producción");
  
  registrarLog("configurarHojaProduccion", "INICIO", "Configurando hoja Producción", "INFO");
  
  if (!hojaProduccion) {
    hojaProduccion = ss.insertSheet("Producción");
    registrarLog("configurarHojaProduccion", "DETALLE", "Hoja Producción creada", "INFO");
  }
  
  // Clear existing content
  hojaProduccion.clear();
  
  // Set headers
  var headers = [
    "Fecha Producción", "Lote", "Producto", "Cantidad Producida", 
    "Almacén Destino", "Costo Total", "Notas"
  ];
  
  hojaProduccion.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  var headerRange = hojaProduccion.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#4285F4")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  
  // Set column widths
  var columnWidths = [120, 120, 200, 120, 120, 100, 200];
  for (var i = 0; i < columnWidths.length; i++) {
    hojaProduccion.setColumnWidth(i + 1, columnWidths[i]);
  }
  
  // Freeze header row
  hojaProduccion.setFrozenRows(1);
  
  registrarLog("configurarHojaProduccion", "FIN", "Hoja Producción configurada exitosamente", "ÉXITO");
}

/**
 * Configure the Transferencias sheet
 */
function configurarHojaTransferencias() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaTransferencias = ss.getSheetByName("Transferencias");
  
  registrarLog("configurarHojaTransferencias", "INICIO", "Configurando hoja Transferencias", "INFO");
  
  if (!hojaTransferencias) {
    hojaTransferencias = ss.insertSheet("Transferencias");
    registrarLog("configurarHojaTransferencias", "DETALLE", "Hoja Transferencias creada", "INFO");
  }
  
  // Clear existing content
  hojaTransferencias.clear();
  
  // Set headers
  var headers = [
    "Fecha", "Producto", "Cantidad", "Almacén Origen", 
    "Almacén Destino", "Motivo", "Responsable"
  ];
  
  hojaTransferencias.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  var headerRange = hojaTransferencias.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#4285F4")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  
  // Set column widths
  var columnWidths = [100, 200, 100, 120, 120, 200, 150];
  for (var i = 0; i < columnWidths.length; i++) {
    hojaTransferencias.setColumnWidth(i + 1, columnWidths[i]);
  }
  
  // Freeze header row
  hojaTransferencias.setFrozenRows(1);
  
  registrarLog("configurarHojaTransferencias", "FIN", "Hoja Transferencias configurada exitosamente", "ÉXITO");
}

/**
 * Configure the Consignaciones sheet
 */
function configurarHojaConsignaciones() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaConsignaciones = ss.getSheetByName("Consignaciones");
  
  registrarLog("configurarHojaConsignaciones", "INICIO", "Configurando hoja Consignaciones", "INFO");
  
  if (!hojaConsignaciones) {
    hojaConsignaciones = ss.insertSheet("Consignaciones");
    registrarLog("configurarHojaConsignaciones", "DETALLE", "Hoja Consignaciones creada", "INFO");
  }
  
  // Clear existing content
  hojaConsignaciones.clear();
  
  // Set headers
  var headers = [
    "Fecha", "Cliente", "Producto", "Cantidad", "Precio Unitario", 
    "Total", "Días Vencimiento", "Estado", "Notas"
  ];
  
  hojaConsignaciones.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  var headerRange = hojaConsignaciones.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#4285F4")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  
  // Set column widths
  var columnWidths = [100, 150, 200, 100, 120, 100, 120, 100, 200];
  for (var i = 0; i < columnWidths.length; i++) {
    hojaConsignaciones.setColumnWidth(i + 1, columnWidths[i]);
  }
  
  // Freeze header row
  hojaConsignaciones.setFrozenRows(1);
  
  registrarLog("configurarHojaConsignaciones", "FIN", "Hoja Consignaciones configurada exitosamente", "ÉXITO");
}

/**
 * Configure the Clientes sheet
 */
function configurarHojaClientes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaClientes = ss.getSheetByName("Clientes");
  
  registrarLog("configurarHojaClientes", "INICIO", "Configurando hoja Clientes", "INFO");
  
  if (!hojaClientes) {
    hojaClientes = ss.insertSheet("Clientes");
    registrarLog("configurarHojaClientes", "DETALLE", "Hoja Clientes creada", "INFO");
  }
  
  // Clear existing content
  hojaClientes.clear();
  
  // Set headers
  var headers = [
    "Nombre", "Teléfono", "Email", "Dirección", "Ciudad", 
    "Tipo", "Fecha Registro", "Estado"
  ];
  
  hojaClientes.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  var headerRange = hojaClientes.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#4285F4")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  
  // Set column widths
  var columnWidths = [150, 120, 200, 250, 120, 120, 120, 100];
  for (var i = 0; i < columnWidths.length; i++) {
    hojaClientes.setColumnWidth(i + 1, columnWidths[i]);
  }
  
  // Freeze header row
  hojaClientes.setFrozenRows(1);
  
  registrarLog("configurarHojaClientes", "FIN", "Hoja Clientes configurada exitosamente", "ÉXITO");
}

/**
 * Configure the Lotes sheet
 */
function configurarHojaLotes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaLotes = ss.getSheetByName("Lotes");
  
  registrarLog("configurarHojaLotes", "INICIO", "Configurando hoja Lotes", "INFO");
  
  if (!hojaLotes) {
    hojaLotes = ss.insertSheet("Lotes");
    registrarLog("configurarHojaLotes", "DETALLE", "Hoja Lotes creada", "INFO");
  }
  
  // Clear existing content
  hojaLotes.clear();
  
  // Set headers
  var headers = [
    "Lote", "Producto", "Fecha Producción", "Fecha Vencimiento", 
    "Cantidad Inicial", "Cantidad Disponible", "Almacén", "Estado"
  ];
  
  hojaLotes.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  var headerRange = hojaLotes.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#4285F4")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  
  // Set column widths
  var columnWidths = [120, 200, 120, 120, 120, 120, 120, 100];
  for (var i = 0; i < columnWidths.length; i++) {
    hojaLotes.setColumnWidth(i + 1, columnWidths[i]);
  }
  
  // Freeze header row
  hojaLotes.setFrozenRows(1);
  
  registrarLog("configurarHojaLotes", "FIN", "Hoja Lotes configurada exitosamente", "ÉXITO");
}

/**
 * Configure the Gastos sheet
 */
function configurarHojaGastos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaGastos = ss.getSheetByName("Gastos");
  
  registrarLog("configurarHojaGastos", "INICIO", "Configurando hoja Gastos", "INFO");
  
  if (!hojaGastos) {
    hojaGastos = ss.insertSheet("Gastos");
    registrarLog("configurarHojaGastos", "DETALLE", "Hoja Gastos creada", "INFO");
  }
  
  // Clear existing content
  hojaGastos.clear();
  
  // Set headers
  var headers = [
    "Fecha", "Concepto", "Categoría", "Monto", 
    "Método de Pago", "Responsable", "Notas"
  ];
  
  hojaGastos.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  var headerRange = hojaGastos.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#4285F4")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  
  // Set column widths
  var columnWidths = [100, 200, 120, 100, 120, 150, 200];
  for (var i = 0; i < columnWidths.length; i++) {
    hojaGastos.setColumnWidth(i + 1, columnWidths[i]);
  }
  
  // Freeze header row
  hojaGastos.setFrozenRows(1);
  
  registrarLog("configurarHojaGastos", "FIN", "Hoja Gastos configurada exitosamente", "ÉXITO");
}

/**
 * Configure the Log sheet
 */
function configurarHojaLog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaLog = ss.getSheetByName("Log");
  
  registrarLog("configurarHojaLog", "INICIO", "Configurando hoja Log", "INFO");
  
  if (!hojaLog) {
    hojaLog = ss.insertSheet("Log");
    registrarLog("configurarHojaLog", "DETALLE", "Hoja Log creada", "INFO");
  }
  
  // Clear existing content
  hojaLog.clear();
  
  // Set headers
  var headers = [
    "Timestamp", "Función", "Tipo", "Mensaje", "Nivel"
  ];
  
  hojaLog.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  var headerRange = hojaLog.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#4285F4")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  
  // Set column widths
  var columnWidths = [150, 200, 100, 300, 100];
  for (var i = 0; i < columnWidths.length; i++) {
    hojaLog.setColumnWidth(i + 1, columnWidths[i]);
  }
  
  // Freeze header row
  hojaLog.setFrozenRows(1);
  
  registrarLog("configurarHojaLog", "FIN", "Hoja Log configurada exitosamente", "ÉXITO");
}

// ============================================================================
// SYSTEM VALIDATION FUNCTIONS
// ============================================================================

/**
 * List all existing sheets
 */
function listarHojasExistentes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojas = ss.getSheets();
  
  var mensaje = "Hojas existentes en el sistema:\n\n";
  
  for (var i = 0; i < hojas.length; i++) {
    mensaje += (i + 1) + ". " + hojas[i].getName() + "\n";
  }
  
  mensaje += "\nTotal: " + hojas.length + " hojas";
  
  SpreadsheetApp.getUi().alert("Hojas Existentes", mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
  
  registrarLog("listarHojasExistentes", "INFO", "Listadas " + hojas.length + " hojas", "INFO");
}

/**
 * Validate complete system
 */
function validarSistemaCompleto() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojas = ss.getSheets();
  
  registrarLog("validarSistemaCompleto", "INICIO", "Iniciando validación del sistema", "INFO");
  
  var hojasRequeridas = [
    "Ventas", "Inventario", "Productos", "Producción", 
    "Transferencias", "Consignaciones", "Clientes", 
    "Lotes", "Gastos", "Venta Movil", "Log"
  ];
  
  var hojasFaltantes = [];
  var hojasExistentes = [];
  
  for (var i = 0; i < hojasRequeridas.length; i++) {
    var hojaRequerida = hojasRequeridas[i];
    var existe = false;
    
    for (var j = 0; j < hojas.length; j++) {
      if (hojas[j].getName() === hojaRequerida) {
        existe = true;
        hojasExistentes.push(hojaRequerida);
        break;
      }
    }
    
    if (!existe) {
      hojasFaltantes.push(hojaRequerida);
    }
  }
  
  var mensaje = "Validación del Sistema:\n\n";
  mensaje += "Hojas existentes: " + hojasExistentes.length + "/" + hojasRequeridas.length + "\n\n";
  
  if (hojasFaltantes.length > 0) {
    mensaje += "Hojas faltantes:\n";
    for (var k = 0; k < hojasFaltantes.length; k++) {
      mensaje += "• " + hojasFaltantes[k] + "\n";
    }
    mensaje += "\nEjecute 'Inicializar Sistema Completo' para crear las hojas faltantes.";
  } else {
    mensaje += "✅ Todas las hojas requeridas están presentes.\n\nSistema validado correctamente.";
  }
  
  SpreadsheetApp.getUi().alert("Validación del Sistema", mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
  
  registrarLog("validarSistemaCompleto", "FIN", 
    "Validación completada. Hojas: " + hojasExistentes.length + "/" + hojasRequeridas.length, 
    hojasFaltantes.length === 0 ? "ÉXITO" : "ADVERTENCIA");
}

/**
 * Show system log
 */
function mostrarLogSistema() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaLog = ss.getSheetByName("Log");
  
  if (!hojaLog) {
    SpreadsheetApp.getUi().alert("Error", "Hoja Log no encontrada", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  var data = hojaLog.getDataRange().getValues();
  
  if (data.length <= 1) {
    SpreadsheetApp.getUi().alert("Log Vacío", "No hay entradas en el log del sistema", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  var mensaje = "Últimas 10 entradas del log:\n\n";
  var inicio = Math.max(1, data.length - 10);
  
  for (var i = inicio; i < data.length; i++) {
    var fila = data[i];
    mensaje += fila[0] + " | " + fila[1] + " | " + fila[2] + " | " + fila[3] + "\n";
  }
  
  SpreadsheetApp.getUi().alert("Log del Sistema", mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ============================================================================
// LOGGING SYSTEM
// ============================================================================

/**
 * Register log entry
 */
function registrarLog(funcion, tipo, mensaje, nivel) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hojaLog = ss.getSheetByName("Log");
    
    if (!hojaLog) {
      console.log("Log: " + funcion + " | " + tipo + " | " + mensaje);
      return;
    }
    
    var timestamp = new Date();
    var fila = [timestamp, funcion, tipo, mensaje, nivel];
    
    hojaLog.appendRow(fila);
    
    // Keep only last 1000 entries
    var ultimaFila = hojaLog.getLastRow();
    if (ultimaFila > 1000) {
      hojaLog.deleteRows(1, ultimaFila - 1000);
    }
    
  } catch (error) {
    console.error("Error registrando log:", error);
  }
}
