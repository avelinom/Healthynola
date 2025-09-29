/**
 * rii.gs - Reporte Inventario (Inventory Reports)
 * Healthynola POS System - Inventory Analytics Module
 * 
 * This script handles all inventory reporting functionality including:
 * - Comprehensive inventory status reports
 * - Stock level analysis and alerts
 * - Movement and turnover analytics
 * - Valuation and financial reporting
 * - Batch tracking and expiration monitoring
 */

// ================================
// CORE INVENTORY REPORTING FUNCTIONS
// ================================

/**
 * Main function to generate comprehensive inventory report
 */
function reporteInventarioCompleto() {
  try {
    console.log('=== INICIANDO REPORTE DE INVENTARIO COMPLETO ===');
    
    // Get inventory data
    const inventarioData = obtenerDatosInventario();
    if (!inventarioData || inventarioData.length <= 1) {
      SpreadsheetApp.getUi().alert('Error', 'No hay datos de inventario disponibles.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Calculate inventory statistics
    const estadisticas = calcularEstadisticasInventario(inventarioData);
    
    // Generate report
    const reporte = generarReporteInventarioHTML(estadisticas);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, 'Reporte de Inventario Completo');
    
    console.log('Reporte de inventario completo generado exitosamente');
    
  } catch (error) {
    console.error('Error en reporteInventarioCompleto:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al generar reporte de inventario: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Generate inventory report for low stock items
 */
function reporteInventarioBajo() {
  try {
    console.log('=== INICIANDO REPORTE DE INVENTARIO BAJO ===');
    
    // Get inventory data
    const inventarioData = obtenerDatosInventario();
    if (!inventarioData || inventarioData.length <= 1) {
      SpreadsheetApp.getUi().alert('Error', 'No hay datos de inventario disponibles.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Get user input for threshold
    const ui = SpreadsheetApp.getUi();
    const response = ui.prompt(
      'Umbral de Inventario Bajo',
      'Ingrese el porcentaje de nivel mínimo para considerar inventario bajo (1-100):',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (response.getSelectedButton() !== ui.Button.OK) {
      return;
    }
    
    const umbral = parseInt(response.getResponseText());
    if (isNaN(umbral) || umbral < 1 || umbral > 100) {
      ui.alert('Error', 'Por favor ingrese un número válido entre 1 y 100.', ui.ButtonSet.OK);
      return;
    }
    
    // Filter low stock items
    const itemsBajoStock = filtrarItemsBajoStock(inventarioData, umbral);
    
    if (itemsBajoStock.length === 0) {
      ui.alert('Información', `No hay productos con nivel de stock por debajo del ${umbral}%.`, ui.ButtonSet.OK);
      return;
    }
    
    // Generate report
    const reporte = generarReporteInventarioBajoHTML(itemsBajoStock, umbral);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, 'Reporte de Inventario Bajo');
    
    console.log('Reporte de inventario bajo generado exitosamente');
    
  } catch (error) {
    console.error('Error en reporteInventarioBajo:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al generar reporte de inventario bajo: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Generate inventory movement report
 */
function reporteMovimientoInventario() {
  try {
    console.log('=== INICIANDO REPORTE DE MOVIMIENTO DE INVENTARIO ===');
    
    // Get movement data from transfers and sales
    const movimientos = obtenerMovimientosInventario();
    
    if (!movimientos || movimientos.length === 0) {
      SpreadsheetApp.getUi().alert('Sin Datos', 'No hay movimientos de inventario registrados.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Calculate movement statistics
    const estadisticas = calcularEstadisticasMovimiento(movimientos);
    
    // Generate report
    const reporte = generarReporteMovimientoHTML(estadisticas, movimientos);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, 'Reporte de Movimiento de Inventario');
    
    console.log('Reporte de movimiento de inventario generado exitosamente');
    
  } catch (error) {
    console.error('Error en reporteMovimientoInventario:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al generar reporte de movimiento: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Generate inventory valuation report
 */
function reporteValoracionInventario() {
  try {
    console.log('=== INICIANDO REPORTE DE VALORACIÓN DE INVENTARIO ===');
    
    // Get inventory and product data
    const inventarioData = obtenerDatosInventario();
    const productosData = obtenerDatosProductos();
    
    if (!inventarioData || inventarioData.length <= 1) {
      SpreadsheetApp.getUi().alert('Error', 'No hay datos de inventario disponibles.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    if (!productosData || productosData.length <= 1) {
      SpreadsheetApp.getUi().alert('Error', 'No hay datos de productos disponibles.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Calculate valuation
    const valoracion = calcularValoracionInventario(inventarioData, productosData);
    
    // Generate report
    const reporte = generarReporteValoracionHTML(valoracion);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, 'Reporte de Valoración de Inventario');
    
    console.log('Reporte de valoración de inventario generado exitosamente');
    
  } catch (error) {
    console.error('Error en reporteValoracionInventario:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al generar reporte de valoración: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Generate batch expiration report
 */
function reporteVencimientoLotes() {
  try {
    console.log('=== INICIANDO REPORTE DE VENCIMIENTO DE LOTES ===');
    
    // Get batch data
    const lotesData = obtenerDatosLotes();
    
    if (!lotesData || lotesData.length <= 1) {
      SpreadsheetApp.getUi().alert('Sin Datos', 'No hay datos de lotes disponibles.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Filter expiring batches
    const lotesVencidos = filtrarLotesVencidos(lotesData);
    const lotesPorVencer = filtrarLotesPorVencer(lotesData);
    
    // Generate report
    const reporte = generarReporteVencimientoHTML(lotesVencidos, lotesPorVencer);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, 'Reporte de Vencimiento de Lotes');
    
    console.log('Reporte de vencimiento de lotes generado exitosamente');
    
  } catch (error) {
    console.error('Error en reporteVencimientoLotes:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al generar reporte de vencimiento: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Generate inventory turnover report
 */
function reporteRotacionInventario() {
  try {
    console.log('=== INICIANDO REPORTE DE ROTACIÓN DE INVENTARIO ===');
    
    // Get inventory and sales data
    const inventarioData = obtenerDatosInventario();
    const ventasData = obtenerDatosVentas();
    
    if (!inventarioData || inventarioData.length <= 1) {
      SpreadsheetApp.getUi().alert('Error', 'No hay datos de inventario disponibles.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    if (!ventasData || ventasData.length <= 1) {
      SpreadsheetApp.getUi().alert('Error', 'No hay datos de ventas disponibles.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Calculate turnover rates
    const rotacion = calcularRotacionInventario(inventarioData, ventasData);
    
    // Generate report
    const reporte = generarReporteRotacionHTML(rotacion);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, 'Reporte de Rotación de Inventario');
    
    console.log('Reporte de rotación de inventario generado exitosamente');
    
  } catch (error) {
    console.error('Error en reporteRotacionInventario:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al generar reporte de rotación: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ================================
// DATA RETRIEVAL FUNCTIONS
// ================================

/**
 * Get inventory data
 */
function obtenerDatosInventario() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Inventario');
    if (!sheet) {
      return [];
    }
    
    const ultimaFila = sheet.getLastRow();
    if (ultimaFila <= 1) {
      return [];
    }
    
    return sheet.getDataRange().getValues();
    
  } catch (error) {
    console.error('Error en obtenerDatosInventario:', error);
    return [];
  }
}

/**
 * Get product data
 */
function obtenerDatosProductos() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Productos');
    if (!sheet) {
      return [];
    }
    
    const ultimaFila = sheet.getLastRow();
    if (ultimaFila <= 1) {
      return [];
    }
    
    return sheet.getDataRange().getValues();
    
  } catch (error) {
    console.error('Error en obtenerDatosProductos:', error);
    return [];
  }
}

/**
 * Get sales data
 */
function obtenerDatosVentas() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ventas');
    if (!sheet) {
      return [];
    }
    
    const ultimaFila = sheet.getLastRow();
    if (ultimaFila <= 1) {
      return [];
    }
    
    return sheet.getDataRange().getValues();
    
  } catch (error) {
    console.error('Error en obtenerDatosVentas:', error);
    return [];
  }
}

/**
 * Get batch data
 */
function obtenerDatosLotes() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Lotes');
    if (!sheet) {
      return [];
    }
    
    const ultimaFila = sheet.getLastRow();
    if (ultimaFila <= 1) {
      return [];
    }
    
    return sheet.getDataRange().getValues();
    
  } catch (error) {
    console.error('Error en obtenerDatosLotes:', error);
    return [];
  }
}

/**
 * Get inventory movements
 */
function obtenerMovimientosInventario() {
  try {
    const movimientos = [];
    
    // Get transfers
    const transferenciasData = obtenerDatosTransferencias();
    if (transferenciasData && transferenciasData.length > 1) {
      for (let i = 1; i < transferenciasData.length; i++) {
        const transferencia = transferenciasData[i];
        movimientos.push({
          tipo: 'Transferencia',
          fecha: transferencia[0],
          producto: transferencia[1],
          cantidad: transferencia[2],
          almacenOrigen: transferencia[3],
          almacenDestino: transferencia[4],
          motivo: transferencia[5]
        });
      }
    }
    
    // Get sales
    const ventasData = obtenerDatosVentas();
    if (ventasData && ventasData.length > 1) {
      for (let i = 1; i < ventasData.length; i++) {
        const venta = ventasData[i];
        movimientos.push({
          tipo: 'Venta',
          fecha: venta[0],
          producto: venta[2],
          cantidad: venta[3],
          almacenOrigen: venta[9],
          almacenDestino: 'Cliente',
          motivo: 'Venta'
        });
      }
    }
    
    return movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
  } catch (error) {
    console.error('Error en obtenerMovimientosInventario:', error);
    return [];
  }
}

/**
 * Get transfer data
 */
function obtenerDatosTransferencias() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transferencias');
    if (!sheet) {
      return [];
    }
    
    const ultimaFila = sheet.getLastRow();
    if (ultimaFila <= 1) {
      return [];
    }
    
    return sheet.getDataRange().getValues();
    
  } catch (error) {
    console.error('Error en obtenerDatosTransferencias:', error);
    return [];
  }
}

// ================================
// DATA ANALYSIS FUNCTIONS
// ================================

/**
 * Calculate inventory statistics
 */
function calcularEstadisticasInventario(data) {
  try {
    const estadisticas = {
      totalProductos: 0,
      totalAlmacenes: 0,
      valorTotal: 0,
      productosAgotados: 0,
      productosBajoStock: 0,
      productosPorAlmacen: {},
      productosPorCategoria: {}
    };
    
    const productos = new Set();
    const almacenes = new Set();
    
    for (let i = 1; i < data.length; i++) {
      const producto = data[i][0];
      const almacen = data[i][1];
      const cantidad = parseFloat(data[i][2]) || 0;
      const cantidadMinima = parseFloat(data[i][3]) || 0;
      
      productos.add(producto);
      almacenes.add(almacen);
      
      // Count products by warehouse
      if (!estadisticas.productosPorAlmacen[almacen]) {
        estadisticas.productosPorAlmacen[almacen] = 0;
      }
      estadisticas.productosPorAlmacen[almacen]++;
      
      // Check stock levels
      if (cantidad <= 0) {
        estadisticas.productosAgotados++;
      } else if (cantidad <= cantidadMinima && cantidadMinima > 0) {
        estadisticas.productosBajoStock++;
      }
    }
    
    estadisticas.totalProductos = productos.size;
    estadisticas.totalAlmacenes = almacenes.size;
    
    return estadisticas;
    
  } catch (error) {
    console.error('Error en calcularEstadisticasInventario:', error);
    return {};
  }
}

/**
 * Filter low stock items
 */
function filtrarItemsBajoStock(data, umbral) {
  const itemsBajoStock = [];
  
  for (let i = 1; i < data.length; i++) {
    const cantidadActual = parseFloat(data[i][2]) || 0;
    const cantidadMinima = parseFloat(data[i][3]) || 0;
    
    if (cantidadMinima > 0) {
      const porcentajeStock = (cantidadActual / cantidadMinima) * 100;
      
      if (porcentajeStock <= umbral) {
        itemsBajoStock.push({
          producto: data[i][0],
          almacen: data[i][1],
          cantidadActual: cantidadActual,
          cantidadMinima: cantidadMinima,
          porcentajeStock: porcentajeStock,
          estado: data[i][5] || 'Desconocido',
          ultimaActualizacion: data[i][4] || 'N/A'
        });
      }
    }
  }
  
  return itemsBajoStock.sort((a, b) => a.porcentajeStock - b.porcentajeStock);
}

/**
 * Calculate inventory valuation
 */
function calcularValoracionInventario(inventarioData, productosData) {
  try {
    const valoracion = {
      valorTotal: 0,
      valorPorAlmacen: {},
      valorPorProducto: {},
      productosValorados: 0
    };
    
    // Create product cost lookup
    const costosProductos = {};
    for (let i = 1; i < productosData.length; i++) {
      const producto = productosData[i];
      const nombre = producto[1];
      const costo = parseFloat(producto[4]) || 0;
      costosProductos[nombre] = costo;
    }
    
    // Calculate valuation
    for (let i = 1; i < inventarioData.length; i++) {
      const item = inventarioData[i];
      const producto = item[0];
      const almacen = item[1];
      const cantidad = parseFloat(item[2]) || 0;
      const costo = costosProductos[producto] || 0;
      
      const valor = cantidad * costo;
      valoracion.valorTotal += valor;
      
      // By warehouse
      if (!valoracion.valorPorAlmacen[almacen]) {
        valoracion.valorPorAlmacen[almacen] = 0;
      }
      valoracion.valorPorAlmacen[almacen] += valor;
      
      // By product
      if (!valoracion.valorPorProducto[producto]) {
        valoracion.valorPorProducto[producto] = 0;
      }
      valoracion.valorPorProducto[producto] += valor;
      
      if (valor > 0) {
        valoracion.productosValorados++;
      }
    }
    
    return valoracion;
    
  } catch (error) {
    console.error('Error en calcularValoracionInventario:', error);
    return {};
  }
}

/**
 * Filter expired batches
 */
function filtrarLotesVencidos(data) {
  const lotesVencidos = [];
  const hoy = new Date();
  
  for (let i = 1; i < data.length; i++) {
    const lote = data[i];
    const fechaVencimiento = lote[3];
    
    if (fechaVencimiento instanceof Date && fechaVencimiento < hoy) {
      lotesVencidos.push({
        lote: lote[0],
        producto: lote[1],
        fechaVencimiento: fechaVencimiento,
        cantidad: parseFloat(lote[5]) || 0,
        almacen: lote[6],
        estado: lote[7]
      });
    }
  }
  
  return lotesVencidos.sort((a, b) => a.fechaVencimiento - b.fechaVencimiento);
}

/**
 * Filter batches expiring soon
 */
function filtrarLotesPorVencer(data) {
  const lotesPorVencer = [];
  const hoy = new Date();
  const en30Dias = new Date();
  en30Dias.setDate(hoy.getDate() + 30);
  
  for (let i = 1; i < data.length; i++) {
    const lote = data[i];
    const fechaVencimiento = lote[3];
    
    if (fechaVencimiento instanceof Date && fechaVencimiento >= hoy && fechaVencimiento <= en30Dias) {
      lotesPorVencer.push({
        lote: lote[0],
        producto: lote[1],
        fechaVencimiento: fechaVencimiento,
        cantidad: parseFloat(lote[5]) || 0,
        almacen: lote[6],
        estado: lote[7]
      });
    }
  }
  
  return lotesPorVencer.sort((a, b) => a.fechaVencimiento - b.fechaVencimiento);
}

/**
 * Calculate inventory turnover
 */
function calcularRotacionInventario(inventarioData, ventasData) {
  try {
    const rotacion = {
      productosRotacion: {},
      promedioRotacion: 0,
      productosAnalizados: 0
    };
  
    // Calculate sales by product
    const ventasPorProducto = {};
    for (let i = 1; i < ventasData.length; i++) {
      const venta = ventasData[i];
      const producto = venta[2];
      const cantidad = parseFloat(venta[3]) || 0;
      
      if (!ventasPorProducto[producto]) {
        ventasPorProducto[producto] = 0;
      }
      ventasPorProducto[producto] += cantidad;
    }
    
    // Calculate turnover for each product
    let totalRotacion = 0;
    for (let i = 1; i < inventarioData.length; i++) {
      const item = inventarioData[i];
      const producto = item[0];
      const cantidadActual = parseFloat(item[2]) || 0;
      const ventasAnuales = ventasPorProducto[producto] || 0;
      
      if (cantidadActual > 0) {
        const tasaRotacion = ventasAnuales / cantidadActual;
        rotacion.productosRotacion[producto] = {
          producto: producto,
          cantidadActual: cantidadActual,
          ventasAnuales: ventasAnuales,
          tasaRotacion: tasaRotacion
        };
        
        totalRotacion += tasaRotacion;
        rotacion.productosAnalizados++;
      }
    }
    
    if (rotacion.productosAnalizados > 0) {
      rotacion.promedioRotacion = totalRotacion / rotacion.productosAnalizados;
    }
    
    return rotacion;
    
  } catch (error) {
    console.error('Error en calcularRotacionInventario:', error);
    return {};
  }
}

// ================================
// REPORT GENERATION FUNCTIONS
// ================================

/**
 * Generate HTML for inventory report
 */
function generarReporteInventarioHTML(estadisticas) {
  const formatCurrency = value => {
    return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <base target="_top">
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
      h1 { color: #4285F4; text-align: center; margin-bottom: 30px; }
      h2 { color: #4285F4; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
      .stats-container { display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 30px; }
      .stat-box { background-color: #f5f5f5; border-radius: 5px; padding: 15px; margin-bottom: 15px; flex: 1; min-width: 200px; margin-right: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
      .stat-box:last-child { margin-right: 0; }
      .stat-value { font-size: 24px; font-weight: bold; color: #4285F4; margin: 10px 0; }
      .stat-label { font-size: 14px; color: #666; }
      .alert { background-color: #ffebee; border-left: 4px solid #f44336; padding: 10px; margin: 10px 0; }
      .success { background-color: #e8f5e8; border-left: 4px solid #4caf50; padding: 10px; margin: 10px 0; }
    </style>
  </head>
  <body>
    <h1>Reporte de Inventario Completo</h1>
    
    <div class="stats-container">
      <div class="stat-box">
        <div class="stat-label">Total de Productos</div>
        <div class="stat-value">${estadisticas.totalProductos || 0}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Total de Almacenes</div>
        <div class="stat-value">${estadisticas.totalAlmacenes || 0}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Productos Agotados</div>
        <div class="stat-value">${estadisticas.productosAgotados || 0}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Productos Bajo Stock</div>
        <div class="stat-value">${estadisticas.productosBajoStock || 0}</div>
      </div>
    </div>
    
    <h2>Distribución por Almacén</h2>
    <div class="stats-container">`;
  
  for (const almacen in estadisticas.productosPorAlmacen) {
    html += `
      <div class="stat-box">
        <div class="stat-label">${almacen}</div>
        <div class="stat-value">${estadisticas.productosPorAlmacen[almacen]}</div>
      </div>`;
  }
  
  html += `
    </div>
    
    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
      Reporte generado el ${new Date().toLocaleString()}
    </div>
  </body>
  </html>`;
  
  return html;
}

/**
 * Generate HTML for low stock report
 */
function generarReporteInventarioBajoHTML(itemsBajoStock, umbral) {
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <base target="_top">
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
      h1 { color: #4285F4; text-align: center; margin-bottom: 30px; }
      h2 { color: #4285F4; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
      th { background-color: #4285F4; color: white; text-align: left; padding: 10px; }
      td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .alert { background-color: #ffebee; border-left: 4px solid #f44336; padding: 10px; margin: 10px 0; }
      .warning { background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 10px; margin: 10px 0; }
    </style>
  </head>
  <body>
    <h1>Reporte de Inventario Bajo</h1>
    <p>Umbral de alerta: ${umbral}% del stock mínimo</p>
    
    <div class="alert">
      <strong>⚠️ Atención:</strong> Se encontraron ${itemsBajoStock.length} productos con inventario bajo.
    </div>
    
    <table>
      <tr>
        <th>Producto</th>
        <th>Almacén</th>
        <th>Stock Actual</th>
        <th>Stock Mínimo</th>
        <th>% del Mínimo</th>
        <th>Estado</th>
        <th>Última Actualización</th>
      </tr>`;
  
  itemsBajoStock.forEach(item => {
    const alertClass = item.porcentajeStock <= 25 ? 'alert' : 'warning';
    html += `
      <tr class="${alertClass}">
        <td>${item.producto}</td>
        <td>${item.almacen}</td>
        <td>${item.cantidadActual}</td>
        <td>${item.cantidadMinima}</td>
        <td>${item.porcentajeStock.toFixed(1)}%</td>
        <td>${item.estado}</td>
        <td>${item.ultimaActualizacion}</td>
      </tr>`;
  });
  
  html += `
    </table>
    
    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
      Reporte generado el ${new Date().toLocaleString()}
    </div>
  </body>
  </html>`;
  
  return html;
}

/**
 * Show HTML report in modal dialog
 */
function mostrarReporteHTML(html, titulo) {
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(800)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, titulo);
}
