const mainButtons = document.querySelector('.main-buttons');
const connectBtn = document.getElementById("connect");

const modal = document.querySelector(".modal");
const signInBtn = document.querySelector(".sign_in");
const signUpBtn = document.querySelector(".sign_up");
const editBtn = document.querySelector(".edit-button");


const username = document.querySelector(".username-text");
const email = document.querySelector(".email");
const elo = document.querySelector(".elo");

async function account_handler(user) {
  try {
    const savedUser = await get_user_info(JSON.parse(user).id);
    if (!savedUser) return;

    console.log(savedUser);
    if (username && savedUser.username) {
      username.textContent = savedUser.username + " ";
    }

    if (email && savedUser.email) {
      email.textContent = "(" + savedUser.email + ")";
    }

    if (elo && savedUser.elo) {
      elo.textContent = "ELO (" + savedUser.elo + ")";
    }

  } catch (error) {
    console.error("Error: ", error);
  }
}

async function editUserResponse(newUsername) {
  try {
    const response = await fetch(`${window.APP_CONFIG.API_URL}/api/username`, {
      method: 'POST',
      headers: {'Content-Type': "application/json"},
      body: JSON.stringify({
        username: newUsername,
        id: JSON.parse(userSession).id
      })
    });

    const result = await response.json();

    return handle_edited_user(result, newUsername);
    
  } catch (error) {
    console.error("Submition failed: ", error);
  }

}

function handle_edited_user(data, username) {
  if (data.success == false) {
    return false;
  }

  const userData = JSON.parse(userSession);
  userData.username = username;

  localStorage.setItem('user_session', JSON.stringify(userData));

  return true;
}

async function get_user_info(userId) {
  try {
    const response = await fetch(`${window.APP_CONFIG.API_URL}/api/user/profile?id=${userId}`, {
      method: 'GET',
      headers: {'Content-Type': "application/json"}
    });

    const result = await response.json();
    console.log(result);

    if (result.success === true) {
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Submition failed: ", error);
  }
}


async function getGamesHistory(userId) {
  try {
    const response = await fetch(`${window.APP_CONFIG.API_URL}/api/game/history?id=${userId}`, {
      method: 'GET',
      headers: {'Content-Type': "application/json"}
    });

    const result = await response.json();

    historyData = result;
    await renderCurrentPage(7);
    console.log("Game history: ", result);
  } catch (error) {
    console.error("Submition failed: ", error);
  }
}

let currentPage = 1;
let historyData;
async function renderCurrentPage(pageSize = 5) {
  if (!historyData) return;

  await handle_game_history(historyData, currentPage, pageSize);

  const games = Object.values(historyData.games|| {});
  const totalPages = Math.ceil(games.length / pageSize) || 1;

  const container = document.getElementById("pagination-numbers");
  container.innerHTML = '';

  let pages = new Set([1, totalPages]);
  pages.add(currentPage);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  let sortedPages = Array.from(pages).sort((a, b) => a - b);

  let finalPages = [];
  for (let i = 0; i < sortedPages.length; i++) {
    if (i > 0 && sortedPages[i] - sortedPages[i - 1] > 1) {
      finalPages.push('...');
    }
    finalPages.push(sortedPages[i]);
  }

  finalPages.forEach(page => {
    const btn = document.createElement('button');
    btn.innerText = page;

    if (page === '...') {
      btn.disable = true;
      btn.classList.add('dots');
    } else {
      if (page === currentPage) btn.classList.add('active');
      btn.addEventListener("click", () => {
        currentPage = page;
        renderCurrentPage(7);
      });
      container.appendChild(btn);
    }
  });
}

async function handle_game_history(data, currentPage = 1, pageSize = 5) {
  const tbody = document.getElementById("history-body");
  tbody.innerHTML = '';

  const games = Object.values(data.games || {});
  games.reverse();
  if (games.length === 0) return; 

  const thead = document.getElementById("history-head");
  thead.innerHTML = '<tr><th>Players</th><th>Moves</th><th>Result</th></tr>';

  let firstIndex = (currentPage - 1) * pageSize;
  let lastIndex = firstIndex + pageSize;
  const pageGames = games.slice(firstIndex, lastIndex);

  const userData = JSON.parse(userSession);

  for (let i = 0; i < pageGames.length; i++) {
    const game = pageGames[i];
    const row = document.createElement("tr");
    row.classList.add("row-slide");
    row.style.animationDelay = `${i * 0.15}s`;

    if (i % 2 === 0) {
      row.classList.add("primary-color");
    }

    let resultStr = '<span class="result-icon draw">-</span>';
    if (game.winnerId) {
      resultStr = (userData.id == game.winnerId) 
        ? '<span class="result-icon win">✅</span>' 
        : '<span class="result-icon loss">❌</span>';
    }

    const enemyId = game.players.white === userData.id ? game.players.black : game.players.white;
    const enemyElo = game.players.white === enemyId ? game.white_elo : game.black_elo;
    const myElo = game.players.white === userData.id ? game.white_elo : game.black_elo;


    const my_info = await get_user_info(userData.id);
    const enemy_info = await get_user_info(enemyId);

    row.innerHTML = `
      <td>
        <div>${my_info.username} (${myElo})</div>
        <div>${enemy_info.username} (${enemyElo})</div>
      </td>
      <td>${game.moves}</td>
      <td>${resultStr}</td>
    `;

    tbody.appendChild(row);
  }

}

const userSession = localStorage.getItem('user_session');
if (userSession !== null) {
  account_handler(userSession);
  editBtn.classList.remove("hidden");

  getGamesHistory(JSON.parse(userSession).id);
}

if (connectBtn) {
  if (userSession !== null) {
    connectBtn.addEventListener('click', () => {
      window.location.href = "game.html";
    });
  } else {
    connectBtn.addEventListener('click', () => {
      modal.show();
    });
  }
}

if (signInBtn) {
  signInBtn.addEventListener('click', () => {
    window.location.href = "login.html";
  });
}

if (signUpBtn) {
  signUpBtn.addEventListener('click', () => {
    window.location.href = "register.html";
  });
}

const usernameText = document.querySelector(".username-text");
const usernameInput = document.getElementById("username-input");
if (editBtn) {
  editBtn.addEventListener('click', () => {
    usernameInput.value = usernameText.textContent;
    usernameText.classList.add("hidden");
    usernameInput.classList.remove("hidden");
    usernameInput.focus();
  });
}

if (usernameInput) {
  usernameInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      const edited = await editUserResponse(usernameInput.value);
      if (edited) {
        usernameText.textContent = usernameInput.value;
      }
      usernameInput.classList.add("hidden");
      usernameText.classList.remove("hidden");
    }
  });
  usernameInput.addEventListener('blur', () => {
    usernameInput.value = usernameText.textContent; 
  
    usernameInput.classList.add("hidden");
    usernameText.classList.remove("hidden");
  });
}

