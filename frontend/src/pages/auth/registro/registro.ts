import type { RUser } from "../../../type/IUser";

const form = document.getElementById("form_registro") as HTMLFormElement;
const registerEmail = document.getElementById("email") as HTMLInputElement;
const registroPassword = document.getElementById("password") as HTMLInputElement;



let users: RUser[] = [];

form.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();

    const valueEmail = registerEmail.value;
    const valuePassword = registroPassword.value;

    const newUser: RUser = {
        email: valueEmail,
        password: valuePassword,
        role: "client",
    };

    const storedUsers = localStorage.getItem("users");
    
    if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        users = Array.isArray(parsed) ? parsed : [];
    }else{
        users = [];
    }

    users.push(newUser);
    
    localStorage.setItem("users", JSON.stringify(users));
    form.reset();
});

