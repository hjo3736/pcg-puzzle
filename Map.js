import Tile from './Tile.js';

// NESW
const DIRS = [
    [-1, 0], 
    [0, 1],  
    [1, 0],  
    [0, -1]  
];

function generatePCGMap(M, N, MAX_ROOMS) {
    // Create Empty Map
    let gameMap = new Array(M).fill(0).map((_, x) =>
        new Array(N).fill(0).map((_, y) => new Tile(x, y))
    );

    let roomCount = 0;

    // Create start pos
    let startX = Math.floor(Math.random() * M);
    let startY = Math.floor(Math.random() * N);

    let startRoom = gameMap[startX][startY];
    startRoom.type = 'start';
    startRoom.roomID = roomCount++;

    // Buffer
    let rooms = [startRoom];

    // Create room with random walk
    let safeGuard = 0;
    let limit = M * N * 10;

    while (roomCount < MAX_ROOMS && safeGuard < limit) {
        safeGuard++;

        const baseRoom = rooms[Math.floor(Math.random() * rooms.length)];
        const currentX = baseRoom.x;
        const currentY = baseRoom.y;

        // Choose random dir
        let dir = Math.floor(Math.random() * 4);
        let [dx, dy] = DIRS[dir];

        let nextX = currentX + dx;
        let nextY = currentY + dy;

        // Check boundary
        if (nextX < 0 || nextX >= M || nextY < 0 || nextY >= N) {
            continue;
        }

        let nextRoom = gameMap[nextX][nextY];

        if (nextRoom.roomID === -1) {
            nextRoom.roomID = roomCount++;
            nextRoom.type = 'room';

            baseRoom.doors[dir] = true;
            nextRoom.doors[(dir + 2) % 4] = true;

            rooms.push(nextRoom);
        }
    }

    settingRooms(gameMap, M, N);

    return gameMap;
}

function settingRooms(gameMap, M, N){
    let rooms = [];
    let emptyRooms = [];

    for (let x = 0; x < M; x++) {
        for (let y = 0; y < N; y++) {
            let tile = gameMap[x][y];
            if (tile.roomID !== -1) rooms.push(tile);
            else emptyRooms.push(tile)
        }
    }

    // 1. Set goal
    let leafRooms = rooms.filter(room =>
        room.type !== 'start' &&
        room.doors.filter(d => d === true).length === 1
    );

    let startRoom = rooms.find(r => r.type === 'start')
    let goalRoom = null;

    if (startRoom && leafRooms.length > 0) {
        const dist = computeDistancesFromStart(gameMap, M, N, startRoom);

        let maxDist = -1;

        for (const room of leafRooms) {
            const d = dist[room.x][room.y];

            if (Number.isFinite(d) && d > maxDist) {
                maxDist = d;
                goalRoom = room;
            }
        }
    }

    if (!goalRoom) {
        goalRoom =
            leafRooms.length > 0
                ? leafRooms[Math.floor(Math.random() * leafRooms.length)]
                : rooms[Math.floor(Math.random() * rooms.length)];
    }

    goalRoom.type = 'goal';

    // 2. Set Hidden
    // Hidden room must have at least 2 rooms nearby
    let possibleHidden = emptyRooms.filter(tile => {
        let count = 0;
        let hasStartOrGoalNeighbor = false;

        for (let dir = 0; dir < 4; dir++) {
            let [dx, dy] = DIRS[dir];
            let nx = tile.x + dx;
            let ny = tile.y + dy;

            if (nx < 0 || nx >= M || ny < 0 || ny >= N) continue;

            let neighbor = gameMap[nx][ny];
            if (!neighbor) continue;

            if (neighbor.type === 'start' || neighbor.type === 'goal') {
                hasStartOrGoalNeighbor = true;
            }

            if (neighbor.roomID !== -1) {
                count++;
            }
        }

        return count >= 2 && !hasStartOrGoalNeighbor;
    });

    // Maximum hidden romm = 2
    let hiddenRooms = [];
    let hiddenCount = Math.min(2, possibleHidden.length);

    for (let i = 0; i < hiddenCount; i++) {
        let idx = Math.floor(Math.random() * possibleHidden.length);
        let tile = possibleHidden.splice(idx, 1)[0];

        tile.type = 'hidden';
        tile.roomID = -1;

        hiddenRooms.push(tile);
    }

    // 3. Setting Fixed state
    
    // Start Tile
    startRoom.isFixed = true;

    // Goal Tile
    goalRoom.isFixed = true;

    // Hidden Tile
    hiddenRooms.forEach(h => h.isFixed = true);

    // Leaf Tile
    leafRooms.forEach(r => {
        if (r.type !== 'goal' && r.type !== 'start')
            r.isFixed = true;
    });

}

function computeDistancesFromStart(gameMap, M, N, startTile) {
    const dist = Array.from({ length: M }, () =>
        Array.from({ length: N }, () => Infinity)
    );

    const queue = [];
    dist[startTile.x][startTile.y] = 0;
    queue.push([startTile.x, startTile.y]);

    while (queue.length > 0) {
        const [x, y] = queue.shift();
        const current = gameMap[x][y];

        for (let dir = 0; dir < 4; dir++) {
            if (!current.doors[dir]) continue; // 문 없으면 못감

            const [dx, dy] = DIRS[dir];
            const nx = x + dx;
            const ny = y + dy;

            if (nx < 0 || nx >= M || ny < 0 || ny >= N) continue;

            const neighbor = gameMap[nx][ny];

            if (!neighbor || neighbor.roomID === -1) continue; // room이 아니면 패스

            // 더 짧은 거리로 갱신되는 경우만 큐에 추가
            if (dist[nx][ny] > dist[x][y] + 1) {
                dist[nx][ny] = dist[x][y] + 1;
                queue.push([nx, ny]);
            }
        }
    }

    return dist;
}

export { generatePCGMap };
