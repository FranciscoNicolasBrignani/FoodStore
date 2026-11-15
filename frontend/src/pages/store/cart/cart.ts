import type { ICartItem } from "../../../type/categoria";
import { navigate } from "../../../utils/navigate";
import {getCart, cambiarCantidad, eliminarProducto } from '../../../utils/cart';
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
        container.innerHTML = `<p class="carrito-vacio">El carrito esta vacio</p>`;
        return;
    }

    let total = 0;

    itemsCart.forEach((producto: ICartItem) => {
        const subtotal = producto.cantidad * producto.precio;
        total += subtotal;

        const card = document.createElement("article");
        card.className = "cart-item";

        card.innerHTML = `
        <img src = "${producto.imagen}" alt= "${producto.nombre}" class="item-img"> 
        <div class="cart-item-info">
        <h3>${producto.nombre}</h3>
        <p>Precio unidad: $${producto.precio}</p>
        <p>Cantidad: ${producto.cantidad}</p><p>Subtotal: $${subtotal.toFixed(2)}</p>
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

    const PrecioTotal = document.createElement("span");
        PrecioTotal.className = "precio-final"
        PrecioTotal.innerHTML = `
        <span>Total ${total.toFixed(2)}</span>`; 
        container.appendChild(PrecioTotal);

    

}

cartCompras();