import type { Rol } from "./Rol";

export interface IUser {
  email: string;
  loggedIn: boolean;
  role: Rol;
}

export interface RUser {
  email: String;
  password: String;
  role: Rol;
}
