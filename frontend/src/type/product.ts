import type { ICategoria } from "./ICategoria";

export interface IProduct {
    id: number;
    eliminado: boolean;
    createdAt: string;
    nombre: string;
    precio: number;
    descripcion: string;
    stock: number;
    imagen: string;
    disponible: boolean;
    categorias: ICategoria[];
}