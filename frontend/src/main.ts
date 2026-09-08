import '../src/pages/client/home.css';
import { renderSidebar } from './components/Sidebar';
import { renderHome } from './pages/client/Home';

// Esperamos a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');

  if (root) {
    // Limpiamos el contenedor base
    root.innerHTML = '';

    //Creamos las secciones principales de la app
    const headerContainer = document.createElement('header');
    headerContainer.id = 'header-app';

    const mainContent = document.createElement('main');
    mainContent.id = 'main-content';

    //estructura en el DOM
    root.appendChild(headerContainer);
    root.appendChild(mainContent);

    //Renderizamos vistas/módulos
    renderSidebar(headerContainer);
    renderHome(mainContent);
  }
});