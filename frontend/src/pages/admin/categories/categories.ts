import { navigate } from "../../../utils/navigate";

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  eliminado: boolean;
}

//Validación de sesión y rol ADMIN
const userData = JSON.parse(localStorage.getItem("userData") || "{}");
const rolActual = (userData.rol || userData.role || "").toLowerCase();
if (!userData.id || rolActual !== "admin") {
  alert("Acceso denegado. Se requieren permisos de administrador.");
  navigate("/src/pages/auth/login/login.html");
}

document.getElementById("btn-logout")?.addEventListener("click", () => {
  localStorage.removeItem("userData");
  navigate("/src/pages/auth/login/login.html");
});

let categoriasState: Categoria[] = [];

//Referencias DOM
const tbody = document.getElementById("tabla-categorias") as HTMLTableSectionElement;
const modal = document.getElementById("modal-categoria") as HTMLDivElement;
const modalTitulo = document.getElementById("modal-titulo") as HTMLHeadingElement;
const form = document.getElementById("form-categoria") as HTMLFormElement;
const inputId = document.getElementById("cat-id") as HTMLInputElement;
const inputNombre = document.getElementById("cat-nombre") as HTMLInputElement;
const inputDescripcion = document.getElementById("cat-descripcion") as HTMLTextAreaElement;
const inputImagen = document.getElementById("cat-imagen") as HTMLInputElement;

//Cargar datos iniciales (localStorage o fetch a /data/categorias.json)
async function inicializarCategorias() {
  const guardadas = localStorage.getItem("admin_categorias");
  if (guardadas) {
    categoriasState = JSON.parse(guardadas);
  } else {
    try {
      const res = await fetch("/data/categorias.json");
      categoriasState = await res.json();
      guardarEnStorage();
    } catch (error) {
      console.error("Error al cargar categorias.json:", error);
    }
  }
  renderizarTabla();
}

function guardarEnStorage() {
  localStorage.setItem("admin_categorias", JSON.stringify(categoriasState));
}

//Renderizar tabla de categorías activas
function renderizarTabla() {
  tbody.innerHTML = "";
  const activas = categoriasState.filter((c) => !c.eliminado);

  if (activas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">No hay categorías registradas.</td></tr>`;
    return;
  }

  activas.forEach((cat) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-50";
    tr.innerHTML = `
      <td class="p-3 font-semibold">${cat.id}</td>
      <td class="p-3">
        <img src="${cat.imagen}" alt="${cat.nombre}" class="w-12 h-12 object-cover rounded border" onerror="this.src='https://via.placeholder.com/50'"/>
      </td>
      <td class="p-3 font-medium text-gray-800">${cat.nombre}</td>
      <td class="p-3 text-gray-600 text-sm">${cat.descripcion}</td>
      <td class="p-3 text-center space-x-2">
        <button class="btn-editar bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700" data-id="${cat.id}">Editar</button>
        <button class="btn-eliminar bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700" data-id="${cat.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  //Asignar eventos a botones dinámicos
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = Number((e.currentTarget as HTMLButtonElement).dataset.id);
      abrirModalEdicion(id);
    });
  });

  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = Number((e.currentTarget as HTMLButtonElement).dataset.id);
      eliminarCategoria(id);
    });
  });
}

//Manejo de Modales (Alta y Edición)
function abrirModalCreacion() {
  form.reset();
  inputId.value = "";
  modalTitulo.textContent = "Nueva Categoría";
  modal.classList.remove("hidden");
}

function abrirModalEdicion(id: number) {
  const cat = categoriasState.find((c) => c.id === id);
  if (!cat) return;

  inputId.value = String(cat.id);
  inputNombre.value = cat.nombre;
  inputDescripcion.value = cat.descripcion;
  inputImagen.value = cat.imagen;
  modalTitulo.textContent = `Editar Categoría #${cat.id}`;
  modal.classList.remove("hidden");
}

function cerrarModal() {
  modal.classList.add("hidden");
}

document.getElementById("btn-nueva-categoria")?.addEventListener("click", abrirModalCreacion);
document.getElementById("btn-cerrar-modal")?.addEventListener("click", cerrarModal);
document.getElementById("btn-cancelar-modal")?.addEventListener("click", cerrarModal);

//Guardar (Crear o Actualizar)
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = inputNombre.value.trim();
  const descripcion = inputDescripcion.value.trim();
  const imagen = inputImagen.value.trim();

  if (!nombre || !descripcion || !imagen) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  const idEdicion = inputId.value ? Number(inputId.value) : null;

  if (idEdicion) {
    //Actualizar existente
    categoriasState = categoriasState.map((c) =>
      c.id === idEdicion ? { ...c, nombre, descripcion, imagen } : c
    );
  } else {
    //Crear nueva con ID autoincremental
    const nuevoId = categoriasState.length > 0 ? Math.max(...categoriasState.map((c) => c.id)) + 1 : 1;
    categoriasState.push({
      id: nuevoId,
      nombre,
      descripcion,
      imagen,
      eliminado: false,
    });
  }

  guardarEnStorage();
  renderizarTabla();
  cerrarModal();
});

//Eliminación lógica con confirmación
function eliminarCategoria(id: number) {
  const cat = categoriasState.find((c) => c.id === id);
  if (!cat) return;

  if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${cat.nombre}"?`)) {
    categoriasState = categoriasState.map((c) =>
      c.id === id ? { ...c, eliminado: true } : c
    );
    guardarEnStorage();
    renderizarTabla();
  }
}

document.addEventListener("DOMContentLoaded", inicializarCategorias);