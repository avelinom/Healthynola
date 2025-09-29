// ============================================================================
// HEALTHYNOLA POS SYSTEM - REGISTRAR PRODUCCIÓN (rp.gs)
// Production Management Script
// Combines: Fix-production-reading-v1.gs, production-fix-v1.gs,
//           production-update-v1.gs, debug-production-fixed-v1.gs
// ============================================================================

// ============================================================================
// MAIN PRODUCTION REGISTRATION
// ============================================================================

/**
 * Main function to register production
 */
function registrarProduccion() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  registrarLog("registrarProduccion", "INICIO", "Iniciando registro de producción", "INFO");
  
  try {
    // Create UI for production input
    var ui = SpreadsheetApp.getUi();
    var result = ui.prompt(
      'Registrar Producción',
      'Ingrese los datos de producción en el siguiente formato:\n\n' +
      'Producto, Cantidad, Lote, Almacén Destino\n\n' +
      'Ejemplo: Granola 1kg regular, 10, LOTE-2023-01, Principal',
      ui.ButtonSet.OK_CANCEL
    );

    // Process the user's response
    var button = result.getSelectedButton();
    var text = result.getResponseText();
    
    if (button == ui.Button.CANCEL || button == ui.Button.CLOSE) {
      registrarLog("registrarProduccion", "CANCELADO", "Operación cancelada por el usuario", "INFO");
      return;
    }
    
    // Parse input
    var datos = text.split(',').map(function(item) { return item.trim(); });
    
    if (datos.length < 4) {
      throw new Error("Formato incorrecto. Debe ingresar: Producto, Cantidad, Lote, Almacén Destino");
    }
    
    var producto = datos[0];
    var cantidad = parseInt(datos[1]);
    var lote = datos[2];
    var almacenDestino = datos[3];
    
    // Validate inputs
    if (!producto || isNaN(cantidad) || cantidad <= 0 || !lote || !almacenDestino) {
      throw new Error("Datos inválidos. Verifique que la cantidad sea un número positivo y que todos los campos estén completos.");
    }
    
    registrarLog("registrarProduccion", "DETALLE", 
      "Datos capturados: Producto=" + producto + ", Cantidad=" + cantidad + 
      ", Lote=" + lote + ", Almacén=" + almacenDestino, "INFO");
    
    // Validate product exists
    var productoExiste = verificarProductoExiste(producto);
    if (!productoExiste) {
      throw new Error("El producto '" + producto + "' no existe en el catálogo.");
    }
    
    // Validate warehouse exists
    var almacenExiste = verificarAlmacenExiste(almacenDestino);
    if (!almacenExiste) {
      throw new Error("El almacén '" + almacenDestino + "' no existe.");
    }
    
    // Register production in Produccion sheet
    var registroExitoso = registrarProduccionEnHoja(producto, cantidad, lote, almacenDestino);
    if (!registroExitoso) {
      throw new Error("Error al registrar la producción en la hoja.");
    }
    
    // Update inventory
    var inventarioActualizado = actualizarInventarioProduccion(producto, cantidad, almacenDestino);
    if (!inventarioActualizado) {
      throw new Error("Error al actualizar el inventario.");
    }
    
    // Register lot
    var loteRegistrado = registrarLoteProduccion(lote, producto, cantidad, almacenDestino);
    if (!loteRegistrado) {
      throw new Error("Error al registrar el lote.");
    }
    
    // Register transfer
    var transferenciaRegistrada = registrarTransferenciaProduccion(producto, cantidad, almacenDestino);
    if (!transferenciaRegistrada) {
      throw new Error("Error al registrar la transferencia.");
    }
    
    // Show success message
    ui.alert(
      'Producción Registrada',
      'La producción se ha registrado exitosamente:\n\n' +
      'Producto: ' + producto + '\n' +
      'Cantidad: ' + cantidad + '\n' +
      'Lote: ' + lote + '\n' +
      'Almacén: ' + almacenDestino,
      ui.ButtonSet.OK
    );
    
    registrarLog("registrarProduccion", "FIN", "Producción registrada exitosamente", "ÉXITO");
    
  } catch (error) {
    registrarLog("registrarProduccion", "ERROR", "Error en producción: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error al registrar producción: ' + error.toString());
  }
}

/**
 * Register production in Produccion sheet
 */
function registrarProduccionEnHoja(producto, cantidad, lote, almacenDestino) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaProduccion = ss.getSheetByName("Producción");
  
  try {
    if (!hojaProduccion) {
      throw new Error("Hoja de Producción no encontrada");
    }
    
    var fecha = new Date();
    var costoTotal = calcularCostoProduccion(producto, cantidad);
    
    var nuevaFila = [
      fecha,
      lote,
      producto,
      cantidad,
      almacenDestino,
      costoTotal,
      "Producción registrada automáticamente"
    ];
    
    hojaProduccion.appendRow(nuevaFila);
    
    registrarLog("registrarProduccionEnHoja", "FIN", "Producción registrada en hoja", "ÉXITO");
    return true;
    
  } catch (error) {
    registrarLog("registrarProduccionEnHoja", "ERROR", "Error registrando en hoja: " + error.toString(), "ERROR");
    return false;
  }
}

/**
 * Update inventory after production
 */
function actualizarInventarioProduccion(producto, cantidad, almacenDestino) {
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
      if (data[i][0] === producto && data[i][1] === almacenDestino) {
        filaEncontrada = i;
        break;
      }
    }
    
    if (filaEncontrada > 0) {
      // Update existing entry
      var cantidadActual = parseFloat(data[filaEncontrada][2]) || 0;
      var nuevaCantidad = cantidadActual + cantidad;
      
      hojaInventario.getRange(filaEncontrada + 1, 3).setValue(nuevaCantidad);
      hojaInventario.getRange(filaEncontrada + 1, 5).setValue(new Date());
      hojaInventario.getRange(filaEncontrada + 1, 6).setValue("Disponible");
      
    } else {
      // Create new inventory entry
      var nuevaFila = [
        producto,
        almacenDestino,
        cantidad,
        0, // Cantidad mínima
        new Date(),
        "Disponible",
        "Agregado por producción"
      ];
      
      hojaInventario.appendRow(nuevaFila);
    }
    
    registrarLog("actualizarInventarioProduccion", "FIN", "Inventario actualizado", "ÉXITO");
    return true;
    
  } catch (error) {
    registrarLog("actualizarInventarioProduccion", "ERROR", "Error actualizando inventario: " + error.toString(), "ERROR");
    return false;
  }
}

/**
 * Register lot in Lotes sheet
 */
function registrarLoteProduccion(lote, producto, cantidad, almacenDestino) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaLotes = ss.getSheetByName("Lotes");
  
  try {
    if (!hojaLotes) {
      throw new Error("Hoja de Lotes no encontrada");
    }
    
    var fechaProduccion = new Date();
    var fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 365); // 1 year expiration
    
    var nuevaFila = [
      lote,
      producto,
      fechaProduccion,
      fechaVencimiento,
      cantidad,
      cantidad, // Cantidad disponible
      almacenDestino,
      "Activo"
    ];
    
    hojaLotes.appendRow(nuevaFila);
    
    registrarLog("registrarLoteProduccion", "FIN", "Lote registrado", "ÉXITO");
    return true;
    
  } catch (error) {
    registrarLog("registrarLoteProduccion", "ERROR", "Error registrando lote: " + error.toString(), "ERROR");
    return false;
  }
}

/**
 * Register transfer in Transferencias sheet
 */
function registrarTransferenciaProduccion(producto, cantidad, almacenDestino) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaTransferencias = ss.getSheetByName("Transferencias");
  
  try {
    if (!hojaTransferencias) {
      throw new Error("Hoja de Transferencias no encontrada");
    }
    
    var fecha = new Date();
    var nuevaFila = [
      fecha,
      producto,
      cantidad,
      "Producción", // Almacén origen
      almacenDestino,
      "Transferencia desde producción",
      "Sistema"
    ];
    
    hojaTransferencias.appendRow(nuevaFila);
    
    registrarLog("registrarTransferenciaProduccion", "FIN", "Transferencia registrada", "ÉXITO");
    return true;
    
  } catch (error) {
    registrarLog("registrarTransferenciaProduccion", "ERROR", "Error registrando transferencia: " + error.toString(), "ERROR");
    return false;
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

/**
 * Calculate production cost
 */
function calcularCostoProduccion(producto, cantidad) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaProductos = ss.getSheetByName("Productos");
  
  try {
    if (!hojaProductos) {
      return 0;
    }
    
    var ultimaFila = hojaProductos.getLastRow();
    if (ultimaFila <= 1) {
      return 0;
    }
    
    var data = hojaProductos.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === producto) { // Product name is in column 2 (index 1)
        var costoUnitario = parseFloat(data[i][4]) || 0; // Cost is in column 5 (index 4)
        return costoUnitario * cantidad;
      }
    }
    
    return 0;
    
  } catch (error) {
    registrarLog("calcularCostoProduccion", "ERROR", "Error calculando costo: " + error.toString(), "ERROR");
    return 0;
  }
}

// ============================================================================
// MAINTENANCE FUNCTIONS
// ============================================================================

/**
 * Clear production sheet
 */
function limpiarHojaProduccion() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaProduccion = ss.getSheetByName("Producción");
  
  try {
    if (!hojaProduccion) {
      SpreadsheetApp.getUi().alert("Error", "Hoja de Producción no encontrada", SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(
      'Limpiar Hoja Producción',
      '¿Está seguro que desea limpiar todos los registros de producción?\n\nEsta acción no se puede deshacer.',
      ui.ButtonSet.YES_NO
    );
    
    if (response == ui.Button.YES) {
      var ultimaFila = hojaProduccion.getLastRow();
      if (ultimaFila > 1) {
        hojaProduccion.getRange(2, 1, ultimaFila - 1, 7).clearContent();
      }
      
      ui.alert('Hoja Limpiada', 'La hoja de Producción ha sido limpiada exitosamente.', ui.ButtonSet.OK);
      registrarLog("limpiarHojaProduccion", "FIN", "Hoja de producción limpiada", "ÉXITO");
    }
    
  } catch (error) {
    registrarLog("limpiarHojaProduccion", "ERROR", "Error limpiando hoja: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error', 'Error al limpiar la hoja: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
