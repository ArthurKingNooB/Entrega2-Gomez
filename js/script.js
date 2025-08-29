

document.addEventListener("DOMContentLoaded", () => {
  // Incremento y decremento para desktop y mobile
  document.querySelectorAll('.input-number, .input-number-mobile').forEach(wrapper => {
    const input = wrapper.querySelector('input[type="number"]');
    const btnInc = wrapper.querySelector('.btn-increment');
    const btnDec = wrapper.querySelector('.btn-decrement');

    // Cargar valor guardado en localStorage
    const nombre = input.dataset.nombre;
    const almacenado = localStorage.getItem(nombre);
    if (almacenado !== null) {
      input.value = almacenado;
    }

    btnInc.addEventListener('click', () => {
      input.value = parseInt(input.value || "0") + 1;
      input.dispatchEvent(new Event('change'));
    });

    btnDec.addEventListener('click', () => {
      let val = parseInt(input.value || "0");
      if (val > parseInt(input.min || "0")) {
        input.value = val - 1;
        input.dispatchEvent(new Event('change'));
      }
    });

    // Guardar en localStorage cuando cambia el input
    input.addEventListener('change', () => {
      let val = parseInt(input.value);
      if (isNaN(val) || val < 0) {
        val = 0;
        input.value = val;
      }
      localStorage.setItem(nombre, val);
      mostrarResumenProductos();
    });
  });

  // Mostrar resumen productos al cargar
  mostrarResumenProductos();

  // Filtros
  const buscador = document.getElementById("buscador-nombre");
  const filtroTipo = document.getElementById("filtro-tipo");
  const filtroOferta = document.getElementById("filtro-oferta");
  const tarjetas = document.querySelectorAll(".col-md-4.col-lg-3.mb-4");
  const noResult = document.getElementById("no-result");

  function obtenerTipoPorContenido(tarjeta) {
    const titulo = tarjeta.querySelector(".card-title")?.textContent.toLowerCase() || "";
    const alt = tarjeta.querySelector("img")?.alt.toLowerCase() || "";

    if (titulo.includes("atun") || titulo.includes("mazapan") || alt.includes("mazapan") || alt.includes("atun")) {
      return "comida";
    } else if (titulo.includes("limpiapisos") || alt.includes("limpiapisos")) {
      return "limpieza";
    }
    return "";
  }

  function estaEnOferta(tarjeta) {
    return tarjeta.querySelector(".discount-badge") !== null;
  }

  function filtrar() {
    const textoBuscado = buscador.value.toLowerCase();
    const tipoSeleccionado = filtroTipo.value;
    const ofertaSeleccionada = filtroOferta.value;

    let visibleCount = 0;

    tarjetas.forEach(tarjeta => {
      const nombreProducto = tarjeta.querySelector(".card-title")?.textContent.toLowerCase() || "";
      const tipo = obtenerTipoPorContenido(tarjeta);
      const esOferta = estaEnOferta(tarjeta) ? "si" : "no";

      const coincideNombre = nombreProducto.includes(textoBuscado);
      const coincideTipo = tipoSeleccionado === "" || tipo === tipoSeleccionado;
      const coincideOferta = ofertaSeleccionada === "" || ofertaSeleccionada === esOferta;

      if (coincideNombre && coincideTipo && coincideOferta) {
        tarjeta.style.display = "block";
        visibleCount++;
      } else {
        tarjeta.style.display = "none";
      }
    });

    noResult.style.display = visibleCount === 0 ? "block" : "none";
  }

  buscador.addEventListener("input", filtrar);
  filtroTipo.addEventListener("change", filtrar);
  filtroOferta.addEventListener("change", filtrar);

  filtrar(); // Ejecutar filtro inicial

  // Mostrar resumen productos
  function mostrarResumenProductos() {
    const inputs = document.querySelectorAll('input[type="number"]');
    let resumenHTML = '';
    let total = 0;

    inputs.forEach(input => {
      const cantidad = parseInt(input.value);
      const nombre = input.dataset.nombre;
      const precio = parseFloat(input.dataset.precio);

      if (!isNaN(cantidad) && cantidad > 0) {
        const subtotal = cantidad * precio;
        resumenHTML += `${nombre} x ${cantidad} = $${subtotal.toFixed(2)}<br>`;
        total += subtotal;
      }
    });

    const contenedor = document.getElementById('resumenProductos');
    contenedor.innerHTML = resumenHTML
      ? `<strong>Productos seleccionados:</strong><br>${resumenHTML}<br><strong>Total: $${total.toFixed(2)}</strong>`
      : 'No agregaste productos aún.';
  }

  // Mostrar resumen al hacer clic
  document.getElementById('botonResumen').addEventListener('click', mostrarResumenProductos);

});
// Función para mostrar productos
function mostrarProductos(productos) {
  const contenedor = document.getElementById("productos-contenedor");
  contenedor.innerHTML = ""; // limpiar contenedor

  productos.forEach((p) => {
    const precioFinal = p.descuento > 0 
      ? (p.precio - (p.precio * p.descuento) / 100).toFixed(2)
      : p.precio.toFixed(2);

  const productoHTML = `
  <div class="producto-card">
    <img src="${p.imagen}" alt="${p.nombre}">
    <h3>${p.nombre}</h3>
    <p>${p.descripcion}</p>
    <p>Categoría: ${p.categoria}</p>
    <p class="precio">${p.descuento > 0 
        ? `<s>$${p.precio}</s> <strong>$${precioFinal}</strong> <span class="descuento">-${p.descuento}%</span>` 
        : `<strong>$${p.precio}</strong>`
      }</p>
    <p><strong>Stock disponible: ${p.stock}</strong></p>
  </div>
`;

    contenedor.innerHTML += productoHTML;
  });
}

// Función para cargar JSON
async function cargarProductos() {
  try {
    const response = await fetch("data/data.json"); // ruta a tu JSON
    const data = await response.json();

    // devolver la lista de productos
    return data.Productos.products;
  } catch (error) {
    console.error("Error cargando productos:", error);
    return [];
  }
}


// Configurar botón
document.getElementById("btnMostrar").addEventListener("click", async () => {
  const productos = await cargarProductos();
  mostrarProductos(productos);
});


// Función para enviar pedido por WhatsApp
function enviarPedidoWhatsApp() {
  const inputs = document.querySelectorAll('input[type="number"]');
  const observaciones = document.getElementById('observaciones').value.trim();
  let mensaje = 'Hola, quiero hacer el siguiente pedido:%0A';
  let total = 0;
  let hayPedido = false;

  inputs.forEach(input => {
    const cantidad = parseInt(input.value);
    const nombre = input.dataset.nombre;
    const precio = parseFloat(input.dataset.precio);

    if (cantidad > 0) {
      const subtotal = cantidad * precio;
      mensaje += `• ${nombre} x ${cantidad} = $${subtotal.toFixed(2)}%0A`;
      total += subtotal;
      hayPedido = true;
    }
  });

  if (!hayPedido) {
    alert("No has seleccionado ningún producto.");
    return;
  }

  mensaje += `%0ATotal: $${total.toFixed(2)}`;

  if (observaciones !== '') {
    mensaje += `%0A%0AObservaciones: ${encodeURIComponent(observaciones)}`;
  }

  const numero = "59892420997";
  const url = `https://wa.me/${numero}?text=${mensaje}`;
  window.open(url, "_blank");
}
