// Objeto para almacenar usuarios registrados (simulando una base de datos)
const usuarios = {
  postulante: [],
  evaluador: [],
  admin: []
};

// Función para inicializar el formulario
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', manejarLogin);
  }
});

// Función para manejar el envío del formulario de login
function manejarLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const role = document.getElementById('login-role').value;
  
  // Validaciones básicas
  if (!email || !password) {
    alert('Por favor complete todos los campos');
    return;
  }
  
  if (!validarEmail(email)) {
    alert('Por favor ingrese un email válido');
    return;
  }
  
  // Verificar credenciales (simulado)
  if (verificarCredenciales(email, password, role)) {
    alert(`Bienvenido ${role}! Login exitoso.`);
    // Aquí se puede redirigir a otra página según el rol
    console.log(`Usuario ${email} con rol ${role} ha iniciado sesión`);
    localStorage.setItem('usuarioActual', JSON.stringify({ email, role }));
  } else {
    alert('Email o contraseña incorrectos');
  }
}

// Función para validar formato de email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Función para verificar credenciales (simulado)
function verificarCredenciales(email, password, role) {
  // Esta es una simulación. En producción, esto se haría contra un servidor
  return email.length > 0 && password.length > 5;
}
