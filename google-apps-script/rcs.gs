// ============================================================================
// HEALTHYNOLA POS SYSTEM - REGISTRAR CLIENTE (rcs.gs)
// Client Management Script
// Combines: fix-Clientes-heet-v1.gs
// ============================================================================

// ============================================================================
// MAIN CLIENT REGISTRATION
// ============================================================================

/**
 * Main function to register a new client
 */
function registrarCliente() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  registrarLog("registrarCliente", "INICIO", "Iniciando registro de cliente", "INFO");
  
  try {
    // Create UI for client input
    var ui = SpreadsheetApp.getUi();
    var result = ui.prompt(
      'Registrar Cliente',
      'Ingrese los datos del cliente en el siguiente formato:\n\n' +
      'Nombre, Teléfono, Email, Dirección, Ciudad, Tipo\n\n' +
      'Tipos válidos: Regular, Mayorista, Consignación, VIP\n' +
      'Ejemplo: Juan Pérez, 3001234567, juan@email.com, Calle 123 #45-67, Bogotá, Regular',
      ui.ButtonSet.OK_CANCEL
    );

    // Process the user's response
    var button = result.getSelectedButton();
    var text = result.getResponseText();
    
    if (button == ui.Button.CANCEL || button == ui.Button.CLOSE) {
      registrarLog("registrarCliente", "CANCELADO", "Operación cancelada por el usuario", "INFO");
      return;
    }
    
    // Parse input
    var datos = text.split(',').map(function(item) { return item.trim(); });
    
    if (datos.length < 6) {
      throw new Error("Formato incorrecto. Debe ingresar: Nombre, Teléfono, Email, Dirección, Ciudad, Tipo");
    }
    
    var nombre = datos[0];
    var telefono = datos[1];
    var email = datos[2];
    var direccion = datos[3];
    var ciudad = datos[4];
    var tipo = datos[5];
    
    // Validate inputs
    if (!nombre || !telefono || !email || !direccion || !ciudad || !tipo) {
      throw new Error("Todos los campos son obligatorios. Por favor complete toda la información.");
    }
    
    // Validate client type
    var tiposValidos = ["Regular", "Mayorista", "Consignación", "VIP"];
    if (tiposValidos.indexOf(tipo) === -1) {
      throw new Error("Tipo de cliente inválido. Use: Regular, Mayorista, Consignación, o VIP");
    }
    
    // Validate email format
    if (!validarFormatoEmail(email)) {
      throw new Error("Formato de email inválido. Use el formato: usuario@dominio.com");
    }
    
    // Validate phone format
    if (!validarFormatoTelefono(telefono)) {
      throw new Error("Formato de teléfono inválido. Use 10 dígitos: 3001234567");
    }
    
    registrarLog("registrarCliente", "DETALLE", 
      "Datos capturados: Nombre=" + nombre + ", Teléfono=" + telefono + 
      ", Email=" + email + ", Tipo=" + tipo, "INFO");
    
    // Check if client already exists
    var clienteExiste = verificarClienteExistePorDatos(nombre, telefono, email);
    if (clienteExiste) {
      throw new Error("El cliente ya existe. Verifique el nombre, teléfono o email.");
    }
    
    // Register client in Clientes sheet
    var registroExitoso = registrarClienteEnHoja(nombre, telefono, email, direccion, ciudad, tipo);
    if (!registroExitoso) {
      throw new Error("Error al registrar el cliente en la hoja.");
    }
    
    // Show success message
    var mensaje = 'Cliente registrado exitosamente:\n\n' +
      'Nombre: ' + nombre + '\n' +
      'Teléfono: ' + telefono + '\n' +
      'Email: ' + email + '\n' +
      'Dirección: ' + direccion + '\n' +
      'Ciudad: ' + ciudad + '\n' +
      'Tipo: ' + tipo;
    
    ui.alert('Cliente Registrado', mensaje, ui.ButtonSet.OK);
    
    registrarLog("registrarCliente", "FIN", "Cliente registrado exitosamente", "ÉXITO");
    
  } catch (error) {
    registrarLog("registrarCliente", "ERROR", "Error en cliente: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error al registrar cliente: ' + error.toString());
  }
}

/**
 * Register client in Clientes sheet
 */
function registrarClienteEnHoja(nombre, telefono, email, direccion, ciudad, tipo) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaClientes = ss.getSheetByName("Clientes");
  
  try {
    if (!hojaClientes) {
      throw new Error("Hoja de Clientes no encontrada");
    }
    
    var fecha = new Date();
    var estado = "Activo";
    
    var nuevaFila = [
      nombre,
      telefono,
      email,
      direccion,
      ciudad,
      tipo,
      fecha,
      estado
    ];
    
    hojaClientes.appendRow(nuevaFila);
    
    registrarLog("registrarClienteEnHoja", "FIN", "Cliente registrado en hoja", "ÉXITO");
    return true;
    
  } catch (error) {
    registrarLog("registrarClienteEnHoja", "ERROR", "Error registrando en hoja: " + error.toString(), "ERROR");
    return false;
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate email format
 */
function validarFormatoEmail(email) {
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format
 */
function validarFormatoTelefono(telefono) {
  var telefonoRegex = /^\d{10}$/;
  return telefonoRegex.test(telefono);
}

/**
 * Check if client exists by data
 */
function verificarClienteExistePorDatos(nombre, telefono, email) {
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
      var cliente = data[i];
      var nombreExistente = cliente[0];
      var telefonoExistente = cliente[1];
      var emailExistente = cliente[2];
      
      if (nombreExistente === nombre || 
          telefonoExistente === telefono || 
          emailExistente === email) {
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    registrarLog("verificarClienteExistePorDatos", "ERROR", "Error verificando cliente: " + error.toString(), "ERROR");
    return false;
  }
}

// ============================================================================
// CLIENT DISPLAY FUNCTIONS
// ============================================================================

/**
 * Show all clients
 */
function mostrarTodosLosClientes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaClientes = ss.getSheetByName("Clientes");
  
  try {
    if (!hojaClientes) {
      SpreadsheetApp.getUi().alert("Error", "Hoja de Clientes no encontrada", SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    var ultimaFila = hojaClientes.getLastRow();
    if (ultimaFila <= 1) {
      SpreadsheetApp.getUi().alert("Sin Datos", "No hay clientes registrados", SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    var data = hojaClientes.getDataRange().getValues();
    var mensaje = "Clientes registrados:\n\n";
    
    for (var i = 1; i < data.length; i++) {
      var cliente = data[i];
      var nombre = cliente[0];
      var telefono = cliente[1];
      var email = cliente[2];
      var ciudad = cliente[4];
      var tipo = cliente[5];
      var estado = cliente[7];
      
      mensaje += (i) + ". " + nombre + " (" + tipo + ")\n";
      mensaje += "   Tel: " + telefono + " | Email: " + email + "\n";
      mensaje += "   Ciudad: " + ciudad + " | Estado: " + estado + "\n\n";
    }
    
    mensaje += "Total: " + (data.length - 1) + " clientes";
    
    SpreadsheetApp.getUi().alert("Todos los Clientes", mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
    
    registrarLog("mostrarTodosLosClientes", "FIN", "Mostrados " + (data.length - 1) + " clientes", "ÉXITO");
    
  } catch (error) {
    registrarLog("mostrarTodosLosClientes", "ERROR", "Error mostrando clientes: " + error.toString(), "ERROR");
    SpreadsheetApp.getUi().alert('Error', 'Error al mostrar clientes: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ============================================================================
// CLIENT ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get client data for analysis
 */
function obtenerDatosClientes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaClientes = ss.getSheetByName("Clientes");
  
  try {
    if (!hojaClientes) {
      return [];
    }
    
    var ultimaFila = hojaClientes.getLastRow();
    if (ultimaFila <= 1) {
      return [];
    }
    
    return hojaClientes.getDataRange().getValues();
    
  } catch (error) {
    registrarLog("obtenerDatosClientes", "ERROR", "Error obteniendo datos: " + error.toString(), "ERROR");
    return [];
  }
}

/**
 * Calculate client statistics
 */
function calcularEstadisticasClientes(data) {
  try {
    var estadisticas = {
      totalClientes: 0,
      clientesActivos: 0,
      clientesInactivos: 0,
      clientesPorTipo: {},
      clientesPorCiudad: {},
      clientesPorMes: {}
    };
    
    for (var i = 1; i < data.length; i++) {
      var cliente = data[i];
      var tipo = cliente[5];
      var ciudad = cliente[4];
      var estado = cliente[7];
      var fecha = cliente[6];
      
      estadisticas.totalClientes++;
      
      // Count by status
      if (estado === "Activo") {
        estadisticas.clientesActivos++;
      } else {
        estadisticas.clientesInactivos++;
      }
      
      // Count by type
      if (!estadisticas.clientesPorTipo[tipo]) {
        estadisticas.clientesPorTipo[tipo] = 0;
      }
      estadisticas.clientesPorTipo[tipo]++;
      
      // Count by city
      if (!estadisticas.clientesPorCiudad[ciudad]) {
        estadisticas.clientesPorCiudad[ciudad] = 0;
      }
      estadisticas.clientesPorCiudad[ciudad]++;
      
      // Count by month
      var mes = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM');
      if (!estadisticas.clientesPorMes[mes]) {
        estadisticas.clientesPorMes[mes] = 0;
      }
      estadisticas.clientesPorMes[mes]++;
    }
    
    return estadisticas;
    
  } catch (error) {
    registrarLog("calcularEstadisticasClientes", "ERROR", "Error calculando estadísticas: " + error.toString(), "ERROR");
    return {};
  }
}

// ============================================================================
// CLIENT REPORTS
// ============================================================================

/**
 * Generate comprehensive client report
 */
function reporteClientesCompleto() {
  try {
    console.log('=== INICIANDO REPORTE DE CLIENTES COMPLETO ===');
    
    // Get client data
    const clientesData = obtenerDatosClientes();
    if (!clientesData || clientesData.length <= 1) {
      SpreadsheetApp.getUi().alert('Error', 'No hay datos de clientes disponibles.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Calculate client statistics
    const estadisticas = calcularEstadisticasClientes(clientesData);
    
    // Generate report
    const reporte = generarReporteClientesHTML(estadisticas, clientesData);
    
    // Show report in modal dialog
    mostrarReporteHTML(reporte, 'Reporte de Clientes Completo');
    
    console.log('Reporte de clientes completo generado exitosamente');
    
  } catch (error) {
    console.error('Error en reporteClientesCompleto:', error);
    SpreadsheetApp.getUi().alert('Error', 'Error al generar reporte de clientes: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Generate HTML report for clients
 */
function generarReporteClientesHTML(estadisticas, data) {
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
      .active { color: #4caf50; }
      .inactive { color: #f44336; }
    </style>
  </head>
  <body>
    <h1>Reporte de Clientes Completo</h1>
    
    <div class="stats-container">
      <div class="stat-box">
        <div class="stat-label">Total de Clientes</div>
        <div class="stat-value">${estadisticas.totalClientes || 0}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Clientes Activos</div>
        <div class="stat-value">${estadisticas.clientesActivos || 0}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Clientes Inactivos</div>
        <div class="stat-value">${estadisticas.clientesInactivos || 0}</div>
      </div>
    </div>
    
    <h2>Distribución por Tipo</h2>
    <div class="stats-container">`;
  
  for (const tipo in estadisticas.clientesPorTipo) {
    html += `
      <div class="stat-box">
        <div class="stat-label">${tipo}</div>
        <div class="stat-value">${estadisticas.clientesPorTipo[tipo]}</div>
      </div>`;
  }
  
  html += `
    </div>
    
    <h2>Distribución por Ciudad</h2>
    <div class="stats-container">`;
  
  for (const ciudad in estadisticas.clientesPorCiudad) {
    html += `
      <div class="stat-box">
        <div class="stat-label">${ciudad}</div>
        <div class="stat-value">${estadisticas.clientesPorCiudad[ciudad]}</div>
      </div>`;
  }
  
  html += `
    </div>
    
    <h2>Lista de Clientes</h2>
    <table>
      <tr>
        <th>Nombre</th>
        <th>Teléfono</th>
        <th>Email</th>
        <th>Ciudad</th>
        <th>Tipo</th>
        <th>Estado</th>
      </tr>`;
  
  for (let i = 1; i < data.length; i++) {
    const cliente = data[i];
    const nombre = cliente[0];
    const telefono = cliente[1];
    const email = cliente[2];
    const ciudad = cliente[4];
    const tipo = cliente[5];
    const estado = cliente[7];
    
    const estadoClass = estado === "Activo" ? "active" : "inactive";
    
    html += `
      <tr>
        <td>${nombre}</td>
        <td>${telefono}</td>
        <td>${email}</td>
        <td>${ciudad}</td>
        <td>${tipo}</td>
        <td class="${estadoClass}">${estado}</td>
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
