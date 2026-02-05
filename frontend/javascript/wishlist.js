document.addEventListener('DOMContentLoaded', () => {
    fetchWishlistItems();
});

async function fetchWishlistItems() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to view your wishlist.");
        window.location.href = '../pages/login_page.html';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/wishlists/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const items = await response.json();
        renderWishlistItems(items);

    } catch (error) {
        console.error('Error fetching wishlist:', error);
    }
}

function renderWishlistItems(items) {
    const tbody = document.getElementById('wishlist-items-container');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Your wishlist is empty.</td></tr>';
        return;
    }

    items.forEach(item => {
        const product = item.product || {};
        const name = product.name || `Product ${item.product_id}`;
        const price = product.price || 0;
        const imageUrl = product.image_url || '../assets/placeholder.png';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${imageUrl}" width="50" alt="${name}"></td>
            <td>${name}</td>
            <td>Rs: ${price}</td>
            <td><button class="add-btn" onclick="moveToCart(${item.id})">ADD TO CART</button></td>
            <td><span class="remove" onclick="removeWishlistItem(${item.id})">✖</span></td>
        `;
        tbody.appendChild(row);
    });
}

async function removeWishlistItem(itemId) {
    const token = localStorage.getItem('token');
    if (!confirm("Remove from wishlist?")) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/wishlists/remove/${itemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            fetchWishlistItems();
        } else {
            alert("Failed to remove item.");
        }
    } catch (error) {
        console.error("Error removing item:", error);
    }
}

async function moveToCart(wishlistId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://127.0.0.1:8000/wishlists/move-to-cart?wishlist_id=${wishlistId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert("Moved to cart!");
            fetchWishlistItems();
        } else {
            alert("Failed to move to cart.");
        }
    } catch (error) {
        console.error("Error moving item:", error);
    }
}
