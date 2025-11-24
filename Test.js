import { generatePCGMap } from './Map.js';
import { createPuzzlePieces } from './Puzzle.js';
import { canPlacePiece, placePiece } from './Board.js';

function debugPrintBoard(board) {
    const M = board.length;
    const N = board[0].length;

    // 문자 격자: 각 타일을 3x3 블록으로 표현
    const rows = M * 3;
    const cols = N * 3;

    // 공백으로 초기화
    const grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ' ')
    );

    for (let x = 0; x < M; x++) {
        for (let y = 0; y < N; y++) {
            const tile = board[x][y];
            const baseRow = x * 3;
            const baseCol = y * 3;

            if (!tile) {
                // 완전 빈칸: 가운데에 '.' 정도 찍어줄 수도 있음
                grid[baseRow + 1][baseCol + 1] = '.';
                continue;
            }

            // === 1) 가운데 심볼 결정 ===
            let centerChar = '.';

            if (tile.type === 'start') {
                centerChar = 'S';
            } else if (tile.type === 'goal') {
                centerChar = 'G';
            } else if (tile.type === 'hidden') {
                centerChar = 'H';
            } else if (tile.roomID !== -1) {
                // room: 고정 vs 가변을 구분해서 표현
                if (tile.isFixed) {
                    centerChar = 'F'; // Fixed room (leaf 등)
                } else {
                    centerChar = 'r'; // movable room (조각)
                }
            } else {
                centerChar = '.'; // roomID === -1 인 빈 공간
            }

            grid[baseRow + 1][baseCol + 1] = centerChar;

            // doors 배열이 없으면 스킵
            if (!tile.doors) continue;

            // === 2) 각 방향의 문을 그린다 ===
            // "이미 그 자리에 다른 문/문자 있으면 덮어쓰지 않는다"

            // 북(0): (baseRow + 0, baseCol + 1)
            if (tile.doors[0]) {
                const r = baseRow + 0;
                const c = baseCol + 1;
                if (grid[r][c] === ' ') {
                    grid[r][c] = '|';
                }
            }

            // 동(1): (baseRow + 1, baseCol + 2)
            if (tile.doors[1]) {
                const r = baseRow + 1;
                const c = baseCol + 2;
                if (grid[r][c] === ' ') {
                    grid[r][c] = '-';
                }
            }

            // 남(2): (baseRow + 2, baseCol + 1)
            if (tile.doors[2]) {
                const r = baseRow + 2;
                const c = baseCol + 1;
                if (grid[r][c] === ' ') {
                    grid[r][c] = '|';
                }
            }

            // 서(3): (baseRow + 1, baseCol + 0)
            if (tile.doors[3]) {
                const r = baseRow + 1;
                const c = baseCol + 0;
                if (grid[r][c] === ' ') {
                    grid[r][c] = '-';
                }
            }
        }
    }

    // === 3) 출력 ===
    let output = '';
    for (let r = 0; r < rows; r++) {
        output += grid[r].join('') + '\n';
    }

    console.log(output);
}

const map = generatePCGMap(10, 10, 20);
const { pieces, board } = createPuzzlePieces(map);

// 처음 상태
console.log("=== 초기 퍼즐 상태 ===");
debugPrintBoard(board);

// 예: 첫 번째 조각을 (5,5)에 배치해본다
const piece = pieces[0];
if (canPlacePiece(board, 5, 5)) {
    placePiece(board, piece, 5, 5);
}

// 배치 후
console.log("=== 배치 후 상태 ===");
debugPrintBoard(board);