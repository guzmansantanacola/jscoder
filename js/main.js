class SimuladorSeguros {
  constructor() {
    this.clientes = [];
    this.seguros = [];
    
    // Verificar elementos críticos antes de iniciar
    if (!this.verificarElementosCriticos()) {
      console.error("Elementos críticos del DOM no encontrados");
      return;
    }
    
    this.init().catch(error => {
      console.error("Error al inicializar el simulador:", error);
      this.mostrarErrorInicializacion();
    });
  }

  // Verificar que los elementos esenciales existen
  verificarElementosCriticos() {
    const elementosRequeridos = [
      'loading', 'progressBar', 'mainApp', 'cotizadorForm',
      'tipo', 'resultado', 'listaClientes', 'totalSeguros'
    ];
    
    return elementosRequeridos.every(id => {
      const elemento = document.getElementById(id);
      if (!elemento) {
        console.error(`Elemento con ID '${id}' no encontrado`);
        return false;
      }
      return true;
    });
  }

  async init() {
    try {
      await this.simularCarga();
      await this.cargarSeguros();
      this.cargarClientes();
      this.setupEventos();
      this.mostrarVistaPrincipal();
    } catch (error) {
      console.error("Error en la inicialización:", error);
      this.mostrarErrorInicializacion();
    }
  }

  async simularCarga() {
    return new Promise((resolve) => {
        const progressBar = document.getElementById('progressBar');
        const progressContainer = document.querySelector('.progress.mt-3');
        
        if (!progressBar || !progressContainer) {
            console.warn("Elementos de progreso no encontrados");
            this.ocultarSpinner();
            resolve();
            return;
        }

        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                progressContainer.style.display = 'none'; // Ocultar directamente
                this.ocultarSpinner();
                resolve();
            }
        }, 100);
    });
}

  ocultarSpinner() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.classList.add('animate__animated', 'animate__fadeOut');
      setTimeout(() => {
        loadingElement.style.display = 'none';
      }, 1000);
    }
  }

  mostrarErrorInicializacion() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.innerHTML = `
        <div class="alert alert-danger">
          <h4>Error al cargar el simulador</h4>
          <p>Recarga la página o intenta más tarde</p>
        </div>
      `;
    }
  }

  async cargarSeguros() {
    try {
      const response = await fetch('./data/seguros.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.seguros = await response.json();
      this.mostrarOpcionesSeguros();
      
      // Mostrar también en la lista de seguros
      this.mostrarListaSeguros();
      
    } catch (error) {
      console.error('Error al cargar seguros:', error);
      
      // Datos de respaldo
      this.seguros = [
        { id: 1, tipo: "basica", costoMensual: 500, descripcion: "Cobertura básica para daños menores." },
        { id: 2, tipo: "completa", costoMensual: 1000, descripcion: "Cobertura completa para todo tipo de daños." },
        { id: 3, tipo: "premium", costoMensual: 1500, descripcion: "Cobertura premium con asistencia 24/7." }
      ];
      
      this.mostrarOpcionesSeguros();
      this.mostrarListaSeguros();
      
      Swal.fire({
        icon: 'warning',
        title: 'Modo offline',
        text: 'Se cargaron datos locales de respaldo',
        timer: 2000
      });
    }
  }

  mostrarOpcionesSeguros() {
    const select = document.getElementById('tipo');
    if (!select) return;
    
    select.innerHTML = '<option value="" disabled selected>Seleccione un seguro...</option>';
    
    this.seguros.forEach(seguro => {
      const option = document.createElement('option');
      option.value = seguro.tipo;
      option.textContent = `${this.capitalizeFirstLetter(seguro.tipo)} ($${seguro.costoMensual}/mes)`;
      select.appendChild(option);
    });
  }

  mostrarListaSeguros() {
    const listaSeguros = document.getElementById('listaSeguros');
    if (!listaSeguros) return;
    
    listaSeguros.innerHTML = this.seguros.map(seguro => `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">${this.capitalizeFirstLetter(seguro.tipo)}</h5>
          <h6 class="card-subtitle mb-2 text-muted">$${seguro.costoMensual}/mes</h6>
          <p class="card-text">${seguro.descripcion}</p>
        </div>
      </div>
    `).join('');
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  cargarClientes() {
    try {
      const clientesGuardados = localStorage.getItem('clientesSeguros');
      if (clientesGuardados) {
        this.clientes = JSON.parse(clientesGuardados);
        this.mostrarClientes();
        this.actualizarEstadisticas();
        this.actualizarResumenTotal();
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  }

  setupEventos() {
    // Verificar que los elementos existen antes de agregar eventos
    const addEventIfExists = (id, event, fn) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener(event, fn.bind(this));
      } else {
        console.warn(`Elemento ${id} no encontrado para agregar evento`);
      }
    };

    addEventIfExists('cotizadorForm', 'submit', this.procesarFormulario);
    addEventIfExists('limpiarClientes', 'click', this.limpiarClientes);
    addEventIfExists('exportarClientes', 'click', this.exportarClientes);
    addEventIfExists('nombre', 'input', (e) => this.validarNombre(e.target.value));
    addEventIfExists('edad', 'input', (e) => this.validarEdad(e.target.value));
  }

  async procesarFormulario(e) {
    e.preventDefault();
    
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const spinner = document.getElementById('submitSpinner');
    
    if (!btnSubmit || !submitText || !spinner) {
      console.error("Elementos del formulario no encontrados");
      return;
    }

    // Mostrar estado de carga
    submitText.textContent = 'Procesando...';
    spinner.classList.remove('d-none');
    btnSubmit.disabled = true;

    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 800));

      // Obtener valores del formulario
      const nombre = document.getElementById('nombre')?.value.trim();
      const edad = parseInt(document.getElementById('edad')?.value);
      const tipo = document.getElementById('tipo')?.value;
      const duracion = parseInt(document.getElementById('duracion')?.value);

      // Validar
      if (!this.validarFormulario(nombre, edad, tipo, duracion)) {
        throw new Error("Validación fallida");
      }

      // Crear nuevo cliente
      const nuevoCliente = {
        id: Date.now(),
        nombre,
        edad,
        tipoSeguro: tipo,
        duracion,
        fechaRegistro: new Date().toLocaleDateString('es-ES'),
        costoTotal: this.calcularCosto(tipo, duracion)
      };

      // Guardar cliente
      this.clientes.push(nuevoCliente);
      localStorage.setItem('clientesSeguros', JSON.stringify(this.clientes));
      
      // Actualizar vistas
      this.mostrarResultado(nuevoCliente);
      this.mostrarClientes();
      this.actualizarEstadisticas();
      
      // Resetear formulario
      e.target.reset();
      
      // Mostrar éxito
      submitText.textContent = '¡Cotización Exitosa!';
      btnSubmit.classList.replace('btn-primary', 'btn-success');

      setTimeout(() => {
        btnSubmit.classList.replace('btn-success', 'btn-primary');
        submitText.textContent = 'Calcular Cotización';
        spinner.classList.add('d-none');
        btnSubmit.disabled = false;
      }, 2000);

    } catch (error) {
      console.error("Error al procesar formulario:", error);
      
      // Restaurar estado del botón
      submitText.textContent = 'Calcular Cotización';
      spinner.classList.add('d-none');
      btnSubmit.disabled = false;
    }
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
    if (this.clientes.length === 0) {
        // Mostrar placeholders si no hay datos
        document.getElementById('graficoSegurosPlaceholder').style.display = 'flex';
        document.getElementById('graficoIngresosPlaceholder').style.display = 'flex';
        
        // Ocultar canvas si no hay datos
        document.getElementById('graficoSeguros').style.display = 'none';
        document.getElementById('graficoIngresos').style.display = 'none';
        return;
    }
    
    // Ocultar placeholders
    document.getElementById('graficoSegurosPlaceholder').style.display = 'none';
    document.getElementById('graficoIngresosPlaceholder').style.display = 'none';
    
    // Mostrar canvas
    document.getElementById('graficoSeguros').style.display = 'block';
    document.getElementById('graficoIngresos').style.display = 'block';
    
    // Procesar datos para los gráficos
    const datosSeguros = this.procesarDatosSeguros();
    const datosIngresos = this.procesarDatosIngresos();
    
    // Crear o actualizar gráficos
    this.crearGraficoSeguros(datosSeguros);
    this.crearGraficoIngresos(datosIngresos);
}

// Nuevos métodos auxiliares para procesar datos
procesarDatosSeguros() {
    const tiposSeguro = {};
    
    this.clientes.forEach(cliente => {
        if (!tiposSeguro[cliente.tipoSeguro]) {
            tiposSeguro[cliente.tipoSeguro] = 0;
        }
        tiposSeguro[cliente.tipoSeguro]++;
    });
    
    return {
        labels: Object.keys(tiposSeguro).map(tipo => this.capitalizeFirstLetter(tipo)),
        data: Object.values(tiposSeguro),
        colors: this.generarColores(Object.keys(tiposSeguro).length)
    };
}

procesarDatosIngresos() {
    const ingresosPorMes = {};
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    this.clientes.forEach(cliente => {
        // Asumimos que fechaRegistro está en formato 'dd/mm/aaaa'
        const [dia, mes, ano] = cliente.fechaRegistro.split('/');
        const claveMes = `${ano}-${mes.padStart(2, '0')}`;
        
        if (!ingresosPorMes[claveMes]) {
            ingresosPorMes[claveMes] = 0;
        }
        ingresosPorMes[claveMes] += cliente.costoTotal;
    });
    
    // Ordenar por mes
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

// Métodos para crear los gráficos
crearGraficoSeguros(datos) {
    const ctx = document.getElementById('graficoSeguros').getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (this.graficoSeguros) {
        this.graficoSeguros.destroy();
    }
    
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
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

crearGraficoIngresos(datos) {
    const ctx = document.getElementById('graficoIngresos').getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (this.graficoIngresos) {
        this.graficoIngresos.destroy();
    }
    
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
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}
  mostrarVistaPrincipal() {
    document.getElementById('mainApp').classList.remove('d-none');
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  try {
    new SimuladorSeguros();
  } catch (error) {
    console.error("Error crítico al iniciar la aplicación:", error);
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.innerHTML = `
        <div class="alert alert-danger">
          <h4>Error crítico</h4>
          <p>No se pudo iniciar la aplicación. Recarga la página.</p>
        </div>
      `;
    }
  }
});