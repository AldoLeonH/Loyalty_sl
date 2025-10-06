const GOOGLE_SCRIPT_URL_ADMIN = "https://script.google.com/macros/s/AKfycbxljAegWUrg5kGKZdrWhgm9Valt4OPLhaZ0Fw1Cbi3Yxc9YxV9PhZZAYYfzg2OeZ_ZX/exec"; // pegarás la URL aquí}


// Inicial
loadLocal(); if(client) renderProfile();


registerForm.addEventListener('submit', e=>{
e.preventDefault();
const name = document.getElementById('fullName').value.trim();
const phone = document.getElementById('phone').value.trim();
let stored = localStorage.getItem('sl_client');
if(stored){ client = JSON.parse(stored); }
if(!client){
client = { code: makeCode(), name, phone, total:0, stamps:0 };
saveLocal();
} else {
// si ingresa con otro telefono/nombre, actualizar
client.name = name; client.phone = phone; saveLocal();
}
renderProfile();
});


// El barista registrará la compra desde admin; pero también permitimos enviar registro manual desde cliente para pruebas
registerPurchaseBtn.addEventListener('click', ()=>{
const monto = parseFloat(amountInput.value);
if(!monto || monto<=0) return alert('Ingresa un monto válido');
// calcular sellos
const nuevosSellos = Math.floor(monto / STAMP_VALUE);
client.total += monto;
client.stamps += nuevosSellos;
// si suma más de STAMPS_TO_REWARD, se mantiene y se notifica
saveLocal(); renderProfile();


// enviar al Google Script para persistir
if(GOOGLE_SCRIPT_URL!=='https://script.google.com/macros/s/AKfycbxljAegWUrg5kGKZdrWhgm9Valt4OPLhaZ0Fw1Cbi3Yxc9YxV9PhZZAYYfzg2OeZ_ZX/exec'){
fetch(GOOGLE_SCRIPT_URL, { method:'POST', mode:'no-cors', body: JSON.stringify({action:'register', code:client.code, name:client.name, phone:client.phone, amount:monto}) });
}
});


sendWhatsBtn.addEventListener('click', ()=>{
if(!client) return alert('Inicia sesión primero');
const msg = `Hola ${encodeURIComponent('Saint Latte Valle de Stgo')}, soy ${encodeURIComponent(client.name)} y mi código es ${encodeURIComponent(client.code)}. Tengo ${client.stamps} sellos.`;
const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/[+\s]/g,'')}?text=${msg}`;
window.open(url,'_blank');
});


// Función para resetear sellos (se hace desde admin al reclamar)
function applyResetFromServer(newData){
// newData = {code, stamps, total}
if(!client) return;
if(newData.code===client.code){ client.stamps = newData.stamps; client.total = newData.total; saveLocal(); renderProfile(); }
}


window.applyResetFromServer = applyResetFromServer; // expuesto para uso si admin llama desde la misma máquina
