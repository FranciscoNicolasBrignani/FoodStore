import { getCart, guardarCart } from "../../../utils/cart";
import { navigate } from "../../../utils/navigate";

// Capturar el ID del producto desde los parámetros de la URL
const getProductIdFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  let id = params.get('id');
  if (!id && window.location.hash) {
    id = window.location.hash.replace('#', '');
  }
  return id;
};

const cargarDetalleProducto = async (): Promise<void> => {
  const container = document.getElementById("product-detail-container");
  if (!container) return;

  const productId = getProductIdFromUrl();

  if (!productId) {
    container.innerHTML = `
      <div class="error-container">
        <h2>Producto no especificado</h2>
        <p>No se ha seleccionado ningún producto para ver su detalle.</p>
        <button id="btn-volver" class="btn-volver">Volver al catálogo</button>
      </div>
    `;
    document.getElementById("btn-volver")?.addEventListener("click", () => {
      navigate("/src/pages/store/home/home.html");
    });
    return;
  }

  try {
    // 1. VERIFICAR LOCALSTORAGE PRIMERO (donde se guarda el stock descontado)
    let productos = JSON.parse(localStorage.getItem('productos') || '[]');

    // 2. Si el localStorage está vacío, lo cargamos desde el JSON original y lo guardamos
    if (productos.length === 0) {
      const response = await fetch('/data/productos.json');
      productos = await response.json();
      localStorage.setItem('productos', JSON.stringify(productos));
    }

    // Filtrar el producto por ID utilizando la lista actualizada
    const producto = productos.find((p: any) => String(p.id) === String(productId));

    if (!producto) {
      container.innerHTML = `
        <div class="error-container">
          <h2>Producto no encontrado</h2>
          <p>El producto que buscas no existe o fue eliminado.</p>
          <button id="btn-volver" class="btn-volver">Volver al catálogo</button>
        </div>
      `;
      document.getElementById("btn-volver")?.addEventListener("click", () => {
        navigate("/src/pages/store/home/home.html");
      });
      return;
    }

    const esValido = producto.disponible !== false && producto.stock > 0;

    // Renderizar la información completa, imagen grande, stock actualizado y estado
    container.innerHTML = `
      <button id="btn-volver" class="btn-volver">← Volver al Catálogo</button>
      <div class="detalle-wrapper">
        <div class="imagen-container">
          <img src="${producto.imagen}" alt="${producto.nombre}" class="img-grande" />
        </div>
        <div class="detalles-info">
          <h1 class="titulo-detalle">${producto.nombre}</h1>
          <p class="desc-detalle">${producto.descripcion}</p>
          <p class="precio-detalle">$${producto.precio}</p>
          
          <p class="stock-detalle">Stock disponible: <strong>${producto.stock}</strong> unidades</p>
          
          <p class="estado-detalle">
            Estado: <span class="badge ${esValido ? 'badge-disponible' : 'badge-nodisponible'}">
              ${esValido ? 'Disponible' : 'No disponible'}
            </span>
          </p>

          <!-- Selector de cantidad con validación basada en el stock actual -->
          <div class="cantidad-selector">
            <label for="input-cantidad">Cantidad:</label>
            <input type="number" id="input-cantidad" value="1" min="1" max="${producto.stock}" />
          </div>

          <!-- Botón Agregar al Carrito (deshabilitado si no disponible o stock 0) -->
          <button id="btn-agregar" class="btn-agregar" ${!esValido ? 'disabled' : ''}>
            ${esValido ? 'Agregar al Carrito' : 'Sin stock'}
          </button>

          <!-- Mensaje de confirmación -->
          <div id="mensaje-confirmacion" class="mensaje-confirmacion" style="display: none;">
            ¡Producto agregado al carrito con éxito!
          </div>
        </div>
      </div>
    `;

    // Botón volver
    document.getElementById("btn-volver")?.addEventListener("click", () => {
      navigate("/src/pages/store/home/home.html");
    });

    const inputCantidad = document.getElementById("input-cantidad") as HTMLInputElement;
    const btnAgregar = document.getElementById("btn-agregar") as HTMLButtonElement;
    const mensajeConfirmacion = document.getElementById("mensaje-confirmacion");

    // Validar en tiempo real que no supere el stock ni sea menor a 1
    inputCantidad?.addEventListener("input", () => {
      let val = parseInt(inputCantidad.value) || 1;
      if (val > producto.stock) {
        inputCantidad.value = String(producto.stock);
      } else if (val < 1) {
        inputCantidad.value = "1";
      }
    });

    // Guardar en el localStorage al hacer clic
    btnAgregar?.addEventListener("click", () => {
      const cantidadSeleccionada = parseInt(inputCantidad.value) || 1;
      const itemsCart = getCart();
      const productoExistente = itemsCart.find((item: any) => item.id === producto.id);

      if (productoExistente) {
        const nuevaCantidad = productoExistente.cantidad + cantidadSeleccionada;
        if (nuevaCantidad > producto.stock) {
          alert("La cantidad total en el carrito supera el stock disponible.");
          return;
        }
        productoExistente.cantidad = nuevaCantidad;
      } else {
        itemsCart.push({
          ...producto,
          cantidad: cantidadSeleccionada
        });
      }

      guardarCart(itemsCart);

      // Mostrar mensaje de confirmación temporal
      if (mensajeConfirmacion) {
        mensajeConfirmacion.style.display = "block";
        setTimeout(() => {
          mensajeConfirmacion.style.display = "none";
        }, 3000);
      }
    });

  } catch (error) {
    console.error("Error al cargar el detalle:", error);
  }
};

cargarDetalleProducto();