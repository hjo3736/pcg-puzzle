import { generatePCGMap } from './Map.js';
import { createPuzzlePieces } from './Puzzle.js';
import { isPuzzleSolved, validateLocalConsistency } from './Validation.js';

const boardCanvas = document.getElementById('gameCanvas');
const boardCtx = boardCanvas.getContext('2d');
const piecesCanvas = document.getElementById('piecesCanvas');
const piecesCtx = piecesCanvas.getContext('2d');
const regenBtn = document.getElementById('regenBtn');
const checkBtn = document.getElementById('checkBtn');
const piecesInfo = document.getElementById('piecesInfo');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const helpClose = document.getElementById('helpClose');

let board = null;       
let pieces = [];        
let selectedPieceIndex = null;

const tileSize = 48;
const pieceTileSize = 40;

const dragState = {
  active: false,
  from: null,
  piece: null,
  pieceIndex: null,
  fromX: null,
  fromY: null,
  offsetX: 0,
  offsetY: 0,
  over: null,
  overX: 0,
  overY: 0,
};

function initGame() {
  const M = parseInt(document.getElementById('inputM').value) || 10;
  const N = parseInt(document.getElementById('inputN').value) || 10;
  const MAX_ROOMS = parseInt(document.getElementById('inputRooms').value) || 20;

  const gameMap = generatePCGMap(M, N, MAX_ROOMS);
  const result = createPuzzlePieces(gameMap);

  board = result.board;
  pieces = result.pieces;

  selectedPieceIndex = null;
  dragState.active = false;
  dragState.from = null;
  dragState.piece = null;

  // 보드 캔버스 크기
  boardCanvas.width = N * tileSize;
  boardCanvas.height = M * tileSize;

  // 조각 캔버스 (두 줄 정도)
  piecesCanvas.width = N * tileSize;
  piecesCanvas.height = pieceTileSize * 2;

  updatePiecesInfo();
  drawBoard();
  drawPiecesList();
}

function updatePiecesInfo() {
  piecesInfo.textContent = `Tiles left: ${pieces.length}`;
}

// === 보드 그리기 ===
function drawBoard() {
  if (!board) return;

  const M = board.length;
  const N = board[0].length;

  boardCtx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);

  for (let x = 0; x < M; x++) {
    for (let y = 0; y < N; y++) {
      const tile = board[x][y];
      const px = y * tileSize;
      const py = x * tileSize;

      // 바탕
      boardCtx.fillStyle = '#222';
      boardCtx.fillRect(px, py, tileSize, tileSize);

      if (!tile) {
        // 완전 빈 슬롯 (null)
        boardCtx.strokeStyle = '#444';
        boardCtx.lineWidth = 1;
        boardCtx.strokeRect(px, py, tileSize, tileSize);
        continue;
      }

      // 타입별 색상
      if (tile.type === 'start') {
        boardCtx.fillStyle = '#2ecc71';    // 초록
      } else if (tile.type === 'goal') {
        boardCtx.fillStyle = '#e74c3c';    // 빨강
      } else if (tile.type === 'hidden') {
        boardCtx.fillStyle = '#9b59b6';    // 보라
      } else if (tile.roomID !== -1) {
        // room: fixed / movable 구분
        boardCtx.fillStyle = tile.isFixed ? '#95a5a6' : '#3498db';
      }

      boardCtx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);

      // 문(doors)
      if (tile.doors) {
        boardCtx.strokeStyle = '#f1c40f';
        boardCtx.lineWidth = 2;
        const cx = px + tileSize / 2;
        const cy = py + tileSize / 2;

        boardCtx.beginPath();
        if (tile.doors[0]) { // N
          boardCtx.moveTo(cx, cy);
          boardCtx.lineTo(cx, py + 2);
        }
        if (tile.doors[1]) { // E
          boardCtx.moveTo(cx, cy);
          boardCtx.lineTo(px + tileSize - 2, cy);
        }
        if (tile.doors[2]) { // S
          boardCtx.moveTo(cx, cy);
          boardCtx.lineTo(cx, py + tileSize - 2);
        }
        if (tile.doors[3]) { // W
          boardCtx.moveTo(cx, cy);
          boardCtx.lineTo(px + 2, cy);
        }
        boardCtx.stroke();
      }

      // 고정 타일 테두리
      if (tile.isFixed) {
        boardCtx.strokeStyle = '#f39c12';
        boardCtx.lineWidth = 2;
        boardCtx.strokeRect(px + 3, py + 3, tileSize - 6, tileSize - 6);
      } else {
        boardCtx.strokeStyle = '#555';
        boardCtx.lineWidth = 1;
        boardCtx.strokeRect(px, py, tileSize, tileSize);
      }
    }
  }

  // 드래그 중이면 고스트(미리보기) 그리기
  drawDraggingGhostOnBoard();
}

// === 조각 리스트 그리기 ===
function drawPiecesList() {
  piecesCtx.clearRect(0, 0, piecesCanvas.width, piecesCanvas.height);

  if (!pieces || pieces.length === 0) return;

  const perRow = Math.max(1, Math.floor(piecesCanvas.width / pieceTileSize));

  pieces.forEach((piece, i) => {
    const col = i % perRow;
    const row = Math.floor(i / perRow);

    const px = col * pieceTileSize;
    const py = row * pieceTileSize;

    // 배경
    piecesCtx.fillStyle = '#111';
    piecesCtx.fillRect(px, py, pieceTileSize, pieceTileSize);

    // 조각
    piecesCtx.fillStyle = '#2980b9';
    piecesCtx.fillRect(px + 2, py + 2, pieceTileSize - 4, pieceTileSize - 4);

    // 문(doors)
    if (piece.doors) {
      piecesCtx.strokeStyle = '#f1c40f';
      piecesCtx.lineWidth = 2;
      const cx = px + pieceTileSize / 2;
      const cy = py + pieceTileSize / 2;

      piecesCtx.beginPath();
      if (piece.doors[0]) { // N
        piecesCtx.moveTo(cx, cy);
        piecesCtx.lineTo(cx, py + 2);
      }
      if (piece.doors[1]) { // E
        piecesCtx.moveTo(cx, cy);
        piecesCtx.lineTo(px + pieceTileSize - 2, cy);
      }
      if (piece.doors[2]) { // S
        piecesCtx.moveTo(cx, cy);
        piecesCtx.lineTo(cx, py + pieceTileSize - 2);
      }
      if (piece.doors[3]) { // W
        piecesCtx.moveTo(cx, cy);
        piecesCtx.lineTo(px + 2, cy);
      }
      piecesCtx.stroke();
    }

    // 선택 / 드래그중 강조
    if (i === selectedPieceIndex || (dragState.active && dragState.from === 'pieces' && dragState.pieceIndex === i)) {
      piecesCtx.strokeStyle = '#e67e22';
      piecesCtx.lineWidth = 3;
      piecesCtx.strokeRect(px + 1, py + 1, pieceTileSize - 2, pieceTileSize - 2);
    } else {
      piecesCtx.strokeStyle = '#555';
      piecesCtx.lineWidth = 1;
      piecesCtx.strokeRect(px, py, pieceTileSize, pieceTileSize);
    }
  });
}

// === 드래그 고스트 (보드 위에 미리보기) ===
function drawDraggingGhostOnBoard() {
  if (!dragState.active) return;
  if (dragState.over !== 'board') return;
  if (!dragState.piece) return;

  const piece = dragState.piece;

  const px = dragState.overX - dragState.offsetX;
  const py = dragState.overY - dragState.offsetY;

  boardCtx.save();
  boardCtx.globalAlpha = 0.6;

  // 바디
  boardCtx.fillStyle =
    piece.type === 'start' ? '#2ecc71' :
    piece.type === 'goal' ? '#e74c3c' :
    piece.type === 'hidden' ? '#9b59b6' :
    '#3498db';

  boardCtx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);

  // 번호
  if (piece.roomID !== -1) {
    boardCtx.fillStyle = '#fff';
    boardCtx.font = '12px monospace';
    boardCtx.textAlign = 'center';
    boardCtx.textBaseline = 'middle';
    boardCtx.fillText(
      piece.roomID.toString(),
      px + tileSize / 2,
      py + tileSize / 2
    );
  }

  // 문
  if (piece.doors) {
    boardCtx.strokeStyle = '#f1c40f';
    boardCtx.lineWidth = 2;
    const cx = px + tileSize / 2;
    const cy = py + tileSize / 2;

    boardCtx.beginPath();
    if (piece.doors[0]) {
      boardCtx.moveTo(cx, cy);
      boardCtx.lineTo(cx, py + 2);
    }
    if (piece.doors[1]) {
      boardCtx.moveTo(cx, cy);
      boardCtx.lineTo(px + tileSize - 2, cy);
    }
    if (piece.doors[2]) {
      boardCtx.moveTo(cx, cy);
      boardCtx.lineTo(cx, py + tileSize - 2);
    }
    if (piece.doors[3]) {
      boardCtx.moveTo(cx, cy);
      boardCtx.lineTo(px + 2, cy);
    }
    boardCtx.stroke();
  }

  boardCtx.restore();
}

// === 드래그 시작: 조각 리스트에서 ===
piecesCanvas.addEventListener('mousedown', (e) => {
  if (!pieces || pieces.length === 0) return;

  const rect = piecesCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const perRow = Math.max(1, Math.floor(piecesCanvas.width / pieceTileSize));
  const col = Math.floor(mx / pieceTileSize);
  const row = Math.floor(my / pieceTileSize);
  const idx = row * perRow + col;

  if (idx < 0 || idx >= pieces.length) return;

  const piece = pieces[idx];

  dragState.active = true;
  dragState.from = 'pieces';
  dragState.piece = piece;
  dragState.pieceIndex = idx;
  dragState.fromX = null;
  dragState.fromY = null;
  dragState.offsetX = mx - col * pieceTileSize;
  dragState.offsetY = my - row * pieceTileSize;
  dragState.over = 'pieces';
  dragState.overX = mx;
  dragState.overY = my;

  selectedPieceIndex = idx;
  drawPiecesList();
});

// === 드래그 시작: 보드에서 (이미 놓인 조각 이동) ===
boardCanvas.addEventListener('mousedown', (e) => {
  if (!board) return;

  const rect = boardCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const tileY = Math.floor(mx / tileSize); // col
  const tileX = Math.floor(my / tileSize); // row

  const M = board.length;
  const N = board[0].length;

  if (tileX < 0 || tileX >= M || tileY < 0 || tileY >= N) return;

  const tile = board[tileX][tileY];

  // fixed거나 빈 공간(roomID === -1)인 타일은 못 움직임
  if (!tile || tile.isFixed || tile.roomID === -1) return;

  dragState.active = true;
  dragState.from = 'board';
  dragState.piece = tile;
  dragState.pieceIndex = null;
  dragState.fromX = tileX;
  dragState.fromY = tileY;
  dragState.offsetX = mx - tileY * tileSize;
  dragState.offsetY = my - tileX * tileSize;
  dragState.over = 'board';
  dragState.overX = mx;
  dragState.overY = my;

  // 드래그 동안은 원래 자리 비워둠
  board[tileX][tileY] = null;

  drawBoard();
});

// === 드래그 이동 (전역) ===
window.addEventListener('mousemove', (e) => {
  if (!dragState.active) return;

  // 보드 내부인지 체크
  const boardRect = boardCanvas.getBoundingClientRect();
  if (
    e.clientX >= boardRect.left &&
    e.clientX <= boardRect.right &&
    e.clientY >= boardRect.top &&
    e.clientY <= boardRect.bottom
  ) {
    dragState.over = 'board';
    dragState.overX = e.clientX - boardRect.left;
    dragState.overY = e.clientY - boardRect.top;
    drawBoard();
    return;
  }

  // 조각 영역 내부인지 체크
  const piecesRect = piecesCanvas.getBoundingClientRect();
  if (
    e.clientX >= piecesRect.left &&
    e.clientX <= piecesRect.right &&
    e.clientY >= piecesRect.top &&
    e.clientY <= piecesRect.bottom
  ) {
    dragState.over = 'pieces';
    dragState.overX = e.clientX - piecesRect.left;
    dragState.overY = e.clientY - piecesRect.top;
    drawPiecesList();
    drawBoard();
    return;
  }

  // 어느 캔버스에도 없음
  dragState.over = null;
});

// === 드래그 끝 (전역) ===
window.addEventListener('mouseup', (e) => {
  if (!dragState.active) return;

  const from = dragState.from;
  const piece = dragState.piece;
  const pieceIndex = dragState.pieceIndex;
  const fromX = dragState.fromX;
  const fromY = dragState.fromY;

  let placed = false;

  // 1) 보드 위에서 놓으려고 한 경우
  const boardRect = boardCanvas.getBoundingClientRect();
  if (
    e.clientX >= boardRect.left &&
    e.clientX <= boardRect.right &&
    e.clientY >= boardRect.top &&
    e.clientY <= boardRect.bottom
  ) {
    const mx = e.clientX - boardRect.left;
    const my = e.clientY - boardRect.top;
    const tileY = Math.floor(mx / tileSize);
    const tileX = Math.floor(my / tileSize);

    const M = board.length;
    const N = board[0].length;

    if (tileX >= 0 && tileX < M && tileY >= 0 && tileY < N) {
      const target = board[tileX][tileY];

      // 고정 타일 위에는 못 놓음
      if (target && target.isFixed) {
        // 실패 → 아래에서 롤백
      }
      // 이미 다른 '방 조각'(movable room)이 있는 칸에도 못 놓게 막기
      else if (target && !target.isFixed && target.roomID !== -1) {
        // 실패 → 아래에서 롤백
      }
      else {
        // 여기서는 target 이
        // 1) null 이거나
        // 2) roomID === -1 (빈 공간 타일)
        // 인 경우만 옴

        if (from === 'pieces') {
          // 조각 리스트에서 가져온 경우: 문 일관성 검사 O
          const oldTile = target || null;

          const placedTile = {
            ...piece,
            x: tileX,
            y: tileY,
            isFixed: false,
          };
          board[tileX][tileY] = placedTile;

          if (validateLocalConsistency(board)) {
            placed = true;
            if (pieceIndex !== null) {
              pieces.splice(pieceIndex, 1);
            }
          } else {
            // 실패 → 롤백
            board[tileX][tileY] = oldTile;
          }
        } else if (from === 'board') {
          // 보드에서 끌어온 경우: 문 검증 없이 이동 허용
          const placedTile = {
            ...piece,
            x: tileX,
            y: tileY,
            isFixed: false,
          };
          board[tileX][tileY] = placedTile;
          placed = true;
        }
      }
    }
  }

  // 2) 보드 위에 제대로 못 놓았거나 / 캔버스 밖에 놓은 경우
  if (!placed) {
    if (from === 'board' && fromX !== null && fromY !== null) {
      // 원래 보드에서 끌어온 조각이면 원 위치 복구
      if (!board[fromX][fromY]) {
        board[fromX][fromY] = piece;
      }
    }
    // from === 'pieces' 인 경우에는 pieces 배열 그대로라서 추가 조치 필요 없음
  }

  // 드래그 상태 초기화
  dragState.active = false;
  dragState.from = null;
  dragState.piece = null;
  dragState.pieceIndex = null;
  dragState.fromX = null;
  dragState.fromY = null;
  dragState.over = null;

  selectedPieceIndex = null;

  updatePiecesInfo();
  drawBoard();
  drawPiecesList();
});

// === 버튼 ===
regenBtn.addEventListener('click', () => {
  initGame();
});

checkBtn.addEventListener('click', () => {
  const solved = isPuzzleSolved(board, pieces.length);
  if (solved) {
    alert('🎉 퍼즐 완성!');
  } else {
    alert('아직 정답이 아니야!');
  }
});

// === 플레이 방법 모달 ===
helpBtn.addEventListener('click', () => {
  helpModal.classList.remove('hidden');
});

helpClose.addEventListener('click', () => {
  helpModal.classList.add('hidden');
});

helpModal.addEventListener('click', (e) => {
  if (e.target === helpModal) {
    helpModal.classList.add('hidden');
  }
});

// 시작
initGame();
