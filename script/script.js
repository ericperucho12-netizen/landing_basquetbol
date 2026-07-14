document.addEventListener("DOMContentLoaded", function() {
    // 1. Manejo del Loader
    const loader = document.getElementById('page-loader');
    if(loader) {
        window.addEventListener('load', () => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        });
        
        // Failsafe por si falla algo en la carga (desaparecerá después de 3s)
        setTimeout(() => {
            if(loader.style.display !== 'none') {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }
        }, 3000);
    }

    // 2. Animaciones de entrada (Scroll Reveal)
    const fadeElements = document.querySelectorAll('.card, .hero-section h1, .hero-section p, .team-section-header, .testimonial-card');
    
    // Agregar la clase base a los elementos que queremos animar si no la tienen
    fadeElements.forEach(el => {
        el.classList.add('fade-in-up');
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    // ==========================================
    // 3. Scripts de index.html (Scroll de Testimonios/Jugadores)
    // ==========================================
    const scroller = document.querySelector('.player-scroller');
    const thumb = document.querySelector('.custom-scroll-thumb');

    if (scroller && thumb) {
        const updateThumb = () => {
            const scrollRatio = scroller.clientWidth / scroller.scrollWidth;
            if (scrollRatio >= 1) {
                thumb.style.width = '100%';
                thumb.style.left = '0px';
                return;
            }
            const thumbWidthPercent = Math.max(scrollRatio * 100, 10);
            thumb.style.width = `${thumbWidthPercent}%`;
            const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
            const scrollPercent = scroller.scrollLeft / maxScrollLeft;
            const maxThumbLeft = 100 - thumbWidthPercent;
            thumb.style.left = `${scrollPercent * maxThumbLeft}%`;
        };

        scroller.addEventListener('scroll', updateThumb);
        window.addEventListener('resize', updateThumb);
        updateThumb(); // Initialize

        scroller.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                scroller.scrollBy({
                    left: e.deltaY < 0 ? -280 : 280,
                    behavior: 'smooth'
                });
            }
        });
    }

    // ==========================================
    // 4. Scripts de productos.html (Filtros y Carrusel Drag)
    // ==========================================
    document.querySelectorAll('.team-filter').forEach(filterBar => {
        filterBar.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterBar.querySelectorAll('.btn').forEach(b => {
                    b.classList.remove('active', 'btn-dark');
                    b.classList.add('btn-outline-dark');
                });
                btn.classList.add('active', 'btn-dark');
                btn.classList.remove('btn-outline-dark');

                const filter = btn.dataset.filter;
                const gridId = btn.dataset.target;
                const grid = document.getElementById(gridId);
                if (!grid) return;

                grid.querySelectorAll('.product-item').forEach(item => {
                    const team = item.dataset.team;
                    item.style.display = (filter === 'all' || team === filter || team === 'all') ? '' : 'none';
                });
                grid.querySelectorAll('.team-section-header').forEach(header => {
                    header.style.display = (filter === 'all' || header.classList.contains(filter)) ? '' : 'none';
                });
            });
        });
    });

    const carousel = document.getElementById('destCarousel');
    if(carousel) {
        let isDragging = false, startX = 0, scrollStart = 0;

        carousel.addEventListener('mousedown', e => {
            isDragging = true;
            startX = e.pageX - carousel.offsetLeft;
            scrollStart = carousel.scrollLeft;
            carousel.style.cursor = 'grabbing';
            carousel.style.userSelect = 'none';
        });
        carousel.addEventListener('mousemove', e => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            carousel.scrollLeft = scrollStart - (x - startX);
        });
        ['mouseup', 'mouseleave'].forEach(ev => {
            carousel.addEventListener(ev, () => {
                isDragging = false;
                carousel.style.cursor = 'grab';
                carousel.style.userSelect = '';
            });
        });

        // Touch support
        carousel.addEventListener('touchstart', e => {
            isDragging = true;
            startX = e.touches[0].pageX;
            scrollStart = carousel.scrollLeft;
        }, { passive: true });
        carousel.addEventListener('touchmove', e => {
            if (!isDragging) return;
            const x = e.touches[0].pageX;
            carousel.scrollLeft = scrollStart - (x - startX);
        }, { passive: true });
        carousel.addEventListener('touchend', () => {
            isDragging = false;
        });

        carousel.style.cursor = 'grab';

        let autoScrollInterval;
        const startAutoScroll = () => {
            autoScrollInterval = setInterval(() => {
                if (!isDragging) {
                    carousel.scrollLeft += 1.5;
                    if (carousel.scrollLeft >= (carousel.scrollWidth - carousel.clientWidth - 1)) {
                        setTimeout(() => {
                            carousel.scrollTo({ left: 0, behavior: 'smooth' });
                        }, 500);
                    }
                }
            }, 30);
        };
        const stopAutoScroll = () => clearInterval(autoScrollInterval);

        startAutoScroll();
        carousel.addEventListener('mouseenter', stopAutoScroll);
        carousel.addEventListener('mouseleave', startAutoScroll);
        carousel.addEventListener('touchstart', stopAutoScroll, { passive: true });
        carousel.addEventListener('touchend', startAutoScroll);
    }
});

// ==========================================
// 5. Manejador Global de Errores
// ==========================================
function displayErrorScreen(errMessage) {
    if (document.getElementById('error-screen')) return;
    
    const errorScreen = document.createElement('div');
    errorScreen.id = 'error-screen';
    Object.assign(errorScreen.style, {
        position: 'fixed',
        top: '0', left: '0',
        width: '100vw', height: '100vh',
        backgroundColor: '#111',
        zIndex: '10000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        textAlign: 'center',
        padding: '20px'
    });
    
    errorScreen.innerHTML = `
        <img src="/landing_basquetbol/img/Error.png" alt="Error" style="max-width: 80%; max-height: 50vh; object-fit: contain; margin-bottom: 2rem;">
        <h2 style="color: #ffc107;">¡Ups! Algo salió mal.</h2>
        <p>Hubo un problema cargando la página o ejecutando el código.</p>
        <p style="font-size: 0.8rem; color: #888; max-width: 600px;">${errMessage || 'Error desconocido'}</p>
        <button onclick="location.reload()" class="btn btn-warning mt-4">Recargar Página</button>
    `;
    
    if(document.body) {
        document.body.appendChild(errorScreen);
    } else {
        window.addEventListener('DOMContentLoaded', () => document.body.appendChild(errorScreen));
    }
}

/* 
// Se desactiva el manejador global automático para evitar falsos positivos
// generados por extensiones del navegador o bloqueos de terceros.
window.addEventListener('error', function(event) {
    if (!event.filename || event.message === 'Script error.') return;
    if (event.message && event.message.includes('ResizeObserver')) return;
    displayErrorScreen(event.message);
});
window.addEventListener('unhandledrejection', function(event) {
    displayErrorScreen(event.reason);
});
*/

// ==========================================
// 6. Lógica del Carrito de Compras
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar estado con try-catch (por si localStorage está bloqueado)
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('hooploop_cart')) || [];
    } catch (e) {
        console.warn('No se pudo acceder a localStorage. El carrito no se guardará.', e);
    }
    
    // Inyectar HTML del Offcanvas
    const offcanvasHTML = `
        <div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="cartOffcanvas" aria-labelledby="cartOffcanvasLabel">
            <div class="offcanvas-header border-bottom border-secondary">
                <h5 class="offcanvas-title text-warning" id="cartOffcanvasLabel"><i class="bi bi-cart-fill me-2"></i>Tu Carrito</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body d-flex flex-column">
                <div id="cart-items-container" class="flex-grow-1 overflow-auto pe-2">
                    <!-- Items will be injected here -->
                </div>
                <div class="mt-3 border-top border-secondary pt-3">
                    <div class="d-flex justify-content-between fs-5 fw-bold mb-3">
                        <span>Total:</span>
                        <span id="cart-total" class="text-warning">$0.00 MXN</span>
                    </div>
                    <button class="btn btn-warning w-100 fw-bold mb-2" id="checkout-btn">Proceder al Pago</button>
                    <button class="btn btn-outline-danger w-100 fw-bold" onclick="clearCart()">Vaciar Carrito</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', offcanvasHTML);

    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.setAttribute('data-bs-toggle', 'offcanvas');
        cartIcon.setAttribute('data-bs-target', '#cartOffcanvas');
        
        // Prevent default link behavior if it's href="#"
        cartIcon.addEventListener('click', (e) => {
            if(cartIcon.getAttribute('href') === '#') {
                e.preventDefault();
            }
        });
    }

    const updateCartUI = () => {
        // Actualizar badges
        const badges = document.querySelectorAll('.cart-badge');
        const count = cart.reduce((acc, item) => acc + item.quantity, 0);
        
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        });

        // Actualizar Offcanvas
        const container = document.getElementById('cart-items-container');
        const totalEl = document.getElementById('cart-total');
        if(!container) return;

        if (cart.length === 0) {
            container.innerHTML = '<p class="text-muted text-center mt-4">Tu carrito está vacío.</p>';
            totalEl.textContent = '$0.00 MXN';
            return;
        }

        let html = '';
        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `
                <div class="d-flex align-items-center mb-3 pb-3 border-bottom border-secondary">
                    <div class="bg-white rounded d-flex justify-content-center align-items-center p-1" style="width: 70px; height: 70px;">
                        <img src="${item.img}" alt="${item.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                    <div class="ms-3 flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start">
                            <h6 class="mb-1 pe-2" style="font-size: 0.95rem;">${item.name}</h6>
                            <button class="btn btn-link text-danger p-0 m-0 border-0" onclick="removeCartItem(${index})" title="Eliminar"><i class="bi bi-trash"></i></button>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-1">
                            <span class="text-light small">$${item.price.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-light px-2 py-0" onclick="updateCartQuantity(${index}, -1)">-</button>
                                <span class="px-2 bg-secondary text-white d-flex align-items-center">${item.quantity}</span>
                                <button class="btn btn-outline-light px-2 py-0" onclick="updateCartQuantity(${index}, 1)">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        totalEl.textContent = `$${total.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN`;
    };

    window.updateCartQuantity = (index, change) => {
        if(cart[index]) {
            cart[index].quantity += change;
            if(cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            saveCart();
            updateCartUI();
        }
    };

    window.removeCartItem = (index) => {
        if(cart[index]) {
            cart.splice(index, 1);
            saveCart();
            updateCartUI();
        }
    };

    window.clearCart = () => {
        if(cart.length > 0 && confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
            cart = [];
            saveCart();
            updateCartUI();
        }
    };

    const saveCart = () => {
        try {
            localStorage.setItem('hooploop_cart', JSON.stringify(cart));
        } catch (e) {
            console.warn('No se pudo guardar en localStorage.', e);
        }
    };

    // Agregar al carrito
    document.querySelectorAll('.btn').forEach(btn => {
        if (btn.textContent.trim().toLowerCase() === 'comprar ahora') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Encontrar la tarjeta del producto
                const card = e.target.closest('.card') || e.target.closest('.prod-carousel-card');
                if(!card) return;

                const name = card.querySelector('.card-title, h6').textContent.trim();
                const priceText = card.querySelector('.card-text, .price').textContent.trim();
                // Limpiar precio: "$2,250.00 MXN" -> 2250.00
                const priceString = priceText.replace(/[^0-9.]/g, '');
                // Handle cases where the string might end in a period or have multiple dots
                const priceParts = priceString.split('.');
                let price = 0;
                if (priceParts.length > 1) {
                    const decimals = priceParts.pop();
                    price = parseFloat(priceParts.join('') + '.' + decimals);
                } else {
                    price = parseFloat(priceString);
                }
                
                const img = card.querySelector('img').src;

                // Verificar si ya existe
                const existing = cart.find(item => item.name === name);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    cart.push({ name, price, img, quantity: 1 });
                }

                saveCart();
                updateCartUI();
                
                // Mostrar feedback visual
                const originalText = e.target.textContent;
                e.target.textContent = '¡Agregado!';
                e.target.classList.replace('btn-outline-dark', 'btn-success');
                setTimeout(() => {
                    e.target.textContent = originalText;
                    e.target.classList.replace('btn-success', 'btn-outline-dark');
                }, 1500);
            });
        }
    });

    // Evento de checkout simulado
    document.body.addEventListener('click', (e) => {
        if(e.target.id === 'checkout-btn') {
            if(cart.length === 0) {
                alert('El carrito está vacío.');
                return;
            }
            alert('¡Gracias por tu compra! Redirigiendo a pasarela de pago...');
            cart = [];
            saveCart();
            updateCartUI();
            
            // Cerrar offcanvas
            const offcanvasEl = document.getElementById('cartOffcanvas');
            if(offcanvasEl && typeof bootstrap !== 'undefined') {
                const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
                if(offcanvas) offcanvas.hide();
            }
        }
    });

    // Inicializar UI
    updateCartUI();
});

