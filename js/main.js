// Datos iniciales de seguros
const segurosDisponibles = [
  { tipo: "basica", costoMensual: 500, descripcion: "Cobertura básica para daños menores." },
  { tipo: "completa", costoMensual: 1000, descripcion: "Cobertura completa para todo tipo de daños." },
  { tipo: "premium", costoMensual: 1500, descripcion: "Cobertura premium con asistencia 24/7." }
];

// Guardar en localStorage si no existe
if (!localStorage.getItem('seguros')) {
  localStorage.setItem('seguros', JSON.stringify(segurosDisponibles));
}

// Cargar clientes desde localStorage o inicializar array
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];

// Función constructora para clientes
function Cliente(nombre, edad, tipoSeguro, duracion) {
  this.nombre = nombre;
  this.edad = edad;
  this.tipoSeguro = tipoSeguro;
  this.duracion = duracion;
  this.fechaRegistro = new Date().toLocaleDateString();
  this.id = Date.now(); // ID único basado en timestamp
}

// Función para validar si el cliente ya existe
function clienteExiste(nombre) {
  return clientes.some(cliente => cliente.nombre.toLowerCase() === nombre.toLowerCase());
}

// Función para mostrar errores de validación
function mostrarError(id, mensaje) {
  const elemento = document.getElementById(id);
  elemento.textContent = mensaje;
  return mensaje === '';
}

// Función para mostrar seguros disponibles
function mostrarSeguros() {
  const listaSeguros = document.getElementById("listaSeguros");
  const seguros = JSON.parse(localStorage.getItem('seguros'));
  
  listaSeguros.innerHTML = seguros.map(seguro => `
      <li>${seguro.tipo} - $${seguro.costoMensual}/mes - ${seguro.descripcion}</li>
  `).join('');
}

// Función para mostrar clientes registrados
function mostrarClientes() {
  const listaClientes = document.getElementById("listaClientes");
  listaClientes.innerHTML = '';
  
  clientes.forEach(cliente => {
      const li = document.createElement('li');
      li.innerHTML = `
          <strong>${cliente.nombre}</strong> (${cliente.edad} años) - 
          ${cliente.tipoSeguro} - ${cliente.duracion} meses - 
          Registrado: ${cliente.fechaRegistro}
          <button class="eliminar" data-id="${cliente.id}">Eliminar</button>
      `;
      listaClientes.appendChild(li);
  });

  // Agregar eventos a los botones de eliminar
  document.querySelectorAll('.eliminar').forEach(btn => {
      btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.getAttribute('data-id'));
          clientes = clientes.filter(cliente => cliente.id !== id);
          localStorage.setItem('clientes', JSON.stringify(clientes));
          mostrarClientes();
          actualizarTotales();
      });
  });
}

// Función para actualizar los totales
function actualizarTotales() {
  const seguros = JSON.parse(localStorage.getItem('seguros'));
  const costoTotalTodos = clientes.reduce((total, cliente) => {
      const seguroCliente = seguros.find(s => s.tipo === cliente.tipoSeguro);
      return total + (seguroCliente ? seguroCliente.costoMensual * cliente.duracion : 0);
  }, 0);

  document.getElementById("totalSeguros").textContent = `Costo total de todos los seguros: $${costoTotalTodos}`;
}

// Evento: Submit del formulario
document.getElementById('cotizadorForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const nombre = document.getElementById('nombre').value.trim();
  const edad = parseInt(document.getElementById('edad').value);
  const tipo = document.getElementById('tipo').value;
  const duracion = parseInt(document.getElementById('duracion').value);

  // Validación
  let valido = true;
  
  valido = mostrarError('nombreError', nombre === '' ? 'Ingrese un nombre válido' : '') && valido;
  valido = mostrarError('edadError', isNaN(edad) || edad < 18 ? 'Debe ser mayor de 18 años' : '') && valido;
  valido = mostrarError('tipoError', tipo === '' ? 'Seleccione un tipo de seguro' : '') && valido;
  valido = mostrarError('duracionError', isNaN(duracion) || duracion <= 0 ? 'Ingrese una duración válida' : '') && valido;
  
  if (clienteExiste(nombre)) {
      valido = mostrarError('nombreError', 'Este cliente ya está registrado') && false;
  }

  if (!valido) return;

  // Registrar cliente
  const nuevoCliente = new Cliente(nombre, edad, tipo, duracion);
  clientes.push(nuevoCliente);
  localStorage.setItem('clientes', JSON.stringify(clientes));

  // Calcular costo
  const seguros = JSON.parse(localStorage.getItem('seguros'));
  const seguro = seguros.find(s => s.tipo === tipo);
  const costoTotal = seguro.costoMensual * duracion;

  // Mostrar resultado
  document.getElementById('resultado').innerHTML = `
      <strong>${nombre}</strong>, tu seguro <em>${tipo}</em> por ${duracion} meses cuesta: <strong>$${costoTotal}</strong>.
  `;

  // Actualizar vistas
  mostrarClientes();
  actualizarTotales();
  
  // Limpiar formulario
  document.getElementById('cotizadorForm').reset();
});

// Evento: Limpiar storage
document.getElementById('limpiarStorage').addEventListener('click', () => {
  if (confirm("¿Está seguro que desea borrar todos los datos?")) {
      localStorage.clear();
      clientes = [];
      alert("Datos borrados. La página se recargará.");
      location.reload();
  }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  mostrarSeguros();
  mostrarClientes();
  actualizarTotales();
});