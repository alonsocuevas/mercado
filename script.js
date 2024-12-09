let cart = [];
let currentProduct = {};
let products = [
    { title: "Lenovo IdeaPad 330s", description: "Lenovo IdeaPad 330s 14IKB - Gráficos integrados...", imageSrc: "./img/lenovo.jpg", price: 449.99 },
    { title: "Producto 2", description: "Descripción del producto 2", imageSrc: "./img/ausente.jpg", price: 45 },
    { title: "Producto 3", description: "Descripción del producto 3", imageSrc: "./img/ausente.jpg", price: 35 },
    { title: "Producto 4", description: "Descripción del producto 4", imageSrc: "./img/ausente.jpg", price: 50 },
    { title: "Producto 5", description: "Descripción del producto 5", imageSrc: "./img/ausente.jpg", price: 15 },
    { title: "Producto 6", description: "Descripción del producto 6", imageSrc: "./img/ausente.jpg", price: 60 },
    { title: "Producto 7", description: "Descripción del producto 7", imageSrc: "./img/ausente.jpg", price: 75 },
    { title: "Producto 8", description: "Descripción del producto 8", imageSrc: "./img/ausente.jpg", price: 100 },
    { title: "Producto 9", description: "Descripción del producto 9", imageSrc: "./img/ausente.jpg", price: 90 },
    { title: "Producto 10", description: "Descripción del producto 10", imageSrc: "./img/ausente.jpg", price: 120 },
    { title: "Producto 11", description: "Descripción del producto 11", imageSrc: "./img/ausente.jpg", price: 45 },
    { title: "Producto 12", description: "Descripción del producto 12", imageSrc: "./img/ausente.jpg", price: 30 },
    { title: "Producto 13", description: "Descripción del producto 13", imageSrc: "./img/ausente.jpg", price: 75 },
    { title: "Producto 14", description: "Descripción del producto 14", imageSrc: "./img/ausente.jpg", price: 25 },
    { title: "Producto 15", description: "Descripción del producto 15", imageSrc: "./img/ausente.jpg", price: 85 },
    { title: "Producto 16", description: "Descripción del producto 16", imageSrc: "./img/ausente.jpg", price: 60 },
    { title: "Producto 17", description: "Descripción del producto 17", imageSrc: "./img/ausente.jpg", price: 50 },
    { title: "Producto 18", description: "Descripción del producto 18", imageSrc: "./img/ausente.jpg", price: 40 },
    { title: "Producto 19", description: "Descripción del producto 19", imageSrc: "./img/ausente.jpg", price: 120 },
    { title: "Producto 20", description: "Descripción del producto 20", imageSrc: "./img/ausente.jpg", price: 35 },
    { title: "Producto 21", description: "Descripción del producto 21", imageSrc: "./img/ausente.jpg", price: 25 },
    { title: "Producto 22", description: "Descripción del producto 22", imageSrc: "./img/ausente.jpg", price: 45 }
    // Más productos...
];

let currentPage = 1;
const productsPerPage = 20;

// Función para mostrar detalles del producto
function showDetails(title, description, imageSrc, price) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-description').innerText = description;
    document.getElementById('modal-image').src = imageSrc;
    document.getElementById('modal-price').innerText = `$${price}`;

    // Establecer el producto actual
    currentProduct = { title, description, imageSrc, price };

    // Mostrar modal
    const modal = document.getElementById('product-modal');
    modal.style.display = 'block';
}

// Función para agregar producto al carrito
function addToCart(title, price) {
    // Busca si el producto ya existe en el carrito
    const existingProduct = cart.find(item => item.title === title);

    if (existingProduct) {
        // Si ya existe, incrementa la cantidad
        existingProduct.quantity += 1;
    } else {
        // Si no existe, agrega un nuevo objeto con cantidad inicial 1
        cart.push({
            title: title,
            price: price,
            quantity: 1
        });
    }

    updateCart(); // Actualiza la vista del carrito
    //alert(`${title} se ha agregado al carrito.`); // Notificación opcional
}

// Función para actualizar la vista del carrito
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    let total = 0;

    cartItems.innerHTML = '';

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.title} - $${item.price} x ${item.quantity}
            <button onclick="removeFromCart(${index})">Eliminar</button>
        `;
        cartItems.appendChild(li);
        total += item.price * item.quantity;
    });

    cartCount.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
}

// Función para eliminar productos del carrito
function removeFromCart(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    updateCart();
}

// Función para cerrar el modal de producto
function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
}

// Función para alternar el modal del carrito
function toggleCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    updateCart();
}

// Función para cargar productos en la página actual
function loadProducts(page) {
    const start = (page - 1) * productsPerPage;
    const end = start + productsPerPage;
    const currentProducts = products.slice(start, end);

    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '';

    currentProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.imageSrc}" alt="${product.title}" onclick="showDetails('${product.title}', '${product.description}', '${product.imageSrc}', ${product.price})">
            <h2>${product.title}</h2>
            <p>$${product.price}</p>
             <button class="add-to-cart" onclick="addToCart('${product.title}', ${product.price})">
                <i class="fas fa-cart-plus"></i> Agregar
            </button>
            
        `;
        productGrid.appendChild(productCard);
    });

    updatePagination(page);
}

// Función para actualizar la paginación
function updatePagination(page) {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(products.length / productsPerPage);

    pagination.innerHTML = '';

    if (page > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Anterior';
        prevButton.onclick = () => loadProducts(page - 1);
        pagination.appendChild(prevButton);
    }

    if (page < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Siguiente';
        nextButton.onclick = () => loadProducts(page + 1);
        pagination.appendChild(nextButton);
    }
}
    

// Función para cerrar el modal del carrito
function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = 'none';
}

// Función para proceder al pago
function proceedToCheckout() {
    if (cart.length > 0) {
        alert("Redirigiendo a la página de pago...");
    } else {
        alert("Tu carrito está vacío.");
    }
}

function applyFilters() {
    const priceFilters = [...document.querySelectorAll('input[type="checkbox"][value^="0"]')]
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value.split('-').map(Number));

    const filteredProducts = products.filter(product => {
        return priceFilters.some(([min, max]) => product.price >= min && product.price <= max);
    });

    loadFilteredProducts(filteredProducts);
}

function loadFilteredProducts(filteredProducts) {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '';

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.imageSrc}" alt="${product.title}" onclick="showDetails('${product.title}', '${product.description}', '${product.imageSrc}', ${product.price})">
            <h2>${product.title}</h2>
            <p>$${product.price}</p>
            <button class="add-to-cart" onclick="addToCart('${product.title}', ${product.price})">
                <i class="fas fa-cart-plus"></i> Agregar
            </button>
        `;
        productGrid.appendChild(productCard);
    });

    updatePagination(1); // Resetea la paginación
}

document.querySelector('.apply-filters').addEventListener('click', applyFilters);

// Cargar la primera página al inicio
loadProducts(currentPage);

// Lista de imágenes de la galería
const images = [
    './img/lenovo.jpg', 
    './img/lenovo2.jpg', 
    './img/lenovo3.jpeg'
  ];
  
  let currentImageIndex = 0;

  // Cambiar imagen de la galería
  function changeImage(direction) {
    currentImageIndex += direction;
    
    // Asegurarse de que el índice esté dentro del rango válido
    if (currentImageIndex < 0) {
      currentImageIndex = images.length - 1;
    } else if (currentImageIndex >= images.length) {
      currentImageIndex = 0;
    }
    
    // Actualizar la imagen principal y la de la galería
    const modalImage = document.getElementById('modal-image');
    const galleryImage = document.getElementById('gallery-image');
    
    modalImage.src = images[currentImageIndex];
    galleryImage.src = images[currentImageIndex];
  }
  
  // Event listener para cerrar el modal si se hace clic en la X
  document.querySelector('.close').addEventListener('click', closeModal);
  
  // Event listener para cerrar el modal si se hace clic fuera de él
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
      closeModal();
    }
  });
  
  // Suponiendo que tu imagen de producto tiene el id 'product-image'
  document.getElementById('product-image').addEventListener('click', openModal);