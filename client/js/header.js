const registerBtn = document.querySelector(".register");
const loginBtn = document.querySelector(".login");
const exitBtn = document.querySelector(".exit");
const playBtn = document.querySelector(".play"); 
const leadersBtn = document.querySelector(".leaders-btn");
const logoBtn = document.querySelector(".logoRef");

let user = localStorage.getItem('user_session');
if (user !== null) {
  registerBtn.classList.add("hidden");
  loginBtn.classList.add("hidden");
  exitBtn.classList.remove("hidden");
}

if (registerBtn) {
  registerBtn.addEventListener('click', () => { 
    window.location.href = "register.html";
  })
}

if (loginBtn) {
  loginBtn.addEventListener('click', () => { 
    window.location.href = "login.html";
  })
}

if (exitBtn) {
  exitBtn.addEventListener('click', () => {
    localStorage.removeItem('user_session');
    registerBtn.classList.remove("hidden");
    loginBtn.classList.remove("hidden");
    exitBtn.classList.add("hidden");
    window.location.reload();
  })
}

if (playBtn) {
  playBtn.addEventListener('click', () => {
    window.location.href = "game.html"
  });
}

if (leadersBtn) {
  leadersBtn.addEventListener('click', () => {
    window.location.href = "leaderboard.html";
  })
}

if (logoBtn) {
  logoBtn.addEventListener('click', () => {
    window.location.href = "index.html";
  })
}


