const socket = io();

const messageForm = document.getElementById("message-form");
const msg = document.getElementById("message-input");
const messageSection = document.querySelector(".message-section");
const userList = document.querySelector(".user-list");
const userTyping = document.querySelector(".user-typing");
const privateChatList = document.querySelector(".private-chat-list");

const websiteURL = document.URL;
const username = websiteURL.slice(
  websiteURL.indexOf("username=") + 9,
  websiteURL.indexOf("&")
);
const room = websiteURL.slice(websiteURL.indexOf("room=") + 5);

//Join room
socket.emit("join-room", { username, room });

socket.on("user-exists", () => {
  alert("User Already Exists");
  window.location.href = "http://localhost:3000/";
});

//get  room and users
socket.on("room-users", (roomusers) => {
  outputUsers(roomusers);
});

//output the new list to different places
function outputUsers(roomusers) {
  userList.innerHTML = `
    ${roomusers
      .map((user) => `<div class="user">${user.username}</div>`)
      .join("")} 
    `;

  // friendsPrivateChat.innerHTML = `
  //   ${roomusers
  //     .map(
  //       (user) =>
  //         `<a class="friend-link" onclick="openChatModal('${user.username}')">${user.username}</a>`
  //     )
  //     .join("")}`;

  privateChatList.innerHTML = "";
  let option = document.createElement("option");
  option.innerText = room;
  privateChatList.appendChild(option);
  roomusers.map((user) => {
    if (user.username != username) {
      var option1 = document.createElement("option");
      option1.innerText = user.username;
      privateChatList.appendChild(option1);
    }
  });
}

//when user sends a message
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let message = msg.value;
  let privateChat = privateChatList.value;

  let ownMessage = {
    username: username,
    text: message,
  };

  if (msg.value != "") {
    sendTheMessage(ownMessage);
    //send message to the server
    socket.emit("chat-message", { message, privateChat });
  }
  //scroll down automatically
  messageSection.scrollTop = messageSection.scrollHeight;
  msg.value = "";
});

socket.on("message", (user) => {
  sendTheMessage(user);
});

//send the message
function sendTheMessage(user) {
  if (user.username === username) {
    const newMessage = document.createElement("div");
    newMessage.classList.add("message");
    newMessage.classList.add("sent-message");
    newMessage.innerHTML = `<span class="message-sender">${user.username}</span>
  <div class="message-content">${user.text}</div>`;
    document.querySelector(".message-section").appendChild(newMessage);
  } else {
    const newMessage = document.createElement("div");
    newMessage.classList.add("message");
    newMessage.innerHTML = `<span class="message-sender">${user.username}</span>
  <div class="message-content">${user.text}</div>`;
    document.querySelector(".message-section").appendChild(newMessage);
  }
}

msg.addEventListener("keydown", function () {
  socket.emit("user-typing", `${username} is typing...`);
});
// msg.addEventListener("keyup", function () {
//   socket.emit("user-stopped-typing");
// });

socket.on("user-typing", (data) => {
  userTyping.textContent = data;
  setTimeout(() => {
    userTyping.textContent = "";
  }, 2000);
});
socket.on("user-stoppen-typing", (data) => {
  userTyping.textContent = "";
});
