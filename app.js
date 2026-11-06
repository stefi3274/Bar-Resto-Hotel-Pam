const productDatabase = [
    { id: 1, name: "Prestige (Bière)", price: 250, stock: 22, alertThreshold: 5 },
    { id: 2, name: "Barbancourt 3*", price: 750, stock: 4, alertThreshold: 5 },
    { id: 3, name: "Soda Cola", price: 150, stock: 35, alertThreshold: 10 },
    { id: 4, name: "Griot de Porc Comp.", price: 1200, stock: 14, alertThreshold: 4 },
    { id: 5, name: "Poisson Gros Sel", price: 2500, stock: 0, alertThreshold: 2 },
    { id: 6, name: "Eau Minérale (Petite)", price: 100, stock: 3, alertThreshold: 6 }
];
let activeCart = [];
function displayProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    productDatabase.forEach(product => {
        let stateClass = 'stock-ok';
        let badgeMessage = `Stock : ${product.stock}`;
        if (product.stock === 0) {
            stateClass = 'stock-empty';
            badgeMessage = "Épuisé";
        } else if (product.stock <= product.alertThreshold) {
            stateClass = 'stock-alert';
            badgeMessage = "Presque à court";
        }
        container.innerHTML += `
            <div class="product-card ${stateClass}" onclick="addItemToCart(${product.id})">
                <div class="stock-badge">${badgeMessage}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price} HTG</div>
            </div>
        `;
    });
}
function addItemToCart(productId) {
    const product = productDatabase.find(p => p.id === productId);
    if (product.stock === 0) { alert("Action Impossible : Ce produit est en rupture complète de stock !"); return; }
    const existingItem = activeCart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.qty >= product.stock) { alert(`Limite critique : Seulement ${product.stock} unités de ce produit sont encore disponibles.`); return; }
        existingItem.qty++;
    } else { activeCart.push({ ...product, qty: 1 }); }
    renderCart();
}
function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalDisplay = document.getElementById('total-price');
    if (activeCart.length === 0) { container.innerHTML = `<div class="empty-cart-msg">Aucun produit sélectionné</div>`; totalDisplay.innerText = "0.00 HTG"; return; }
    container.innerHTML = '';
    let grandTotal = 0;
    activeCart.forEach(item => {
        const itemTotal = item.price * item.qty;
        grandTotal += itemTotal;
        container.innerHTML += `<div class="cart-item"><span><strong>${item.qty}x</strong> ${item.name}</span><span>${itemTotal.toLocaleString()} HTG</span></div>`;
    });
    totalDisplay.innerText = `${grandTotal.toLocaleString()}.00 HTG`;
}
function clearCart() { activeCart = []; renderCart(); }
function processPayment(paymentMethod) {
    if (activeCart.length === 0) { alert("Opération invalide : Veuillez d'abord ajouter des éléments à la commande."); return; }
    let totalTransaction = activeCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let referenceMobile = "";
    if (paymentMethod === 'MonCash' || paymentMethod === 'NatCash') {
        referenceMobile = prompt(`[PORTAIL TRANSACTION] Saisissez les 4 chiffres de la référence SMS (${paymentMethod}) :`);
        if (!referenceMobile) { alert("Erreur : Référence requise."); return; }
    }
    activeCart.forEach(cartItem => { const dbProduct = productDatabase.find(p => p.id === cartItem.id); dbProduct.stock -= cartItem.qty; });
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    let receipt = `====================================\n          BAR RESTO LE PARADIS\n====================================\n`;
    receipt += `Date: ${currentDate}       Heure: ${currentTime}\nTable: N° 05\nServeuse: Marie L. (ID: #SRV04)\n------------------------------------\n`;
    activeCart.forEach(item => { let calcSpaces = 20 - item.name.length; let spaces = calcSpaces > 0 ? " ".repeat(calcSpaces) : " "; receipt += `${item.qty}x ${item.name}${spaces}${(item.price * item.qty).toLocaleString()} HTG\n`; });
    receipt += `------------------------------------\nTOTAL ACQUITTÉ:     ${totalTransaction.toLocaleString()} HTG\nMéthode:   ${paymentMethod.toUpperCase()}\n`;
    if (referenceMobile) receipt += `Ref. Trans:   #${referenceMobile}\n`;
    receipt += `====================================\n    FACTURE ACQUITTEE - MERCI !\n====================================`;
    document.getElementById('ticket-text').innerText = receipt;
    document.getElementById('overlay').style.display = 'flex';
}
function closeModal() { document.getElementById('overlay').style.display = 'none'; clearCart(); displayProducts(); }
function addNewTable() { alert("Configuration du plan de salle."); }
window.onload = function() { displayProducts(); };
