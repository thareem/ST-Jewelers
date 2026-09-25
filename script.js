// 1. Cart Data Get karne ka function
function getCart() {
    return JSON.parse(localStorage.getItem('st_jewelers_cart')) || [];
}

// 2. Cart Data Save karne ka function
function saveCart(cart) {
    localStorage.setItem('st_jewelers_cart', JSON.stringify(cart));
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
}

// 3. Item Add karne ka Main Function
function addToCart(name, price, imageSrc) {
    let cart = getCart();

    // Price se agar koi extra text/quotes ho toh usko number banayein
    let cleanPrice = typeof price === 'string' 
        ? parseFloat(price.replace(/[^0-9.]/g, '')) 
        : Number(price);

    // Cart array mein naya item push karein
    cart.push({
        name: name,
        price: cleanPrice || 0,
        image: imageSrc || ''
    });

    // Cart save karein
    saveCart(cart);

    // User ko message dikhain
    alert(`${name} has been added to your cart!`);
}

// 4. Cart Badge (Header Count) Update function
function updateCartBadge() {
    let cart = getCart();
    let badge = document.getElementById('cart-badge');
    if (badge) {
        badge.innerText = cart.length;
    }
}
// 4a. Increase Quantity Function
function increaseQuantity(index) {
    let cart = getCart();
    cart[index].quantity = (cart[index].quantity || 1) + 1;
    saveCart(cart);
    renderCart();
}

// 4b. Decrease Quantity Function
function decreaseQuantity(index) {
    let cart = getCart();
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    saveCart(cart);
    renderCart();
    updateCartBadge();
}
// 5. Payment Toggle Function
function togglePaymentFields() {
    let onlinePaymentBox = document.getElementById('online-payment-details');
    let selectedMethod = document.querySelector('input[name="payment_method"]:checked')?.value;

    if (onlinePaymentBox) {
        if (selectedMethod === 'online') {
            onlinePaymentBox.style.display = 'block';
        } else {
            onlinePaymentBox.style.display = 'none';
        }
    }
}
// 6. Cart Page Render Function (With Quantity Support & Empty Cart Design)
function renderCart() {
    let cartBody = document.getElementById('cart-items-body');
    let subtotalElement = document.getElementById('cart-subtotal');
    let deliveryElement = document.getElementById('cart-delivery-fee');
    let totalPriceElement = document.getElementById('cart-total-price');

    if (!cartBody) return;

    let cart = getCart();
    cartBody.innerHTML = "";

    // Empty Cart Design + "Shop Now" Button
    if (cart.length === 0) {
        cartBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding: 30px;">
                    <p style="font-size: 1.1rem; margin-bottom: 15px;">Your shopping cart is empty!</p>
                    <a href="index.html" style="background: #d4af37; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 4px;">Shop Now</a>
                </td>
            </tr>
        `;
        if (subtotalElement) subtotalElement.innerText = "PKR 0";
        if (deliveryElement) deliveryElement.innerText = "PKR 0";
        if (totalPriceElement) totalPriceElement.innerText = "PKR 0";
        return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        let priceNum = 0;
        if (typeof item.price === 'number') {
            priceNum = item.price;
        } else if (typeof item.price === 'string') {
            priceNum = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
        }

        let qty = item.quantity || 1;
        let itemTotal = priceNum * qty;
        subtotal += itemTotal;

        let row = `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>PKR ${priceNum.toLocaleString()}</td>
                <td>
                    <button onclick="decreaseQuantity(${index})" style="background:#d4af37; color:#000; border:none; padding:2px 8px; cursor:pointer; font-weight:bold;">-</button>
                    <span style="margin: 0 8px; font-weight:bold;">${qty}</span>
                    <button onclick="increaseQuantity(${index})" style="background:#d4af37; color:#000; border:none; padding:2px 8px; cursor:pointer; font-weight:bold;">+</button>
                </td>
                <td><button onclick="removeFromCart(${index})" style="background:#800020; color:#fff; border:1px solid #d4af37; padding:4px 8px; cursor:pointer;">Remove</button></td>
            </tr>
        `;
        cartBody.innerHTML += row;
    });

    let selectedMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'cod';
    let deliveryFee = (selectedMethod === 'cod') ? 200 : 0;
    let finalTotal = subtotal + deliveryFee;

    if (subtotalElement) subtotalElement.innerText = "PKR " + subtotal.toLocaleString();
    if (deliveryElement) deliveryElement.innerText = "PKR " + deliveryFee.toLocaleString();
    if (totalPriceElement) totalPriceElement.innerText = "PKR " + finalTotal.toLocaleString();
}
   
// 7. Remove item from Cart
function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

// 8. Place Order Handler
function handlePlaceOrder(event) {
    if (event) event.preventDefault();
    let cart = getCart();

    if (cart.length === 0) {
        alert("Your Shopping Cart is empty!");
        return;
    }

    let name = document.getElementById('cust-name')?.value.trim();
    let phone = document.getElementById('cust-phone')?.value.trim();
    let address = document.getElementById('cust-address')?.value.trim();
    let paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value;

    if (!name || !phone || !address) {
        alert("Please fill in all delivery details (Name, Phone, Address)!");
        return;
    }
    if (paymentMethod === 'online') {
        let cardName = document.getElementById('card-name')?.value.trim();
        let cardNumber = document.getElementById('card-number')?.value.trim();
        if (!cardName || !cardNumber) {
            alert("Please fill in all card details!");
            return;
        }
    }

    let methodText = (paymentMethod === 'cod') 
    ? "Cash on Delivery (Including PKR 200 Delivery Fee)" 
    : "Online Payment";

    alert(`Thank you, ${name}!\nYour order has been placed successfully.\nPayment Method: ${methodText}\nWe will contact you at ${phone} shortly.`);

    localStorage.removeItem('st_jewelers_cart');
    window.location.href = "index.html";
}

// 9. Initial Load Listener
document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
    renderCart();
});