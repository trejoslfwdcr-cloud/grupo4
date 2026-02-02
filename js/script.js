// Archivo: js/script.js
// Versión anotada: cada bloque contiene comentarios que explican la lógica

// ==================== NAVBAR INTERACTIVO ====================
// Espera a que todo el DOM esté cargado antes de manipular elementos
document.addEventListener('DOMContentLoaded', function() {
    // Selecciona el elemento hamburguesa (botón móvil)
    const hamburger = document.querySelector('.hamburger');
    // Selecciona el menú de navegación (lista de enlaces)
    const navMenu = document.querySelector('.nav-menu');
    // Selecciona todos los enlaces del navbar para añadir comportamiento
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menú hamburguesa
    if (hamburger) {
        // Si el botón existe, agrega un listener para alternar clases
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active'); // Cambia estilo del icono
            navMenu.classList.toggle('active'); // Muestra/oculta el menú en móvil
        });
    }

    // Cerrar menú cuando se hace clic en un enlace
    navLinks.forEach(link => {
        // Para cada enlace añadimos un manejador que cierra el menú al clicar
        link.addEventListener('click', function() {
            hamburger.classList.remove('active'); // Quita estado activo del icono
            navMenu.classList.remove('active'); // Oculta el menú desplegable
            
            // Marcar enlace activo visualmente
            navLinks.forEach(l => l.classList.remove('active')); // Quita clases activas previas
            this.classList.add('active'); // Marca el enlace clicado como activo
        });
    });

    // Cerrar menú al hacer clic fuera del contenedor de navegación
    document.addEventListener('click', function(event) {
        // Si el clic no se originó dentro del contenedor del navbar
        if (!event.target.closest('.nav-container')) {
            hamburger.classList.remove('active'); // Cierra icono
            navMenu.classList.remove('active'); // Cierra menú
        }
    });

    // Agregar clase activa al enlace actual según la URL
    const currentLocation = location.pathname.split('/').pop();
    // Comprueba cada enlace; si coincide con la ruta actual, lo marca
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentLocation || 
            (currentLocation === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active'); // Mantiene persistente el enlace activo
        }
    });
});

// ==================== SCROLL SMOOTH ====================
// Selecciona todos los enlaces que apuntan a anclas internas (#) y aplica scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Evita el salto instantáneo por defecto
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Si el objetivo existe, desplaza la vista suavemente hasta él
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== ANIMACIONES AL SCROLL ====================
// Opciones para el IntersectionObserver que detecta cuando un elemento entra en pantalla
const observerOptions = {
    threshold: 0.1, // Se activa cuando al menos 10% del elemento es visible
    rootMargin: '0px 0px -100px 0px' // Ajusta el margen de activación hacia arriba/abajo
};

// Crea el observador que añadirá animaciones cuando los elementos entren en vista
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Cuando el elemento es visible, le aplicamos estilos de transición
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Prepara las secciones para animarse: inicialmente están ocultas y desplazadas
document.querySelectorAll('.content-section, .news-item').forEach(el => {
    el.style.opacity = '0'; // Invisible al inicio
    el.style.transform = 'translateY(20px)'; // Ligera traslación hacia abajo
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'; // Transición suave
    observer.observe(el); // Observa el elemento para activar la animación al entrar en vista
});