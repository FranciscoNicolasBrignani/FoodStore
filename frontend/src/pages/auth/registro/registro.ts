import { navigate } from "../../../utils/navigate";

const form = document.getElementById("form_registro") as HTMLFormElement;
const registerNombre = document.getElementById("nombre") as HTMLInputElement;
const registerEmail = document.getElementById("email") as HTMLInputElement;
const registroPassword = document.getElementById("password") as HTMLInputElement;

form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();

  const valueNombre = registerNombre ? registerNombre.value.trim() : "Cliente";
  const valueEmail = registerEmail.value.trim();
  const valuePassword = registroPassword.value.trim();

  //Validaciones
  if (!valueNombre || !valueEmail || !valuePassword) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(valueEmail)) {
    alert("Por favor, ingresa un email con formato válido.");
    return;
  }

  if (valuePassword.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  try {
    const response = await fetch("/data/usuarios.json");
    const usuariosJson: any[] = await response.json();

    const storedUsers = localStorage.getItem("users");
    const usuariosLocales: any[] = storedUsers ? JSON.parse(storedUsers) : [];

    const todosLosUsuarios = [...usuariosJson, ...usuariosLocales];

   
    const emailExiste = todosLosUsuarios.some(
      (u) => (u.mail || u.email)?.toLowerCase() === valueEmail.toLowerCase()
    );

    if (emailExiste) {
      alert("Este correo electrónico ya se encuentra registrado.");
      return;
    }

    //Crear el nuevo usuario con rol USUARIO y estructura compatible con el JSON
    const nuevoId =
      todosLosUsuarios.length > 0
        ? Math.max(...todosLosUsuarios.map((u) => Number(u.id) || 0)) + 1
        : 3;

    const newUser = {
      id: nuevoId,
      nombre: valueNombre,
      apellido: "",
      mail: valueEmail,
      celular: "",
      password: valuePassword,
      rol: "USUARIO",
      role: "client", //Compatibilidad con tus interfaces previas
    };

    usuariosLocales.push(newUser);
    localStorage.setItem("users", JSON.stringify(usuariosLocales));

    //Auto-login después del registro exitoso (sin guardar password en userData)
    const { password, ...usuarioSesion } = newUser;
    localStorage.setItem("userData", JSON.stringify(usuarioSesion));

    form.reset();
    navigate("/src/pages/store/home/home.html");
  } catch (error) {
    console.error("Error durante el registro:", error);
    alert("Ocurrió un error al registrar el usuario.");
  }
});