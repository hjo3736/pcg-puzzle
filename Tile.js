class Tile {
    constructor(x, y, isFixed = false) {
        // Cur Pos
        this.x = x;
        this.y = y;

        // Type of room
        // Start / Goal / Room / Hidden
        this.type = 'room'; 
        
        // Door of room
        // NESW
        this.doors = [false, false, false, false];

        // Fixed on layer
        // If fixed, used as hint
        // Start, Goal, and room with only one door will be fixed
        this.isFixed = false;

        // Room ID
        this.roomID = -1


    }
}
export default Tile;