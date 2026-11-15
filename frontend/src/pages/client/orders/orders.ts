
5    9}
  subtotal: number;
  envio: number;
  total: number;
  mensajeEstado?: string; 
}

export interface UsuarioSesion {
  id: string | number;
  nombre: string;
  email?: string;
  [key: string]: any;
}