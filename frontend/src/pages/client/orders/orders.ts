import { navigate } from "../../../utils/navigate";

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  stock: number;
  imagen: string;
  disponible: boolean;
  categoria: Categoria;
}

interface DetallePedido {
  cantidad: number;
  subtotal: number;
  producto: Producto;
}

interface UsuarioDto {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  rol: string;
}

interface Pedido {
  id: number;
  fecha: string;
  estado: 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO';
  total: number;
  formaPago: string;
  detalles: DetallePedido[];
  usuarioDto: UsuarioDto;
}

const usuarioSesion = JSON.parse(localStorage.getItem('userData') || '{}');

console.log("Usuario en sesión actual:", usuarioSesion);

if (!usuarioSesion.id) {
  window.location.href = '/src/pages/auth/login/login.html';
}

const btnLogout = document.getElementById('btn-salir');

//Evento para cerrar sesión
btnLogout?.addEventListener('click', () => {
  localStorage.removeItem('userData');
  navigate('/src/pages/auth/login/login.html');
});

const badgeColors: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  EN_PREPARACION: 'bg-blue-100 text-blue-800 border-blue-300',
  ENTREGADO: 'bg-green-100 text-green-800 border-green-300',
  CANCELADO: 'bg-red-100 text-red-800 border-red-300',
};

async function cargarHistorialPedidos() {
  try {
    //Cargar los pedidos iniciales del archivo JSON de la cátedra
    const response = await fetch('/data/pedidos.json');
    const pedidosJson: Pedido[] = await response.json();

    //Cargar los nuevos pedidos creados por el usuario en localStorage
    const pedidosLocales: Pedido[] = JSON.parse(localStorage.getItem('mis_pedidos_nuevos') || '[]');

    //Unir ambos arreglos en uno solo
    const todosLosPedidos = [...pedidosJson, ...pedidosLocales];
    console.log("Todos los pedidos disponibles:", todosLosPedidos);

    //Filtrar usando Number() para evitar problemas de tipos (string vs number)
    const misPedidos = todosLosPedidos.filter(
      p => Number(p.usuarioDto.id) === Number(usuarioSesion.id)
    );
    
    console.log("Pedidos filtrados para este usuario:", misPedidos);

    const contenedor = document.getElementById('orders-container')!;
    const emptyState = document.getElementById('empty-state')!;

    if (misPedidos.length === 0) {
      emptyState.classList.remove('hidden');
      contenedor.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    contenedor.classList.remove('hidden');
    contenedor.innerHTML = '';

    misPedidos.forEach((pedido: Pedido) => {
      const card = document.createElement('div');
      card.className = 'bg-white shadow rounded-lg p-6 border border-gray-200 cursor-pointer hover:shadow-md transition';
      
      const primerosProductos = pedido.detalles.slice(0, 3);
      const resumenProductosHTML = primerosProductos
        .map((d: DetallePedido) => `<li class="text-sm text-gray-600">• ${d.producto.nombre} (x${d.cantidad}) - $${d.subtotal.toFixed(2)}</li>`)
        .join('');
      
      const masProductos = pedido.detalles.length > 3 
        ? `<p class="text-xs text-gray-400 mt-1">Y ${pedido.detalles.length - 3} producto(s) más...</p>`
        : '';

      const badgeClass = badgeColors[pedido.estado] || 'bg-gray-100 text-gray-800';

      card.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <span class="font-bold text-gray-800">Pedido #${pedido.id}</span>
          <span class="px-3 py-1 text-xs font-semibold rounded-full border ${badgeClass}">${pedido.estado.replace('_', ' ')}</span>
        </div>
        <div class="mb-3">
          <p class="text-xs text-gray-500">Fecha: ${pedido.fecha}</p>
        </div>
        <div class="border-t border-b border-gray-100 py-2 mb-3">
          <p class="text-xs font-semibold text-gray-500 mb-1">Resumen:</p>
          <ul>${resumenProductosHTML}</ul>
          ${masProductos}
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500">Total:</span>
          <span class="text-lg font-bold text-gray-900">$${pedido.total.toFixed(2)}</span>
        </div>
      `;

      card.addEventListener('click', () => abrirModalDetalle(pedido));
      contenedor.appendChild(card);
    });

  } catch (error) {
    console.error('Error al cargar los pedidos:', error);
  }
}

function abrirModalDetalle(pedido: Pedido) {
  const modal = document.getElementById('pedido-modal')!;
  const modalContent = document.getElementById('modal-content')!;

  const detalleProductosHTML = pedido.detalles
    .map((d: DetallePedido) => `
      <div class="flex justify-between py-2 border-b border-gray-100 text-sm">
        <span>${d.producto.nombre} (Cant: ${d.cantidad})</span>
        <span class="font-semibold">$${d.subtotal.toFixed(2)}</span>
      </div>
    `).join('');

  modalContent.innerHTML = `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-800">Detalle del Pedido #${pedido.id}</h3>
        <span class="px-3 py-1 text-xs font-semibold rounded-full border ${badgeColors[pedido.estado]}">${pedido.estado.replace('_', ' ')}</span>
      </div>
      <div>
        <p class="text-sm text-gray-600"><strong>Fecha:</strong> ${pedido.fecha}</p>
        <p class="text-sm text-gray-600"><strong>Forma de Pago:</strong> ${pedido.formaPago}</p>
      </div>
      <div class="bg-gray-50 p-3 rounded-md">
        <h4 class="text-xs font-bold text-gray-500 uppercase mb-1">Información de Entrega</h4>
        <p class="text-sm text-gray-700">Cliente: ${pedido.usuarioDto.nombre} ${pedido.usuarioDto.apellido}</p>
        <p class="text-sm text-gray-700">Celular: ${pedido.usuarioDto.celular}</p>
      </div>
      <div>
        <h4 class="text-xs font-bold text-gray-500 uppercase mb-2">Productos</h4>
        <div class="max-h-40 overflow-y-auto pr-1">
          ${detalleProductosHTML}
        </div>
      </div>
      <div class="border-t pt-3 flex justify-between items-center">
        <span class="font-bold text-gray-700">Total a Pagar:</span>
        <span class="text-xl font-bold text-gray-900">$${pedido.total.toFixed(2)}</span>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

document.getElementById('close-modal')?.addEventListener('click', () => {
  document.getElementById('pedido-modal')?.classList.add('hidden');
});

document.addEventListener('DOMContentLoaded', cargarHistorialPedidos);