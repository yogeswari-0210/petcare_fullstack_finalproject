document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupSearch();
    setupPriceFilter();
});

function setupSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                searchProducts(query);
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    searchProducts(query);
                }
            }
        });
    }
}

async function searchProducts(query) {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.style.display = 'grid'; // Ensure it's visible
    productGrid.innerHTML = '<p>Searching...</p>';

    try {
        const response = await fetch(`http://127.0.0.1:8000/products/name/${query}`);
        if (!response.ok) {
            productGrid.innerHTML = `<p>No products found matching "${query}".</p>`;
            return;
        }
        const products = await response.json();

        productGrid.innerHTML = '';
        if (products.length === 0) {
            productGrid.innerHTML = `<p>No products found matching "${query}".</p>`;
            return;
        }

        products.forEach(product => {
            const productCard = createProductCard(product);
            productGrid.appendChild(productCard);
        });

    } catch (error) {
        console.error('Error searching products:', error);
        productGrid.innerHTML = '<p>Error loading search results.</p>';
    }
}

function setupPriceFilter() {
    const applyBtn = document.querySelector('.apply-btn');
    const checkboxes = document.querySelectorAll('.price-filter input[type="checkbox"]');

    const handleFilter = () => {
        const checkedBoxes = document.querySelectorAll('.price-filter input[type="checkbox"]:checked');
        let minPrice = null;
        let maxPrice = null;

        checkedBoxes.forEach(cb => {
            const label = cb.parentElement.textContent.trim();
            let localMin, localMax;

            if (label.includes('more than')) {
                const match = label.match(/more than\s+(\d+)/);
                if (match) {
                    localMin = parseInt(match[1]);
                    localMax = 1000000;
                }
            } else {
                const parts = label.split('-');
                if (parts.length === 2) {
                    localMin = parseInt(parts[0]);
                    localMax = parseInt(parts[1]);
                }
            }

            if (localMin !== undefined) {
                if (minPrice === null || localMin < minPrice) minPrice = localMin;
            }
            if (localMax !== undefined) {
                if (maxPrice === null || localMax > maxPrice) maxPrice = localMax;
            }
        });

        fetchProducts(minPrice, maxPrice);
    };

    if (applyBtn) {
        applyBtn.addEventListener('click', handleFilter);
    }

    // Also trigger on checkbox selection for more dynamic feel
    checkboxes.forEach(cb => {
        cb.addEventListener('change', handleFilter);
    });
}

async function fetchProducts(minPrice = null, maxPrice = null) {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return; // Exit if no product grid found

    const category = productGrid.getAttribute('data-category');
    const subcategory = productGrid.getAttribute('data-subcategory');
    let url = 'http://127.0.0.1:8000/products/';

    // Construct Base URL
    if (category && subcategory) {
        url = `http://127.0.0.1:8000/products/filter/strict?category=${category}&subcategory=${subcategory}`;
    } else if (category) {
        url = `http://127.0.0.1:8000/products/category/${category}`;
    }

    // Append Price Params
    const separator = url.includes('?') ? '&' : '?';
    if (minPrice !== null) {
        url += `${separator}min_price=${minPrice}`;
    }
    // Check again for separator in case min_price was added
    const nextSeparator = url.includes('?') ? '&' : '?';
    if (maxPrice !== null) {
        url += `${nextSeparator}max_price=${maxPrice}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Handle 404 specifically
            if (response.status === 404) {
                productGrid.innerHTML = `<p>No products found matching your criteria.</p>`;
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();

        productGrid.innerHTML = ''; // Clear current products

        if (products.length === 0) {
            productGrid.innerHTML = '<p>No products found matching your criteria.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = createProductCard(product);
            productGrid.appendChild(productCard);
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        productGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'card';

    // Use a placeholder if no image_url, or the actual URL
    const imageUrl = product.image_url || '../assets/placeholder.png'; // Make sure you have a placeholder or handle null

    card.innerHTML = `
        <a href="../pages/product_details.html?id=${product.id}" class="product-link">
            <img src="${imageUrl}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover;">
        </a>
        <div class="info">
            <p class="rate">★★★★★</p>
            <h4>${product.name}</h4>
            <p class="desc">${product.description || ''}</p>
            <p class="price">₹${product.price}</p>
            <div class="actions">
                <button class="cart-btn" onclick="addToCart(${product.id}, this)">CART</button>
                <button class="heart" onclick="addToWishlist(${product.id}, this)">💛</button>
            </div>
        </div>
    `;
    return card;
}


async function addToCart(productId, btnElement) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to add items to cart.");
        window.location.href = '../pages/login_page.html';
        return;
    }

    // Visual feedback immediately
    const originalText = btnElement.innerText;
    btnElement.innerText = "Adding...";
    btnElement.disabled = true;

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
            // Success feedback
            btnElement.innerText = "Added";
            btnElement.style.backgroundColor = "#28a745"; // Green
            btnElement.style.color = "white";

            // Revert after 2 seconds
            setTimeout(() => {
                btnElement.innerText = originalText;
                btnElement.style.backgroundColor = "";
                btnElement.style.color = "";
                btnElement.disabled = false;
            }, 2000);

        } else {
            const error = await response.json();
            alert("Failed to add to cart: " + (error.detail || "Unknown error"));
            btnElement.innerText = originalText;
            btnElement.disabled = false;
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Network error.");
        btnElement.innerText = originalText;
        btnElement.disabled = false;
    }
}

async function addToWishlist(productId, btnElement) {
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
            // Visual effect for wishlist (toggle heart maybe, or just alert for now)
            alert("Product added to wishlist!");
            // Optionally change color
            btnElement.style.backgroundColor = "#ff4081"; // Pink/Red
        } else {
            const error = await response.json();
            // If already in wishlist, maybe just notify
            if (response.status === 400 && error.detail === "Product already in wishlist") {
                alert("Product is already in your wishlist.");
            } else {
                alert("Failed to add to wishlist: " + (error.detail || "Unknown error"));
            }
        }
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        alert("Network error.");
    }
}

