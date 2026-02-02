// Objeto para almacenar usuarios registrados (simulando una base de datos local)
const usuariosRegistrados = []; // Array que almacena los usuarios del sistema

// Función que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() { // Evento de carga del documento
  const registerForm = document.getElementById('register-form'); // Obtiene el formulario de registro
  if (registerForm) { // Verifica si el formulario existe
    registerForm.addEventListener('submit', manejarRegistro); // Asigna el evento submit al formulario
  } // Cierre del condicional
}); // Cierre del evento DOMContentLoaded

// Función principal para manejar el envío del formulario de registro
function manejarRegistro(e) { // Parámetro e contiene el evento
  e.preventDefault(); // Previene el comportamiento por defecto del formulario
  
  // Obtiene los valores de los campos del formulario de registro
  const nombre = document.getElementById('reg-name').value.trim(); // Obtiene y limpia el nombre
  const email = document.getElementById('reg-email').value.trim(); // Obtiene y limpia el email
  const password = document.getElementById('reg-password').value.trim(); // Obtiene y limpia la contraseña
  const edad = document.getElementById('reg-age').value.trim(); // Obtiene y limpia la edad
  const rol = document.getElementById('reg-role').value; // Obtiene el rol seleccionado
  
  // Validación: verifica que todos los campos estén completos
  if (!nombre || !email || !password || !edad) { // Si algún campo está vacío
    alert('Por favor complete todos los campos'); // Muestra mensaje de error
    return; // Sale de la función
  } // Cierre del condicional
  
  // Validación: verifica el formato del email
  if (!validarEmail(email)) { // Llama función de validación de email
    alert('Por favor ingrese un email válido'); // Muestra error si email no es válido
    return; // Sale de la función
  } // Cierre del condicional
  
  // Validación: verifica la longitud de la contraseña (mínimo 6 caracteres)
  if (password.length < 6) { // Si la contraseña tiene menos de 6 caracteres
    alert('La contraseña debe tener al menos 6 caracteres'); // Muestra mensaje de error
    return; // Sale de la función
  } // Cierre del condicional
  
  // Validación: verifica que la edad sea un número válido y mayor a 0
  if (isNaN(edad) || edad <= 0) { // Si edad no es número o es menor/igual a 0
    alert('Por favor ingrese una edad válida'); // Muestra mensaje de error
    return; // Sale de la función
  } // Cierre del condicional
  
  // Validación: verifica si el email ya está registrado
  if (emailYaRegistrado(email)) { // Llama función para verificar email duplicado
    alert('Este email ya está registrado'); // Muestra error si existe
    return; // Sale de la función
  } // Cierre del condicional
  
  // Crea un objeto nuevo con los datos del usuario
  const nuevoUsuario = { // Objeto que contiene los datos del nuevo usuario
    nombre: nombre, // Propiedad nombre
    email: email, // Propiedad email
    password: password, // Propiedad password (en producción debe encriptarse)
    edad: parseInt(edad), // Propiedad edad convertida a número entero
    rol: rol, // Propiedad rol
    fechaRegistro: new Date() // Propiedad con la fecha actual de registro
  }; // Cierre del objeto
  
  // Agrega el nuevo usuario al array de usuarios registrados
  usuariosRegistrados.push(nuevoUsuario); // Añade el usuario al array
  
  // Guarda los usuarios en localStorage para persistencia local
  localStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosRegistrados)); // Almacena en localStorage
  
  // Muestra mensaje de éxito
  alert(`¡Registro exitoso! Bienvenido ${nombre}`); // Mensaje de bienvenida personalizado
  console.log('Usuario registrado:', nuevoUsuario); // Log en consola para depuración
  
  // Limpia el formulario después del registro exitoso
  document.getElementById('register-form').reset(); // Reinicia todos los campos del formulario
} // Cierre de la función manejarRegistro

// Función para validar el formato del email
function validarEmail(email) { // Parámetro email a validar
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar email
  return regex.test(email); // Retorna true si el email cumple el patrón
} // Cierre de la función

// Función para verificar si un email ya está registrado
function emailYaRegistrado(email) { // Parámetro email a verificar
  return usuariosRegistrados.some(usuario => usuario.email === email); // Busca si existe un usuario con ese email
} // Cierre de la función
