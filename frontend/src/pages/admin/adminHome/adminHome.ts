import { navigate } from "../../../utils/navigate";

//Validación de rol de Administrador
const usuarioSesion = JSON.parse(localStorage.getItem('userData') || '{}');

const rolUsuario = (usuarioSesion.rol || usuarioSesion.role || '').toLowerCase();

if (!usuarioSesion.id || rolUsuario !== 'admin') {
    alert("Acceso denegado. Se requieren permisos de administrador.");
    navigate("/src/pages/auth/login/login.html");
}

// Cierre de sesión
document.getElementById('btn-salir')?.addEventListener('click', () => {
    localStorage.removeItem('userData');
    navigate('/src/pages/auth/login/login.html');
});

// Función principal para cargar métricas y estadísticas
async function cargarDashboard() {
    try {
        // Realizar fetch concurrente a todos los archivos JSON necesarios
        const [resCategorias, resProductos, resPedidos] = await Promise.all([
            fetch('/data/categorias.json'),
            fetch('/data/productos.json'),
            fetch('/data/pedidos.json')
        ]);

        const categorias = await resCategorias.json();
        const productos = await resProductos.json();
        const pedidosJson = await resPedidos.json();

        // Integrar también los pedidos nuevos creados en localStorage 
        const pedidosLocales = JSON.parse(localStorage.getItem('mis_pedidos_nuevos') || '[]');
        const todosLosPedidos = [...pedidosJson, ...pedidosLocales];


        // Totales para las 4 tarjetas
        const totalCategorias = categorias.filter((c: any) => !c.eliminado).length;
        const totalProductos = productos.filter((p: any) => !p.eliminado).length;
        const totalPedidos = todosLosPedidos.length;
        
        // Productos activos y con stock o disponibles
        const productosDisponibles = productos.filter(
            (p: any) => p.disponible === true && !p.eliminado
        ).length;

        //Renderizar tarjetas
        (document.getElementById('stat-categorias') as HTMLElement).innerText = String(totalCategorias);
        (document.getElementById('stat-productos') as HTMLElement).innerText = String(totalProductos);
        (document.getElementById('stat-pedidos') as HTMLElement).innerText = String(totalPedidos);
        (document.getElementById('stat-disponibles') as HTMLElement).innerText = String(productosDisponibles);

        //Panel de Resumen
        const productosActivos = productos.filter((p: any) => p.disponible && !p.eliminado).length;
        const productosInactivos = productos.filter((p: any) => (!p.disponible || p.eliminado)).length;

        //Contar pedidos por estado
        const pedidosPorEstado: Record<string, number> = {
            PENDIENTE: 0,
            CONFIRMADO: 0,
            EN_PREPARACION: 0,
            TERMINADO: 0,
            CANCELADO: 0
        };

        todosLosPedidos.forEach((pedido: any) => {
            const estado = pedido.estado || 'PENDIENTE';
            pedidosPorEstado[estado] = (pedidosPorEstado[estado] || 0) + 1;
        });

        //Renderizar panel de resumen
        const summaryContent = document.getElementById('summary-content');
        if (summaryContent) {
            summaryContent.innerHTML = `
                <div class="summary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 15px;">
                    <div class="summary-box" style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                        <h4 style="margin-bottom: 8px; color: #333;">📦 Productos</h4>
                        <p>Activos: <strong>${productosActivos}</strong></p>
                        <p>Inactivos / Sin stock: <strong>${productosInactivos}</strong></p>
                    </div>
                    <div class="summary-box" style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                        <h4 style="margin-bottom: 8px; color: #333;">🏷️ Categorías</h4>
                        <p>Total Activas: <strong>${totalCategorias}</strong></p>
                    </div>
                    <div class="summary-box" style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                        <h4 style="margin-bottom: 8px; color: #333;">📋 Pedidos por Estado</h4>
                        <p>Pendientes: <strong>${pedidosPorEstado['PENDIENTE'] || 0}</strong></p>
                        <p>En Preparación: <strong>${pedidosPorEstado['EN_PREPARACION'] || 0}</strong></p>
                        <p>Confirmados: <strong>${pedidosPorEstado['CONFIRMADO'] || 0}</strong></p>
                        <p>Terminados: <strong>${pedidosPorEstado['TERMINADO'] || 0}</strong></p>
                        <p>Cancelados: <strong>${pedidosPorEstado['CANCELADO'] || 0}</strong></p>
                    </div>
                </div>
            `;
        }

    } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
    }
}

document.addEventListener('DOMContentLoaded', cargarDashboard);