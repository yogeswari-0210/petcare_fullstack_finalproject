document.addEventListener("DOMContentLoaded", function () {
    const productId = getProductIdFromURL();
    if (productId) {
        fetchProductDetails(productId);
    } else {
        console.error("No product ID found in URL");
    }

    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (productId) addToCart(productId);
        });
    }

    const addToWishlistBtn = document.getElementById('add-to-wishlist-btn');
    if (addToWishlistBtn) {
        addToWishlistBtn.addEventListener('click', () => {
            if (productId) addToWishlist(productId);
        });
    }
});

function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/products/${productId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const product = await response.json();
        displayProductDetails(product);
    } catch (error) {
        console.error('Error fetching product details:', error);
        document.getElementById('product-name').textContent = "Product not found";
    }
}

function displayProductDetails(product) {
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-price').textContent = `₹${product.price}`;

    // Handle image placeholder
    const imgElement = document.getElementById('product-image');
    imgElement.src = product.image_url || '../assets/placeholder.png';
}

async function addToCart(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to add items to cart.");
        window.location.href = '../pages/login_page.html';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/carts/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: parseInt(productId),
                quantity: 1
            })
        });

        if (response.ok) {
            alert("Product added to cart!");
        } else {
            const error = await response.json();
            alert("Failed to add to cart: " + (error.detail || "Unknown error"));
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Network error.");
    }
}

async function addToWishlist(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to use wishlist.");
        window.location.href = '../pages/login_page.html';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/wishlists/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: parseInt(productId)
            })
        });

        if (response.ok) {
            alert("Product added to wishlist!");
        } else {
            const error = await response.json();
            // Handle duplicate specifically if needed, but alert is fine for now
            alert("Failed to add to wishlist: " + (error.detail || "Unknown error"));
        }
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        alert("Network error.");
    }
}
