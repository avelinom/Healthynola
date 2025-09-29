// ============================================================================
// HEALTHYNOLA POS SYSTEM - REGISTRAR PRODUCTOS (rps.gs)
// Product Management Script
// Combines: production-functions-v1.gs, diagnose-Productos-Sheet-v1.gs,
//           unified-product-functions-v1.gs, update-existing-functions-v1.gs
// ============================================================================

// ============================================================================
// MAIN PRODUCT REGISTRATION
// ============================================================================

/**
 * Main function to register a new product
 */
function registrarProducto() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  registrarLog("registrarProducto", "INICIO", "Iniciando registro de producto", "INFO");
  
  try {
    // Create UI for product input
    var ui = SpreadsheetApp.getUi();
    var result = ui.prompt(
      'Registrar Producto',
      'Ingrese los datos del producto en el siguiente formato:\n\n' +
      'Código, Nombre, Descripción, Precio, Costo, Categoría, Unidad\n\n' +
      'Ejemplo: GR2KG, Granola 2kg regular, Granola tradicional 2kg, 45000, 27000, Granola, 2kg',
      ui.ButtonSet.OK_CANCEL
    );

    // Process the user's response
    var button = result.getSelectedButton();
    var text = result.getResponseText();
    
    if (button == ui.Button.CANCEL || button == ui.Button.CLOSE) {
      registrarLog("registrarProducto", "CANCELADO", "Operación cancelada por el usuario", "INFO");
      return;
    }
    
    // Parse input
    var datos = text.split(',').map(function(item) { return item.trim(); });
    
    if (datos.length < 7) {
      throw new Error("Formato incorrecto. Debe ingresar: Código, Nombre, Descripción, Precio, Costo, Categoría, Unidad");
    }
    
    var codigo = datos[0];
    var nombre = datos[1];
    var descripcion = datos[2];
    var precio = parseFloat(datos[3]);
    var costo = parseFloat(datos[4]);
    var categoria = datos[5];
    var unidad = datos[6];
    
    // Validate inputs
    if (!codigo || !nombre || !descripcion || isNaN(precio) || isNaN(costo) || !categoria || !unidad) {
      throw new Error("Datos inválidos. Verifique que el precio y costo sean números válidos y que todos los campos estén completos.");
    }
    
    if (precio <= 0 || costo <= 0) {
      throw new Error("El precio y costo deben ser mayores a cero.");
    }
    
    if (precio <= costo) {
      var confirmacion = ui.alert(
        'Advertencia de Precio',
        'El precio de venta (' + precio + ') es menor o igual al costo (' + costo + ').\n\n' +
        'Esto resultará en una pérdida o margen cero.\n\n' +
        '¿Desea continuar?',
        ui.ButtonSet.YES_NO
      );
      
      if (confirmacion != ui.Button.YES) {
        registrarLog("registrarProducto", "CANCELADO", "Registro cancelado por precio menor al costo", "INFO");
        return;
      }
    }
    
    registrarLog("registrarProducto", "DETALLE", 
      "Datos capturados: Código=" + codigo + ", Nombre=" + nombre + 
      ", Precio=" + precio + ", Costo=" + costo, "INFO");
    
    // Check if product code already exists
    var codigoExiste = verificarCodigoProductoExiste(codigo);
    if (codigoExiste) {
      throw new Error("El código '" + codigo + "' ya existe. Use un código único.");
    }
    
    // Check if product name already exists
    var nombreExiste = verificarNombreProductoExiste(nombre);
    if (nombreExiste) {
      throw new Error("El nombre '" + nombre + "' ya existe. Use un nombre único.");
    }
    
    // Register product in Productos sheet
    var registroExitoso = registrarProductoEnHoja(codigo, nombre, descripcion, precio, costo, categoria, unidad);
    if (!registroExitoso) {
      throw new Error("Error al registrar el producto en la hoja.");
    }
    
    // Show success message
    var margen = ((precio - costo) / precio * 100).toFixed(2);
    var mensaje = 'Producto registrado exitosamente:\n\n' +
      'Código: ' + codigo + '\n' +
      'Nombre: ' + nombre + '\n' +
      'Precio: $' + precio.toLocaleString() + '\n' +
      'Costo: $' + costo.toLocaleString() + '\n' +
      'Margen: ' + margen + '%\n' +
      'Categoría: ' + categoria + '\n' +
      'Unidad: ' + unidad;
    
    ui.alert('Producto Registrado', mensaje, ui.ButtonSet.OK);
    
    registrarLog("registrarProducto", "FIN", "Producto registrado exitosamente", "ÉXITO");
    
  } catch (error) {
    registrarLog("registrarProducto", "ERROR", "Error en producto: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error al registrar producto: ' + error.toString());
  }
}

/**
 * Register product in Productos sheet
 */
function registrarProductoEnHoja(codigo, nombre, descripcion, precio, costo, categoria, unidad) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaProductos = ss.getSheetByName("Productos");
  
  try {
    if (!hojaProductos) {
      throw new Error("Hoja de Productos no encontrada");
    }
    
    var fecha = new Date();
    var estado = "Activo";
    
    var nuevaFila = [
      codigo,
      nombre,
      descripcion,
      precio,
      costo,
      categoria,
      unidad,
      estado,
      fecha
    ];
    
    hojaProductos.appendRow(nuevaFila);
    
    registrarLog("registrarProductoEnHoja", "FIN", "Producto registrado en hoja", "ÉXITO");
    return true;
    
  } catch (error) {
    registrarLog("registrarProductoEnHoja", "ERROR", "Error registrando en hoja: " + error.toString(), "ERROR");
    return false;
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Verify if product code already exists
 */
function verificarCodigoProductoExiste(codigo) {
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
      if (data[i][0] === codigo) { // Product code is in column 1 (index 0)
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    registrarLog("verificarCodigoProductoExiste", "ERROR", "Error verificando código: " + error.toString(), "ERROR");
    return false;
  }
}

/**
 * Verify if product name already exists
 */
function verificarNombreProductoExiste(nombre) {
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
      if (data[i][1] === nombre) { // Product name is in column 2 (index 1)
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    registrarLog("verificarNombreProductoExiste", "ERROR", "Error verificando nombre: " + error.toString(), "ERROR");
    return false;
  }
}

// ============================================================================
// PRODUCT DISPLAY FUNCTIONS
// ============================================================================

/**
 * Show all products
 */
function mostrarTodosLosProductos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaProductos = ss.getSheetByName("Productos");
  
  try {
    if (!hojaProductos) {
      SpreadsheetApp.getUi().alert("Error", "Hoja de Productos no encontrada", SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    var ultimaFila = hojaProductos.getLastRow();
    if (ultimaFila <= 1) {
      SpreadsheetApp.getUi().alert("Sin Datos", "No hay productos registrados", SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    var data = hojaProductos.getDataRange().getValues();
    var mensaje = "Productos registrados:\n\n";
    
    for (var i = 1; i < data.length; i++) {
      var producto = data[i];
      var codigo = producto[0];
      var nombre = producto[1];
      var precio = producto[3];
      var costo = producto[4];
      var categoria = producto[5];
      var estado = producto[7];
      
      mensaje += (i) + ". " + nombre + " (" + codigo + ")\n";
      mensaje += "   Precio: $" + precio.toLocaleString() + " | Costo: $" + costo.toLocaleString() + "\n";
      mensaje += "   Categoría: " + categoria + " | Estado: " + estado + "\n\n";
    }
    
    mensaje += "Total: " + (data.length - 1) + " productos";
    
    SpreadsheetApp.getUi().alert("Todos los Productos", mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
    
    registrarLog("mostrarTodosLosProductos", "FIN", "Mostrados " + (data.length - 1) + " productos", "ÉXITO");
    
  } catch (error) {
    registrarLog("mostrarTodosLosProductos", "ERROR", "Error mostrando productos: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error', 'Error al mostrar productos: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ============================================================================
// PRODUCT ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get product data for analysis
 */
function obtenerDatosProductos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaProductos = ss.getSheetByName("Productos");
  
  try {
    if (!hojaProductos) {
      return [];
    }
    
    var ultimaFila = hojaProductos.getLastRow();
    if (ultimaFila <= 1) {
      return [];
    }
    
    return hojaProductos.getDataRange().getValues();
    
  } catch (error) {
    registrarLog("obtenerDatosProductos", "ERROR", "Error obteniendo datos: " + error.toString(), "ERROR");
    return [];
  }
}

/**
 * Calculate product statistics
 */
function calcularEstadisticasProductos(data) {
  try {
    var estadisticas = {
      totalProductos: 0,
      productosActivos: 0,
      productosInactivos: 0,
      valorTotalInventario: 0,
      margenPromedio: 0,
      productosPorCategoria: {},
      productosPorEstado: {}
    };
    
    var totalMargen = 0;
    var productosConMargen = 0;
    
    for (var i = 1; i < data.length; i++) {
      var producto = data[i];
      var precio = parseFloat(producto[3]) || 0;
      var costo = parseFloat(producto[4]) || 0;
      var categoria = producto[5];
      var estado = producto[7];
      
      estadisticas.totalProductos++;
      
      // Count by status
      if (estado === "Activo") {
        estadisticas.productosActivos++;
      } else {
        estadisticas.productosInactivos++;
      }
      
      // Count by category
      if (!estadisticas.productosPorCategoria[categoria]) {
        estadisticas.productosPorCategoria[categoria] = 0;
      }
      estadisticas.productosPorCategoria[categoria]++;
      
      // Count by status
      if (!estadisticas.productosPorEstado[estado]) {
        estadisticas.productosPorEstado[estado] = 0;
      }
      estadisticas.productosPorEstado[estado]++;
      
      // Calculate margin
      if (precio > 0 && costo > 0) {
        var margen = ((precio - costo) / precio) * 100;
        totalMargen += margen;
        productosConMargen++;
      }
    }
    
    if (productosConMargen > 0) {
      estadisticas.margenPromedio = totalMargen / productosConMargen;
    }
    
    return estadisticas;
    
  } catch (error) {
    registrarLog("calcularEstadisticasProductos", "ERROR", "Error calculando estadísticas: " + error.toString(), "ERROR");
    return {};
  }
}

// ============================================================================
// PRODUCT REPORTS
// ============================================================================

/**
 * Generate comprehensive product report
 */
function reporteProductosCompleto() {
  try {
    console.log('=== INICIANDO REPORTE DE PRODUCTOS COMPLETO ===');
    
    // Get product data
    const productosData = obtenerDatosProductos();
    if (!productosData || productosData.length <= 1) {
      SpreadsheetApp.getUi().alert('Error', 'No hay datos de productos disponibles.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Calculate product statistics
    const estadisticas = calcularEstadisticasProductos(productosData);
    
    // Generate report
    const reporte = generarReporteProductosHTML(estadisticas, productosData);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, 'Reporte de Productos Completo');
    
    console.log('Reporte de productos completo generado exitosamente');
    
  } catch (error) {
    console.error('Error en reporteProductosCompleto:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al generar reporte de productos: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Generate HTML report for products
 */
function generarReporteProductosHTML(estadisticas, data) {
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
      .positive { color: #4caf50; }
      .negative { color: #f44336; }
    </style>
  </head>
  <body>
    <h1>Reporte de Productos Completo</h1>
    
    <div class="stats-container">
      <div class="stat-box">
        <div class="stat-label">Total de Productos</div>
        <div class="stat-value">${estadisticas.totalProductos || 0}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Productos Activos</div>
        <div class="stat-value">${estadisticas.productosActivos || 0}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Productos Inactivos</div>
        <div class="stat-value">${estadisticas.productosInactivos || 0}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Margen Promedio</div>
        <div class="stat-value">${(estadisticas.margenPromedio || 0).toFixed(2)}%</div>
      </div>
    </div>
    
    <h2>Distribución por Categoría</h2>
    <div class="stats-container">`;
  
  for (const categoria in estadisticas.productosPorCategoria) {
    html += `
      <div class="stat-box">
        <div class="stat-label">${categoria}</div>
        <div class="stat-value">${estadisticas.productosPorCategoria[categoria]}</div>
      </div>`;
  }
  
  html += `
    </div>
    
    <h2>Lista de Productos</h2>
    <table>
      <tr>
        <th>Código</th>
        <th>Nombre</th>
        <th>Precio</th>
        <th>Costo</th>
        <th>Margen</th>
        <th>Categoría</th>
        <th>Estado</th>
      </tr>`;
  
  for (let i = 1; i < data.length; i++) {
    const producto = data[i];
    const codigo = producto[0];
    const nombre = producto[1];
    const precio = parseFloat(producto[3]) || 0;
    const costo = parseFloat(producto[4]) || 0;
    const categoria = producto[5];
    const estado = producto[7];
    
    const margen = precio > 0 && costo > 0 ? ((precio - costo) / precio * 100).toFixed(2) : 'N/A';
    const margenClass = margen !== 'N/A' && parseFloat(margen) >= 0 ? 'positive' : 'negative';
    
    html += `
      <tr>
        <td>${codigo}</td>
        <td>${nombre}</td>
        <td>${formatCurrency(precio)}</td>
        <td>${formatCurrency(costo)}</td>
        <td class="${margenClass}">${margen}%</td>
        <td>${categoria}</td>
        <td>${estado}</td>
      </tr>`;
  }
  
  html += `
    </table>
    
    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
      Reporte generado el ${new Date().toLocaleString()}
    </div>
  </body>
  </html>`;
  
  return html;
}
