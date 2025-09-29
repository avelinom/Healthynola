// ============================================================================
// HEALTHYNOLA POS SYSTEM - REGISTRAR INVENTARIO (ri.gs)
// Inventory Management Script
// Combines: inventory-update-v2.gs, Inventario-redesign-v1.gs,
//           inventory-functions-corrected-v1.gs, inventory-mapping-v1.gs,
//           Fix-inventory-lookup-v1.gs
// ============================================================================

// ============================================================================
// MAIN INVENTORY FUNCTIONS
// ============================================================================

/**
 * Main function to update inventory dynamically
 */
function actualizarInventarioDinamico() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  registrarLog("actualizarInventarioDinamico", "INICIO", "Iniciando actualización de inventario", "INFO");
  
  try {
    // Create UI for inventory update
    var ui = SpreadsheetApp.getUi();
    var result = ui.prompt(
      'Actualizar Inventario',
      'Ingrese los datos de inventario en el siguiente formato:\n\n' +
      'Producto, Cantidad, Almacén, Motivo\n\n' +
      'Ejemplo: Granola 1kg regular, 10, Principal, Ajuste manual',
      ui.ButtonSet.OK_CANCEL
    );

    // Process the user's response
    var button = result.getSelectedButton();
    var text = result.getResponseText();
    
    if (button == ui.Button.CANCEL || button == ui.Button.CLOSE) {
      registrarLog("actualizarInventarioDinamico", "CANCELADO", "Operación cancelada por el usuario", "INFO");
      return;
    }
    
    // Parse input
    var datos = text.split(',').map(function(item) { return item.trim(); });
    
    if (datos.length < 4) {
      throw new Error("Formato incorrecto. Debe ingresar: Producto, Cantidad, Almacén, Motivo");
    }
    
    var producto = datos[0];
    var cantidad = parseInt(datos[1]);
    var almacen = datos[2];
    var motivo = datos[3];
    
    // Validate inputs
    if (!producto || isNaN(cantidad) || !almacen || !motivo) {
      throw new Error("Datos inválidos. Verifique que la cantidad sea un número y que todos los campos estén completos.");
    }
    
    registrarLog("actualizarInventarioDinamico", "DETALLE", 
      "Datos capturados: Producto=" + producto + ", Cantidad=" + cantidad + 
      ", Almacén=" + almacen + ", Motivo=" + motivo, "INFO");
    
    // Validate product exists
    var productoExiste = verificarProductoExiste(producto);
    if (!productoExiste) {
      throw new Error("El producto '" + producto + "' no existe en el catálogo.");
    }
    
    // Validate warehouse exists
    var almacenExiste = verificarAlmacenExiste(almacen);
    if (!almacenExiste) {
      throw new Error("El almacén '" + almacen + "' no existe.");
    }
    
    // Ask if this is an addition or subtraction
    var tipoOperacion = ui.alert(
      'Tipo de Operación',
      '¿Qué tipo de operación desea realizar?',
      ui.ButtonSet.YES_NO_CANCEL
    );
    
    if (tipoOperacion == ui.Button.CANCEL) {
      registrarLog("actualizarInventarioDinamico", "CANCELADO", "Operación cancelada por el usuario", "INFO");
      return;
    }
    
    var esSuma = (tipoOperacion == ui.Button.YES);
    
    // Update inventory
    var actualizacionExitosa = actualizarInventarioEnHoja(producto, cantidad, almacen, motivo, esSuma);
    if (!actualizacionExitosa) {
      throw new Error("Error al actualizar el inventario.");
    }
    
    // Show success message
    var mensaje = 'Inventario actualizado exitosamente:\n\n' +
      'Producto: ' + producto + '\n' +
      'Cantidad: ' + (esSuma ? '+' : '-') + cantidad + '\n' +
      'Almacén: ' + almacen + '\n' +
      'Motivo: ' + motivo;
    
    ui.alert('Inventario Actualizado', mensaje, ui.ButtonSet.OK);
    
    registrarLog("actualizarInventarioDinamico", "FIN", "Inventario actualizado exitosamente", "ÉXITO");
    
  } catch (error) {
    registrarLog("actualizarInventarioDinamico", "ERROR", "Error en inventario: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error al actualizar inventario: ' + error.toString());
  }
}

/**
 * Update inventory in Inventario sheet
 */
function actualizarInventarioEnHoja(producto, cantidad, almacen, motivo, esSuma) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaInventario = ss.getSheetByName("Inventario");
  
  try {
    if (!hojaInventario) {
      throw new Error("Hoja de Inventario no encontrada");
    }
    
    var ultimaFila = hojaInventario.getLastRow();
    var data = hojaInventario.getDataRange().getValues();
    
    // Find existing inventory entry
    var filaEncontrada = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === producto && data[i][1] === almacen) {
        filaEncontrada = i;
        break;
      }
    }
    
    if (filaEncontrada > 0) {
      // Update existing entry
      var cantidadActual = parseFloat(data[filaEncontrada][2]) || 0;
      var nuevaCantidad = esSuma ? 
        cantidadActual + cantidad : 
        Math.max(0, cantidadActual - cantidad);
      
      hojaInventario.getRange(filaEncontrada + 1, 3).setValue(nuevaCantidad);
      hojaInventario.getRange(filaEncontrada + 1, 5).setValue(new Date());
      hojaInventario.getRange(filaEncontrada + 1, 6).setValue(nuevaCantidad <= 0 ? "Agotado" : "Disponible");
      hojaInventario.getRange(filaEncontrada + 1, 7).setValue(motivo);
      
    } else {
      // Create new inventory entry
      if (esSuma) {
        var nuevaFila = [
          producto,
          almacen,
          cantidad,
          0, // Cantidad mínima
          new Date(),
          "Disponible",
          motivo
        ];
        
        hojaInventario.appendRow(nuevaFila);
      } else {
        throw new Error("No se puede restar de un inventario que no existe. Use suma para crear el inventario.");
      }
    }
    
    registrarLog("actualizarInventarioEnHoja", "FIN", "Inventario actualizado en hoja", "ÉXITO");
    return true;
    
  } catch (error) {
    registrarLog("actualizarInventarioEnHoja", "ERROR", "Error actualizando en hoja: " + error.toString(), "ERROR");
    return false;
  }
}

/**
 * Show low inventory items
 */
function mostrarInventarioBajo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaInventario = ss.getSheetByName("Inventario");
  
  try {
    if (!hojaInventario) {
      SpreadsheetApp.getUi().alert("Error", "Hoja de Inventario no encontrada", SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    var ultimaFila = hojaInventario.getLastRow();
    if (ultimaFila <= 1) {
      SpreadsheetApp.getUi().alert("Sin Datos", "No hay datos de inventario", SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    var data = hojaInventario.getDataRange().getValues();
    var itemsBajoStock = [];
    
    // Find items with low stock
    for (var i = 1; i < data.length; i++) {
      var cantidadActual = parseFloat(data[i][2]) || 0;
      var cantidadMinima = parseFloat(data[i][3]) || 0;
      
      if (cantidadActual <= cantidadMinima && cantidadMinima > 0) {
        itemsBajoStock.push({
          producto: data[i][0],
          almacen: data[i][1],
          cantidadActual: cantidadActual,
          cantidadMinima: cantidadMinima
        });
      }
    }
    
    if (itemsBajoStock.length === 0) {
      SpreadsheetApp.getUi().alert("Inventario OK", "No hay productos con inventario bajo", SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Show low stock items
    var mensaje = "Productos con inventario bajo:\n\n";
    for (var j = 0; j < itemsBajoStock.length; j++) {
      var item = itemsBajoStock[j];
      mensaje += "• " + item.producto + " (" + item.almacen + ")\n";
      mensaje += "  Actual: " + item.cantidadActual + " | Mínimo: " + item.cantidadMinima + "\n\n";
    }
    
    SpreadsheetApp.getUi().alert("Inventario Bajo", mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
    
    registrarLog("mostrarInventarioBajo", "FIN", "Mostrados " + itemsBajoStock.length + " items con inventario bajo", "ÉXITO");
    
  } catch (error) {
    registrarLog("mostrarInventarioBajo", "ERROR", "Error mostrando inventario bajo: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error', 'Error al mostrar inventario bajo: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Verify if product exists
 */
function verificarProductoExiste(producto) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaProductos = ss.getSheetByName("Productos");
  
  try {
    if (!hojaProductos) {
      return false;
    }
    
    var ultimaFila = hojaProductos.getLastRow();
    if (ultimaFila <= 1) {
      return false;
    }
    
    var data = hojaProductos.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === producto) { // Product name is in column 2 (index 1)
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    registrarLog("verificarProductoExiste", "ERROR", "Error verificando producto: " + error.toString(), "ERROR");
    return false;
  }
}

/**
 * Verify if warehouse exists
 */
function verificarAlmacenExiste(almacen) {
  var almacenesValidos = ["Principal", "MMM", "DVP"];
  return almacenesValidos.indexOf(almacen) !== -1;
}

// ============================================================================
// INVENTORY ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get inventory data for analysis
 */
function obtenerDatosInventario() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaInventario = ss.getSheetByName("Inventario");
  
  try {
    if (!hojaInventario) {
      return [];
    }
    
    var ultimaFila = hojaInventario.getLastRow();
    if (ultimaFila <= 1) {
      return [];
    }
    
    return hojaInventario.getDataRange().getValues();
    
  } catch (error) {
    registrarLog("obtenerDatosInventario", "ERROR", "Error obteniendo datos: " + error.toString(), "ERROR");
    return [];
  }
}

/**
 * Calculate inventory statistics
 */
function calcularEstadisticasInventario(data) {
  try {
    var estadisticas = {
      totalProductos: 0,
      totalAlmacenes: 0,
      valorTotal: 0,
      productosAgotados: 0,
      productosBajoStock: 0,
      productosPorAlmacen: {},
      productosPorCategoria: {}
    };
    
    var productos = new Set();
    var almacenes = new Set();
    
    for (var i = 1; i < data.length; i++) {
      var producto = data[i][0];
      var almacen = data[i][1];
      var cantidad = parseFloat(data[i][2]) || 0;
      var cantidadMinima = parseFloat(data[i][3]) || 0;
      
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
    registrarLog("calcularEstadisticasInventario", "ERROR", "Error calculando estadísticas: " + error.toString(), "ERROR");
    return {};
  }
}

// ============================================================================
// INVENTORY REPORTS
// ============================================================================

/**
 * Generate comprehensive inventory report
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
 * Generate HTML report for inventory
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
 * Generate HTML report for low stock items
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
