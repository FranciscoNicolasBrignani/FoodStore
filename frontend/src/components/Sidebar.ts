import './Sidebar.css';

export const renderSidebar = (container: HTMLElement): void => {
  // 1. Botón para abrir el menú
  const btnAbrir = document.createElement('button');
  btnAbrir.className = 'btn-abrir';
  btnAbrir.textContent = '☰';

  // 2. Título principal
  const titulo = document.createElement('h1');
  titulo.className = 'titulo';
  titulo.textContent = 'FoodStore';

  // 3. Fondo oscuro / Overlay
  const overlay = document.createElement('div');
  overlay.className = 'menu';
  overlay.style.display = 'none'; // Inicialmente oculto

  // 4. Panel del Sidebar
  const aside = document.createElement('aside');
  aside.className = 'sidebar';

  // Header del Sidebar
  const sidebarHeader = document.createElement('div');
  sidebarHeader.className = 'sidebar-header';

  const tituloMenu = document.createElement('h2');
  tituloMenu.className = 'titulo-menu';
  tituloMenu.textContent = 'FoodStore';

  const btnCerrar = document.createElement('button');
  btnCerrar.className = 'btn-cerrar';
  btnCerrar.textContent = 'x';

  sidebarHeader.appendChild(tituloMenu);
  sidebarHeader.appendChild(btnCerrar);

  // Navegación
  const nav = document.createElement('nav');
  nav.className = 'sidebar-nav';

  const ul = document.createElement('ul');
  const opciones = [
    { texto: 'Inicio', href: '#' },
    { texto: 'Catálogo', href: '#catalogo' },
    { texto: 'Mis Pedidos', href: '#pedidos' },
    { texto: 'Carrito', href: '/src/pages/cart/cart.html' },
    { texto: 'Panel Admin', href: '#admin' },
  ];

  opciones.forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.texto;
    a.addEventListener('click', toggleSidebar); // Cierra el menú al hacer clic
    li.appendChild(a);
    ul.appendChild(li);
  });

  nav.appendChild(ul);
  aside.appendChild(sidebarHeader);
  aside.appendChild(nav);

  // 5. Función para alternar abrir/cerrar (reemplaza a useState)
  function toggleSidebar(): void {
    const isOpen = aside.classList.toggle('open');
    overlay.style.display = isOpen ? 'block' : 'none';
  }

  // Eventos para abrir y cerrar
  btnAbrir.addEventListener('click', toggleSidebar);
  btnCerrar.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', toggleSidebar);

  // 6. Inyectar todo al contenedor recibido
  container.appendChild(btnAbrir);
  container.appendChild(titulo);
  container.appendChild(overlay);
  container.appendChild(aside);
};