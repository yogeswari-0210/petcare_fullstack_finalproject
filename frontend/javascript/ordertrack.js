document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to view your orders.');
        window.location.href = 'login_page.html';
        return;
    }

    fetchOrders();
});

async function fetchOrders() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('orders-container');

    try {
        const response = await fetch('http://127.0.0.1:8000/orders/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const orders = await response.json();
            renderOrders(orders);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Failed to load orders. Please try again later.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        container.innerHTML = '<div class="empty-state"><p>An error occurred.</p></div>';
    }
}

function renderOrders(orders) {
    const container = document.getElementById('orders-container');
    container.innerHTML = '';

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No orders yet</h3>
                <p>Track your pet's favorite products once you place an order.</p>
                <a href="dogs_shop.html" class="btn-shop">Explore Shop</a>
            </div>
        `;
        return;
    }

    // Sort by most recent
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    orders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';

        // Build items HTML
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div class="item-row">
                    <img src="${item.product.image_url || '../assets/placeholder.png'}" alt="${item.product.name}">
                    <div class="item-details">
                        <h4>${item.product.name}</h4>
                        <p>Qty: ${item.quantity} • Unit Price: ₹${item.product.price}</p>
                    </div>
                </div>
            `;
        });

        // Delivery estimate (mocked +5 days)
        const estDate = new Date(new Date(order.created_at).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString();

        // Status Logic
        const statusSteps = ["Ordered", "Processing", "Shipped", "Delivered"];
        const currentStatus = order.status || "Ordered";
        const statusIndex = statusSteps.indexOf(currentStatus);

        orderCard.innerHTML = `
            <div class="card-header">
                <div class="order-id-group">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <h3>Order #${order.id}</h3>
                        <span class="status-badge status-${currentStatus.toLowerCase()}">${currentStatus}</span>
                    </div>
                    <p>Placed on ${date}</p>
                </div>
                <div class="order-amount">
                    <span class="amount-label">Total Amount</span>
                    <span class="amount-value">₹${Number(order.total_price).toFixed(2)}</span>
                </div>
            </div>

            <div class="items-list">
                ${order.items && order.items.length > 0 ? order.items.map(item => `
                    <div class="item-row">
                        <img src="${item.product?.image_url || '../assets/placeholder.png'}" alt="${item.product?.name || 'Product'}">
                        <div class="item-details">
                            <h4>${item.product?.name || 'Unknown Product'}</h4>
                            <p>Qty: ${item.quantity} • Unit Price: ₹${Number(item.product?.price || 0).toFixed(2)}</p>
                        </div>
                    </div>
                `).join('') : '<p style="padding: 20px; color: #64748b;">No items found in this order.</p>'}
            </div>

            <div class="tracking-area">
                <div class="tracker-container">
                    ${statusSteps.map((step, index) => {
            let stateClass = "";
            if (index < statusIndex) stateClass = "completed";
            else if (index === statusIndex) stateClass = "active";
            return `
                            <div class="tracker-step ${stateClass}">
                                <div class="dot"></div>
                                <span class="step-name">${step}</span>
                            </div>
                        `;
        }).join('')}
                </div>
                <p style="text-align: center; color: #64748b; font-size: 0.875rem; margin-top: 1.25rem;">
                    ${currentStatus === 'Delivered' ? 'Delivered on ' + estDate : 'Estimated delivery by <strong>' + estDate + '</strong>'}
                </p>
            </div>

            ${statusIndex < 2 ? `
                <div class="card-footer">
                    <button class="btn-cancel" onclick="cancelOrder(${order.id})">Cancel Order</button>
                </div>
            ` : ''}
        `;
        container.appendChild(orderCard);
    });
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this entire order?')) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://127.0.0.1:8000/orders/delete/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Order cancelled successfully.');
            fetchOrders(); // Refresh list to reflect changes
        } else {
            const error = await response.json();
            alert('Failed to cancel order: ' + (error.detail || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('An error occurred during cancellation.');
    }
}
