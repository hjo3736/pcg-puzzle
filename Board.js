function canPlacePiece(board, x, y) {
    const M = board.length;
    const N = board[0].length;

    if (x < 0 || x >= M || y < 0 || y >= N) return false;

    const tile = board[x][y];

    if (tile && tile.isFixed) return false;

    return true;
}

function placePiece(board, piece, x, y) {
    if (!canPlacePiece(board, x, y)) {
        return false;
    }

    const placed = { ...piece, x, y };

    board[x][y] = placed;

    return true;
}

function removePiece(board, x, y) {
    const M = board.length;
    const N = board[0].length;

    if (x < 0 || x >= M || y < 0 || y >= N) return false;

    const tile = board[x][y];
    if (!tile) return false;

    if (tile.isFixed) return false;

    board[x][y] = null;
    return true;
}

export { canPlacePiece, placePiece, removePiece };