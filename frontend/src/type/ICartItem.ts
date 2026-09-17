import type { IProduct } from "./product";

export interface ICartItem extends IProduct {
    cantidad: number;
}