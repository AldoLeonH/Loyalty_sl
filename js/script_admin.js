// -----------------------------
// Configuración
// -----------------------------
const GOOGLE_SCRIPT_URL_ADMIN = "https://script.google.com/macros/s/AKfycbxljAegWUrg5kGKZdrWhgm9Valt4OPLhaZ0Fw1Cbi3Yxc9YxV9PhZZAYYfzg2OeZ_ZX/exec";
const WHATSAPP_NUMBER_ADMIN = "5214561560813";

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');
const clientInfo = document.getElementById('clientInfo');
const a_name = document.getElementById('a_name');
const a_phone = document.getElementById('a_phone');
const a_code = document.getElementById('a_code');
const a_total = document.getElementById('a_total');
const a_stamps = document.getElementById('a_stamps');
const a_reward = document.getElementById('a_reward');
const adminAmount = document.getElementById('adminAmount');
const adminRegister = document.getElementById('adminRegister');
const resetStampsBtn = document.getElementById('resetStamps');
const sendPromoBtn = document.getElementById('sendPromo');

let current = null;

// -----------------------------
// Función para mostrar cliente
// -----------------------------
function showClient(c) {
    clientInfo.classList.remove('hidden');
    a_name.textContent = c.name;
    a_phone.textContent = c.phone;
    a_code.textContent = c.code;
    a_total.textContent = c.total;
    a_stamps.textContent = c.stamps;
    a_reward.textContent = c.stamps >= 10 ? 'Sí' : 'No';
}

// -----------------------------
// Buscar cliente
// -----------------------------
btnSearch.addEventListener('click', async () => {
    const q = searchInput.value.trim();
    if (!q) return alert('Ingresa teléfono o código');

    try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL_ADMIN}?action=get&query=${encodeURIComponent(q)}`);
        const data = await res.json();

        if (data && data.found) {
            current = data.client;
            showClient(current);
        } else {
            alert('Cliente no encontrado');
        }
    } catch (e) {
        alert('Error buscando cliente. Revisa la URL del Apps Script.');
        console.error(e);
    }
});

// -----------------------------
// Registrar compra
// -----------------------------
adminRegister.addEventListener('click', async () => {
    if (!current) return alert('Busca un cliente primero');

    const monto = parseFloat(adminAmount.value);
    if (!monto || monto <= 0) return alert('Monto inválido');

    try {
        const formData = new URLSearchParams();
        formData.append('action', 'register');
        formData.append('code', current.code);
        formData.append('name', current.name);
        formData.append('phone', current.phone);
        formData.append('amount', monto);

        const res = await fetch(GOOGLE_SCRIPT_URL_ADMIN, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (data.ok) {
            current = data.client;
            showClient(current);
            alert('Compra registrada correctamente');

            // Si la ventana padre tiene función para actualizar
            if (window.opener && window.opener.applyResetFromServer) {
                window.opener.applyResetFromServer(current);
            }
        } else {
            alert('No se pudo registrar la compra');
        }

    } catch (e) {
        alert('Error al registrar compra');
        console.error(e);
    }
});

// -----------------------------
// Reiniciar sellos
// -----------------------------
resetStampsBtn.addEventListener('click', async () => {
    if (!current) return alert('Busca un cliente primero');
    if (!confirm('¿Confirmas reiniciar los sellos de este cliente?')) return;

    try {
        const formData = new URLSearchParams();
        formData.append('action', 'reset');
        formData.append('code', current.code);

        const res = await fetch(GOOGLE_SCRIPT_URL_ADMIN, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (data.ok) {
            current = data.client;
            showClient(current);
            alert('Sellos reiniciados');
        } else {
            alert('No se pudieron reiniciar los sellos');
        }

    } catch (e) {
        alert('Error al reiniciar');
        console.error(e);
    }
});

// -----------------------------
// Enviar promo por WhatsApp
// -----------------------------
sendPromoBtn.addEventListener('click', () => {
    if (!current) return alert('Busca un cliente primero');

    const msg = `Hola ${encodeURIComponent(current.name)}, en Saint Latte Valle de Stgo tenemos novedades!`;
    const url = `https://wa.me/${WHATSAPP_NUMBER_ADMIN}?text=${msg}`;
    window.open(url, '_blank');
});
