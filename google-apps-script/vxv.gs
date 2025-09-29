/**
 * vxv.gs - Ventas por Vendedor (Sales by Vendor)
 * Healthynola POS System - Vendor Sales Analytics Module
 * 
 * This script handles all vendor sales reporting functionality including:
 * - Comprehensive vendor performance reports
 * - Sales goal tracking and commission calculations
 * - Product performance by vendor
 * - Time-based sales analysis
 * - Comparative vendor analytics
 */

// ================================
// CORE VENDOR SALES FUNCTIONS
// ================================

/**
 * Main function to generate vendor sales report
 */
function reporteVentasPorVendedor() {
  try {
    console.log('=== INICIANDO REPORTE DE VENTAS POR VENDEDOR ===');
    
    // Get date range from user
    const fechas = solicitarRangoFechas('Rango de Fechas para Reporte de Vendedores');
    if (!fechas) {
      return;
    }
    
    // Get sales data for the period
    const ventas = obtenerVentasPorPeriodo(fechas.fechaInicio, fechas.fechaFin);
    
    if (!ventas || ventas.length === 0) {
      SpreadsheetApp.getUi().alert('Sin Datos', 'No hay ventas registradas en el período seleccionado.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Calculate vendor statistics
    const estadisticas = calcularEstadisticasVendedores(ventas);
    
    // Generate report
    const reporte = generarReporteVendedoresHTML(estadisticas, fechas);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, 'Reporte de Ventas por Vendedor');
    
    console.log('Reporte de ventas por vendedor generado exitosamente');
    
  } catch (error) {
    console.error('Error en reporteVentasPorVendedor:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al generar reporte de ventas por vendedor: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Generate vendor performance comparison report
 */
function compararVendedores() {
  try {
    console.log('=== INICIANDO COMPARACIÓN DE VENDEDORES ===');
    
    // Get date range from user
    const fechas = solicitarRangoFechas('Rango de Fechas para Comparación de Vendedores');
    if (!fechas) {
      return;
    }
    
    // Get sales data for the period
    const ventas = obtenerVentasPorPeriodo(fechas.fechaInicio, fechas.fechaFin);
    
    if (!ventas || ventas.length === 0) {
      SpreadsheetApp.getUi().alert('Sin Datos', 'No hay ventas registradas en el período seleccionado.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Get vendors to compare
    const vendedores = obtenerListaVendedores(ventas);
    
    if (vendedores.length < 2) {
      SpreadsheetApp.getUi().alert('Insuficientes Vendedores', 'Se necesitan al menos 2 vendedores para realizar una comparación.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Select vendors to compare
    const vendedoresSeleccionados = seleccionarVendedoresComparar(vendedores);
    
    if (!vendedoresSeleccionados || vendedoresSeleccionados.length < 2) {
      return;
    }
    
    // Filter sales for selected vendors
    const ventasFiltradas = ventas.filter(venta => vendedoresSeleccionados.includes(venta.vendedor));
    
    // Calculate comparison statistics
    const estadisticas = calcularEstadisticasComparacion(ventasFiltradas, vendedoresSeleccionados);
    
    // Generate comparison report
    const reporte = generarReporteComparativoHTML(estadisticas, fechas);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, 'Comparación de Vendedores');
    
    console.log('Comparación de vendedores generada exitosamente');
    
  } catch (error) {
    console.error('Error en compararVendedores:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al comparar vendedores: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Generate individual vendor performance report
 */
function reporteVendedorIndividual() {
  try {
    console.log('=== INICIANDO REPORTE INDIVIDUAL DE VENDEDOR ===');
    
    // Get date range from user
    const fechas = solicitarRangoFechas('Rango de Fechas para Reporte Individual');
    if (!fechas) {
      return;
    }
    
    // Get sales data for the period
    const ventas = obtenerVentasPorPeriodo(fechas.fechaInicio, fechas.fechaFin);
    
    if (!ventas || ventas.length === 0) {
      SpreadsheetApp.getUi().alert('Sin Datos', 'No hay ventas registradas en el período seleccionado.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Get vendors list
    const vendedores = obtenerListaVendedores(ventas);
    
    if (vendedores.length === 0) {
      SpreadsheetApp.getUi().alert('Sin Vendedores', 'No se encontraron vendedores en el período seleccionado.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Select vendor for report
    const vendedor = seleccionarVendedor(vendedores);
    
    if (!vendedor) {
      return;
    }
    
    // Filter sales for selected vendor
    const ventasVendedor = ventas.filter(venta => venta.vendedor === vendedor);
    
    if (ventasVendedor.length === 0) {
      SpreadsheetApp.getUi().alert('Sin Ventas', `No hay ventas registradas para ${vendedor} en el período seleccionado.`, SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Calculate vendor statistics
    const estadisticas = calcularEstadisticasVendedorIndividual(ventasVendedor, vendedor);
    
    // Generate individual report
    const reporte = generarReporteIndividualHTML(estadisticas, fechas);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, `Reporte de Vendedor: ${vendedor}`);
    
    console.log(`Reporte individual para ${vendedor} generado exitosamente`);
    
  } catch (error) {
    console.error('Error en reporteVendedorIndividual:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al generar reporte individual: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Track sales goals and commissions
 */
function seguimientoMetasComisiones() {
  try {
    console.log('=== INICIANDO SEGUIMIENTO DE METAS Y COMISIONES ===');
    
    // Get current month data
    const fechaInicio = new Date();
    fechaInicio.setDate(1); // First day of current month
    fechaInicio.setHours(0, 0, 0, 0);
    
    const fechaFin = new Date();
    fechaFin.setHours(23, 59, 59, 999);
    
    // Get sales data for current month
    const ventas = obtenerVentasPorPeriodo(fechaInicio, fechaFin);
    
    if (!ventas || ventas.length === 0) {
      SpreadsheetApp.getUi().alert('Sin Datos', 'No hay ventas registradas en el mes actual.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Get vendors list
    const vendedores = obtenerListaVendedores(ventas);
    
    if (vendedores.length === 0) {
      SpreadsheetApp.getUi().alert('Sin Vendedores', 'No se encontraron vendedores en el mes actual.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Get or create goals for vendors
    const metas = obtenerMetasVendedores(vendedores);
    
    // Calculate progress and commissions
    const estadisticas = calcularMetasComisiones(ventas, metas);
    
    // Generate goals and commissions report
    const reporte = generarReporteMetasHTML(estadisticas, fechaInicio, fechaFin);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, 'Seguimiento de Metas y Comisiones');
    
    console.log('Reporte de metas y comisiones generado exitosamente');
    
  } catch (error) {
    console.error('Error en seguimientoMetasComisiones:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al generar seguimiento de metas: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Generate product performance by vendor report
 */
function reporteProductosPorVendedor() {
  try {
    console.log('=== INICIANDO REPORTE DE PRODUCTOS POR VENDEDOR ===');
    
    // Get date range from user
    const fechas = solicitarRangoFechas('Rango de Fechas para Reporte de Productos');
    if (!fechas) {
      return;
    }
    
    // Get sales data for the period
    const ventas = obtenerVentasPorPeriodo(fechas.fechaInicio, fechas.fechaFin);
    
    if (!ventas || ventas.length === 0) {
      SpreadsheetApp.getUi().alert('Sin Datos', 'No hay ventas registradas en el período seleccionado.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Get vendors list
    const vendedores = obtenerListaVendedores(ventas);
    
    if (vendedores.length === 0) {
      SpreadsheetApp.getUi().alert('Sin Vendedores', 'No se encontraron vendedores en el período seleccionado.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Select vendor for report
    const vendedor = seleccionarVendedor(vendedores);
    
    if (!vendedor) {
      return;
    }
    
    // Filter sales for selected vendor
    const ventasVendedor = ventas.filter(venta => venta.vendedor === vendedor);
    
    if (ventasVendedor.length === 0) {
      SpreadsheetApp.getUi().alert('Sin Ventas', `No hay ventas registradas para ${vendedor} en el período seleccionado.`, SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Calculate product statistics
    const estadisticas = calcularEstadisticasProductos(ventasVendedor, vendedor);
    
    // Generate product report
    const reporte = generarReporteProductosHTML(estadisticas, fechas);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, `Productos Vendidos por: ${vendedor}`);
    
    console.log(`Reporte de productos para ${vendedor} generado exitosamente`);
    
  } catch (error) {
    console.error('Error en reporteProductosPorVendedor:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al generar reporte de productos: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ================================
// DATA RETRIEVAL FUNCTIONS
// ================================

/**
 * Get sales data for a specific period
 */
function obtenerVentasPorPeriodo(fechaInicio, fechaFin) {
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
    const clienteIndex = 0; // Assuming client is first column
    const productoIndex = headers.findIndex(header => header.toString().toLowerCase().includes('producto'));
    const cantidadIndex = headers.findIndex(header => header.toString().toLowerCase().includes('cantidad'));
    const precioIndex = headers.findIndex(header => header.toString().toLowerCase().includes('precio'));
    const subtotalIndex = headers.findIndex(header => header.toString().toLowerCase().includes('subtotal'));
    const metodoPagoIndex = headers.findIndex(header => header.toString().toLowerCase().includes('método') || header.toString().toLowerCase().includes('metodo'));
    const totalIndex = headers.findIndex(header => header.toString().toLowerCase().includes('total'));
    const vendedorIndex = headers.findIndex(header => header.toString().toLowerCase().includes('vendedor'));
    const fechaIndex = headers.findIndex(header => header.toString().toLowerCase().includes('fecha'));
    
    if (vendedorIndex === -1 || fechaIndex === -1) {
      throw new Error('Columnas requeridas no encontradas en la hoja de Ventas');
    }
    
    // Filter sales by date range
    const ventas = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const fecha = row[fechaIndex];
      
      if (fecha instanceof Date && fecha >= fechaInicio && fecha <= fechaFin) {
        ventas.push({
          cliente: row[clienteIndex] || 'Sin cliente',
          producto: productoIndex >= 0 ? (row[productoIndex] || 'Sin producto') : 'Sin producto',
          cantidad: cantidadIndex >= 0 ? (parseFloat(row[cantidadIndex]) || 0) : 0,
          precioUnitario: precioIndex >= 0 ? (parseFloat(row[precioIndex]) || 0) : 0,
          subtotal: subtotalIndex >= 0 ? (parseFloat(row[subtotalIndex]) || 0) : 0,
          metodoPago: metodoPagoIndex >= 0 ? (row[metodoPagoIndex] || 'Sin método') : 'Sin método',
          total: totalIndex >= 0 ? (parseFloat(row[totalIndex]) || 0) : 0,
          vendedor: row[vendedorIndex] || 'Sin vendedor',
          fecha: fecha
        });
      }
    }
    
    return ventas;
    
  } catch (error) {
    console.error('Error en obtenerVentasPorPeriodo:', error);
    throw error;
  }
}

/**
 * Get list of vendors from sales data
 */
function obtenerListaVendedores(ventas) {
  const vendedoresSet = new Set();
  
  ventas.forEach(venta => {
    if (venta.vendedor && venta.vendedor !== 'Sin vendedor') {
      vendedoresSet.add(venta.vendedor);
    }
  });
  
  return Array.from(vendedoresSet).sort();
}

/**
 * Select a single vendor from list
 */
function seleccionarVendedor(vendedores) {
  const ui = SpreadsheetApp.getUi();
  
  // Create vendor list with numbers
  let listaVendedores = '';
  vendedores.forEach((vendedor, index) => {
    listaVendedores += `${index + 1}. ${vendedor}\n`;
  });
  
  // Prompt for selection
  const response = ui.prompt(
    'Seleccionar Vendedor',
    `Seleccione un vendedor ingresando el número correspondiente:\n\n${listaVendedores}`,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() !== ui.Button.OK) {
    return null;
  }
  
  const seleccion = parseInt(response.getResponseText());
  
  if (isNaN(seleccion) || seleccion < 1 || seleccion > vendedores.length) {
    ui.alert('Error', 'Selección inválida. Por favor ingrese un número de la lista.', ui.ButtonSet.OK);
    return null;
  }
  
  return vendedores[seleccion - 1];
}

// ================================
// DATA ANALYSIS FUNCTIONS
// ================================

/**
 * Calculate vendor statistics
 */
function calcularEstadisticasVendedores(ventas) {
  try {
    // Group sales by vendor
    const ventasPorVendedor = {};
    
    ventas.forEach(venta => {
      const vendedor = venta.vendedor;
      
      if (!ventasPorVendedor[vendedor]) {
        ventasPorVendedor[vendedor] = {
          vendedor: vendedor,
          totalVentas: 0,
          cantidadVentas: 0,
          cantidadProductos: 0,
          promedioVenta: 0,
          clientes: new Set(),
          productos: new Set(),
          metodosPago: {},
          ventasPorDia: {},
          ventasPorProducto: {}
        };
      }
      
      // Update statistics
      ventasPorVendedor[vendedor].totalVentas += venta.total;
      ventasPorVendedor[vendedor].cantidadVentas++;
      ventasPorVendedor[vendedor].cantidadProductos += venta.cantidad;
      ventasPorVendedor[vendedor].clientes.add(venta.cliente);
      ventasPorVendedor[vendedor].productos.add(venta.producto);
      
      // Track payment methods
      if (!ventasPorVendedor[vendedor].metodosPago[venta.metodoPago]) {
        ventasPorVendedor[vendedor].metodosPago[venta.metodoPago] = 0;
      }
      ventasPorVendedor[vendedor].metodosPago[venta.metodoPago] += venta.total;
      
      // Track sales by day
      const fechaStr = Utilities.formatDate(venta.fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      if (!ventasPorVendedor[vendedor].ventasPorDia[fechaStr]) {
        ventasPorVendedor[vendedor].ventasPorDia[fechaStr] = {
          fecha: venta.fecha,
          total: 0,
          ventas: 0
        };
      }
      ventasPorVendedor[vendedor].ventasPorDia[fechaStr].total += venta.total;
      ventasPorVendedor[vendedor].ventasPorDia[fechaStr].ventas++;
      
      // Track sales by product
      if (!ventasPorVendedor[vendedor].ventasPorProducto[venta.producto]) {
        ventasPorVendedor[vendedor].ventasPorProducto[venta.producto] = {
          producto: venta.producto,
          cantidad: 0,
          total: 0,
          ventas: 0
        };
      }
      ventasPorVendedor[vendedor].ventasPorProducto[venta.producto].cantidad += venta.cantidad;
      ventasPorVendedor[vendedor].ventasPorProducto[venta.producto].total += venta.total;
      ventasPorVendedor[vendedor].ventasPorProducto[venta.producto].ventas++;
    });
    
    // Calculate derived statistics
    const vendedores = [];
    
    for (const vendedor in ventasPorVendedor) {
      const stats = ventasPorVendedor[vendedor];
      
      // Calculate average sale
      stats.promedioVenta = stats.cantidadVentas > 0 ? stats.totalVentas / stats.cantidadVentas : 0;
      
      // Convert sets to counts
      stats.cantidadClientes = stats.clientes.size;
      stats.cantidadProductosUnicos = stats.productos.size;
      
      // Convert objects to arrays for easier processing
      stats.metodosPagoArray = Object.entries(stats.metodosPago).map(([metodo, total]) => ({
        metodo,
        total,
        porcentaje: (total / stats.totalVentas) * 100
      }));
      
      stats.ventasPorDiaArray = Object.values(stats.ventasPorDia).sort((a, b) => a.fecha - b.fecha);
      
      stats.productosMasVendidos = Object.values(stats.ventasPorProducto)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
      
      // Calculate daily average
      const diasConVentas = stats.ventasPorDiaArray.length;
      stats.promedioDiario = diasConVentas > 0 ? stats.totalVentas / diasConVentas : 0;
      
      // Add to vendors array
      vendedores.push(stats);
    }
    
    // Sort vendors by total sales
    vendedores.sort((a, b) => b.totalVentas - a.totalVentas);
    
    // Calculate overall statistics
    const totalVentas = vendedores.reduce((sum, v) => sum + v.totalVentas, 0);
    const totalTransacciones = vendedores.reduce((sum, v) => sum + v.cantidadVentas, 0);
    
    // Calculate percentages
    vendedores.forEach(v => {
      v.porcentajeVentas = (v.totalVentas / totalVentas) * 100;
      v.porcentajeTransacciones = (v.cantidadVentas / totalTransacciones) * 100;
    });
    
    return {
      vendedores,
      totalVentas,
      totalTransacciones,
      promedioVenta: totalTransacciones > 0 ? totalVentas / totalTransacciones : 0
    };
    
  } catch (error) {
    console.error('Error en calcularEstadisticasVendedores:', error);
    throw error;
  }
}

// ================================
// REPORT GENERATION FUNCTIONS
// ================================

/**
 * Generate HTML for vendor sales report
 */
function generarReporteVendedoresHTML(estadisticas, fechas) {
  try {
    const formatDate = date => Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd/MM/yyyy');
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
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background-color: #4285F4; color: white; text-align: left; padding: 10px; }
        td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .progress-bar { height: 10px; background-color: #e0e0e0; border-radius: 5px; margin-top: 5px; }
        .progress-fill { height: 100%; background-color: #4285F4; border-radius: 5px; }
        .date-range { text-align: center; font-size: 16px; margin-bottom: 20px; color: #666; }
      </style>
    </head>
    <body>
      <h1>Reporte de Ventas por Vendedor</h1>
      
      <div class="date-range">
        Período: ${formatDate(fechas.fechaInicio)} - ${formatDate(fechas.fechaFin)}
      </div>
      
      <div class="stats-container">
        <div class="stat-box">
          <div class="stat-label">Total de Ventas</div>
          <div class="stat-value">${formatCurrency(estadisticas.totalVentas)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Total de Transacciones</div>
          <div class="stat-value">${estadisticas.totalTransacciones}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Promedio por Venta</div>
          <div class="stat-value">${formatCurrency(estadisticas.promedioVenta)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Vendedores Activos</div>
          <div class="stat-value">${estadisticas.vendedores.length}</div>
        </div>
      </div>
      
      <h2>Rendimiento por Vendedor</h2>
      <table>
        <tr>
          <th>Vendedor</th>
          <th>Ventas Totales</th>
          <th>% del Total</th>
          <th>Transacciones</th>
          <th>Promedio</th>
        </tr>`;
    
    estadisticas.vendedores.forEach(vendedor => {
      html += `
        <tr>
          <td>${vendedor.vendedor}</td>
          <td>${formatCurrency(vendedor.totalVentas)}</td>
          <td>
            ${vendedor.porcentajeVentas.toFixed(1)}%
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${vendedor.porcentajeVentas}%"></div>
            </div>
          </td>
          <td>${vendedor.cantidadVentas}</td>
          <td>${formatCurrency(vendedor.promedioVenta)}</td>
        </tr>`;
    });
    
    html += `
      </table>`;
    
    // Only show top vendor details if there are vendors
    if (estadisticas.vendedores.length > 0) {
      const topVendedor = estadisticas.vendedores[0];
      
      html += `
      <h2>Detalle del Vendedor Principal: ${topVendedor.vendedor}</h2>
      
      <div class="stats-container">
        <div class="stat-box">
          <div class="stat-label">Ventas Totales</div>
          <div class="stat-value">${formatCurrency(topVendedor.totalVentas)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Transacciones</div>
          <div class="stat-value">${topVendedor.cantidadVentas}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Clientes Atendidos</div>
          <div class="stat-value">${topVendedor.cantidadClientes}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Promedio Diario</div>
          <div class="stat-value">${formatCurrency(topVendedor.promedioDiario)}</div>
        </div>
      </div>
      
      <h2>Productos Más Vendidos por ${topVendedor.vendedor}</h2>
      <table>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Total</th>
          <th>Ventas</th>
        </tr>`;
      
      topVendedor.productosMasVendidos.forEach(producto => {
        html += `
          <tr>
            <td>${producto.producto}</td>
            <td>${producto.cantidad}</td>
            <td>${formatCurrency(producto.total)}</td>
            <td>${producto.ventas}</td>
          </tr>`;
      });
      
      html += `
        </table>`;
    }
    
    html += `
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
        Reporte generado el ${new Date().toLocaleString()}
      </div>
    </body>
    </html>`;
    
    return html;
    
  } catch (error) {
    console.error('Error en generarReporteVendedoresHTML:', error);
    return `<html><body><h1>Error al generar reporte</h1><p>${error.message}</p></body></html>`;
  }
}

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Request date range from user
 */
function solicitarRangoFechas(titulo) {
  const ui = SpreadsheetApp.getUi();
  
  const fechaInicioResponse = ui.prompt(
    titulo,
    'Ingrese la fecha de inicio (DD/MM/YYYY):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (fechaInicioResponse.getSelectedButton() !== ui.Button.OK) {
    return null;
  }
  
  const fechaFinResponse = ui.prompt(
    titulo,
    'Ingrese la fecha de fin (DD/MM/YYYY):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (fechaFinResponse.getSelectedButton() !== ui.Button.OK) {
    return null;
  }
  
  const fechaInicio = parsearFecha(fechaInicioResponse.getResponseText().trim());
  const fechaFin = parsearFecha(fechaFinResponse.getResponseText().trim());
  
  if (!fechaInicio || !fechaFin) {
    ui.alert('Error', 'Formato de fecha inválido. Use DD/MM/YYYY', ui.ButtonSet.OK);
    return null;
  }
  
  if (fechaInicio > fechaFin) {
    ui.alert('Error', 'La fecha de inicio debe ser anterior a la fecha de fin', ui.ButtonSet.OK);
    return null;
  }
  
  return { fechaInicio, fechaFin };
}

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
 * Show HTML report in modal dialog
 */
function mostrarReporteHTML(html, titulo) {
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(800)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, titulo);
}
