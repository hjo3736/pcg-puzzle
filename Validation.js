const DIRS = [
    [-1, 0],  // N
    [0, 1],   // E
    [1, 0],   // S
    [0, -1],  // W
];

// 1. Local (When tile is placed)
// 1-1. Check the doors between two doors are connected
function checkLocalConnection(tileA, tileB, direction) {
    if (!tileA || !tileB) return false;

    const opposite = (direction + 2) % 4;

    const doorA = tileA.doors[direction];
    const doorB = tileB.doors[opposite];

    return doorA === doorB;
}

// 1-2. Check in total Board
function validateLocalConsistency(board) {
    const M = board.length;
    const N = board[0].length;

    for (let x = 0; x < M; x++) {
        for (let y = 0; y < N; y++) {
            const tile = board[x][y];
            if (!tile) continue;

            if (y + 1 < N) {
                const right = board[x][y + 1];
                if (right && !checkLocalConnection(tile, right, 1)) {
                    return false;
                }
            }

            if (x + 1 < M) {
                const down = board[x + 1][y];
                if (down && !checkLocalConnection(tile, down, 2)) {
                    return false;
                }
            }
        }
    }

    return true;
}

// Simple util
// Finding Start / Goal Tile
function findStartAndGoal(board) {
    const M = board.length;
    const N = board[0].length;

    let start = null;
    let goal = null;

    for (let x = 0; x < M; x++) {
        for (let y = 0; y < N; y++) {
            const tile = board[x][y];
            if (!tile) continue;

            if (tile.type === 'start') {
                start = { tile, x, y };
            } else if (tile.type === 'goal') {
                goal = { tile, x, y };
            }
        }
    }

    return { start, goal };
}

// 1-3. Check if can move start to goal
function checkStartGoalPath(board) {
    const M = board.length;
    const N = board[0].length;

    const { start, goal } = findStartAndGoal(board);

    if (!start || !goal) {
        return false;
    }

    const visited = Array.from({ length: M }, () =>
        Array.from({ length: N }, () => false)
    );

    const queue = [];
    queue.push([start.x, start.y]);
    visited[start.x][start.y] = true;

    while (queue.length > 0) {
        const [x, y] = queue.shift();
        const current = board[x][y];

        if (current && current.type === 'goal') {
            return true;
        }

        for (let dir = 0; dir < 4; dir++) {
            const [dx, dy] = DIRS[dir];
            const nx = x + dx;
            const ny = y + dy;

            if (nx < 0 || nx >= M || ny < 0 || ny >= N) continue;
            if (visited[nx][ny]) continue;

            const neighbor = board[nx][ny];
            if (!neighbor) continue;

            if (!checkLocalConnection(current, neighbor, dir)) continue;

            visited[nx][ny] = true;
            queue.push([nx, ny]);
        }
    }

    return false;
}

// 2. Global (Check when every tile is placed)
// Check puzzle is solved
function isPuzzleSolved(board, remainingPiecesCount = 0) {
    // Check unplaced tiles
    if (remainingPiecesCount > 0) return false;

    if (!validateLocalConsistency(board)) return false;

    if (!checkStartGoalPath(board)) return false;

    return true;
}

export {
    checkLocalConnection,
    validateLocalConsistency,
    checkStartGoalPath,
    isPuzzleSolved,
};