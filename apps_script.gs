/* ---------- Code.gs (Google Apps Script) ---------- */

function doPost(e) {
  const action = (e.parameter && e.parameter.action) || "";
  if (action === "register") {
    return registerUser(e);
  }
  // Allow check via POST as well
  if (action === "check") {
    return checkUser(e);
  }
  return ContentService.createTextOutput(JSON.stringify({ error: "Acción no reconocida" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e.parameter && e.parameter.action) || "";
  if (action === "check") {
    return checkUser(e);
  }
  return ContentService.createTextOutput("Script activo")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Comprueba si existe un teléfono.
 * Parámetros: phone
 * Respuesta JSON: { exists: true/false, row: n (si existe) }
 */
function checkUser(e) {
  try {
    const rawPhone = (e.parameter && e.parameter.phone) || "";
    const phone = normalizePhone(rawPhone);
    const sheet = SpreadsheetApp.openById("11yXNxX6g9DWC-njWndYde454sa_Z2kFMIQ24w1ESHdg").getSheetByName("Usuarios");
    const data = sheet.getDataRange().getValues(); // incluye encabezado
    // Asumimos que la columna teléfono está en la columna C (índice 2)
    for (let i = 1; i < data.length; i++) {
      const rowPhone = normalizePhone(String(data[i][2] || ""));
      if (rowPhone && rowPhone === phone) {
        return ContentService.createTextOutput(JSON.stringify({ exists: true, row: i + 1 }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ exists: false }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Registra o actualiza usuario por teléfono.
 * Parámetros esperados (form-data / urlencoded):
 * name, phone, password, email, birthday, otters, address, favorite_drink, notes
 */
function registerUser(e) {
  try {
    const params = e.parameter || {};
    const name = params.name || "";
    const rawPhone = params.phone || "";
    const phone = normalizePhone(rawPhone);
    const password = params.password || "";
    const email = params.email || "";
    const birthday = params.birthday || "";
    const otters = params.otters || ""; // "nutrias"
    const address = params.address || "";
    const favorite_drink = params.favorite_drink || "";
    const notes = params.notes || "";

    if (!phone) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Teléfono inválido o vacío." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.openById("11yXNxX6g9DWC-njWndYde454sa_Z2kFMIQ24w1ESHdg").getSheetByName("Usuarios");

    // Asegura que exista encabezado; si no, crea uno
    ensureHeader(sheet);

    const data = sheet.getDataRange().getValues(); // incluye encabezado
    // Buscar telefono existente
    for (let i = 1; i < data.length; i++) {
      const rowPhone = normalizePhone(String(data[i][2] || ""));
      if (rowPhone && rowPhone === phone) {
        // actualizar fila i+1 (1-indexed)
        const rowIndex = i + 1;
        const values = [
          new Date(), // timestamp
          name,
          phone,
          password,
          email,
          birthday,
          otters,
          address,
          favorite_drink,
          notes
        ];
        sheet.getRange(rowIndex, 1, 1, values.length).setValues([values]);
        return ContentService.createTextOutput(JSON.stringify({ success: true, updated: true, message: "Usuario actualizado (teléfono existente)." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Si no existe, agregar como nueva fila
    const newValues = [
      new Date(),
      name,
      phone,
      password,
      email,
      birthday,
      otters,
      address,
      favorite_drink,
      notes
    ];
    sheet.appendRow(newValues);
    return ContentService.createTextOutput(JSON.stringify({ success: true, updated: false, message: "Usuario registrado exitosamente." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ---------- Helpers ---------- */

function normalizePhone(s) {
  // Elimina todo lo que no sea dígito; útil para comparar con consistencia
  if (!s) return "";
  return String(s).replace(/\D/g, "");
}

function ensureHeader(sheet) {
  const header = [
    "Timestamp",
    "Name",
    "Phone",
    "Password",
    "Email",
    "Birthday",
    "Otters",
    "Address",
    "FavoriteDrink",
    "Notes"
  ];
  const firstRow = sheet.getRange(1, 1, 1, header.length).getValues()[0];
  // Si la primera celda está vacía o no coincide, reemplaza header
  let needHeader = false;
  if (!firstRow || firstRow.length === 0) needHeader = true;
  else {
    // compara el primer campo (Timestamp); si vacío o distinto, considera necesario
    if (!firstRow[0] || firstRow[0].toString().toLowerCase().indexOf("timestamp") === -1) {
      needHeader = true;
    }
  }
  if (needHeader) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  }
}

