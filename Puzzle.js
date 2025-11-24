function createPuzzlePieces(gameMap) {
    const M = gameMap.length;
    const N = gameMap[0].length;

    const pieces = [];

    for (let x = 0; x < M; x++) {
        for (let y = 0; y < N; y++) {
            const tile = gameMap[x][y];
            if (!tile) continue;

            if (tile.isFixed) {
                continue;
            }

            if (tile.roomID !== -1) {
                const piece = JSON.parse(JSON.stringify(tile));

                piece.originalX = x;
                piece.originalY = y;

                pieces.push(piece);

                gameMap[x][y] = null;
            }
        }
    }
    shuffleArray(pieces);

    return {
        pieces,
        board: gameMap,
    };
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

export { createPuzzlePieces };
