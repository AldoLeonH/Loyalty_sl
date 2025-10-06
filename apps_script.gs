function doPost(e) {
  const action = e.parameter.action;
  if (action === "register") {
    return registerUser(e);
  }
}

function registerUser(e) {
  const name = e.parameter.name;
  const phone = e.parameter.phone;
  const password = e.parameter.password;

  // Abre la hoja usando el ID real
  const sheet = SpreadsheetApp.openById("11yXNxX6g9DWC-njWndYde454sa_Z2kFMIQ24w1ESHdg").getSheetByName("Usuarios");
  
  // Guarda los datos
  sheet.appendRow([new Date(), name, phone, password]);
  
  return ContentService.createTextOutput("Usuario registrado exitosamente.");
}

function doGet(e) {
  return ContentService.createTextOutput("Script activo ✅");
}
