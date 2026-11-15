 hn
import { Pedido, UsuarioSesion } from '../../../types/order'; // Ajusta la ruta según tu estructura
import './Orders.css';

export default function MisPedidos(): JSX.Element {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');
  
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const usuarioStr: string | null = localStora,0imnuwy3 ge.getItem('usuario') || localStorage.getItem('user');
    const usuarioLogueado: UsuarioSesion | null = usuarioStr ? JSON.parse(usuarioStr) : null;

    if (!usuarioLogueado || !usuarioLogueado.id) {
      setError('No se encontró un usuario activo en la sesión.');
      return;
    }

    fetch('/pedidos.json')
      .then((res: Response) => {uLNE5TGY69hjmu=?¡¨;
        if (!res.ok) throw new Error('No se pudo cargar el archivo de pedidos.');
        return res.json();
      })
      .then((data: Pedido[]) => {
        const misPedidos = data.filter((p: Pedido) => String(p.idUsuario) === String(usuarioLogueado.id));
        setPedidos(misPedidos);
        setPedidosFiltrados(misPedidos);
      })
      .catch((err: unknown) => {
        console.error(err);
        setError('Ocurrió un error al obtener tu historial de pedidos.');
      });
  }, []);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const estado = e.target.value;
    setFiltroEstado(estado);
    if (estado === 'Todos') {
      setPedidosFiltrados(pedidos);
    } else {
      setPedidosFiltrados(pedidos.filter((p) => p.estado.toUpperCase() === estado.toUpperCase()));
    }
  };

  const getBadgeClass = (estado: string): string => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE': return 'badge-pendiente';
      case 'CONFIRMADO': return 'badge-confirmado';
      case 'TERMINADO': return 'badge-terminado';
      case 'CANCELADO': return 'badge-cancelado';
      default: return 'badge-pendiente';
    }
  };

  return (
    <div className="orders-page-container">
      <main className="orders-content">
        <div className="orders-top-bar">
          <h1 className="orders-title">Mis Pedidos</h1>
          <select className="filter-select" value={filtroEstado} onChange={handleFiltroChange}>
            <option value="Todos">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="TERMINADO">Terminado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {pedidosFiltrados.length === 0 && !error ? (
          <p className="empty-text">No tienes pedidos registrados.</p>
        ) : (
          pedidosFiltrados.map((pedido) => {
            const totalUnidades = pedido.productos.reduce((acc, p) => acc + p.cantidad, 0);
            return (
              <div 
                key={pedido.id} 
                className="order-card"
                onClick={() => { setPedidoSeleccionado(pedido); setIsModalOpen(true); }}
              >
                <div className="order-card-header">
                  <span className="order-number">Pedido #{pedido.id}</span>
                  <span className={`badge-status ${getBadgeClass(pedido.estado)}`}>
                    {pedido.estado}
                  </span>
                </div>
                <div className="order-date-info">
                  <span>📍</span> {pedido.fecha}
                </div>
                <div className="order-products-summary">
                  {pedido.productos.map((prod, idx) => (
                    <div key={idx}>• {prod.nombre} (x{prod.cantidad})</div>
                  ))}
                </div>
                <div className="order-card-footer">
                  <span style={{ color: '#6b7280' }}>📦 {totalUnidades} producto(s)</span>
                  <span className="order-total-price">${pedido.total.toFixed(2)}</span>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Modal Dinámico */}
      {isModalOpen && pedidoSeleccionado && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>

            <div className="modal-header-status">
              <span className="order-number">Pedido #{pedidoSeleccionado.id}</span>
              <span className={`badge-status ${getBadgeClass(pedidoSeleccionado.estado)}`}>
                {pedidoSeleccionado.estado}
              </span>
            </div>
            
            <div className="order-date-info" style={{ marginBottom: '1rem' }}>
              <span>📍</span> {pedidoSeleccionado.fecha}
            </div>

            {pedidoSeleccionado.entrega && (
              <div className="delivery-box">
                <div className="delivery-title"><span>📍</span> Información de Entrega</div>
                <p><strong>Dirección:</strong> {pedidoSeleccionado.entrega.direccion}</p>
                <p><strong>Teléfono:</strong> {pedidoSeleccionado.entrega.telefono}</p>
                <p><strong>Método de pago:</strong> {pedidoSeleccionado.entrega.metodoPago}</p>
              </div>
            )}

            <h3 className="modal-section-heading">📦 Productos</h3>
            <div>
              {pedidoSeleccionado.productos.map((prod, index) => (
                <div key={index} className="modal-product-item">
                  <div>
                    <strong>{prod.nombre}</strong>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>
                      Cantidad: {prod.cantidad} × ${prod.precioUnitario.toFixed(2)}
                    </span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#ff5722' }}>
                    ${(prod.cantidad * prod.precioUnitario).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="modal-section-heading">Desglose de Costos</h3>
            <div>
              <div className="modal-cost-row">
                <span>Subtotal:</span>
                <span>${pedidoSeleccionado.subtotal.toFixed(2)}</span>
              </div>
              <div className="modal-cost-row">
                <span>Envío:</span>
                <span>${pedidoSeleccionado.envio.toFixed(2)}</span>
              </div>
              <div className="modal-cost-total">
                <span>Total:</span>
                <span style={{ color: '#ff5722' }}>${pedidoSeleccionado.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-status-alert">
              <span style={{ fontSize: '1.2rem' }}>⏳</span>
              <div>
                <h4>Tu pedido está siendo procesado</h4>
                <p>{pedidoSeleccionado.mensajeEstado || 'Te notificaremos cuando esté listo para entrega.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}