// Clase principal del simulador
class SimuladorSeguros {
  constructor() {
    this.clientes = [];
    this.seguros = [];
    this.init();
  }

  async init() {
    await this.simularCarga();
    await this.cargarSeguros();
    this.cargarClientes();
    this.setupEventos();
    this.mostrarVistaPrincipal();
  }

  async simularCarga() {
    return new Promise((resolve) => {
      const progressBar = document.getElementById('progressBar');
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
          clearInterval(interval);
          document.getElementById('loading').classList.add('animate__animated', 'animate__fadeOut');
          setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            resolve();
          }, 1000);
        }
      }, 100);
    });
  }

  async cargarSeguros() {
    try {
      const response = await fetch('data/seguros.json');
      if (!response.ok) throw new Error('No se pudieron cargar los seguros');
      this.seguros = await response.json();
      this.mostrarOpcionesSeguros();
    } catch (error) {
      console.error('Error al cargar seguros:', error);
      this.seguros = [
        { id: 1, tipo: "basica", costoMensual: 500, descripcion: "Cobertura básica para daños menores." },
        { id: 2, tipo: "completa", costoMensual: 1000, descripcion: "Cobertura completa para todo tipo de daños." },
        { id: 3, tipo: "premium", costoMensual: 1500, descripcion: "Cobertura premium con asistencia 24/7." }
      ];
      this.mostrarOpcionesSeguros();
      Swal.fire({ icon: 'warning', title: 'Modo offline', text: 'Se cargaron datos locales de respaldo', timer: 2000 });
    }
  }

  mostrarOpcionesSeguros() {
    const select = document.getElementById('tipo');
    select.innerHTML = '<option value="">Seleccione...</option>';
    this.seguros.forEach(seguro => {
      const option = document.createElement('option');
      option.value = seguro.tipo;
      option.textContent = `${seguro.tipo.charAt(0).toUpperCase() + seguro.tipo.slice(1)} ($${seguro.costoMensual}/mes)`;
      select.appendChild(option);
    });
  }

  cargarClientes() {
    const clientesGuardados = localStorage.getItem('clientesSeguros');
    if (clientesGuardados) {
      this.clientes = JSON.parse(clientesGuardados);
      this.mostrarClientes();
      this.actualizarEstadisticas();
    }
  }

  setupEventos() {
    document.getElementById('cotizadorForm').addEventListener('submit', (e) => this.procesarFormulario(e));
    document.getElementById('limpiarClientes').addEventListener('click', () => this.limpiarClientes());
    document.getElementById('exportarClientes').addEventListener('click', () => this.exportarClientes());
    document.getElementById('nombre').addEventListener('input', (e) => this.validarNombre(e.target.value));
    document.getElementById('edad').addEventListener('input', (e) => this.validarEdad(e.target.value));
  }

  async procesarFormulario(e) {
    e.preventDefault();
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const spinner = document.getElementById('submitSpinner');
    submitText.textContent = 'Procesando...';
    spinner.classList.remove('d-none');
    btnSubmit.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 800));

    const nombre = document.getElementById('nombre').value.trim();
    const edad = parseInt(document.getElementById('edad').value);
    const tipo = document.getElementById('tipo').value;
    const duracion = parseInt(document.getElementById('duracion').value);

    if (!this.validarFormulario(nombre, edad, tipo, duracion)) {
      submitText.textContent = 'Calcular Cotización';
      spinner.classList.add('d-none');
      btnSubmit.disabled = false;
      return;
    }

    const nuevoCliente = {
      id: Date.now(),
      nombre,
      edad,
      tipoSeguro: tipo,
      duracion,
      fechaRegistro: new Date().toLocaleDateString('es-ES'),
      costoTotal: this.calcularCosto(tipo, duracion)
    };

    this.clientes.push(nuevoCliente);
    localStorage.setItem('clientesSeguros', JSON.stringify(this.clientes));
    this.mostrarResultado(nuevoCliente);
    this.mostrarClientes();
    this.actualizarEstadisticas();
    e.target.reset();
    submitText.textContent = 'Cotización Exitosa!';
    btnSubmit.classList.replace('btn-primary', 'btn-success');

    setTimeout(() => {
      btnSubmit.classList.replace('btn-success', 'btn-primary');
      submitText.textContent = 'Calcular Cotización';
      spinner.classList.add('d-none');
      btnSubmit.disabled = false;
    }, 2000);
  }

  validarFormulario(nombre, edad, tipo, duracion) {
    return this.validarNombre(nombre) && this.validarEdad(edad) && this.validarTipo(tipo) && this.validarDuracion(duracion);
  }

  validarNombre(nombre) {
    const error = document.getElementById('nombreError');
    if (!nombre || nombre.length < 3) {
      error.textContent = 'Nombre inválido (mínimo 3 caracteres)';
      return false;
    }
    error.textContent = '';
    return true;
  }

  validarEdad(edad) {
    const error = document.getElementById('edadError');
    if (isNaN(edad)) {
      error.textContent = 'Ingrese una edad válida';
      return false;
    }
    if (edad < 18 || edad > 100) {
      error.textContent = 'Edad debe ser entre 18 y 100 años';
      return false;
    }
    error.textContent = '';
    return true;
  }

  validarTipo(tipo) {
    const error = document.getElementById('tipoError');
    if (!tipo) {
      error.textContent = 'Seleccione un tipo de seguro';
      return false;
    }
    error.textContent = '';
    return true;
  }

  validarDuracion(duracion) {
    const error = document.getElementById('duracionError');
    if (isNaN(duracion) || duracion < 1 || duracion > 36) {
      error.textContent = 'Duración debe ser entre 1 y 36 meses';
      return false;
    }
    error.textContent = '';
    return true;
  }

  calcularCosto(tipo, duracion) {
    const seguro = this.seguros.find(s => s.tipo === tipo);
    return seguro ? seguro.costoMensual * duracion : 0;
  }

  mostrarResultado(cliente) {
    const seguro = this.seguros.find(s => s.tipo === cliente.tipoSeguro);
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = `
      <div class="animate__animated animate__fadeIn">
        <h4 class="text-primary">${cliente.nombre}</h4>
        <p>Has cotizado el seguro <strong>${cliente.tipoSeguro}</strong></p>
        <div class="alert alert-success">
          <h5 class="mb-0">Total a pagar: $${cliente.costoTotal}</h5>
          <small class="text-muted">$${seguro.costoMensual} x ${cliente.duracion} meses</small>
        </div>
        <p class="mt-2"><small>${seguro.descripcion}</small></p>
      </div>
    `;
    this.actualizarResumenTotal();
  }

  mostrarClientes() {
    const tbody = document.getElementById('listaClientes');
    if (this.clientes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay clientes registrados</td></tr>';
      return;
    }
    tbody.innerHTML = this.clientes.map(cliente => `
      <tr class="animate__animated animate__fadeIn">
        <td>${cliente.nombre}</td>
        <td>${cliente.edad}</td>
        <td>${cliente.tipoSeguro}</td>
        <td>${cliente.duracion} meses</td>
        <td>${cliente.fechaRegistro}</td>
        <td><button class="btn btn-sm btn-outline-danger eliminar-cliente" data-id="${cliente.id}">Eliminar</button></td>
      </tr>
    `).join('');

    document.querySelectorAll('.eliminar-cliente').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        this.eliminarCliente(id);
      });
    });
  }

  eliminarCliente(id) {
    this.clientes = this.clientes.filter(c => c.id !== id);
    localStorage.setItem('clientesSeguros', JSON.stringify(this.clientes));
    this.mostrarClientes();
    this.actualizarEstadisticas();
    this.actualizarResumenTotal();
  }

  limpiarClientes() {
    localStorage.removeItem('clientesSeguros');
    this.clientes = [];
    this.mostrarClientes();
    this.actualizarResumenTotal();
    this.actualizarEstadisticas();
  }

  exportarClientes() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.clientes));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "clientes_seguros.json");
    dlAnchor.click();
  }

  actualizarResumenTotal() {
    const totalElement = document.getElementById('totalSeguros');
    const total = this.clientes.reduce((sum, c) => sum + c.costoTotal, 0);
    const cantidad = this.clientes.length;
    totalElement.innerHTML = `<strong>Total Cotizado:</strong> $${total} por ${cantidad} cliente(s)`;
  }

  actualizarEstadisticas() {
    const estadisticas = document.getElementById('estadisticas');
    const tipos = {};
    this.clientes.forEach(c => tipos[c.tipoSeguro] = (tipos[c.tipoSeguro] || 0) + 1);
    estadisticas.innerHTML = Object.entries(tipos).map(([tipo, count]) => `
      <p>${tipo.charAt(0).toUpperCase() + tipo.slice(1)}: ${count} cliente(s)</p>
    `).join('');
  }

  mostrarVistaPrincipal() {
    document.getElementById('mainApp').classList.remove('d-none');
  }
}

// Inicialización
window.addEventListener('DOMContentLoaded', () => new SimuladorSeguros());
