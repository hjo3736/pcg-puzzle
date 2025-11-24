# PCG Puzzle Game

A tile-based puzzle game built with **HTML5 Canvas** and **JavaScript**, featuring:
- Procedural dungeon generation (PCG)
- Puzzle disassembly/reassembly
- Door-consistency validation
- Drag & Drop interaction system
- Full solution verification (BFS)

The player must arrange room tiles to create a valid path from **Start** to **Goal**.

---

## 🎯 Game Objective

Create a **single continuous path** from the **Start (S)** room to the **Goal (G)** room  
by placing and arranging movable room tiles so that their **doors (yellow lines)** match correctly.

---

## 🧱 Tile Types

| Tile | Color | Description |
|------|--------|-------------|
| **Start (S)** | Green | Cannot be moved (fixed) |
| **Goal (G)** | Red | Cannot be moved (fixed) |
| **Hidden (H)** | Purple | Fixed hint tile |
| **Leaf Rooms** | Gray | Fixed rooms used as puzzle hints |
| **Movable Rooms** | Blue | Puzzle pieces the player must place |
| **Empty Slot** | Black | A valid placement location |

---

## 🔄 How the PCG Map Is Generated

1. A random cell is chosen as **Start**.
2. A **Random Walk** algorithm creates up to `MAX_ROOMS` rooms.
3. Doors between sequential rooms are opened.
4. Rooms with only one door become **Leaf Rooms**.
5. The **farthest leaf** from Start becomes **Goal** (via BFS distance).
6. Hidden rooms (H) are placed in empty cells adjacent to ≥2 rooms.
7. Start, Goal, Hidden, and Leaf rooms become **fixed** tiles.
8. Movable tiles are extracted as **puzzle pieces**.

The resulting layout is the puzzle’s “solution state”.

---

## ✔ Validation Logic

### **1. Local Validation**
When placing a tile:
- Only neighboring doors (N/E/S/W) are checked.
- Door A must match Door B (open ↔ open, closed ↔ closed).

### **2. Global Validation**
Triggered when pressing “Check Solution”:
1. No remaining puzzle pieces  
2. All adjacent tiles have matching doors  
3. A valid path exists from **Start → Goal** (BFS)

If all conditions pass → puzzle is solved.
---

## 📁 Project Structure

Below is the correct directory structure:

```plaintext
PCGPuzzle/
│
├── index.html          # UI layout, canvases, modal
├── main.js             # Rendering + drag & drop + UI logic
├── Map.js              # PCG map generation (rooms, doors, leaf, hidden)
├── Puzzle.js           # Puzzle piece generation logic
├── Tile.js             # Tile data structure (x, y, type, doors, roomID)
├── Validation.js       # Door checking + BFS solution check
├── style.css           # (Optional) custom styling
└── README.md           # Documentation
```
---

## 🚀 Future Enhancements

- Rotating room tiles
- Path visualization effects
- Difficulty settings
- Seed-based map generation
- Mobile UI optimization

---

## 👤 Author

Created through iterative development with ChatGPT.  
A complete, interactive PCG-based puzzle system.

Enjoy the puzzle!
