import type { Productos, Categorias } from '../type/index';


export const PRODUCTOS: Productos[] = [
    {
        id: "1",
        nombre: "Hamburguesa Triple",
        descripcion: "Triple carne, Cheddar y bacon",
        precio: 25000,
        imagen:  "./img/hamburguesa.png",
        categoria: "Hamburguesas"
    },
    {
        id: "2",
        nombre: "Pizza Muzzarella",
        descripcion: "Salsa casera y oregano",
        precio: 18000,
        imagen: "./img/pizza.webp",
        categoria: "Pizzas"
    },
    {
        id: "3",
        nombre: "Papas comunes",
        descripcion: "Papas fritas con piel y sal",
        precio: 10000,
        imagen: "./img/papas.jpg",
        categoria: "Papas Fritas"
    },
    {
        id: "4",
        nombre: "Coca-Cola",
        descripcion: "Bebida cola",
        precio: 5000,
        imagen: "./img/kokakola.jpg",
        categoria: "Bebidas"
    }
];

export const CATEGORIAS: Categorias[] = [
    {id: "0", nombre: "Hamburguesas"},
    {id: "1", nombre: "Bebidas"},
    {id: "2", nombre: "Postres"},
];