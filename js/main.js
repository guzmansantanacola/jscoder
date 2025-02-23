// Función para calcular el costo del seguro
function calcularSeguro(tipo, duracion) {
  let costoMensual = 0;

  //determinar el costo mensual según el tipo de seguro
  if (tipo === "basica") {
    costoMensual = 500;
  } else if (tipo === "total") {
    costoMensual = 1000;
  } else if (tipo === "premium") {
    costoMensual = 1500;
  } else {
    return "Tipo de seguro no válido.";
  }
  // Multiplicar costo mensual por duración
  let costoTotal = 0;
  for (let i = 0; i < duracion; i++) {
    costoTotal += costoMensual;
  }

  return costoTotal;
}

// manejar el formulario
function manejarFormulario(event) {
  event.preventDefault();
  // valores del formulario
  const tipo = document.getElementById("tipo").value;
  const duracion = parseInt(document.getElementById("duracion").value);

  // validar si la duración es valida 
  if (isNaN(duracion) || duracion <= 0) {
    alert("Por favor, ingrese una duración válida.");
    return;
  }

  // Calcular el costo del seguro
  const costoTotal = calcularSeguro(tipo, duracion);

  // mostrar el resultado
  document.getElementById(
    "resultado"
  ).textContent = `Costo total del seguro: $${costoTotal}`;
}

// submit al formulario
document
  .getElementById("cotizadorForm")
  .addEventListener("submit", manejarFormulario);
