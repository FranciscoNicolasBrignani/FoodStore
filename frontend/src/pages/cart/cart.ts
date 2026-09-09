import { guardarCarrito, itemsCarrito } from "../../data/data";
import type { Icarrito } from "../../type/Icarrito";
import { navigate } from "../../utils/navigate";
import './cart.css';

// 1. Manejo del cierre de sesión
const btnLogout = document.getElementById('btn-salir');
btnLogout?.addEventListener('click', () => {
    localStorage.removeItem('userData');
    navigate('/src/pages/auth/login/login.html');
});

const carritoCompras = () => {
    const container = document.getElementById("carrito");
    if (!container) return;

    container.innerHTML = "";

    if (itemsCarrito.length === 0) {
        container.innerHTML = "<p>El carrito esta vacio</p>";
    }

    let total = 0;

    itemsCarrito.forEach((producto: Icarrito) => {
        const subtotal = producto.cantidad * producto.precio;
        total += subtotal;

        const card = document.createElement("article");
        card.className = "cart-item";

        card.innerHTML = `
        <img src = "${producto.imagen}" alt= "${producto.nombre}" class="item-img"> 
        <div class="cart-item-info">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <p>${producto.precio}</p>
        <p>Subtotal: $${subtotal}</p>
        </div>
        <div class="cart-items-acciones">
        <button class="btn-restar">-</button>
        <button class="btn-sumar">+</button>
        <button class="btn-eliminar">Eliminar</button>
        </div>
        <span>Total: $${total}</span>
        `;

        card.querySelector(".btn-restar")?.addEventListener("click", () => {
            cambiarCantidad(producto.id, -1);
        });

        card.querySelector(".btn-sumar")?.addEventListener("click", () => {
            cambiarCantidad(producto.id, 1);
        });

        card.querySelector(".btn-eliminar")?.addEventListener("click", () => {
            eliminarProducto(producto.id);
        });

        container.appendChild(card);
    });

    const cambiarCantidad = (id: number, cambio: number): void => {
        const producto = itemsCarrito.find(item => item.id === id);
        if (!producto) return;

        producto.cantidad += cambio;

        if (producto.cantidad <= 0) {
            eliminarProducto(id);
            return;
        }

        guardarCarrito();
        carritoCompras();
    }

    const eliminarProducto = (id: number): void => {
        const index = itemsCarrito.findIndex(item => item.id === id);
        if (index !== -1) {
            itemsCarrito.splice(index, 1);
            guardarCarrito();
            carritoCompras();
        }
    }

}

carritoCompras();