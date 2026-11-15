import type { ICartItem } from "../../../type/categoria";
import '../home/home.css';
import { navigate } from "../../../utils/navigate";
import { getCart, guardarCart } from "../../../utils/cart";

const btnLogout = document.getElementById('btn-salir');

// 2. Evento para cerrar sesión
btnLogout?.addEventListener('click', () => {
  localStorage.removeItem('userData');
  navigate('/src/pages/auth/login/login.html');
});

// Función botón agregar al carrito
const agregarCart = (nuevoProducto: ICartItem): void => {
  const itemsCart = getCart();
  const productoExistente = itemsCart.find(item => item.id === nuevoProducto.id);
  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    itemsCart.push({ ...nuevoProducto, cantidad: nuevoProducto.cantidad || 1 });
  }
  guardarCart(itemsCart);
};

// Obtener categorías desde /data/categorias.json usando fetch()
const GetCategories = async (): Promise<void> => {
  const container = document.getElementById("categorias-list");
  if (!container) return;

  try {
    const responseCat = await fetch('/data/categorias.json');
    const categorias = await responseCat.json();

    const responseProd = await fetch('/data/productos.json');
    const PRODUCTS = await responseProd.json();

    container.innerHTML = "";
    const todas = document.createElement("a"); 
    todas.href = `/src/pages/store/home/home.html`;
    todas.textContent = "Todos los productos";
    todas.className = "categorias";
    container.appendChild(todas);

    // Evento para "Todos los productos"
    todas.addEventListener("click", (e) => {
      e.preventDefault();
      cargarProductos();
    });

    categorias.forEach((cate: any) => {
      const li = document.createElement("li");
      const link = document.createElement("a");

      link.href = `#${cate.id}`;
      link.textContent = cate.nombre;
      link.className = "categorias";
      
      li.appendChild(link);
      container.appendChild(li);

      link.addEventListener("click", (e) => {
        e.preventDefault();

        const productoFiltrado = PRODUCTS.filter((producto: any) => {
          // Detecta cualquier posible nombre de la propiedad de categoría en el JSON
          const catRef = producto.categoriaId ?? producto.categoriald ?? producto.categoria_id ?? producto.categoria ?? producto.categorias;
          
          let coincide = false;

          if (Array.isArray(catRef)) {
            coincide = catRef.some((c: any) => String(c.id ?? c) === String(cate.id));
          } else if (typeof catRef === 'object' && catRef !== null) {
            coincide = String(catRef.id ?? '') === String(cate.id);
          } else if (catRef !== undefined && catRef !== null) {
            coincide = String(catRef) === String(cate.id);
          }

          // Valida que esté disponible y no eliminado
          const esActivo = producto.disponible !== false && producto.eliminado !== true;

          return coincide && esActivo;
        });

        renderizarProductos(productoFiltrado, PRODUCTS);
      });
    });
  } catch (error) {
    console.error("Error al cargar las categorías:", error);
  }
};

// Cargar productos desde /data/productos.json usando fetch()
const cargarProductos = async (): Promise<void> => {
  try {
    const response = await fetch('/data/productos.json');
    const PRODUCTS = await response.json();
    
    // Filtrar solo los disponibles y no eliminados
    const productosValidos = PRODUCTS.filter((p: any) => p.disponible !== false && p.eliminado !== true);
    renderizarProductos(productosValidos, PRODUCTS);
  } catch (error) {
    console.error("Error al cargar los productos:", error);
  }
};

const renderizarProductos = (listaProductos: any[], PRODUCTS: any[]): void => {
  const container = document.getElementById("catalogo-container");
  if (!container) return;

  container.innerHTML = "";

  const barra = document.createElement("div");
  const search = document.createElement("input");
  const btnbuscar = document.createElement("button");
  btnbuscar.textContent = "Buscar";

  btnbuscar.className = "btn-buscar";
  search.className = "barra-busqueda";

  const textBuscar = document.createElement("p");
  textBuscar.className = "text-buscar";
  textBuscar.textContent = "Buscar producto";
  container.appendChild(textBuscar);

  const buscar = (): void => {
    const inputUsuario = search.value.toLowerCase();
    const buscarProducto = PRODUCTS.filter((producto: any) => {
      const nombreProducto = producto.nombre.toLowerCase().includes(inputUsuario);
      const disponibleValido = producto.disponible !== false && producto.eliminado !== true;
      return nombreProducto && disponibleValido;
    });
    renderizarProductos(buscarProducto, PRODUCTS);
  };

  btnbuscar.addEventListener("click", () => {
    buscar();
  });

  search.addEventListener("keydown", (Evento) => {
    if (Evento.key === 'Enter') {
      buscar();
    }
  });

  barra.appendChild(search);
  barra.appendChild(btnbuscar);
  container.appendChild(barra);

  listaProductos.forEach((productos: any) => {
    const card = document.createElement("div");
    const box = document.createElement("div");
    box.className = "catalogo-box";

    card.addEventListener("click", () => {
      navigate(`/src/pages/store/productDetail/productDetail.html?id=${productos.id}`);
    });
    card.style.cursor = "pointer";

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
    btn.textContent = "Detalles";
    btn.className = "btn-detalles";
    
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      navigate(`/src/pages/store/productDetail/productDetail.html?id=${productos.id}`);
    });

    box.appendChild(h3);
    box.appendChild(img);
    box.appendChild(desc);
    box.appendChild(precio);
    box.appendChild(btn);

    card.appendChild(box);
    container.appendChild(card);
  });
};
// Inicialización de la vista
cargarProductos();
GetCategories();