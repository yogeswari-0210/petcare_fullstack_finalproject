document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to continue.');
        window.location.href = 'login_page.html';
        return;
    }

    fetchCartDetails();

    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
});

let cartItems = [];

async function fetchCartDetails() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://127.0.0.1:8000/carts/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            cartItems = await response.json();
            updateOrderSummary(cartItems);
        } else {
            console.error('Failed to fetch cart items');
            // Check if unauthorized
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                window.location.href = 'login_page.html';
            }
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
    }
}

function updateOrderSummary(items) {
    let subtotal = 0;
    items.forEach(item => {
        subtotal += item.product.price * item.quantity;
    });

    const deliveryFee = subtotal > 0 ? 50 : 0; // Simple flat delivery fee
    const total = subtotal + deliveryFee;

    document.getElementById('subtotal').innerText = `₹${subtotal}`;
    document.getElementById('delivery-fee').innerText = `₹${deliveryFee}`;
    document.getElementById('total-price').innerText = `₹${total}`;
}

async function placeOrder() {
    const token = localStorage.getItem('token');

    if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const address = document.getElementById('shipping-address').value;
    const paymentMethod = document.querySelector('input[name="pay"]:checked').value;

    if (!address) {
        alert('Please enter a shipping address.');
        return;
    }

    const orderData = {
        user_id: 0, // Backend gets actual user_id from token, but schema requires a placeholder
        items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
        })),
        address: address,
        payment_method: paymentMethod
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/orders/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            // Order placed successfully
            window.location.href = 'sucessful.html';
        } else {
            const errorData = await response.json();
            alert('Failed to place order: ' + (errorData.detail || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('An error occurred: ' + error.message);
    }
}
