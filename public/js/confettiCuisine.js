$(document).ready(() => {

  const socket = io("http://64.176.227.45:5050", {
    path: "/proxy/3000/socket.io/", // Explicitly set the correct path
  });                               // 새 사용자가 연결됐음을 서버에서 감지할수있도록 socket.io를 클라이언트측에서 초기화 
  
  $("#chatForm").submit(() => {
    let text = $("#chat-input").val();
    let userName = $("#chat-user-name").val();
    let userId = $("#chat-user-id").val();
    socket.emit("message", {
      content: text,
      userName: userName,
      userId: userId
    });
    $("#chat-input").val("");
    return false;
  });

//socket.on("message", ...): This sets up an event listener to handle the "message" event coming from the server.
  socket.on("message", message => { 
    displayMessage(message);
    for (let i = 0; i < 2; i++) {
      $(".chat-icon").fadeOut(200).fadeIn(200);
    }
  });

  socket.on("user disconnected", () => {
    displayMessage({
      userName: "Notice",
      content: "user left the chat"
    });
  });

  socket.on("load all messages", (data) => {
    data.forEach(message => displayMessage(message));
  });

  let displayMessage = message => {
    $("#chat").prepend($("<li>").html(
      `<strong class="message ${getCurrentUserClass(message.user)}">
      ${message.userName}
      </strong>: ${message.content}`)
    );
  };

  let getCurrentUserClass = (id) => {
    let userId = $("#chat-user-id").val();
    return userId === id ? "current-user": "";
  }
  $("#modal-button").click(() => {
    $(".modal-body").html("");
    $.get(`http://64.176.227.45:5050/proxy/3000/api/courses`, (results = {}) => {
      
      let data = results.data;
      if (!data || !data.courses) return;

      data.courses.forEach((course) => {
        $(".modal-body").append(
          `<div>
          <span class="course-title">
            ${course.title}
          </span>
          <button class="button ${course.joined ? "joined-button" : "join-button"} data-id="${course._id}">
          ${course.joined ? "Joined" : "Join"}
          </button>
          <div class="course-description">
            ${course.description}
          </div>
          </div>`
        );
      })
    }).then(() => {
      addJoinButtonListener();
    });
  });
});

let addJoinButtonListener = () => {
  $(".join-button").click(event => {
    let $button = $(event.target),
      courseId = $button.data("id");
    $.get(`http://64.176.227.45:5050/proxy/3000/api/courses/${courseId}/join`, (results = {}) => {
      let data = results.data;
      if (data && data.success) {
        $button
          .text("Joined")
          .addClass("joined-button")
          .removeClass("join-button");
      } else {
        $button.text("Try again");
      }
    });
  });
};