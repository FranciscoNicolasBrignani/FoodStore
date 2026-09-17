import type {ICartItem} from '../type/categoria';

const CART_KEY = "cart";

export const getCart = (): ICartItem[] => {
    const cartData = localStorage.getItem(CART_KEY);
    return cartData ? JSON.parse(cartData): [];
};

export const guardarCart = (items: ICartItem[]): void => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const cambiarCantidad = (id: number, cambio: number): void => {
        const items = getCart();
        const producto = items.find(item => item.id === id);
        if (!producto) return;

        producto.cantidad += cambio;

        if (producto.cantidad <= 0) {
            eliminarProducto(id);
            return;
        }

        guardarCart(items);
        
}

export const eliminarProducto = (id: number): void => {
        const items = getCart();
        const actualizarItem = items.filter(item => item.id !== id);
            guardarCart(actualizarItem);
}
