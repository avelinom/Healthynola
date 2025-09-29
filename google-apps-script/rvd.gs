/**
 * HEALTHYNOLA POS SYSTEM
 * Daily Sales Summary Module (rvd.gs)
 * Handles daily sales reporting, analytics, and summaries
 * 
 * Features:
 * - Daily sales summary generation
 * - Multi-period sales analysis
 * - Product performance tracking
 * - Payment method analysis
 * - Sales trend visualization
 * - Comparative reporting
 * - Automated daily reports
 * - Sales target tracking
 */

// ==================== CORE DAILY SALES FUNCTIONS ====================

/**
 * Generate daily sales summary for today
 */
function resumenVentasHoy() {
  try {
    console.log('=== GENERANDO RESUMEN DE VENTAS DE HOY ===');
    
    const hoy = new Date();
    const fechaStr = Utilities.formatDate(hoy, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    generarResumenVentasDiario(fechaStr);
    
  } catch (error) {
    console.error('Error en resumenVentasHoy:', error);
    SpreadsheetApp.getUi().alert('❌ Error al generar resumen de hoy: ' + error.message);
  }
}

/**
 * Generate daily sales summary for a specific date
 */
function resumenVentasFecha() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    const fechaResponse = ui.prompt(
      'Resumen de Ventas por Fecha',
      'Ingrese la fecha para el resumen (DD/MM/YYYY):',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (fechaResponse.getSelectedButton() !== ui.Button.OK) {
      return;
    }
    
    const fechaInput = fechaResponse.getResponseText().trim();
    const fecha = parsearFecha(fechaInput);
    
    if (!fecha) {
      ui.alert('❌ Formato de fecha inválido. Use DD/MM/YYYY');
      return;
    }
    
    const fechaStr = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    generarResumenVentasDiario(fechaStr);
    
  } catch (error) {
    console.error('Error en resumenVentasFecha:', error);
    SpreadsheetApp.getUi().alert('❌ Error al generar resumen: ' + error.message);
  }
}

/**
 * Generate comprehensive daily sales summary
 */
function generarResumenVentasDiario(fechaStr) {
  try {
    console.log('Generando resumen para fecha:', fechaStr);
    
    // Get sales data for the specified date
    const ventasDelDia = obtenerVentasDelDia(fechaStr);
    
    if (ventasDelDia.length === 0) {
      SpreadsheetApp.getUi().alert(
        'Sin Ventas',
        `No se encontraron ventas para la fecha: ${fechaStr}`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }
    
    // Calculate daily statistics
    const estadisticas = calcularEstadisticasDiarias(ventasDelDia, fechaStr);
    
    // Create or update daily summary sheet
    const resumenSheet = crearHojaResumenDiario(fechaStr, estadisticas, ventasDelDia);
    
    // Show summary alert
    mostrarResumenAlerta(estadisticas, fechaStr);
    
    // Activate the summary sheet
    resumenSheet.activate();
    
    console.log('Resumen diario generado exitosamente');
    
  } catch (error) {
    console.error('Error en generarResumenVentasDiario:', error);
    throw error;
  }
}

/**
 * Generate sales summary for a date range
 */
function resumenVentasRango() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    const fechaInicioResponse = ui.prompt(
      'Resumen de Ventas por Rango',
      'Ingrese la fecha de inicio (DD/MM/YYYY):',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (fechaInicioResponse.getSelectedButton() !== ui.Button.OK) {
      return;
    }
    
    const fechaFinResponse = ui.prompt(
      'Resumen de Ventas por Rango',
      'Ingrese la fecha de fin (DD/MM/YYYY):',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (fechaFinResponse.getSelectedButton() !== ui.Button.OK) {
      return;
    }
    
    const fechaInicio = parsearFecha(fechaInicioResponse.getResponseText().trim());
    const fechaFin = parsearFecha(fechaFinResponse.getResponseText().trim());
    
    if (!fechaInicio || !fechaFin) {
      ui.alert('❌ Formato de fecha inválido. Use DD/MM/YYYY');
      return;
    }
    
    if (fechaInicio > fechaFin) {
      ui.alert('❌ La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }
    
    generarResumenVentasRango(fechaInicio, fechaFin);
    
  } catch (error) {
    console.error('Error en resumenVentasRango:', error);
    SpreadsheetApp.getUi().alert('❌ Error al generar resumen de rango: ' + error.message);
  }
}

/**
 * Generate comprehensive range sales summary
 */
function generarResumenVentasRango(fechaInicio, fechaFin) {
  try {
    console.log('Generando resumen para rango:', fechaInicio, 'a', fechaFin);
    
    // Get sales data for the range
    const ventasDelRango = obtenerVentasDelRango(fechaInicio, fechaFin);
    
    if (ventasDelRango.length === 0) {
      SpreadsheetApp.getUi().alert(
        'Sin Ventas',
        `No se encontraron ventas en el rango especificado`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }
    
    // Calculate range statistics
    const estadisticas = calcularEstadisticasRango(ventasDelRango, fechaInicio, fechaFin);
    
    // Create range summary sheet
    const resumenSheet = crearHojaResumenRango(fechaInicio, fechaFin, estadisticas, ventasDelRango);
    
    // Show summary alert
    mostrarResumenRangoAlerta(estadisticas, fechaInicio, fechaFin);
    
    // Activate the summary sheet
    resumenSheet.activate();
    
    console.log('Resumen de rango generado exitosamente');
    
  } catch (error) {
    console.error('Error en generarResumenVentasRango:', error);
    throw error;
  }
}

// ==================== DATA RETRIEVAL FUNCTIONS ====================

/**
 * Get sales data for a specific date
 */
function obtenerVentasDelDia(fechaStr) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
    if (!sheet) {
      throw new Error('Hoja de Ventas no encontrada');
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }
    
    // Find column indexes
    const headers = data[0];
    const fechaIndex = headers.findIndex(header => header.toString().toLowerCase().includes('fecha'));
    
    if (fechaIndex === -1) {
      throw new Error('Columna de fecha no encontrada en la hoja de Ventas');
    }
    
    // Filter sales by date
    const ventas = [];
    const fechaTarget = new Date(fechaStr);
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const fecha = row[fechaIndex];
      
      if (fecha instanceof Date) {
        const fechaRow = new Date(fecha);
        fechaRow.setHours(0, 0, 0, 0);
        fechaTarget.setHours(0, 0, 0, 0);
        
        if (fechaRow.getTime() === fechaTarget.getTime()) {
          ventas.push(parsearVenta(row, headers));
        }
      }
    }
    
    return ventas;
    
  } catch (error) {
    console.error('Error en obtenerVentasDelDia:', error);
    throw error;
  }
}

/**
 * Get sales data for a date range
 */
function obtenerVentasDelRango(fechaInicio, fechaFin) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
    if (!sheet) {
      throw new Error('Hoja de Ventas no encontrada');
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }
    
    // Find column indexes
    const headers = data[0];
    const fechaIndex = headers.findIndex(header => header.toString().toLowerCase().includes('fecha'));
    
    if (fechaIndex === -1) {
      throw new Error('Columna de fecha no encontrada en la hoja de Ventas');
    }
    
    // Filter sales by date range
    const ventas = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const fecha = row[fechaIndex];
      
      if (fecha instanceof Date && fecha >= fechaInicio && fecha <= fechaFin) {
        ventas.push(parsearVenta(row, headers));
      }
    }
    
    return ventas;
    
  } catch (error) {
    console.error('Error en obtenerVentasDelRango:', error);
    throw error;
  }
}

/**
 * Parse a sales row into a structured object
 */
function parsearVenta(row, headers) {
  const clienteIndex = 0;
  const productoIndex = headers.findIndex(header => header.toString().toLowerCase().includes('producto'));
  const cantidadIndex = headers.findIndex(header => header.toString().toLowerCase().includes('cantidad'));
  const precioIndex = headers.findIndex(header => header.toString().toLowerCase().includes('precio'));
  const subtotalIndex = headers.findIndex(header => header.toString().toLowerCase().includes('subtotal'));
  const metodoPagoIndex = headers.findIndex(header => header.toString().toLowerCase().includes('método') || header.toString().toLowerCase().includes('metodo'));
  const totalIndex = headers.findIndex(header => header.toString().toLowerCase().includes('total'));
  const vendedorIndex = headers.findIndex(header => header.toString().toLowerCase().includes('vendedor'));
  const fechaIndex = headers.findIndex(header => header.toString().toLowerCase().includes('fecha'));
  
  return {
    cliente: row[clienteIndex] || 'Sin cliente',
    producto: productoIndex >= 0 ? (row[productoIndex] || 'Sin producto') : 'Sin producto',
    cantidad: cantidadIndex >= 0 ? (parseFloat(row[cantidadIndex]) || 0) : 0,
    precioUnitario: precioIndex >= 0 ? (parseFloat(row[precioIndex]) || 0) : 0,
    subtotal: subtotalIndex >= 0 ? (parseFloat(row[subtotalIndex]) || 0) : 0,
    metodoPago: metodoPagoIndex >= 0 ? (row[metodoPagoIndex] || 'Sin método') : 'Sin método',
    total: totalIndex >= 0 ? (parseFloat(row[totalIndex]) || 0) : 0,
    vendedor: vendedorIndex >= 0 ? (row[vendedorIndex] || 'Sin vendedor') : 'Sin vendedor',
    fecha: row[fechaIndex] || new Date()
  };
}

// ==================== STATISTICS CALCULATION ====================

/**
 * Calculate daily sales statistics
 */
function calcularEstadisticasDiarias(ventas, fechaStr) {
  try {
    const estadisticas = {
      fecha: fechaStr,
      totalVentas: 0,
      cantidadTransacciones: ventas.length,
      cantidadProductos: 0,
      promedioVenta: 0,
      ventasPorVendedor: {},
      ventasPorProducto: {},
      ventasPorMetodoPago: {},
      clientesAtendidos: new Set(),
      productosVendidos: new Set()
    };
    
    // Calculate basic statistics
    ventas.forEach(venta => {
      estadisticas.totalVentas += venta.total;
      estadisticas.cantidadProductos += venta.cantidad;
      estadisticas.clientesAtendidos.add(venta.cliente);
      estadisticas.productosVendidos.add(venta.producto);
      
      // Group by vendor
      if (!estadisticas.ventasPorVendedor[venta.vendedor]) {
        estadisticas.ventasPorVendedor[venta.vendedor] = {
          vendedor: venta.vendedor,
          total: 0,
          transacciones: 0
        };
      }
      estadisticas.ventasPorVendedor[venta.vendedor].total += venta.total;
      estadisticas.ventasPorVendedor[venta.vendedor].transacciones++;
      
      // Group by product
      if (!estadisticas.ventasPorProducto[venta.producto]) {
        estadisticas.ventasPorProducto[venta.producto] = {
          producto: venta.producto,
          cantidad: 0,
          total: 0,
          transacciones: 0
        };
      }
      estadisticas.ventasPorProducto[venta.producto].cantidad += venta.cantidad;
      estadisticas.ventasPorProducto[venta.producto].total += venta.total;
      estadisticas.ventasPorProducto[venta.producto].transacciones++;
      
      // Group by payment method
      if (!estadisticas.ventasPorMetodoPago[venta.metodoPago]) {
        estadisticas.ventasPorMetodoPago[venta.metodoPago] = {
          metodo: venta.metodoPago,
          total: 0,
          transacciones: 0
        };
      }
      estadisticas.ventasPorMetodoPago[venta.metodoPago].total += venta.total;
      estadisticas.ventasPorMetodoPago[venta.metodoPago].transacciones++;
    });
    
    // Calculate derived statistics
    estadisticas.promedioVenta = estadisticas.cantidadTransacciones > 0 ? 
      estadisticas.totalVentas / estadisticas.cantidadTransacciones : 0;
    
    estadisticas.cantidadClientes = estadisticas.clientesAtendidos.size;
    estadisticas.cantidadProductosUnicos = estadisticas.productosVendidos.size;
    
    // Convert objects to arrays for easier processing
    estadisticas.ventasPorVendedorArray = Object.values(estadisticas.ventasPorVendedor)
      .sort((a, b) => b.total - a.total);
    
    estadisticas.ventasPorProductoArray = Object.values(estadisticas.ventasPorProducto)
      .sort((a, b) => b.total - a.total);
    
    estadisticas.ventasPorMetodoPagoArray = Object.values(estadisticas.ventasPorMetodoPago)
      .sort((a, b) => b.total - a.total);
    
    return estadisticas;
    
  } catch (error) {
    console.error('Error en calcularEstadisticasDiarias:', error);
    throw error;
  }
}

/**
 * Calculate range sales statistics
 */
function calcularEstadisticasRango(ventas, fechaInicio, fechaFin) {
  try {
    const estadisticas = {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      totalVentas: 0,
      cantidadTransacciones: ventas.length,
      cantidadProductos: 0,
      promedioVenta: 0,
      promedioDiario: 0,
      ventasPorVendedor: {},
      ventasPorProducto: {},
      ventasPorMetodoPago: {},
      ventasPorDia: {},
      clientesAtendidos: new Set(),
      productosVendidos: new Set()
    };
    
    // Calculate basic statistics
    ventas.forEach(venta => {
      estadisticas.totalVentas += venta.total;
      estadisticas.cantidadProductos += venta.cantidad;
      estadisticas.clientesAtendidos.add(venta.cliente);
      estadisticas.productosVendidos.add(venta.producto);
      
      // Group by vendor
      if (!estadisticas.ventasPorVendedor[venta.vendedor]) {
        estadisticas.ventasPorVendedor[venta.vendedor] = {
          vendedor: venta.vendedor,
          total: 0,
          transacciones: 0
        };
      }
      estadisticas.ventasPorVendedor[venta.vendedor].total += venta.total;
      estadisticas.ventasPorVendedor[venta.vendedor].transacciones++;
      
      // Group by product
      if (!estadisticas.ventasPorProducto[venta.producto]) {
        estadisticas.ventasPorProducto[venta.producto] = {
          producto: venta.producto,
          cantidad: 0,
          total: 0,
          transacciones: 0
        };
      }
      estadisticas.ventasPorProducto[venta.producto].cantidad += venta.cantidad;
      estadisticas.ventasPorProducto[venta.producto].total += venta.total;
      estadisticas.ventasPorProducto[venta.producto].transacciones++;
      
      // Group by payment method
      if (!estadisticas.ventasPorMetodoPago[venta.metodoPago]) {
        estadisticas.ventasPorMetodoPago[venta.metodoPago] = {
          metodo: venta.metodoPago,
          total: 0,
          transacciones: 0
        };
      }
      estadisticas.ventasPorMetodoPago[venta.metodoPago].total += venta.total;
      estadisticas.ventasPorMetodoPago[venta.metodoPago].transacciones++;
      
      // Group by day
      const fechaStr = Utilities.formatDate(venta.fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      if (!estadisticas.ventasPorDia[fechaStr]) {
        estadisticas.ventasPorDia[fechaStr] = {
          fecha: venta.fecha,
          total: 0,
          transacciones: 0
        };
      }
      estadisticas.ventasPorDia[fechaStr].total += venta.total;
      estadisticas.ventasPorDia[fechaStr].transacciones++;
    });
    
    // Calculate derived statistics
    estadisticas.promedioVenta = estadisticas.cantidadTransacciones > 0 ? 
      estadisticas.totalVentas / estadisticas.cantidadTransacciones : 0;
    
    const diasConVentas = Object.keys(estadisticas.ventasPorDia).length;
    estadisticas.promedioDiario = diasConVentas > 0 ? estadisticas.totalVentas / diasConVentas : 0;
    
    estadisticas.cantidadClientes = estadisticas.clientesAtendidos.size;
    estadisticas.cantidadProductosUnicos = estadisticas.productosVendidos.size;
    
    // Convert objects to arrays for easier processing
    estadisticas.ventasPorVendedorArray = Object.values(estadisticas.ventasPorVendedor)
      .sort((a, b) => b.total - a.total);
    
    estadisticas.ventasPorProductoArray = Object.values(estadisticas.ventasPorProducto)
      .sort((a, b) => b.total - a.total);
    
    estadisticas.ventasPorMetodoPagoArray = Object.values(estadisticas.ventasPorMetodoPago)
      .sort((a, b) => b.total - a.total);
    
    estadisticas.ventasPorDiaArray = Object.values(estadisticas.ventasPorDia)
      .sort((a, b) => a.fecha - b.fecha);
    
    return estadisticas;
    
  } catch (error) {
    console.error('Error en calcularEstadisticasRango:', error);
    throw error;
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Parse date string in DD/MM/YYYY format
 */
function parsearFecha(fechaStr) {
  try {
    const partes = fechaStr.split('/');
    if (partes.length !== 3) {
      return null;
    }
    
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1; // JavaScript months are 0-based
    const año = parseInt(partes[2]);
    
    if (isNaN(dia) || isNaN(mes) || isNaN(año)) {
      return null;
    }
    
    const fecha = new Date(año, mes, dia);
    
    // Validate the date
    if (fecha.getDate() !== dia || fecha.getMonth() !== mes || fecha.getFullYear() !== año) {
      return null;
    }
    
    return fecha;
    
  } catch (error) {
    console.error('Error parseando fecha:', error);
    return null;
  }
}

/**
 * Show daily summary alert
 */
function mostrarResumenAlerta(estadisticas, fechaStr) {
  const ui = SpreadsheetApp.getUi();
  
  const mensaje = `📊 RESUMEN DE VENTAS - ${fechaStr}\n\n` +
    `💰 Total de Ventas: $${estadisticas.totalVentas.toLocaleString()}\n` +
    `🛒 Transacciones: ${estadisticas.cantidadTransacciones}\n` +
    `📦 Productos Vendidos: ${estadisticas.cantidadProductos}\n` +
    `👥 Clientes Atendidos: ${estadisticas.cantidadClientes}\n` +
    `📈 Promedio por Venta: $${estadisticas.promedioVenta.toLocaleString()}\n\n` +
    `🏆 Mejor Vendedor: ${estadisticas.ventasPorVendedorArray[0]?.vendedor || 'N/A'}\n` +
    `🛍️ Producto Más Vendido: ${estadisticas.ventasPorProductoArray[0]?.producto || 'N/A'}`;
  
  ui.alert('Resumen de Ventas', mensaje, ui.ButtonSet.OK);
}

/**
 * Show range summary alert
 */
function mostrarResumenRangoAlerta(estadisticas, fechaInicio, fechaFin) {
  const ui = SpreadsheetApp.getUi();
  
  const fechaInicioStr = Utilities.formatDate(fechaInicio, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  const fechaFinStr = Utilities.formatDate(fechaFin, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  
  const mensaje = `📊 RESUMEN DE VENTAS - ${fechaInicioStr} a ${fechaFinStr}\n\n` +
    `💰 Total de Ventas: $${estadisticas.totalVentas.toLocaleString()}\n` +
    `🛒 Transacciones: ${estadisticas.cantidadTransacciones}\n` +
    `📦 Productos Vendidos: ${estadisticas.cantidadProductos}\n` +
    `👥 Clientes Atendidos: ${estadisticas.cantidadClientes}\n` +
    `📈 Promedio por Venta: $${estadisticas.promedioVenta.toLocaleString()}\n` +
    `📅 Promedio Diario: $${estadisticas.promedioDiario.toLocaleString()}\n\n` +
    `🏆 Mejor Vendedor: ${estadisticas.ventasPorVendedorArray[0]?.vendedor || 'N/A'}\n` +
    `🛍️ Producto Más Vendido: ${estadisticas.ventasPorProductoArray[0]?.producto || 'N/A'}`;
  
  ui.alert('Resumen de Ventas por Rango', mensaje, ui.ButtonSet.OK);
}

// ==================== SHEET CREATION FUNCTIONS ====================

/**
 * Create daily summary sheet
 */
function crearHojaResumenDiario(fechaStr, estadisticas, ventas) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const nombreHoja = `Resumen ${fechaStr}`;
    
    // Delete existing sheet if it exists
    const existingSheet = ss.getSheetByName(nombreHoja);
    if (existingSheet) {
      ss.deleteSheet(existingSheet);
    }
    
    // Create new sheet
    const sheet = ss.insertSheet(nombreHoja);
    
    // Set up headers and data
    sheet.getRange('A1').setValue('RESUMEN DE VENTAS DIARIO');
    sheet.getRange('A1').setFontSize(16).setFontWeight('bold');
    sheet.getRange('A1').setBackground('#4285F4').setFontColor('white');
    
    // Add summary statistics
    let row = 3;
    sheet.getRange(row, 1).setValue('Fecha:');
    sheet.getRange(row, 2).setValue(fechaStr);
    row++;
    
    sheet.getRange(row, 1).setValue('Total de Ventas:');
    sheet.getRange(row, 2).setValue(`$${estadisticas.totalVentas.toLocaleString()}`);
    row++;
    
    sheet.getRange(row, 1).setValue('Transacciones:');
    sheet.getRange(row, 2).setValue(estadisticas.cantidadTransacciones);
    row++;
    
    sheet.getRange(row, 1).setValue('Productos Vendidos:');
    sheet.getRange(row, 2).setValue(estadisticas.cantidadProductos);
    row++;
    
    sheet.getRange(row, 1).setValue('Clientes Atendidos:');
    sheet.getRange(row, 2).setValue(estadisticas.cantidadClientes);
    row++;
    
    sheet.getRange(row, 1).setValue('Promedio por Venta:');
    sheet.getRange(row, 2).setValue(`$${estadisticas.promedioVenta.toLocaleString()}`);
    row += 2;
    
    // Add sales by vendor
    sheet.getRange(row, 1).setValue('VENTAS POR VENDEDOR');
    sheet.getRange(row, 1).setFontWeight('bold');
    row++;
    
    sheet.getRange(row, 1).setValue('Vendedor');
    sheet.getRange(row, 2).setValue('Total');
    sheet.getRange(row, 3).setValue('Transacciones');
    sheet.getRange(row, 1, 1, 3).setFontWeight('bold');
    row++;
    
    estadisticas.ventasPorVendedorArray.forEach(vendedor => {
      sheet.getRange(row, 1).setValue(vendedor.vendedor);
      sheet.getRange(row, 2).setValue(`$${vendedor.total.toLocaleString()}`);
      sheet.getRange(row, 3).setValue(vendedor.transacciones);
      row++;
    });
    
    row++;
    
    // Add sales by product
    sheet.getRange(row, 1).setValue('VENTAS POR PRODUCTO');
    sheet.getRange(row, 1).setFontWeight('bold');
    row++;
    
    sheet.getRange(row, 1).setValue('Producto');
    sheet.getRange(row, 2).setValue('Cantidad');
    sheet.getRange(row, 3).setValue('Total');
    sheet.getRange(row, 4).setValue('Transacciones');
    sheet.getRange(row, 1, 1, 4).setFontWeight('bold');
    row++;
    
    estadisticas.ventasPorProductoArray.forEach(producto => {
      sheet.getRange(row, 1).setValue(producto.producto);
      sheet.getRange(row, 2).setValue(producto.cantidad);
      sheet.getRange(row, 3).setValue(`$${producto.total.toLocaleString()}`);
      sheet.getRange(row, 4).setValue(producto.transacciones);
      row++;
    });
    
    // Format the sheet
    sheet.autoResizeColumns(1, 4);
    
    return sheet;
    
  } catch (error) {
    console.error('Error creando hoja resumen diario:', error);
    throw error;
  }
}

/**
 * Create range summary sheet
 */
function crearHojaResumenRango(fechaInicio, fechaFin, estadisticas, ventas) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const fechaInicioStr = Utilities.formatDate(fechaInicio, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const fechaFinStr = Utilities.formatDate(fechaFin, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const nombreHoja = `Resumen ${fechaInicioStr} a ${fechaFinStr}`;
    
    // Delete existing sheet if it exists
    const existingSheet = ss.getSheetByName(nombreHoja);
    if (existingSheet) {
      ss.deleteSheet(existingSheet);
    }
    
    // Create new sheet
    const sheet = ss.insertSheet(nombreHoja);
    
    // Set up headers and data
    sheet.getRange('A1').setValue('RESUMEN DE VENTAS POR RANGO');
    sheet.getRange('A1').setFontSize(16).setFontWeight('bold');
    sheet.getRange('A1').setBackground('#4285F4').setFontColor('white');
    
    // Add summary statistics
    let row = 3;
    sheet.getRange(row, 1).setValue('Período:');
    sheet.getRange(row, 2).setValue(`${fechaInicioStr} a ${fechaFinStr}`);
    row++;
    
    sheet.getRange(row, 1).setValue('Total de Ventas:');
    sheet.getRange(row, 2).setValue(`$${estadisticas.totalVentas.toLocaleString()}`);
    row++;
    
    sheet.getRange(row, 1).setValue('Transacciones:');
    sheet.getRange(row, 2).setValue(estadisticas.cantidadTransacciones);
    row++;
    
    sheet.getRange(row, 1).setValue('Productos Vendidos:');
    sheet.getRange(row, 2).setValue(estadisticas.cantidadProductos);
    row++;
    
    sheet.getRange(row, 1).setValue('Clientes Atendidos:');
    sheet.getRange(row, 2).setValue(estadisticas.cantidadClientes);
    row++;
    
    sheet.getRange(row, 1).setValue('Promedio por Venta:');
    sheet.getRange(row, 2).setValue(`$${estadisticas.promedioVenta.toLocaleString()}`);
    row++;
    
    sheet.getRange(row, 1).setValue('Promedio Diario:');
    sheet.getRange(row, 2).setValue(`$${estadisticas.promedioDiario.toLocaleString()}`);
    row += 2;
    
    // Add sales by day
    sheet.getRange(row, 1).setValue('VENTAS POR DÍA');
    sheet.getRange(row, 1).setFontWeight('bold');
    row++;
    
    sheet.getRange(row, 1).setValue('Fecha');
    sheet.getRange(row, 2).setValue('Total');
    sheet.getRange(row, 3).setValue('Transacciones');
    sheet.getRange(row, 1, 1, 3).setFontWeight('bold');
    row++;
    
    estadisticas.ventasPorDiaArray.forEach(dia => {
      const fechaStr = Utilities.formatDate(dia.fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy');
      sheet.getRange(row, 1).setValue(fechaStr);
      sheet.getRange(row, 2).setValue(`$${dia.total.toLocaleString()}`);
      sheet.getRange(row, 3).setValue(dia.transacciones);
      row++;
    });
    
    row++;
    
    // Add sales by vendor
    sheet.getRange(row, 1).setValue('VENTAS POR VENDEDOR');
    sheet.getRange(row, 1).setFontWeight('bold');
    row++;
    
    sheet.getRange(row, 1).setValue('Vendedor');
    sheet.getRange(row, 2).setValue('Total');
    sheet.getRange(row, 3).setValue('Transacciones');
    sheet.getRange(row, 1, 1, 3).setFontWeight('bold');
    row++;
    
    estadisticas.ventasPorVendedorArray.forEach(vendedor => {
      sheet.getRange(row, 1).setValue(vendedor.vendedor);
      sheet.getRange(row, 2).setValue(`$${vendedor.total.toLocaleString()}`);
      sheet.getRange(row, 3).setValue(vendedor.transacciones);
      row++;
    });
    
    // Format the sheet
    sheet.autoResizeColumns(1, 3);
    
    return sheet;
    
  } catch (error) {
    console.error('Error creando hoja resumen rango:', error);
    throw error;
  }
}
