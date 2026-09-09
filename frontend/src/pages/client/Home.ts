import { categorias, itemsCarrito, PRODUCTS, guardarCarrito } from "../../data/data";
import type { Icarrito } from "../../type/Icarrito";
import './home.css';
import { navigate } from "../../utils/navigate";

const btnLogout = document.getElementById('btn-salir');

  // 2. Evento para cerrar sesión
  btnLogout?.addEventListener('click', () => {
    localStorage.removeItem('userData');
    navigate('/src/pages/auth/login/login.html');
  });


  //funcion boton agregar
const agregarCarrito = (nuevoProducto: Icarrito): void => {
  const productoExistente = itemsCarrito.find(item => item.id === nuevoProducto.id);
  if(productoExistente){
    productoExistente.cantidad += 1;
  }else {
    itemsCarrito.push({...nuevoProducto, cantidad: nuevoProducto.cantidad || 1 });
  }
  guardarCarrito();
};

const cargarCategorias = (): void => {
  const container = document.getElementById("categorias-list");
  if(!container) return;

  container.innerHTML = "";
  categorias.forEach((cate) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${cate.id}`;
    link.textContent = cate.nombre;

    li.appendChild(link);
    container.appendChild(li);
  });
};

/*filtrar por categorias*/


const cargarProductos = (): void => {
  const container = document.getElementById("catalogo-container");
  if(!container) return;

  container.innerHTML = "";
  PRODUCTS.forEach((productos) => {
    const card = document.createElement("div");
    const box = document.createElement("div");
    box.className = "catalogo-box";

    const h3 = document.createElement("h3");
    h3.className = "titulo-producto";
    h3.textContent = productos.nombre;

    const img = document.createElement("img");
    img.className = "imagen-producto";
    img.src = productos.imagen;
    img.alt = productos.nombre;

    const desc = document.createElement("p");
    desc.className = "desc-producto";
    desc.textContent = productos.descripcion;

    const precio = document.createElement("p");
    precio.className = "precio-producto";
    precio.textContent = `$${productos.precio}`;

    const btn = document.createElement("button");
    btn.textContent = "Agregar";
    btn.addEventListener("click", () => {
      agregarCarrito({...productos, cantidad: 1});
      
    })

    box.appendChild(h3);
    box.appendChild(img);
    box.appendChild(desc);
    box.appendChild(precio);
    box.appendChild(btn);

    card.appendChild(box);
    container.appendChild(card);
  })

}

  cargarCategorias();
  cargarProductos();
