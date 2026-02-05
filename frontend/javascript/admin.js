document.addEventListener('DOMContentLoaded', () => {
    const createProductForm = document.getElementById('create-product-form');

    // Fetch and populate categories
    const categorySelect = document.getElementById('product-category');
    if (categorySelect) {
        fetchCategories(categorySelect);
    }

    if (createProductForm) {
        createProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append('name', document.getElementById('product-name').value);
            formData.append('price', document.getElementById('product-price').value);
            formData.append('description', document.getElementById('product-desc').value);
            formData.append('category_id', document.getElementById('product-category').value);
            formData.append('file', document.getElementById('product-image').files[0]);

            try {
                const response = await fetch('http://127.0.0.1:8000/products/', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    alert('Product created successfully!');
                    createProductForm.reset();
                    console.log('Product created:', result);
                } else {
                    const error = await response.json();
                    alert('Error creating product: ' + (error.detail || 'Unknown error'));
                    console.error('Error:', error);
                }
            } catch (error) {
                alert('Network error or server is down.');
                console.error('Network error:', error);
            }
        });
    }
});

async function fetchCategories(selectElement) {
    try {
        const response = await fetch('http://127.0.0.1:8000/categories/');
        if (response.ok) {
            const categories = await response.json();
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name; // Display name, send ID
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}
