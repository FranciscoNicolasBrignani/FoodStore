import { useState } from "react";
import './Sidebar.css';

export const Sidebar = () => {
    const [Abierto, abrir] = useState<boolean>(false);

    const toggleSidebar = () => {
        abrir(!Abierto);
    };

    return (
        <>
        <button className="btn-abrir" onClick={toggleSidebar}>
            ☰ 
        </button><h1 className="titulo">FoodStore</h1>
        {Abierto && <div className="menu" onClick={toggleSidebar}></div>}

        <aside className={`sidebar ${Abierto ? 'open' : ''}`}>
        <div className="sidebar-header">
            <h2 className="titulo-menu">FoodStore</h2>
            <button className="btn-cerrar" onClick={toggleSidebar}>
                x
            </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><a href="#" onClick={toggleSidebar}>Inicio</a></li>
            <li><a href="#catalogo" onClick={toggleSidebar}>Catálogo</a></li>
            <li><a href="#pedidos" onClick={toggleSidebar}>Mis Pedidos</a></li>
            <li><a href="#carrito" onClick={toggleSidebar}>Carrito</a></li>
            <li><a href="#admin" onClick={toggleSidebar}>Panel Admin</a></li>
          </ul>
        </nav>
        </aside>
        </>
    );
};