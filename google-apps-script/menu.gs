/**
 * menu.gs - Menu System Controller
 * Healthynola POS System
 * 
 * This script controls the menu system for the entire application.
 * It ensures that only one menu is created and prevents conflicts.
 */

/**
 * Create the main menu system when spreadsheet opens
 * This function will be triggered automatically when the spreadsheet opens
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  
  try {
    console.log('=== INICIANDO CREACIÓN DE MENÚ PRINCIPAL ===');
    
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
    
    console.log('Menú principal creado exitosamente');
    
  } catch (error) {
    console.error('Error creando menú principal:', error);
    
    // Fallback to a simple menu if there's an error
    try {
      ui.createMenu('Healthynola POS')
        .addItem('Inicializar Sistema', 'configurarSistemaPOSCompleto')
        .addToUi();
    } catch (e) {
      console.error('Error creando menú de respaldo:', e);
    }
  }
}
