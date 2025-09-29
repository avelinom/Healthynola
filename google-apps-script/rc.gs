// ============================================================================
// HEALTHYNOLA POS SYSTEM - REGISTRAR CONSIGNACIÓN (rc.gs)
// Consignment Management Script
// Combines: registrar-consignación-v1.gs, cleanConsignacionesSheet-v1.gs,
//           MissingConsignaciones.gs
// ============================================================================

// ============================================================================
// MAIN CONSIGNMENT FUNCTIONS
// ============================================================================

/**
 * Main function to register a consignment
 */
function registrarConsignacion() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  registrarLog("registrarConsignacion", "INICIO", "Iniciando registro de consignación", "INFO");
  
  try {
    // Create UI for consignment input
    var ui = SpreadsheetApp.getUi();
    var result = ui.prompt(
      'Registrar Consignación',
      'Ingrese los datos de consignación en el siguiente formato:\n\n' +
      'Cliente, Producto, Cantidad, Precio Unitario, Días Vencimiento, Notas\n\n' +
      'Ejemplo: Juan Pérez, Granola 1kg regular, 5, 25000, 30, Consignación para tienda',
      ui.ButtonSet.OK_CANCEL
    );

    // Process the user's response
    var button = result.getSelectedButton();
    var text = result.getResponseText();
    
    if (button == ui.Button.CANCEL || button == ui.Button.CLOSE) {
      registrarLog("registrarConsignacion", "CANCELADO", "Operación cancelada por el usuario", "INFO");
      return;
    }
    
    // Parse input
    var datos = text.split(',').map(function(item) { return item.trim(); });
    
    if (datos.length < 6) {
      throw new Error("Formato incorrecto. Debe ingresar: Cliente, Producto, Cantidad, Precio Unitario, Días Vencimiento, Notas");
    }
    
    var cliente = datos[0];
    var producto = datos[1];
    var cantidad = parseInt(datos[2]);
    var precioUnitario = parseFloat(datos[3]);
    var diasVencimiento = parseInt(datos[4]);
    var notas = datos[5];
    
    // Validate inputs
    if (!cliente || !producto || isNaN(cantidad) || cantidad <= 0 || 
        isNaN(precioUnitario) || precioUnitario <= 0 || 
        isNaN(diasVencimiento) || diasVencimiento <= 0 || !notas) {
      throw new Error("Datos inválidos. Verifique que la cantidad, precio y días sean números positivos y que todos los campos estén completos.");
    }
    
    registrarLog("registrarConsignacion", "DETALLE", 
      "Datos capturados: Cliente=" + cliente + ", Producto=" + producto + 
      ", Cantidad=" + cantidad + ", Precio=" + precioUnitario + ", Días=" + diasVencimiento, "INFO");
    
    // Validate product exists
    var productoExiste = verificarProductoExiste(producto);
    if (!productoExiste) {
      throw new Error("El producto '" + producto + "' no existe en el catálogo.");
    }
    
    // Check if client exists, if not offer to create
    var clienteExiste = verificarClienteExiste(cliente);
    if (!clienteExiste) {
      var crearCliente = ui.alert(
        'Cliente No Encontrado',
        'El cliente "' + cliente + '" no existe en la base de datos.\n\n' +
        '¿Desea crear un nuevo cliente?',
        ui.ButtonSet.YES_NO
      );
      
      if (crearCliente == ui.Button.YES) {
        var clienteCreado = crearClienteRapido(cliente);
        if (!clienteCreado) {
          throw new Error("Error al crear el cliente. Operación cancelada.");
        }
      } else {
        throw new Error("Operación cancelada. El cliente debe existir para registrar una consignación.");
      }
    }
    
    // Calculate total and expiration date
    var total = cantidad * precioUnitario;
    var fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVencimiento);
    
    // Register consignment in Consignaciones sheet
    var registroExitoso = registrarConsignacionEnHoja(cliente, producto, cantidad, precioUnitario, total, diasVencimiento, fechaVencimiento, notas);
    if (!registroExitoso) {
      throw new Error("Error al registrar la consignación en la hoja.");
    }
    
    // Update inventory (subtract from available stock)
    var inventarioActualizado = actualizarInventarioConsignacion(producto, cantidad);
    if (!inventarioActualizado) {
      throw new Error("Error al actualizar el inventario.");
    }
    
    // Show success message
    var mensaje = 'Consignación registrada exitosamente:\n\n' +
      'Cliente: ' + cliente + '\n' +
      'Producto: ' + producto + '\n' +
      'Cantidad: ' + cantidad + '\n' +
      'Precio Unitario: $' + precioUnitario.toLocaleString() + '\n' +
      'Total: $' + total.toLocaleString() + '\n' +
      'Vencimiento: ' + Utilities.formatDate(fechaVencimiento, Session.getScriptTimeZone(), 'dd/MM/yyyy') + '\n' +
      'Notas: ' + notas;
    
    ui.alert('Consignación Registrada', mensaje, ui.ButtonSet.OK);
    
    registrarLog("registrarConsignacion", "FIN", "Consignación registrada exitosamente", "ÉXITO");
    
  } catch (error) {
    registrarLog("registrarConsignacion", "ERROR", "Error en consignación: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error al registrar consignación: ' + error.toString());
  }
}

/**
 * Register consignment in Consignaciones sheet
 */
function registrarConsignacionEnHoja(cliente, producto, cantidad, precioUnitario, total, diasVencimiento, fechaVencimiento, notas) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaConsignaciones = ss.getSheetByName("Consignaciones");
  
  try {
    if (!hojaConsignaciones) {
      throw new Error("Hoja de Consignaciones no encontrada");
    }
    
    var fecha = new Date();
    var estado = "Activa";
    
    var nuevaFila = [
      fecha,
      cliente,
      producto,
      cantidad,
      precioUnitario,
      total,
      diasVencimiento,
      estado,
      notas
    ];
    
    hojaConsignaciones.appendRow(nuevaFila);
    
    registrarLog("registrarConsignacionEnHoja", "FIN", "Consignación registrada en hoja", "ÉXITO");
    return true;
    
  } catch (error) {
    registrarLog("registrarConsignacionEnHoja", "ERROR", "Error registrando en hoja: " + error.toString(), "ERROR");
    return false;
  }
}

/**
 * Update inventory after consignment
 */
function actualizarInventarioConsignacion(producto, cantidad) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaInventario = ss.getSheetByName("Inventario");
  
  try {
    if (!hojaInventario) {
      throw new Error("Hoja de Inventario no encontrada");
    }
    
    var ultimaFila = hojaInventario.getLastRow();
    var data = hojaInventario.getDataRange().getValues();
    
    // Find product in inventory (check all warehouses)
    var filaEncontrada = -1;
    var almacenEncontrado = "";
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === producto && parseFloat(data[i][2]) >= cantidad) {
        filaEncontrada = i;
        almacenEncontrado = data[i][1];
        break;
      }
    }
    
    if (filaEncontrada > 0) {
      // Update inventory
      var cantidadActual = parseFloat(data[filaEncontrada][2]) || 0;
      var nuevaCantidad = cantidadActual - cantidad;
      
      hojaInventario.getRange(filaEncontrada + 1, 3).setValue(nuevaCantidad);
      hojaInventario.getRange(filaEncontrada + 1, 5).setValue(new Date());
      hojaInventario.getRange(filaEncontrada + 1, 6).setValue(nuevaCantidad <= 0 ? "Agotado" : "Disponible");
      hojaInventario.getRange(filaEncontrada + 1, 7).setValue("Consignación - " + almacenEncontrado);
      
      registrarLog("actualizarInventarioConsignacion", "FIN", 
        "Inventario actualizado: " + producto + " en " + almacenEncontrado + " = " + nuevaCantidad, "ÉXITO");
      return true;
      
    } else {
      throw new Error("No hay suficiente inventario disponible para el producto: " + producto);
    }
    
  } catch (error) {
    registrarLog("actualizarInventarioConsignacion", "ERROR", "Error actualizando inventario: " + error.toString(), "ERROR");
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
 * Verify if client exists
 */
function verificarClienteExiste(cliente) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaClientes = ss.getSheetByName("Clientes");
  
  try {
    if (!hojaClientes) {
      return false;
    }
    
    var ultimaFila = hojaClientes.getLastRow();
    if (ultimaFila <= 1) {
      return false;
    }
    
    var data = hojaClientes.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === cliente) { // Client name is in column 1 (index 0)
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    registrarLog("verificarClienteExiste", "ERROR", "Error verificando cliente: " + error.toString(), "ERROR");
    return false;
  }
}

/**
 * Create client quickly
 */
function crearClienteRapido(nombre) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaClientes = ss.getSheetByName("Clientes");
  
  try {
    if (!hojaClientes) {
      throw new Error("Hoja de Clientes no encontrada");
    }
    
    var fecha = new Date();
    var tipo = "Consignación";
    var estado = "Activo";
    
    var nuevaFila = [
      nombre,
      "Sin teléfono",
      "sin@email.com",
      "Sin dirección",
      "Sin ciudad",
      tipo,
      fecha,
      estado
    ];
    
    hojaClientes.appendRow(nuevaFila);
    
    registrarLog("crearClienteRapido", "FIN", "Cliente creado: " + nombre, "ÉXITO");
    return true;
    
  } catch (error) {
    registrarLog("crearClienteRapido", "ERROR", "Error creando cliente: " + error.toString(), "ERROR");
    return false;
  }
}

// ============================================================================
// MAINTENANCE FUNCTIONS
// ============================================================================

/**
 * Clear consignations sheet
 */
function limpiarHojaConsignaciones() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaConsignaciones = ss.getSheetByName("Consignaciones");
  
  try {
    if (!hojaConsignaciones) {
      SpreadsheetApp.getUi().alert("Error", "Hoja de Consignaciones no encontrada", SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(
      'Limpiar Hoja Consignaciones',
      '¿Está seguro que desea limpiar todos los registros de consignaciones?\n\nEsta acción no se puede deshacer.',
      ui.ButtonSet.YES_NO
    );
    
    if (response == ui.Button.YES) {
      var ultimaFila = hojaConsignaciones.getLastRow();
      if (ultimaFila > 1) {
        hojaConsignaciones.getRange(2, 1, ultimaFila - 1, 9).clearContent();
      }
      
      ui.alert('Hoja Limpiada', 'La hoja de Consignaciones ha sido limpiada exitosamente.', ui.ButtonSet.OK);
      registrarLog("limpiarHojaConsignaciones", "FIN", "Hoja de consignaciones limpiada", "ÉXITO");
    }
    
  } catch (error) {
    registrarLog("limpiarHojaConsignaciones", "ERROR", "Error limpiando hoja: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error', 'Error al limpiar la hoja: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ============================================================================
// CONSIGNMENT ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get consignment data for analysis
 */
function obtenerDatosConsignaciones() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaConsignaciones = ss.getSheetByName("Consignaciones");
  
  try {
    if (!hojaConsignaciones) {
      return [];
    }
    
    var ultimaFila = hojaConsignaciones.getLastRow();
    if (ultimaFila <= 1) {
      return [];
    }
    
    return hojaConsignaciones.getDataRange().getValues();
    
  } catch (error) {
    registrarLog("obtenerDatosConsignaciones", "ERROR", "Error obteniendo datos: " + error.toString(), "ERROR");
    return [];
  }
}

/**
 * Calculate consignment statistics
 */
function calcularEstadisticasConsignaciones(data) {
  try {
    var estadisticas = {
      totalConsignaciones: 0,
      valorTotalConsignaciones: 0,
      consignacionesActivas: 0,
      consignacionesVencidas: 0,
      consignacionesPorCliente: {},
      consignacionesPorProducto: {},
      consignacionesPorMes: {}
    };
    
    var hoy = new Date();
    
    for (var i = 1; i < data.length; i++) {
      var consignacion = data[i];
      var cliente = consignacion[1];
      var producto = consignacion[2];
      var total = parseFloat(consignacion[5]) || 0;
      var estado = consignacion[7];
      var fecha = consignacion[0];
      
      estadisticas.totalConsignaciones++;
      estadisticas.valorTotalConsignaciones += total;
      
      // Count by status
      if (estado === "Activa") {
        estadisticas.consignacionesActivas++;
      } else {
        estadisticas.consignacionesVencidas++;
      }
      
      // Count by client
      if (!estadisticas.consignacionesPorCliente[cliente]) {
        estadisticas.consignacionesPorCliente[cliente] = 0;
      }
      estadisticas.consignacionesPorCliente[cliente]++;
      
      // Count by product
      if (!estadisticas.consignacionesPorProducto[producto]) {
        estadisticas.consignacionesPorProducto[producto] = 0;
      }
      estadisticas.consignacionesPorProducto[producto]++;
      
      // Count by month
      var mes = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM');
      if (!estadisticas.consignacionesPorMes[mes]) {
        estadisticas.consignacionesPorMes[mes] = 0;
      }
      estadisticas.consignacionesPorMes[mes]++;
    }
    
    return estadisticas;
    
  } catch (error) {
    registrarLog("calcularEstadisticasConsignaciones", "ERROR", "Error calculando estadísticas: " + error.toString(), "ERROR");
    return {};
  }
}
