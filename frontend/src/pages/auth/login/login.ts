import type { IUser, RUser } from "../../../type/IUser";
import type { Rol } from "../../../type/Rol";
import { navigate } from "../../../utils/navigate";
import './login.css';

const form = document.getElementById("form") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;
const selectRol = document.getElementById("rol") as HTMLSelectElement;


form.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();
  const valueEmail = inputEmail.value;
  const valuePassword = inputPassword.value;
  const valueRol = selectRol.value as Rol;
  const storedUsers = localStorage.getItem("users");
  const users: RUser[] = storedUsers ? JSON.parse(storedUsers) : [];

  const user: IUser = {
    email: valueEmail,
    role: valueRol,
    loggedIn: true,
  };
  
  const parseUser = JSON.stringify(user);
  localStorage.setItem("userData", parseUser);

  const usuarioEncontrado = users.find(
    (user) => user.email === valueEmail && user.password === valuePassword
  );

  if (usuarioEncontrado) {
    const userData = JSON.stringify(usuarioEncontrado);
    localStorage.setItem("userData", userData);

    if (valueRol === "admin") {
      navigate("/src/pages/admin/home/home.html"); 
    } else if (valueRol === "client") {
      navigate("/src/pages/client/home.html"); 
    }

  } else {
    alert("Usuario no encontrado");
  }
  

});

