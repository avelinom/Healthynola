// ============================================================================
// HEALTHYNOLA POS SYSTEM - REGISTRAR VENTA MÓVIL (rvm.gs)
// Consolidated Mobile Sales Management Script
// Combines: fix-registrar-venta.gs, ventas-menu-mobile-v1.gs, 
//           fix-venta-movil.gs, registrar-venta-movil-v1.gs
// ============================================================================

// ============================================================================
// MOBILE INTERFACE CONFIGURATION
// ============================================================================

/**
 * Configure the Venta Movil tab with dropdown menu interface
 */
function configurarHojaVentaMovil() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaVentaMovil = ss.getSheetByName("Venta Movil");
  
  registrarLog("configurarHojaVentaMovil", "INICIO", "Configurando hoja Venta Movil", "INFO");
  
  if (!hojaVentaMovil) {
    hojaVentaMovil = ss.insertSheet("Venta Movil");
    registrarLog("configurarHojaVentaMovil", "DETALLE", "Hoja Venta Movil creada", "INFO");
  }
  
  // Configure the title and header
  hojaVentaMovil.getRange("A1:C1").merge();
  hojaVentaMovil.getRange("A1").setValue("REGISTRAR VENTA MÓVIL")
    .setBackground("#4285F4")
    .setFontColor("white")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setFontSize(16);
  
  // Configure form labels and input fields
  var labels = [
    "Cliente:", 
    "Producto:", 
    "Cantidad:", 
    "Método de Pago:", 
    "Envío:", 
    "Notas:", 
    "Almacén:", 
    "Vendedor:"
  ];
  
  for (var i = 0; i < labels.length; i++) {
    hojaVentaMovil.getRange(i+2, 1).setValue(labels[i])
      .setFontWeight("bold");
  }
  
  // Add data validation for products
  var productoValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Granola 1kg regular', 'Granola 1/2kg regular', 'Granola 1/2kg keto'], true)
    .build();
  hojaVentaMovil.getRange("B3").setDataValidation(productoValidation);
  
  // Add data validation for payment methods
  var pagoValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Efectivo', 'Transferencia', 'Regalo', 'Consignación'], true)
    .build();
  hojaVentaMovil.getRange("B5").setDataValidation(pagoValidation);
  
  // Add data validation for warehouses
  var almacenValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Principal', 'MMM', 'DVP'], true)
    .build();
  hojaVentaMovil.getRange("B8").setDataValidation(almacenValidation);
  
  // Set column widths
  hojaVentaMovil.setColumnWidth(1, 120);
  hojaVentaMovil.setColumnWidth(2, 200);
  
  // Add the Ventas dropdown menu
  hojaVentaMovil.getRange("A12").setValue("Acciones:")
    .setFontWeight("bold");
  
  var ventasMenuValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Seleccionar acción...', 'Ejecutar venta', 'Cancelar venta'], true)
    .build();
  
  hojaVentaMovil.getRange("B12").setValue("Seleccionar acción...")
    .setDataValidation(ventasMenuValidation);
  
  // Add onEdit trigger for the action menu
  ScriptApp.newTrigger('procesarAccionVentaMovil')
    .for(ss)
    .onEdit()
    .create();
  
  registrarLog("configurarHojaVentaMovil", "FIN", "Hoja Venta Movil configurada exitosamente", "ÉXITO");
}

// ============================================================================
// MOBILE SALES PROCESSING
// ============================================================================

/**
 * Process mobile sales action when dropdown is changed
 */
function procesarAccionVentaMovil(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaVentaMovil = ss.getSheetByName("Venta Movil");
  
  if (!hojaVentaMovil || e.range.getSheet().getName() !== "Venta Movil") {
    return;
  }
  
  if (e.range.getA1Notation() === "B12") {
    var accion = e.value;
    
    if (accion === "Ejecutar venta") {
      registrarVentaMovil();
    } else if (accion === "Cancelar venta") {
      mostrarDialogoCancelarVenta();
    }
    
    // Reset dropdown
    hojaVentaMovil.getRange("B12").setValue("Seleccionar acción...");
  }
}

/**
 * Main function to register mobile sale
 */
function registrarVentaMovil() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaVentaMovil = ss.getSheetByName("Venta Movil");
  
  registrarLog("registrarVentaMovil", "INICIO", "Iniciando registro de venta móvil", "INFO");
  
  try {
    // Get form data
    var cliente = hojaVentaMovil.getRange("B2").getValue();
    var producto = hojaVentaMovil.getRange("B3").getValue();
    var cantidad = hojaVentaMovil.getRange("B4").getValue();
    var metodoPago = hojaVentaMovil.getRange("B5").getValue();
    var envio = hojaVentaMovil.getRange("B6").getValue();
    var notas = hojaVentaMovil.getRange("B7").getValue();
    var almacen = hojaVentaMovil.getRange("B8").getValue();
    var vendedor = hojaVentaMovil.getRange("B9").getValue();
    
    // Validate required fields
    if (!cliente || !producto || !cantidad || !metodoPago || !almacen || !vendedor) {
      throw new Error("Por favor complete todos los campos obligatorios");
    }
    
    if (isNaN(cantidad) || cantidad <= 0) {
      throw new Error("La cantidad debe ser un número positivo");
    }
    
    // Get product price
    var precioUnitario = buscarPrecioProducto(producto);
    if (precioUnitario === 0) {
      throw new Error("No se pudo obtener el precio del producto: " + producto);
    }
    
    // Calculate totals
    var subtotal = cantidad * precioUnitario;
    var total = subtotal; // Add shipping costs if needed
    
    // Check inventory availability
    var inventarioDisponible = verificarInventarioDisponible(producto, almacen);
    if (inventarioDisponible < cantidad) {
      throw new Error("Inventario insuficiente. Disponible: " + inventarioDisponible + ", Solicitado: " + cantidad);
    }
    
    // Register sale in Ventas sheet
    var hojaVentas = ss.getSheetByName("Ventas");
    if (!hojaVentas) {
      throw new Error("Hoja de Ventas no encontrada");
    }
    
    var fecha = new Date();
    var nuevaFila = [
      fecha,
      cliente,
      producto,
      cantidad,
      precioUnitario,
      subtotal,
      metodoPago,
      total,
      vendedor,
      almacen,
      notas
    ];
    
    hojaVentas.appendRow(nuevaFila);
    
    // Update inventory
    actualizarInventarioVenta(producto, cantidad, almacen, "Venta");
    
    // Clear form
    limpiarFormularioVentaMovil();
    
    // Show success message
    SpreadsheetApp.getUi().alert(
      'Venta Registrada',
      'La venta se ha registrado exitosamente.\n\n' +
      'Cliente: ' + cliente + '\n' +
      'Producto: ' + producto + '\n' +
      'Cantidad: ' + cantidad + '\n' +
      'Total: $' + total.toLocaleString(),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    registrarLog("registrarVentaMovil", "FIN", "Venta móvil registrada exitosamente", "ÉXITO");
    
  } catch (error) {
    registrarLog("registrarVentaMovil", "ERROR", "Error en venta móvil: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error al registrar venta: ' + error.toString());
  }
}

/**
 * Search for product price from Productos sheet
 */
function buscarPrecioProducto(producto) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaProductos = ss.getSheetByName("Productos");
  
  registrarLog("buscarPrecioProducto", "INICIO", "Buscando precio para: " + producto, "INFO");
  
  try {
    if (!hojaProductos) {
      registrarLog("buscarPrecioProducto", "ERROR", "Hoja Productos no encontrada", "ERROR");
      return 0;
    }
    
    // Get all product data
    var ultimaFila = hojaProductos.getLastRow();
    if (ultimaFila <= 1) {
      registrarLog("buscarPrecioProducto", "ERROR", "No hay productos registrados", "ERROR");
      return 0;
    }
    
    var data = hojaProductos.getRange(1, 1, ultimaFila, 9).getValues();
    
    // Find product by name (column 2)
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === producto) {
        var precio = parseFloat(data[i][3]); // Price is in column 4 (index 3)
        registrarLog("buscarPrecioProducto", "FIN", "Precio encontrado: " + precio, "ÉXITO");
        return precio;
      }
    }
    
    registrarLog("buscarPrecioProducto", "ERROR", "Producto no encontrado: " + producto, "ERROR");
    return 0;
    
  } catch (error) {
    registrarLog("buscarPrecioProducto", "ERROR", "Error buscando precio: " + error.toString(), "ERROR");
    return 0;
  }
}

/**
 * Check inventory availability
 */
function verificarInventarioDisponible(producto, almacen) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaInventario = ss.getSheetByName("Inventario");
  
  try {
    if (!hojaInventario) {
      return 0;
    }
    
    var ultimaFila = hojaInventario.getLastRow();
    if (ultimaFila <= 1) {
      return 0;
    }
    
    var data = hojaInventario.getRange(1, 1, ultimaFila, 7).getValues();
    
    // Find product and warehouse combination
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === producto && data[i][1] === almacen) {
        return parseFloat(data[i][2]) || 0; // Current quantity is in column 3 (index 2)
      }
    }
    
    return 0;
    
  } catch (error) {
    registrarLog("verificarInventarioDisponible", "ERROR", "Error verificando inventario: " + error.toString(), "ERROR");
    return 0;
  }
}

/**
 * Update inventory after sale
 */
function actualizarInventarioVenta(producto, cantidad, almacen, motivo) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaInventario = ss.getSheetByName("Inventario");
  
  try {
    if (!hojaInventario) {
      throw new Error("Hoja de Inventario no encontrada");
    }
    
    var ultimaFila = hojaInventario.getLastRow();
    if (ultimaFila <= 1) {
      throw new Error("No hay datos de inventario");
    }
    
    var data = hojaInventario.getRange(1, 1, ultimaFila, 7).getValues();
    
    // Find product and warehouse combination
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === producto && data[i][1] === almacen) {
        var cantidadActual = parseFloat(data[i][2]) || 0;
        var nuevaCantidad = cantidadActual - cantidad;
        
        // Update inventory
        hojaInventario.getRange(i + 1, 3).setValue(nuevaCantidad);
        hojaInventario.getRange(i + 1, 5).setValue(new Date()); // Last update
        hojaInventario.getRange(i + 1, 6).setValue(nuevaCantidad <= 0 ? "Agotado" : "Disponible");
        
        registrarLog("actualizarInventarioVenta", "FIN", 
          "Inventario actualizado: " + producto + " en " + almacen + " = " + nuevaCantidad, "ÉXITO");
        return;
      }
    }
    
    throw new Error("Producto no encontrado en inventario: " + producto + " en " + almacen);
    
  } catch (error) {
    registrarLog("actualizarInventarioVenta", "ERROR", "Error actualizando inventario: " + error.toString(), "ERROR");
    throw error;
  }
}

// ============================================================================
// FORM MANAGEMENT
// ============================================================================

/**
 * Clear mobile sales form
 */
function limpiarFormularioVentaMovil() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaVentaMovil = ss.getSheetByName("Venta Movil");
  
  try {
    if (!hojaVentaMovil) {
      return;
    }
    
    // Clear all input fields
    hojaVentaMovil.getRange("B2:B9").clearContent();
    
    // Reset dropdowns to default values
    hojaVentaMovil.getRange("B3").setValue(""); // Product
    hojaVentaMovil.getRange("B5").setValue(""); // Payment method
    hojaVentaMovil.getRange("B8").setValue(""); // Warehouse
    
    registrarLog("limpiarFormularioVentaMovil", "FIN", "Formulario limpiado exitosamente", "ÉXITO");
    
  } catch (error) {
    registrarLog("limpiarFormularioVentaMovil", "ERROR", "Error limpiando formulario: " + error.toString(), "ERROR");
  }
}

/**
 * Show cancel sale dialog
 */
function mostrarDialogoCancelarVenta() {
  var ui = SpreadsheetApp.getUi();
  
  var response = ui.alert(
    'Cancelar Venta',
    '¿Está seguro que desea cancelar la venta actual?',
    ui.ButtonSet.YES_NO
  );
  
  if (response == ui.Button.YES) {
    limpiarFormularioVentaMovil();
    ui.alert('Venta Cancelada', 'La venta ha sido cancelada y el formulario ha sido limpiado.', ui.ButtonSet.OK);
  }
}
