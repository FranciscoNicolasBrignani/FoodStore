import { categorias, PRODUCTS } from "../../data/data";
import type { IProduct } from "../../type/product";

// Manejador del evento Agregar
const handleAgregar = (producto: IProduct): void => {
  alert(`¡Agregado con éxito: ${producto.nombre}!`);
};

// Función principal que renderiza el catálogo en el DOM
export const renderHome = (container: HTMLElement): void => {
  container.innerHTML = ""; // Limpia el contenedor

  // 1. Sección principal de catálogo
  const catalogoSection = document.createElement("section");
  catalogoSection.id = "catalogo";
  catalogoSection.className = "catalogo";

  // 2. Lista de Categorías
  const categoriasUl = document.createElement("ul");
  categoriasUl.className = "categorias-list";

  const tituloCategorias = document.createElement("h2");
  tituloCategorias.className = "titulo-categorias";
  tituloCategorias.textContent = "Categorías";
  categoriasUl.appendChild(tituloCategorias);

  categorias.forEach((cate) => {
    const divCate = document.createElement("div");
    const link = document.createElement("a");
    link.href = `#${cate.id}`;
    link.textContent = cate.nombre;

    divCate.appendChild(link);
    categoriasUl.appendChild(divCate);
  });

  // 3. Grid de Productos
  const productosSection = document.createElement("section");
  productosSection.className = "productos-grid";

  const tituloProductos = document.createElement("h2");
  tituloProductos.textContent = "Productos destacados";
  productosSection.appendChild(tituloProductos);

  const containerCatalogo = document.createElement("div");
  containerCatalogo.className = "container-catalogo";

  PRODUCTS.forEach((producto) => {
    const cardWrapper = document.createElement("div");

    const box = document.createElement("div");
    box.className = "catalogo-box";

    const h3 = document.createElement("h3");
    h3.className = "titulo-producto";
    h3.textContent = producto.nombre;

    const img = document.createElement("img");
    img.src = producto.imagen;
    img.alt = "imagen-producto";

    const desc = document.createElement("p");
    desc.className = "desc-producto";
    desc.textContent = producto.descripcion;

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = `$${producto.precio}`;

    const btn = document.createElement("button");
    btn.textContent = "Agregar";
    btn.addEventListener("click", () => handleAgregar(producto));

    // Ensamblar la tarjeta de producto
    box.appendChild(h3);
    box.appendChild(img);
    box.appendChild(desc);
    box.appendChild(precio);
    box.appendChild(btn);

    cardWrapper.appendChild(box);
    containerCatalogo.appendChild(cardWrapper);
  });

  productosSection.appendChild(containerCatalogo);

  // 4. Inyectar todo al catálogo y al contenedor principal
  catalogoSection.appendChild(categoriasUl);
  catalogoSection.appendChild(productosSection);
  container.appendChild(catalogoSection);
};