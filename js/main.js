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
    document.getElementById('mainApp').classList.remove('d-none');
  }

  simularCarga() {
    return new Promise((resolve) => {
      const progressBar = document.getElementById('progressBar');
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
          clearInterval(interval);
          document.querySelector('.progress.mt-3').style.display = 'none';
          document.getElementById('loading').style.display = 'none';
          resolve();
        }
      }, 100);
    });
  }

  async cargarSeguros() {
    try {
      const response = await fetch('./data/seguros.json');
      this.seguros = await response.json();
    } catch (error) {
      this.seguros = [
        { id: 1, tipo: "basica", costoMensual: 500, descripcion: "Cobertura básica para daños menores." },
        { id: 2, tipo: "completa", costoMensual: 1000, descripcion: "Cobertura completa para todo tipo de daños." },
        { id: 3, tipo: "premium", costoMensual: 1500, descripcion: "Cobertura premium con asistencia 24/7." }
      ];
    }
    this.mostrarOpcionesSeguros();
    this.mostrarListaSeguros();
  }

  mostrarOpcionesSeguros() {
    const select = document.getElementById('tipo');
    select.innerHTML = '<option value="" disabled selected>Seleccione un seguro...</option>';
    this.seguros.forEach(seguro => {
      const option = document.createElement('option');
      option.value = seguro.tipo;
      option.textContent = `${seguro.tipo.charAt(0).toUpperCase() + seguro.tipo.slice(1)} ($${seguro.costoMensual}/mes)`;
      select.appendChild(option);
    });
  }

  mostrarListaSeguros() {
    const listaSeguros = document.getElementById('listaSeguros');
    listaSeguros.innerHTML = this.seguros.map(seguro => `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">${seguro.tipo.charAt(0).toUpperCase() + seguro.tipo.slice(1)}</h5>
          <h6 class="card-subtitle mb-2 text-muted">$${seguro.costoMensual}/mes</h6>
          <p class="card-text">${seguro.descripcion}</p>
        </div>
      </div>
    `).join('');
  }

  cargarClientes() {
    const clientesGuardados = localStorage.getItem('clientesSeguros');
    if (clientesGuardados) {
      this.clientes = JSON.parse(clientesGuardados);
      this.mostrarClientes();
      this.actualizarEstadisticas();
      this.actualizarResumenTotal();
    }
  }

  setupEventos() {
    document.getElementById('cotizadorForm').addEventListener('submit', (e) => this.procesarFormulario(e));
    document.getElementById('limpiarClientes').addEventListener('click', () => this.limpiarClientes());
    document.getElementById('exportarClientes').addEventListener('click', () => this.exportarClientes());
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

    if (!nombre || isNaN(edad) || !tipo || isNaN(duracion)) {
      alert('Por favor complete todos los campos correctamente');
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
    submitText.textContent = '¡Cotización Exitosa!';
    btnSubmit.classList.replace('btn-primary', 'btn-success');

    setTimeout(() => {
      btnSubmit.classList.replace('btn-success', 'btn-primary');
      submitText.textContent = 'Calcular Cotización';
      spinner.classList.add('d-none');
      btnSubmit.disabled = false;
    }, 2000);
  }

  calcularCosto(tipo, duracion) {
    const seguro = this.seguros.find(s => s.tipo === tipo);
    return seguro ? seguro.costoMensual * duracion : 0;
  }

  mostrarResultado(cliente) {
    const seguro = this.seguros.find(s => s.tipo === cliente.tipoSeguro);
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = `
      <div>
        <h4 class="text-primary">${cliente.nombre}</h4>
        <p>Has cotizado el seguro <strong>${cliente.tipoSeguro}</strong></p>
        <div class="alert alert-success">
          <h5 class="mb-0">Total a pagar: $${cliente.costoTotal}</h5>
          <small class="text-muted">$${seguro.costoMensual} x ${cliente.duracion} meses</small>
        </div>
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
      <tr>
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
    const total = this.clientes.reduce((sum, c) => sum + c.costoTotal, 0);
    const cantidad = this.clientes.length;
    document.getElementById('totalSeguros').innerHTML = `<strong>Total Cotizado:</strong> $${total} por ${cantidad} cliente(s)`;
  }

  actualizarEstadisticas() {
    if (this.clientes.length === 0) {
      document.getElementById('graficoSegurosPlaceholder').style.display = 'flex';
      document.getElementById('graficoIngresosPlaceholder').style.display = 'flex';
      document.getElementById('graficoSeguros').style.display = 'none';
      document.getElementById('graficoIngresos').style.display = 'none';
      return;
    }
    
    document.getElementById('graficoSegurosPlaceholder').style.display = 'none';
    document.getElementById('graficoIngresosPlaceholder').style.display = 'none';
    document.getElementById('graficoSeguros').style.display = 'block';
    document.getElementById('graficoIngresos').style.display = 'block';
    
    const datosSeguros = this.procesarDatosSeguros();
    const datosIngresos = this.procesarDatosIngresos();
    
    this.crearGraficoSeguros(datosSeguros);
    this.crearGraficoIngresos(datosIngresos);
  }

  procesarDatosSeguros() {
    const tiposSeguro = {};
    this.clientes.forEach(cliente => {
      if (!tiposSeguro[cliente.tipoSeguro]) {
        tiposSeguro[cliente.tipoSeguro] = 0;
      }
      tiposSeguro[cliente.tipoSeguro]++;
    });
    
    return {
      labels: Object.keys(tiposSeguro).map(tipo => tipo.charAt(0).toUpperCase() + tipo.slice(1)),
      data: Object.values(tiposSeguro),
      colors: this.generarColores(Object.keys(tiposSeguro).length)
    };
  }

  procesarDatosIngresos() {
    const ingresosPorMes = {};
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    this.clientes.forEach(cliente => {
      const [dia, mes, ano] = cliente.fechaRegistro.split('/');
      const claveMes = `${ano}-${mes.padStart(2, '0')}`;
      
      if (!ingresosPorMes[claveMes]) {
        ingresosPorMes[claveMes] = 0;
      }
      ingresosPorMes[claveMes] += cliente.costoTotal;
    });
    
    const mesesOrdenados = Object.keys(ingresosPorMes).sort();
    
    return {
      labels: mesesOrdenados.map(mes => {
        const [ano, mesNum] = mes.split('-');
        return `${nombresMeses[parseInt(mesNum) - 1]} ${ano}`;
      }),
      data: mesesOrdenados.map(mes => ingresosPorMes[mes]),
      color: '#007bff'
    };
  }

  generarColores(cantidad) {
    const colores = [];
    for (let i = 0; i < cantidad; i++) {
      colores.push(`hsl(${(i * 360 / cantidad)}, 70%, 50%)`);
    }
    return colores;
  }

  crearGraficoSeguros(datos) {
    const ctx = document.getElementById('graficoSeguros').getContext('2d');
    if (this.graficoSeguros) this.graficoSeguros.destroy();
    
    this.graficoSeguros = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: datos.labels,
        datasets: [{
          data: datos.data,
          backgroundColor: datos.colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  crearGraficoIngresos(datos) {
    const ctx = document.getElementById('graficoIngresos').getContext('2d');
    if (this.graficoIngresos) this.graficoIngresos.destroy();
    
    this.graficoIngresos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datos.labels,
        datasets: [{
          label: 'Ingresos ($)',
          data: datos.data,
          backgroundColor: datos.color,
          borderColor: datos.color,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  new SimuladorSeguros();
});
