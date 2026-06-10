const canvas = document.getElementById("board");
const ctx = canvas.getContext('2d');

const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');


offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;

const size = canvas.height / 8;
const piece_size = size;

const DEBUG = true;
let my_turn = false;
let white = false;
let draw_offer = false;
let fen = "";

let turn_from = undefined;
let turn_to = undefined;

const piecesIcons = {};
const pieceSymbols = 'pnbrqkPNBRQK';

let isDragging = false;
let draggedPiece = null;
let dragX = 0;
let dragY = 0;
let dragSourceCell = null;

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawBoard() {
  offscreenCtx.fillStyle = "#F8E1E1";
  offscreenCtx.fillRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 !== 1) continue;
      offscreenCtx.fillStyle = "#49337B";
      offscreenCtx.fillRect(col * size, row * size, size, size);
    }
  }
}

function getPieceImage(piece) {
  switch (piece) {
    case 'p': return 'res/b_pawn.svg';
    case 'n': return 'res/b_knight.svg';
    case 'b': return 'res/b_bishop.svg';
    case 'r': return 'res/b_rook.svg';
    case 'q': return 'res/b_queen.svg';
    case 'k': return 'res/b_king.svg';
    case 'P': return 'res/w_pawn.svg';
    case 'N': return 'res/w_knight.svg';
    case 'B': return 'res/w_bishop.svg';
    case 'R': return 'res/w_rook.svg';
    case 'Q': return 'res/w_queen.svg';
    case 'K': return 'res/w_king.svg';
    default: break;
  }
}

function loadImages(callback) {
  let loadedCount = 0;
  for (const char of pieceSymbols) {
    const img = new Image();
    img.onload = function () {
      loadedCount++;
      if (loadedCount === pieceSymbols.length) callback();
    };
    img.src = getPieceImage(char);
    piecesIcons[char] = img;
  }
}

function drawPiece(piece, x, y) {
  const img = piecesIcons[piece];
  if (img) {
    // const k = (size - piece_size) / 2;
    offscreenCtx.drawImage(img, x * size, y * size, piece_size, piece_size);
  }
}

function drawFEN(currentFen, isWhite, skipCell = null) {
  if (!currentFen) return;
  const placement = currentFen.split(' ')[0];
  const ranks = placement.split('/');

  if (!isWhite) ranks.reverse();

  ranks.forEach((rank, y) => {
    let x = 0;
    const cells = isWhite ? rank.split('') : rank.split('').reverse();

    for (const char of cells) {
      if (/[0-9]/.test(char)) {
        x += parseInt(char);
      } else {
        const currentCellX = isWhite ? x : 7 - x;
        const currentCellY = isWhite ? y : 7 - y;
        const currentCellIndex = currentCellY * 8 + currentCellX;
       

        if (currentCellIndex !== skipCell) {
          drawPiece(char, x, y)
        } 
        x++;
      }
    }
  });
}

function drawGame(currentFen, isWhite) {
  clearCanvas();
  drawBoard();
  drawFEN(currentFen, isWhite, isDragging ? dragSourceCell : null);
  ctx.drawImage(offscreenCanvas, 0, 0);

  if (isDragging && draggedPiece) {
    const img = piecesIcons[draggedPiece];
    if (img) {
      ctx.drawImage(img, dragX - piece_size / 2, dragY - piece_size / 2, piece_size + 10, piece_size + 10);
    }
  }
}

function getPieceAtCell(cellIndex, currentFen) {
  if (!currentFen) return;

  const placement = currentFen.split(' ')[0];
  const ranks = placement.split('/');

  const targetX = cellIndex % 8;
  const targetY = (cellIndex / 8) | 0;

  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  ranks.forEach((rank, y) => {
    let x = 0;
    for (const char of rank.split('')) {
      if (/[0-9]/.test(char)) {
        x += parseInt(char);
      } else {
        board[y][x] = char;
        x++;
      }
    }
  });

  return board[targetY][targetX];
}

const drawMsg = document.querySelector(".draw-message"); 

function showDrawRequestStatus() {
  drawMsg.classList.remove("hidden");
}

function hideDrawRequestStatus() {
  drawMsg.classList.add("hidden");
}

const drawOfferMsg = document.querySelector(".draw-offer-message");

function showDrawOffer() {
  drawOfferMsg.classList.remove("hidden");
}

function hideDrawOffer() {
  drawOfferMsg.classList.add("hidden");
}

const wonModal = document.querySelector('#wonModal');
const loseModal = document.querySelector('#loseModal');
const drawModal = document.querySelector('#drawModal');
const resignModal = document.querySelector("#resignModal");
const mainContent = document.querySelector('.main-container');

function showWonModal(rating, rating_change) {
  const modalBody = wonModal.querySelector(".modal-body");
  const scoreMain = modalBody.querySelector(".score-main");
  const scoreChange = modalBody.querySelector(".score-plus");
  scoreMain.textContent = rating;
  scoreChange.textContent = rating_change;
  mainContent.classList.add('content-disable');
  wonModal.show();
}

function hideModals() {
  mainContent.classList.remove('content-disable');
  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal) => {
    modal.close();
  })
}

function showLoseModal(rating, rating_change) {
  const modalBody = loseModal.querySelector(".modal-body");
  const scoreMain = modalBody.querySelector(".score-main");
  const scoreChange = modalBody.querySelector(".score-plus");
  scoreMain.textContent = rating;
  scoreChange.textContent = rating_change;
  mainContent.classList.add('content-disable');
  loseModal.show();
}

function showDrawModal(rating, rating_change) {
  const modalBody = drawModal.querySelector(".modal-body");
  const scoreMain = modalBody.querySelector(".score-main");
  const scoreChange = modalBody.querySelector(".score-plus");
  scoreMain.textContent = rating;
  scoreChange.textContent = rating_change;
  mainContent.classList.add('content-disable');
  drawModal.show();
}

function showResignModal() {
  mainContent.classList.add('content-disable');
  resignModal.show();
}

function hideResignModal() {
  mainContent.classList.remove('content-disable');
  resignModal.close();
}


function renderPromotionMenu(pieces, squareIndex) {
    const rect = canvas.getBoundingClientRect();
    let { x, y } = getPixelPosition(squareIndex);

    const menu = document.getElementById('promotion-menu');
    menu.innerHTML = '';

    pieces.forEach(p => {
        const img = document.createElement('img');
        img.src = getPieceImage(p);
        img.className = 'promo-option';
        img.alt = p;
        
        img.onclick = () => {
            handlePromotionSelection(p); 
            menu.style.display = 'none';
        };
        
        menu.appendChild(img);
    });

    menu.style.display = 'flex';
    menu.style.left = (rect.left + x) + `px`;
    menu.style.top = (rect.top + y) + `px`;
}

function handlePromotionSelection(p) {
  sendRequest({
    action: "game.promote",
    selection: p
  });
}

function getPixelPosition(squareIndex) {
    const col = squareIndex % 8;
    const row = Math.floor(squareIndex / 8);

    return {
        x: col * 64,
        y: row * 64
    };
}

function socketOpenHandler() {
  sendRequest({
    action: "auth",
    id: userData.id
  });
 
}

let socket;

function connect() {
  socket = new WebSocket(`${window.APP_CONFIG.WS_URL}`);

  socket.onopen = () => {
    socketOpenHandler();
  };
  
  socket.onmessage = (event) => {
    if (DEBUG) console.log(event.data);
    requestHandler(event);
  };

  socket.onerror = (error) => {
    console.error("Socket error:", error.message);
  };
  
  socket.onclose = () => {
  };
}

function sendRequest(data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

const userSession = localStorage.getItem('user_session');
const userData = JSON.parse(userSession);

function sendDrawOffered() {
  sendRequest({
    action: "game.draw.offer"
  });
}

function getFen() {
  sendRequest({ action: "game.state" });
}

const loader = document.querySelector('.loader-wrapper');
function showLoader() {
  loader.classList.remove('hidden');
}

function hideLoader() {
  loader.classList.add('hidden');
}


function requestHandler(data) {
  const request = JSON.parse(data.data);
 
  console.log(request);
  switch (request.action) {
    case 'connection.close':
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
        window.location.href = "index.html";
      }
      break;
    case 'game.opponent.waiting':
      showLoader();
      break;
    case 'game.start':
      hideLoader();
      getFen();
      break;
    case 'game.player.info':
      player_data_handler(request);
      break;
    case 'game.opponent.info':
      enemy_data_handler(request);
      break;
    case 'game.opponent.disconnect':
      showCountdownOverlay(request.timeout);
      break;
    case 'game.opponent.reconnected':
      hideCountdownOverlay();
      break;

    case 'game.state':
      hideDrawRequestStatus(); 
      white = request.isWhite;
      fen = request.fen;
      if (Object.keys(piecesIcons).length === 0) {
        loadImages(() => drawGame(fen, white));
      } else {
        drawGame(fen, white);
      } 
      break;
    case 'game.move.success':
      getFen();
      resetDrag();
      break;
    case 'game.move.illegal':
      resetDrag();
      break;
    case 'game.turn.status':
      my_turn = request.is_my_turn;
      break;
    case "game.over":
      gameOverHandler(request);
      break;
    case "game.draw.cancel": 
      hideDrawRequestStatus();
      hideDrawOffer();
      break;
    case "game.draw.offer":
      showDrawOffer();
      hideDrawRequestStatus();
      break;
    case "game.promote.options":
      renderPromotionMenu(request.options[0], request.square_index);
    default:
      break;
  }
}

const enemy = document.querySelector(".enemy"); 
const enemy_name = enemy.querySelector(".player-name");
const enemy_rating = enemy.querySelector(".player-rating");

const me = document.querySelector(".me");
const my_name = me.querySelector(".player-name");
const my_rating = me.querySelector(".player-rating");

function enemy_data_handler(data) {
  enemy_name.textContent = data.username;
  enemy_rating.textContent = data.elo;
}

function player_data_handler(data) {
  my_name.textContent = data.username;
  my_rating.textContent = data.elo;
}

function getCellFromCoords(clientX, clientY, isWhite) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = clientX - rect.left;
  const mouseY = clientY - rect.top;

  let col = (mouseX / size) | 0;
  let row = (mouseY / size) | 0;

  if (!isWhite) {
    col = 7 - col;
    row = 7 - row;
  }

  if (col < 0 || col > 7 || row < 0 || row > 7) return null;
  
  return row * 8 + col;
}

function gameOverHandler(data) {
  switch (data.result) {
    case "WIN":
      showWonModal(data.rating, data.rating_change)
      break;
    case "LOSE":
      showLoseModal(data.rating, data.rating_change);
      break;
    case "DRAW":
      showDrawModal(data.rating, data.rating_change);
      break;
    default:
      break;
  }
}

canvas.addEventListener('mousedown', (e) => {
  const cell = getCellFromCoords(e.clientX, e.clientY, white);
  if (cell === null) return;

  const piece = getPieceAtCell(cell, fen);
  
  if (piece) {
    const isWhitePiece = piece === piece.toUpperCase();
    if (isWhitePiece !== white) return; 

    isDragging = true;
    draggedPiece = piece;
    dragSourceCell = cell;
    turn_from = cell; 
    const rect = canvas.getBoundingClientRect();
    dragX = e.clientX - rect.left;
    dragY = e.clientY - rect.top;

    drawGame(fen, white);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const rect = canvas.getBoundingClientRect();
  dragX = e.clientX - rect.left;
  dragY = e.clientY - rect.top;

  drawGame(fen, white);
});


function resetDrag() {
  isDragging = false;
  isWaitingForServer = false;
  draggedPiece = null;
  dragSourceCell = null;
  drawGame(fen, white);
}

window.addEventListener('mouseup', (e) => {
  if (!isDragging) return;

  const targetCell = getCellFromCoords(e.clientX, e.clientY, white);
  
  if (targetCell === null || targetCell === dragSourceCell || !my_turn) {
    resetDrag();
    return;
  }

  turn_to = targetCell;
  const data = {
    action: "game.move",
    from: dragSourceCell,
    to: turn_to
  };
    
  sendRequest(data);
});

let countdownTimer = null;
let currentSeconds = 30;

const rec_overlay = document.getElementById('reconnect-overlay');
function showCountdownOverlay(time) {
  rec_overlay.classList.remove('hidden');
  startCountdown(time);
}

function hideCountdownOverlay() {
  rec_overlay.classList.add('hidden');
  clearInterval(countdownTimer);
}


function startCountdown(seconds) {
    const timerDisplay = document.getElementById('reconnect-timer');
    currentSeconds = seconds;
    
    timerDisplay.innerText = `Waiting for opponent: ${currentSeconds}s`;

    if (countdownTimer) clearInterval(countdownTimer);

    countdownTimer = setInterval(() => {
        currentSeconds--;

        if (currentSeconds > 0) {
            timerDisplay.innerText = `Waiting for opponent: ${currentSeconds}s`;
        } else {
            clearInterval(countdownTimer);
            timerDisplay.innerText = "Time is up!";
            handleTimeout();
        }
    }, 1000);
}

function handleTimeout() {
}

const homeButton = document.querySelectorAll('.homeButton');
homeButton.forEach((btn) => {
  btn.addEventListener('click', () => {
    window.location.href = "index.html";
  })
});

const gameBtns = document.querySelectorAll('.gameButton');
gameBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    hideModals();
    connect();
  });
});;

const drawBtn = document.getElementById("draw");
if (drawBtn) {
  drawBtn.addEventListener('click', () => {
    sendDrawOffered();
    showDrawRequestStatus();
  });
}

const withDrawBtn = document.getElementById("withdraw");
if (withDrawBtn) {
  withDrawBtn.addEventListener('click', () => {
    sendRequest( {action: "game.draw.cancel"} );
    hideDrawRequestStatus();
    hideDrawOffer();
  });
}

const acceptDrawBtn = document.getElementById("accept-draw");
if (acceptDrawBtn) {
  acceptDrawBtn.addEventListener('click', () => {
    sendRequest( {action: "game.draw.accept"} );
    hideDrawRequestStatus();
    hideDrawOffer();

  });
}

const declineDrawBtn = document.getElementById("decline-draw");
if (declineDrawBtn) {
  declineDrawBtn.addEventListener('click', () => {
    sendRequest( {action: "game.draw.cancel"} );
    hideDrawRequestStatus();
    hideDrawOffer();
  });
}

const resignBtns = document.querySelectorAll(".resign-btn");
resignBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    showResignModal();
  });
});

const resignCancel = document.querySelector(".stayBtn");
if (resignCancel) {
  resignCancel.addEventListener('click', () => {
    hideResignModal();
  });
}

const resignAccept = document.querySelector(".resignBtn");
if (resignAccept) {
  resignAccept.addEventListener('click', () => {
    sendRequest({action: "game.resign"});
    hideResignModal();
  });
}

connect();
