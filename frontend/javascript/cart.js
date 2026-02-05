document.addEventListener('DOMContentLoaded', () => {
    fetchCartItems();
});

async function fetchCartItems() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to view your cart.");
        window.location.href = '../pages/login_page.html';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/carts/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cartItems = await response.json();
        renderCartItems(cartItems);

    } catch (error) {
        console.error('Error fetching cart items:', error);
        document.querySelector('table').innerHTML = '<p>Error loading cart. Please try again.</p>';
    }
}

function renderCartItems(items) {
    const tbody = document.getElementById('cart-items-container');
    if (!tbody) return;

    tbody.innerHTML = ''; // Clear loading/static content
    let total = 0;

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Your cart is empty.</td></tr>';
        document.getElementById('cart-total-display').textContent = 'Total: ₹0'; // Ensure total is reset
        return;
    }

    items.forEach(item => {
        const product = item.product || {};
        const name = product.name || `Product ${item.product_id}`;
        const price = product.price || 0;
        const imageUrl = product.image_url || '../assets/placeholder.png';
        const subtotal = price * item.quantity;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${imageUrl}" width="50" alt="${name}"></td>
            <td>${name}</td>
            <td>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity} - 1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity} + 1)">+</button>
                </div>
            </td> 
            <td>₹${subtotal}</td>
            <td><button class="add-link" onclick="moveToWishlist(${item.id})" style="background:none;border:none;color:blue;cursor:pointer;">MOVE</button></td>
            <td class="remove" onclick="removeCartItem(${item.id})">✖</td>
        `;
        tbody.appendChild(row);

        total += subtotal;
    });

    // Update Total Display
    // Check if total row exists or add it
    let totalRow = document.getElementById('cart-total-row');
    if (!totalRow) {
        totalRow = document.createElement('tr');
        totalRow.id = 'cart-total-row';
        totalRow.innerHTML = `<td colspan="3" style="text-align:right; font-weight:bold;">Total:</td><td colspan="3" id="cart-total-display" style="font-weight:bold;">₹${total}</td>`;
        tbody.appendChild(totalRow);
    } else {
        document.getElementById('cart-total-display').textContent = `₹${total}`;
    }
}

async function updateQuantity(cartItemId, newQuantity) {
    const token = localStorage.getItem('token');
    if (newQuantity < 1) {
        alert("Quantity must be at least 1");
        fetchCartItems(); // Reset view
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/carts/update/${cartItemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity: parseInt(newQuantity) })
        });

        if (response.ok) {
            fetchCartItems(); // Refresh to update subtotals and total
        } else {
            const err = await response.json();
            alert("Failed to update quantity: " + (err.detail || "Error"));
        }
    } catch (error) {
        console.error("Error updating quantity:", error);
    }
}

async function removeCartItem(itemId) {
    const token = localStorage.getItem('token');
    if (!confirm("Are you sure you want to remove this item?")) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/carts/remove/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            fetchCartItems(); // Refresh
        } else {
            alert("Failed to remove item.");
        }
    } catch (error) {
        console.error("Error removing item:", error);
    }
}

async function moveToWishlist(itemId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://127.0.0.1:8000/carts/move-to-wishlist?cart_item_id=${itemId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert("Moved to wishlist!");
            fetchCartItems(); // Refresh
        } else {
            const err = await response.json();
            alert("Failed to move: " + (err.detail || "Error"));
        }
    } catch (error) {
        console.error("Error moving item:", error);
    }
}
