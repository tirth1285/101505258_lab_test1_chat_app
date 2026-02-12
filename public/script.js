const socket = io();
let currentRoom;

/* ---------------- SIGNUP ---------------- */
async function signup() {

    const res = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: document.getElementById("username").value,
            firstname: document.getElementById("firstname").value,
            lastname: document.getElementById("lastname").value,
            password: document.getElementById("password").value
        })
    });

    if(res.ok){
        alert("Signup successful");
        window.location.href = "login.html";
    } else {
        alert("Username already exists");
    }
}

/* ---------------- LOGIN ---------------- */
async function login() {

    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
        })
    });

    if(res.ok){
        localStorage.setItem("user", document.getElementById("username").value);
        window.location.href = "chat.html";
    } else {
        alert("Invalid login");
    }
}

/* ---------------- JOIN ROOM ---------------- */
function joinRoom(){

    currentRoom = document.getElementById("room").value;
    socket.emit("joinRoom", currentRoom);
}

/* ---------------- SEND MESSAGE ---------------- */
function sendMsg(){

    const data = {
        from_user: localStorage.getItem("user"),
        room: currentRoom,
        message: document.getElementById("msg").value
    };

    socket.emit("chatMessage", data);

    document.getElementById("msg").value = "";
}

/* ---------------- RECEIVE MESSAGE ---------------- */
socket.on("message", data => {

    const chat = document.getElementById("chat");

    chat.innerHTML += `
        <p class="message">
            <b>${data.from_user}:</b> ${data.message}
        </p>
    `;

});

/* ---------------- TYPING INDICATOR ---------------- */
function typing(){

    socket.emit("typing", currentRoom);
}

socket.on("typing", () => {

    const typingText = document.getElementById("typing");

    typingText.innerText = "Someone is typing...";

    setTimeout(() => {
        typingText.innerText = "";
    }, 1000);

});