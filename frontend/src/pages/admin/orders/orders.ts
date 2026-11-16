import { navigate } from "../../../utils/navigate";

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

const badgeColors: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-300",
  CONFIRMADO: "bg-blue-100 text-blue-800 border-blue-300",
  TERMINADO: "bg-green-100 text-green-800 border-green-300",
  CANCELADO: "bg-red-100 text-red-800 border-red-300",
};

let pedidosState: any[] = [];
let usuariosState: any[] = [];
let productosState: any[] = [];
let pedidoSeleccionadoId: number | null = null;

// Referencias DOM
const ordersListContainer = document.getElementById("admin-orders-list") as HTMLDivElement;
const filtroEstadoSelect = document.getElementById("filtro-estado") as HTMLSelectElement;
const modal = document.getElementById("modal-pedido-admin") as HTMLDivElement;
const modalTitulo = document.getElementById("modal-pedido-titulo") as HTMLHeadingElement;
const modalBody = document.getElementById("modal-pedido-body") as HTMLDivElement;
const selectNuevoEstado = document.getElementById("select-nuevo-estado") as HTMLSelectElement;

// 2. Cargar todos los pedidos, usuarios y productos
async function inicializarPedidosAdmin() {
  try {
    const [resPedidos, resUsuarios, resProductos] = await Promise.all([
      fetch("/data/pedidos.json"),
      fetch("/data/usuarios.json"),
      fetch("/data/productos.json"),
    ]);

    const pedidosJson = await resPedidos.json();
    usuariosState = await resUsuarios.json();
    const productosJson = await resProductos.json();

    // Priorizar productos actualizados en localStorage si existen
    const prodsLocal = JSON.parse(localStorage.getItem("productos") || "[]");
    productosState = prodsLocal.length > 0 ? prodsLocal : productosJson;

    // Verificar si ya tenemos estado modificado en localStorage para el admin
    const pedidosAdminGuardados = localStorage.getItem("admin_pedidos_estado");
    const pedidosNuevosCliente = JSON.parse(localStorage.getItem("mis_pedidos_nuevos") || "[]");

    if (pedidosAdminGuardados) {
      const guardados: any[] = JSON.parse(pedidosAdminGuardados);
      // Fusionar evitando duplicados si el cliente hizo un pedido nuevo después
      const idsGuardados = new Set(guardados.map((p) => p.id));
      const nuevosSinRegistrar = pedidosNuevosCliente.filter((p: any) => !idsGuardados.has(p.id));
      pedidosState = [...nuevosSinRegistrar, ...guardados];
    } else {
      pedidosState = [...pedidosNuevosCliente, ...pedidosJson];
    }

    // Ordenar por fecha más reciente primero (FHU-10)
    pedidosState.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    guardarPedidosAdmin();
    renderizarListaPedidos("TODOS");
  } catch (error) {
    console.error("Error al cargar gestión de pedidos:", error);
  }
}

function guardarPedidosAdmin() {
  localStorage.setItem("admin_pedidos_estado", JSON.stringify(pedidosState));
  // También sincronizar los estados con mis_pedidos_nuevos para que el cliente vea los cambios
  const idsJsonBase = [1, 2]; // IDs estáticos iniciales si aplica
  const pedidosDeClientes = pedidosState.filter((p) => p.usuarioDto || !idsJsonBase.includes(p.id));
  localStorage.setItem("mis_pedidos_nuevos", JSON.stringify(pedidosDeClientes));
}

function obtenerNombreCliente(pedido: any): string {
  if (pedido.usuarioDto) {
    return `${pedido.usuarioDto.nombre} ${pedido.usuarioDto.apellido}`;
  }
  const usuario = usuariosState.find((u) => Number(u.id) === Number(pedido.idUsuario));
  return usuario ? `${usuario.nombre} ${usuario.apellido}` : "Cliente Desconocido";
}

// 3. Renderizar tarjetas de pedidos
function renderizarListaPedidos(estadoFiltro: string) {
  ordersListContainer.innerHTML = "";

  const filtrados = pedidosState.filter((p) => {
    if (estadoFiltro === "TODOS") return true;
    return p.estado === estadoFiltro;
  });

  if (filtrados.length === 0) {
    ordersListContainer.innerHTML = `
      <div class="bg-white p-8 rounded-lg shadow text-center text-gray-500">
        No se encontraron pedidos con el filtro seleccionado.
      </div>
    `;
    return;
  }

  filtrados.forEach((pedido) => {
    const nombreCliente = obtenerNombreCliente(pedido);
    const cantidadProductos = pedido.detalles.reduce((acc: number, d: any) => acc + d.cantidad, 0);
    const badgeClass = badgeColors[pedido.estado] || "bg-gray-100 text-gray-800";

    const card = document.createElement("div");
    card.className = "bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition cursor-pointer flex justify-between items-center";
    card.innerHTML = `
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h3 class="font-bold text-lg text-gray-800">Pedido #${pedido.id}</h3>
          <span class="px-3 py-0.5 text-xs font-semibold rounded-full border ${badgeClass}">
            ${pedido.estado}
          </span>
        </div>
        <p class="text-sm text-gray-700 font-medium">Cliente: ${nombreCliente}</p>
        <p class="text-xs text-gray-500 mt-1">Fecha: ${pedido.fecha} • ${cantidadProductos} producto(s)</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-gray-500">Total</p>
        <p class="text-xl font-bold text-orange-600">$${Number(pedido.total).toFixed(2)}</p>
      </div>
    `;

    card.addEventListener("click", () => abrirModalDetalle(pedido));
    ordersListContainer.appendChild(card);
  });
}

// 4. Modal con detalle completo y cambio de estado (FHU-10)
function abrirModalDetalle(pedido: any) {
  pedidoSeleccionadoId = pedido.id;
  modalTitulo.textContent = `Detalle del Pedido #${pedido.id}`;
  selectNuevoEstado.value = pedido.estado;

  const nombreCliente = obtenerNombreCliente(pedido);
  const usuario = pedido.usuarioDto || usuariosState.find((u) => Number(u.id) === Number(pedido.idUsuario)) || {};

  // Mapear detalles (soporta tanto formato JSON plano idProducto como objeto producto anidado)
  const detallesHTML = pedido.detalles
    .map((d: any) => {
      const prodObj = d.producto || productosState.find((p) => Number(p.id) === Number(d.idProducto)) || { nombre: `Producto #${d.idProducto}` };
      return `
        <div class="flex justify-between py-2 border-b border-gray-100">
          <span>${prodObj.nombre} <strong class="text-gray-500">(x${d.cantidad})</strong></span>
          <span class="font-semibold">$${Number(d.subtotal).toFixed(2)}</span>
        </div>
      `;
    })
    .join("");

  modalBody.innerHTML = `
    <div class="bg-gray-50 p-3 rounded border space-y-1">
      <p><strong>Cliente:</strong> ${nombreCliente}</p>
      <p><strong>Teléfono:</strong> ${usuario.celular || pedido.telefono || "No especificado"}</p>
      ${pedido.direccion ? `<p><strong>Dirección:</strong> ${pedido.direccion}</p>` : ""}
      <p><strong>Fecha:</strong> ${pedido.fecha}</p>
      <p><strong>Forma de Pago:</strong> ${pedido.formaPago}</p>
    </div>

    <div>
      <h4 class="font-bold text-gray-700 mb-2 uppercase text-xs">Productos del Pedido</h4>
      <div class="max-h-40 overflow-y-auto border rounded px-3">
        ${detallesHTML}
      </div>
    </div>

    <div class="flex justify-between items-center pt-2 text-base font-bold">
      <span>Total del Pedido:</span>
      <span class="text-orange-600 text-xl">$${Number(pedido.total).toFixed(2)}</span>
    </div>
  `;

  modal.classList.remove("hidden");
}

function cerrarModal() {
  modal.classList.add("hidden");
  pedidoSeleccionadoId = null;
}

document.getElementById("btn-cerrar-pedido-modal")?.addEventListener("click", cerrarModal);

// 5. Actualizar estado del pedido
document.getElementById("btn-actualizar-estado")?.addEventListener("click", () => {
  if (pedidoSeleccionadoId === null) return;

  const nuevoEstado = selectNuevoEstado.value;
  pedidosState = pedidosState.map((p) =>
    p.id === pedidoSeleccionadoId ? { ...p, estado: nuevoEstado } : p
  );

  guardarPedidosAdmin();
  renderizarListaPedidos(filtroEstadoSelect.value);
  cerrarModal();
});

filtroEstadoSelect.addEventListener("change", () => {
  renderizarListaPedidos(filtroEstadoSelect.value);
});

document.addEventListener("DOMContentLoaded", inicializarPedidosAdmin);