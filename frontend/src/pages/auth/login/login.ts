import { navigate } from "../../../utils/navigate";
import './login.css';

const form = document.getElementById("form") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;

form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();
  
  const valueEmail = inputEmail.value.trim();
  const valuePassword = inputPassword.value.trim();

  if (!valueEmail || !valuePassword) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    //Obtener usuarios estáticos del JSON
    const response = await fetch('/data/usuarios.json');
    const usersJson: any[] = await response.json();

    //Obtener usuarios registrados dinámicamente en localStorage
    const storedUsers = localStorage.getItem('users');
    const usersLocal: any[] = storedUsers ? JSON.parse(storedUsers) : [];

    //Unir ambos listados
    const todosLosUsuarios = [...usersJson, ...usersLocal];

    //Buscar coincidencia (soportando 'mail' o 'email')
    const usuarioEncontrado = todosLosUsuarios.find(
      (u) => (u.mail || u.email)?.toLowerCase() === valueEmail.toLowerCase() && u.password === valuePassword
    );

    if (usuarioEncontrado) {
      const { password, ...usuarioSinPassword } = usuarioEncontrado;
      
      //Normalizamos el rol en minúsculas para evitar errores de validación en adminHome
      const rolNormalizado = (usuarioEncontrado.rol || usuarioEncontrado.role || 'usuario').toLowerCase();
      
      const sessionData = {
        ...usuarioSinPassword,
        role: rolNormalizado === 'admin' ? 'admin' : 'client',
        loggedIn: true
      };

      localStorage.setItem("userData", JSON.stringify(sessionData));

      if (rolNormalizado === "admin") {
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