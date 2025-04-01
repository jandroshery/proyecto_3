document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('productContainer');
    const searchInput = document.getElementById('searchInput');
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const paymentForm = document.getElementById('paymentForm');

    let cart = [];

    // Cargar productos desde la API
    fetch('https://fakestoreapi.com/products')
        .then(response => response.json())
        .then(products => {
            products.forEach(product => {
                const card = document.createElement('div');
                card.classList.add('col-md-4');
                card.innerHTML = `
                    <div class="card">
                        <img src="${product.image}" class="card-img-top" alt="${product.title}">
                        <div class="card-body">
                            <h5 class="card-title">${product.title}</h5>
                            <p class="card-text">$${product.price}</p>
                            <button class="btn btn-primary add-to-cart" data-id="${product.id}">Añadir al carrito</button>
                        </div>
                    </div>
                `;
                productContainer.appendChild(card);
            });

            // Añadir evento a los botones de "Añadir al carrito"
            const addToCartButtons = document.querySelectorAll('.add-to-cart');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const productId = button.getAttribute('data-id');
                    const product = products.find(p => p.id === parseInt(productId));
                    $('#quantityModal').modal('show');
                    addToCartBtn.addEventListener('click', () => {
                        const quantity = document.getElementById('productQuantity').value;
                        addToCart(product, quantity);
                        $('#quantityModal').modal('hide');
                    }, { once: true });
                });
            });
        });

    // Añadir producto al carrito
    function addToCart(product, quantity) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            cart.push({ ...product, quantity: parseInt(quantity) });
        }
        updateCart();
    }

    // Actualizar el carrito
    function updateCart() {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <span>${item.title} x${item.quantity}</span>
                <span>$${item.price * item.quantity}</span>
            `;
            cartItems.appendChild(cartItem);
        });
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Búsqueda dinámica
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filteredProducts = Array.from(productContainer.children).filter(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            return title.includes(query);
        });
        productContainer.innerHTML = '';
        filteredProducts.forEach(card => productContainer.appendChild(card));
    });

    // Generar factura en PDF
    paymentForm.addEventListener('submit', event => {
        event.preventDefault();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 10;
        doc.text('Factura', 10, y);
        y += 10;
        cart.forEach(item => {
            doc.text(`${item.title} x${item.quantity} - $${item.price * item.quantity}`, 10, y);
            y += 10;
        });
        const total = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        doc.text(`Total: $${total}`, 10, y);
        doc.save('factura.pdf');
        cart = [];
        updateCart();
        $('#paymentModal').modal('hide');
        $('#cartModal').modal('hide');
    });
});
