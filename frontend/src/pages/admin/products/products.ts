import { navigate } from "../../../utils/navigate";

interface Categoria {
  id: number;
  nombre: string;
  eliminado?: boolean;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  stock: number;
  imagen: string;
  disponible: boolean;
  eliminado: boolean;
  categoriaId: number;
}

// 1. Validación de sesión ADMIN
const userData = JSON.parse(localStorage.getItem("userData") || "{}");
const rolActual = (userData.rol || userData.role || "").toLowerCase();
if (!userData.id || rolActual !== "admin") {
  alert("Acceso denegado.");
  navigate("/src/pages/auth/login/login.html");
}

document.getElementById("btn-logout")?.addEventListener("click", () => {
  localStorage.removeItem("userData");
  navigate("/src/pages/auth/login/login.html");
});

let productosState: Producto[] = [];
let categoriasState: Categoria[] = [];

// Referencias DOM
const tbody = document.getElementById("tabla-productos") as HTMLTableSectionElement;
const modal = document.getElementById("modal-producto") as HTMLDivElement;
const modalTitulo = document.getElementById("modal-prod-titulo") as HTMLHeadingElement;
const form = document.getElementById("form-producto") as HTMLFormElement;

const inputId = document.getElementById("prod-id") as HTMLInputElement;
const inputNombre = document.getElementById("prod-nombre") as HTMLInputElement;
const inputDescripcion = document.getElementById("prod-descripcion") as HTMLTextAreaElement;
const inputPrecio = document.getElementById("prod-precio") as HTMLInputElement;
const inputStock = document.getElementById("prod-stock") as HTMLInputElement;
const selectCategoria = document.getElementById("prod-categoria") as HTMLSelectElement;
const inputImagen = document.getElementById("prod-imagen") as HTMLInputElement;
const checkDisponible = document.getElementById("prod-disponible") as HTMLInputElement;

// 2. Inicializar datos desde localStorage o JSON
async function inicializarProductos() {
  const prodsGuardados = localStorage.getItem("productos");
  const catsGuardadas = localStorage.getItem("admin_categorias");

  try {
    if (catsGuardadas) {
      categoriasState = JSON.parse(catsGuardadas);
    } else {
      const resCat = await fetch("/data/categorias.json");
      categoriasState = await resCat.json();
      localStorage.setItem("admin_categorias", JSON.stringify(categoriasState));
    }

    if (prodsGuardados) {
      productosState = JSON.parse(prodsGuardados);
    } else {
      const resProd = await fetch("/data/productos.json");
      productosState = await resProd.json();
      guardarProductosStorage();
    }
  } catch (error) {
    console.error("Error al cargar productos/categorías:", error);
  }

  cargarSelectCategorias();
  renderizarTabla();
}

function guardarProductosStorage() {
  localStorage.setItem("productos", JSON.stringify(productosState));
}

function cargarSelectCategorias() {
  selectCategoria.innerHTML = `<option value="">Seleccione una categoría...</option>`;
  categoriasState
    .filter((c) => !c.eliminado)
    .forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = String(cat.id);
      opt.textContent = cat.nombre;
      selectCategoria.appendChild(opt);
    });
}

// 3. Renderizar tabla completa con nombre de categoría
function renderizarTabla() {
  tbody.innerHTML = "";
  const activos = productosState.filter((p) => !p.eliminado);

  if (activos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-gray-500">No hay productos registrados.</td></tr>`;
    return;
  }

  activos.forEach((prod) => {
    const categoriaObj = categoriasState.find((c) => Number(c.id) === Number(prod.categoriaId));
    const nombreCategoria = categoriaObj ? categoriaObj.nombre : "Sin categoría";

    const estadoBadge =
      prod.disponible && prod.stock > 0
        ? `<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-semibold">Disponible</span>`
        : `<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-semibold">No disponible</span>`;

    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-50";
    tr.innerHTML = `
      <td class="p-3 font-semibold">${prod.id}</td>
      <td class="p-3">
        <img src="${prod.imagen}" alt="${prod.nombre}" class="w-12 h-12 object-cover rounded border" onerror="this.src='https://via.placeholder.com/50'" />
      </td>
      <td class="p-3 font-medium text-gray-800">${prod.nombre}</td>
      <td class="p-3 text-gray-600 max-w-xs truncate">${prod.descripcion}</td>
      <td class="p-3 font-bold text-gray-800">$${Number(prod.precio).toFixed(2)}</td>
      <td class="p-3"><span class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">${nombreCategoria}</span></td>
      <td class="p-3 font-semibold">${prod.stock}</td>
      <td class="p-3">${estadoBadge}</td>
      <td class="p-3 text-center space-x-1 whitespace-nowrap">
        <button class="btn-editar bg-gray-600 text-white px-2.5 py-1 rounded text-xs hover:bg-gray-700" data-id="${prod.id}">Editar</button>
        <button class="btn-eliminar bg-red-600 text-white px-2.5 py-1 rounded text-xs hover:bg-red-700" data-id="${prod.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = Number((e.currentTarget as HTMLButtonElement).dataset.id);
      abrirModalEdicion(id);
    });
  });

  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = Number((e.currentTarget as HTMLButtonElement).dataset.id);
      eliminarProducto(id);
    });
  });
}

// 4. Modales
function abrirModalCreacion() {
  cargarSelectCategorias();
  form.reset();
  inputId.value = "";
  checkDisponible.checked = true;
  modalTitulo.textContent = "Nuevo Producto";
  modal.classList.remove("hidden");
}

function abrirModalEdicion(id: number) {
  const prod = productosState.find((p) => p.id === id);
  if (!prod) return;

  cargarSelectCategorias();
  inputId.value = String(prod.id);
  inputNombre.value = prod.nombre;
  inputDescripcion.value = prod.descripcion;
  inputPrecio.value = String(prod.precio);
  inputStock.value = String(prod.stock);
  selectCategoria.value = String(prod.categoriaId);
  inputImagen.value = prod.imagen;
  checkDisponible.checked = prod.disponible;

  modalTitulo.textContent = `Editar Producto #${prod.id}`;
  modal.classList.remove("hidden");
}

function cerrarModal() {
  modal.classList.add("hidden");
}

document.getElementById("btn-nuevo-producto")?.addEventListener("click", abrirModalCreacion);
document.getElementById("btn-cerrar-prod-modal")?.addEventListener("click", cerrarModal);
document.getElementById("btn-cancelar-prod-modal")?.addEventListener("click", cerrarModal);

// 5. Validaciones y Guardado (FHU-09: precio > 0, stock >= 0, categoría existente)
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = inputNombre.value.trim();
  const descripcion = inputDescripcion.value.trim();
  const precio = parseFloat(inputPrecio.value);
  const stock = parseInt(inputStock.value, 10);
  const categoriaId = Number(selectCategoria.value);
  const imagen = inputImagen.value.trim();
  const disponible = checkDisponible.checked;

  if (!nombre || !descripcion || !imagen) {
    alert("Complete todos los campos de texto obligatorios.");
    return;
  }
  if (isNaN(precio) || precio <= 0) {
    alert("El precio debe ser mayor a 0.");
    return;
  }
  if (isNaN(stock) || stock < 0) {
    alert("El stock no puede ser negativo.");
    return;
  }
  const categoriaExiste = categoriasState.some((c) => c.id === categoriaId && !c.eliminado);
  if (!categoriaExiste) {
    alert("Debe seleccionar una categoría válida.");
    return;
  }

  const idEdicion = inputId.value ? Number(inputId.value) : null;

  if (idEdicion) {
    productosState = productosState.map((p) =>
      p.id === idEdicion
        ? { ...p, nombre, descripcion, precio, stock, categoriaId, imagen, disponible }
        : p
    );
  } else {
    const nuevoId = productosState.length > 0 ? Math.max(...productosState.map((p) => p.id)) + 1 : 1;
    productosState.push({
      id: nuevoId,
      nombre,
      descripcion,
      precio,
      stock,
      categoriaId,
      imagen,
      disponible,
      eliminado: false,
    });
  }

  guardarProductosStorage();
  renderizarTabla();
  cerrarModal();
});

// 6. Eliminación lógica
function eliminarProducto(id: number) {
  const prod = productosState.find((p) => p.id === id);
  if (!prod) return;

  if (confirm(`¿Estás seguro de que deseas eliminar el producto "${prod.nombre}"?`)) {
    productosState = productosState.map((p) =>
      p.id === id ? { ...p, eliminado: true, disponible: false } : p
    );
    guardarProductosStorage();
    renderizarTabla();
  }
}

document.addEventListener("DOMContentLoaded", inicializarProductos);