// ============================================================================
// HEALTHYNOLA POS SYSTEM - TRANSFERIR ENTRE ALMACENES (tea.gs)
// Warehouse Transfer Management Script
// Combines: transferencias-almacenes-v1.gs, clean-Transferencias-sheet.gs,
//           fix-Transferencias-sheet-v1.gs, unified-product-functions-v1.gs
// ============================================================================

// ============================================================================
// MAIN TRANSFER FUNCTIONS
// ============================================================================

/**
 * Main function to transfer products between warehouses
 */
function transferirEntreAlmacenes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  registrarLog("transferirEntreAlmacenes", "INICIO", "Iniciando transferencia entre almacenes", "INFO");
  
  try {
    // Create UI for transfer input
    var ui = SpreadsheetApp.getUi();
    var result = ui.prompt(
      'Transferir Entre Almacenes',
      'Ingrese los datos de transferencia en el siguiente formato:\n\n' +
      'Producto, Cantidad, Almacén Origen, Almacén Destino, Motivo\n\n' +
      'Almacenes válidos: Principal, MMM, DVP\n' +
      'Ejemplo: Granola 1kg regular, 5, Principal, MMM, Reposición de stock',
      ui.ButtonSet.OK_CANCEL
    );

    // Process the user's response
    var button = result.getSelectedButton();
    var text = result.getResponseText();
    
    if (button == ui.Button.CANCEL || button == ui.Button.CLOSE) {
      registrarLog("transferirEntreAlmacenes", "CANCELADO", "Operación cancelada por el usuario", "INFO");
      return;
    }
    
    // Parse input
    var datos = text.split(',').map(function(item) { return item.trim(); });
    
    if (datos.length < 5) {
      throw new Error("Formato incorrecto. Debe ingresar: Producto, Cantidad, Almacén Origen, Almacén Destino, Motivo");
    }
    
    var producto = datos[0];
    var cantidad = parseInt(datos[1]);
    var almacenOrigen = datos[2];
    var almacenDestino = datos[3];
    var motivo = datos[4];
    
    // Validate inputs
    if (!producto || isNaN(cantidad) || cantidad <= 0 || !almacenOrigen || !almacenDestino || !motivo) {
      throw new Error("Datos inválidos. Verifique que la cantidad sea un número positivo y que todos los campos estén completos.");
    }
    
    if (almacenOrigen === almacenDestino) {
      throw new Error("El almacén de origen y destino no pueden ser el mismo.");
    }
    
    registrarLog("transferirEntreAlmacenes", "DETALLE", 
      "Datos capturados: Producto=" + producto + ", Cantidad=" + cantidad + 
      ", Origen=" + almacenOrigen + ", Destino=" + almacenDestino + ", Motivo=" + motivo, "INFO");
    
    // Validate product exists
    var productoExiste = verificarProductoExiste(producto);
    if (!productoExiste) {
      throw new Error("El producto '" + producto + "' no existe en el catálogo.");
    }
    
    // Validate warehouses exist
    var origenExiste = verificarAlmacenExiste(almacenOrigen);
    var destinoExiste = verificarAlmacenExiste(almacenDestino);
    
    if (!origenExiste) {
      throw new Error("El almacén de origen '" + almacenOrigen + "' no existe.");
    }
    
    if (!destinoExiste) {
      throw new Error("El almacén de destino '" + almacenDestino + "' no existe.");
    }
    
    // Check inventory availability in origin warehouse
    var inventarioDisponible = verificarInventarioDisponible(producto, almacenOrigen);
    if (inventarioDisponible < cantidad) {
      throw new Error("Inventario insuficiente en " + almacenOrigen + ". Disponible: " + inventarioDisponible + ", Solicitado: " + cantidad);
    }
    
    // Execute transfer
    var transferenciaExitosa = ejecutarTransferencia(producto, cantidad, almacenOrigen, almacenDestino, motivo);
    if (!transferenciaExitosa) {
      throw new Error("Error al ejecutar la transferencia.");
    }
    
    // Show success message
    var mensaje = 'Transferencia ejecutada exitosamente:\n\n' +
      'Producto: ' + producto + '\n' +
      'Cantidad: ' + cantidad + '\n' +
      'Origen: ' + almacenOrigen + '\n' +
      'Destino: ' + almacenDestino + '\n' +
      'Motivo: ' + motivo;
    
    ui.alert('Transferencia Exitosa', mensaje, ui.ButtonSet.OK);
    
    registrarLog("transferirEntreAlmacenes", "FIN", "Transferencia ejecutada exitosamente", "ÉXITO");
    
  } catch (error) {
    registrarLog("transferirEntreAlmacenes", "ERROR", "Error en transferencia: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error al transferir: ' + error.toString());
  }
}

/**
 * Execute the actual transfer between warehouses
 */
function ejecutarTransferencia(producto, cantidad, almacenOrigen, almacenDestino, motivo) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    // Update origin warehouse inventory (subtract)
    var origenActualizado = actualizarInventarioTransferencia(producto, cantidad, almacenOrigen, false);
    if (!origenActualizado) {
      throw new Error("Error actualizando inventario de origen");
    }
    
    // Update destination warehouse inventory (add)
    var destinoActualizado = actualizarInventarioTransferencia(producto, cantidad, almacenDestino, true);
    if (!destinoActualizado) {
      // Rollback origin warehouse if destination fails
      actualizarInventarioTransferencia(producto, cantidad, almacenOrigen, true);
      throw new Error("Error actualizando inventario de destino");
    }
    
    // Register transfer in Transferencias sheet
    var transferenciaRegistrada = registrarTransferenciaEnHoja(producto, cantidad, almacenOrigen, almacenDestino, motivo);
    if (!transferenciaRegistrada) {
      throw new Error("Error registrando transferencia");
    }
    
    registrarLog("ejecutarTransferencia", "FIN", "Transferencia ejecutada correctamente", "ÉXITO");
    return true;
    
  } catch (error) {
    registrarLog("ejecutarTransferencia", "ERROR", "Error ejecutando transferencia: " + error.toString(), "ERROR");
    return false;
  }
}

/**
 * Update inventory for transfer
 */
function actualizarInventarioTransferencia(producto, cantidad, almacen, esSuma) {
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
      
    } else if (esSuma) {
      // Create new inventory entry for destination
      var nuevaFila = [
        producto,
        almacen,
        cantidad,
        0, // Cantidad mínima
        new Date(),
        "Disponible",
        "Transferencia desde " + (esSuma ? "otro almacén" : "producción")
      ];
      
      hojaInventario.appendRow(nuevaFila);
    } else {
      throw new Error("No se puede restar de un inventario que no existe");
    }
    
    registrarLog("actualizarInventarioTransferencia", "FIN", 
      "Inventario actualizado: " + producto + " en " + almacen + " = " + (esSuma ? "+" : "-") + cantidad, "ÉXITO");
    return true;
    
  } catch (error) {
    registrarLog("actualizarInventarioTransferencia", "ERROR", "Error actualizando inventario: " + error.toString(), "ERROR");
    return false;
  }
}

/**
 * Register transfer in Transferencias sheet
 */
function registrarTransferenciaEnHoja(producto, cantidad, almacenOrigen, almacenDestino, motivo) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaTransferencias = ss.getSheetByName("Transferencias");
  
  try {
    if (!hojaTransferencias) {
      throw new Error("Hoja de Transferencias no encontrada");
    }
    
    var fecha = new Date();
    var responsable = "Sistema"; // Could be enhanced to get current user
    
    var nuevaFila = [
      fecha,
      producto,
      cantidad,
      almacenOrigen,
      almacenDestino,
      motivo,
      responsable
    ];
    
    hojaTransferencias.appendRow(nuevaFila);
    
    registrarLog("registrarTransferenciaEnHoja", "FIN", "Transferencia registrada en hoja", "ÉXITO");
    return true;
    
  } catch (error) {
    registrarLog("registrarTransferenciaEnHoja", "ERROR", "Error registrando transferencia: " + error.toString(), "ERROR");
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
    
    var data = hojaInventario.getDataRange().getValues();
    
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

// ============================================================================
// MAINTENANCE FUNCTIONS
// ============================================================================

/**
 * Clear transfer sheet
 */
function limpiarHojaTransferencias() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaTransferencias = ss.getSheetByName("Transferencias");
  
  try {
    if (!hojaTransferencias) {
      SpreadsheetApp.getUi().alert("Error", "Hoja de Transferencias no encontrada", SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(
      'Limpiar Hoja Transferencias',
      '¿Está seguro que desea limpiar todos los registros de transferencias?\n\nEsta acción no se puede deshacer.',
      ui.ButtonSet.YES_NO
    );
    
    if (response == ui.Button.YES) {
      var ultimaFila = hojaTransferencias.getLastRow();
      if (ultimaFila > 1) {
        hojaTransferencias.getRange(2, 1, ultimaFila - 1, 7).clearContent();
      }
      
      ui.alert('Hoja Limpiada', 'La hoja de Transferencias ha sido limpiada exitosamente.', ui.ButtonSet.OK);
      registrarLog("limpiarHojaTransferencias", "FIN", "Hoja de transferencias limpiada", "ÉXITO");
    }
    
  } catch (error) {
    registrarLog("limpiarHojaTransferencias", "ERROR", "Error limpiando hoja: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error', 'Error al limpiar la hoja: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ============================================================================
// TRANSFER ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get transfer data for analysis
 */
function obtenerDatosTransferencias() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaTransferencias = ss.getSheetByName("Transferencias");
  
  try {
    if (!hojaTransferencias) {
      return [];
    }
    
    var ultimaFila = hojaTransferencias.getLastRow();
    if (ultimaFila <= 1) {
      return [];
    }
    
    return hojaTransferencias.getDataRange().getValues();
    
  } catch (error) {
    registrarLog("obtenerDatosTransferencias", "ERROR", "Error obteniendo datos: " + error.toString(), "ERROR");
    return [];
  }
}

/**
 * Calculate transfer statistics
 */
function calcularEstadisticasTransferencias(data) {
  try {
    var estadisticas = {
      totalTransferencias: 0,
      transferenciasPorAlmacen: {},
      transferenciasPorProducto: {},
      transferenciasPorMotivo: {},
      transferenciasPorMes: {}
    };
    
    for (var i = 1; i < data.length; i++) {
      var transferencia = data[i];
      var producto = transferencia[1];
      var almacenOrigen = transferencia[3];
      var almacenDestino = transferencia[4];
      var motivo = transferencia[5];
      var fecha = transferencia[0];
      
      estadisticas.totalTransferencias++;
      
      // Count by origin warehouse
      if (!estadisticas.transferenciasPorAlmacen[almacenOrigen]) {
        estadisticas.transferenciasPorAlmacen[almacenOrigen] = 0;
      }
      estadisticas.transferenciasPorAlmacen[almacenOrigen]++;
      
      // Count by product
      if (!estadisticas.transferenciasPorProducto[producto]) {
        estadisticas.transferenciasPorProducto[producto] = 0;
      }
      estadisticas.transferenciasPorProducto[producto]++;
      
      // Count by reason
      if (!estadisticas.transferenciasPorMotivo[motivo]) {
        estadisticas.transferenciasPorMotivo[motivo] = 0;
      }
      estadisticas.transferenciasPorMotivo[motivo]++;
      
      // Count by month
      var mes = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM');
      if (!estadisticas.transferenciasPorMes[mes]) {
        estadisticas.transferenciasPorMes[mes] = 0;
      }
      estadisticas.transferenciasPorMes[mes]++;
    }
    
    return estadisticas;
    
  } catch (error) {
    registrarLog("calcularEstadisticasTransferencias", "ERROR", "Error calculando estadísticas: " + error.toString(), "ERROR");
    return {};
  }
}
