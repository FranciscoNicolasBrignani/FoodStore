import { navigate } from "../../../utils/navigate";
import './login.css';

const form = document.getElementById("form") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;

form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();
  
  const valueEmail = inputEmail.value.trim();
  const valuePassword = inputPassword.value.trim();

  try {
    
    const response = await fetch('/data/usuarios.json');
    const users: any[] = await response.json();

   
    const usuarioEncontrado = users.find(
      (u) => u.mail === valueEmail && u.password === valuePassword
    );

    if (usuarioEncontrado) {
      
      const { password, ...usuarioSinPassword } = usuarioEncontrado;
      localStorage.setItem("userData", JSON.stringify(usuarioSinPassword));

      const rolUsuario = usuarioEncontrado.rol?.toLowerCase();

      if (rolUsuario === "admin" || rolUsuario === "ADMIN") {
        navigate("/src/pages/admin/adminHome/adminHome.html"); 
      } else {
        navigate("/src/pages/store/home/home.html"); 
      }

    } else {
      alert("Email o contraseña incorrectos");
    }

  } catch (error) {
    console.error("Error al procesar el login:", error);
    alert("Ocurrió un error al intentar iniciar sesión.");
  }
});