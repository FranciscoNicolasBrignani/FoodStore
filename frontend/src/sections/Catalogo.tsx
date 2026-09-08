import { CATEGORIAS, PRODUCTOS } from "../data/tiendaData";
import type { Productos } from "../type";

export const Catalogo = () => {
    
    const handleAgregar = (producto: Productos): void => {
        alert(`¡Agregado con éxito: ${producto.nombre}!`);
    };

    return (
        <section id="catalogo" className="catalogo">
            <ul className="categorias-list">
                <h2 className="titulo-categorias">Categorias</h2>
                {CATEGORIAS.map((cate) => (
                    <div key={cate.id}>
                        <a href={`#${cate.id}`}>{cate.nombre}</a>
                    </div>
                ))}
            </ul>
            <section className="productos-grid">
                <h2>Productos destacados</h2>
                <div className="container-catalogo">
                    {PRODUCTOS.map((productos) => (
                        <div key={productos.id}>
                            <div className="catalogo-box">
                                <h3 className="titulo-producto">{productos.nombre}</h3>
                                <img src={productos.imagen} alt="imagen-producto" />
                                <p className="desc-producto">{productos.descripcion}</p>
                                <p className="precio">{productos.precio}</p>
                                <button onClick={() => handleAgregar(productos)}>Agregar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </section>
    )
}