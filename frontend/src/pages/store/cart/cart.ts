import type { ICartItem } from "../../../type/categoria";
import { navigate } from "../../../utils/navigate";
import { getCart, cambiarCantidad, eliminarProducto } from '../../../utils/cart';
import '../cart/cart.css';

// 1. Manejo del cierre de sesión
const btnLogout = document.getElementById('btn-salir');
btnLogout?.addEventListener('click', () => {
    localStorage.removeItem('userData');
    navigate('/src/pages/auth/login/login.html');
});

const cartCompras = () => {
    const container = document.getElementById("cart");

    if (!container) return;

    container.innerHTML = "";

    const itemsCart: ICartItem[] = getCart();

    if (itemsCart.length === 0) {
        container.innerHTML = `<p class="carrito-vacio">El carrito está vacío</p>`;
        return;
    }

    let total = 0;

    itemsCart.forEach((producto: ICartItem) => {
        const subtotal = producto.cantidad * producto.precio;
        total += subtotal;

        const card = document.createElement("article");
        card.className = "cart-item";

        card.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}" class="item-img"> 
        <div class="cart-item-info">
          <h3>${producto.nombre}</h3>
          <p>Precio unidad: $${producto.precio}</p>
          <p>Cantidad: ${producto.cantidad}</p>
          <p>Subtotal: $${subtotal.toFixed(2)}</p>
        </div>
        <div class="cart-items-acciones">
          <button class="btn-restar">-</button>
          <button class="btn-sumar">+</button>
          <button class="btn-eliminar">Eliminar</button>
        </div>
        `;      

        const btnRestar = card.querySelector(".btn-restar");
        const btnSumar = card.querySelector(".btn-sumar");
        const btnEliminar = card.querySelector(".btn-eliminar");

        btnRestar?.addEventListener("click", () => {
            cambiarCantidad(producto.id, -1);
            cartCompras();
        });

        btnSumar?.addEventListener("click", () => {
            cambiarCantidad(producto.id, +1);
            cartCompras();
        });

        btnEliminar?.addEventListener("click", () => {
            eliminarProducto(producto.id);
            cartCompras();
        });

        container.appendChild(card);        
    });

    // Contenedor de resumen, selección de pago y botón de confirmar
    const checkoutSection = document.createElement("div");
    checkoutSection.className = "cart-checkout-section";
    checkoutSection.innerHTML = `
        <div class="precio-final">
            <span>Total: $${total.toFixed(2)}</span>
        </div>
        <div class="checkout-controls" style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
            <label for="forma-pago" style="font-weight: bold;">Forma de Pago:</label>
            <select id="forma-pago" style="padding: 8px; border-radius: 4px;">
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
            </select>
            <button id="btn-confirmar-pedido" class="btn-confirmar">
                Confirmar Pedido
            </button>
        </div>
    `;

    container.appendChild(checkoutSection);

    // Lógica al hacer clic en "Confirmar Pedido"
    const btnConfirmar = document.getElementById("btn-confirmar-pedido");
    btnConfirmar?.addEventListener("click", () => {
        confirmarCompra(itemsCart, total);
    });
}

//Función encargada de validar, descontar stock y generar el pedido
function confirmarCompra(itemsCart: ICartItem[], totalPedido: number) {
    
    const usuarioSesion = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!usuarioSesion.id) {
        alert("Debes iniciar sesión para confirmar el pedido.");
        navigate('/src/pages/auth/login/login.html');
        return;
    }

   
    const selectPago = document.getElementById("forma-pago") as HTMLSelectElement;
    const formaPagoSeleccionada = selectPago ? selectPago.value : "EFECTIVO";

    
    let productosCatalogo = JSON.parse(localStorage.getItem('productos') || '[]');
    
    itemsCart.forEach(item => {
        const productoEnCatalogo = productosCatalogo.find((p: any) => p.id === item.id);
        if (productoEnCatalogo) {
            productoEnCatalogo.stock = Math.max(0, productoEnCatalogo.stock - item.cantidad);
            if (productoEnCatalogo.stock === 0) {
                productoEnCatalogo.disponible = false;
            }
        }
    });
    localStorage.setItem('productos', JSON.stringify(productosCatalogo));

   
    const nuevoPedido = {
        id: Date.now(), //ID único autogenerado
        fecha: new Date().toISOString().split('T')[0], 
        estado: "PENDIENTE",
        total: totalPedido,
        formaPago: formaPagoSeleccionada,
        detalles: itemsCart.map(item => ({
            cantidad: item.cantidad,
            subtotal: item.cantidad * item.precio,
            producto: {
                id: item.id,
                nombre: item.nombre,
                precio: item.precio,
                descripcion: item.descripcion || "",
                stock: item.stock || 0,
                imagen: item.imagen,
                disponible: item.disponible ?? true,
                categoria: item.categorias || { id: 1, nombre: "General", descripcion: "" }
            }
        })),
        usuarioDto: {
            id: usuarioSesion.id,
            nombre: usuarioSesion.nombre || "Cliente",
            apellido: usuarioSesion.apellido || "",
            mail: usuarioSesion.email,
            celular: usuarioSesion.celular || "Sin celular",
            rol: usuarioSesion.role || "USUARIO"
        }
    };

    const pedidosLocales = JSON.parse(localStorage.getItem('mis_pedidos_nuevos') || '[]');
    pedidosLocales.push(nuevoPedido);
    localStorage.setItem('mis_pedidos_nuevos', JSON.stringify(pedidosLocales));

    
    localStorage.removeItem('cart');

    
    navigate('/src/pages/client/orders/orders.html'); 
}

cartCompras();