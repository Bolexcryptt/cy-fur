// Board Management
class Board {
    constructor() {
        this.board = [];
        this.specialCandies = {};
    }
    
    initialize() {
        this.board = [];
        this.specialCandies = {};
        this.fillBoard();
    }

    fillBoard() {
        for (let i = 0; i < BOARD_ROWS * BOARD_COLS; i++) {
            this.board[i] = this.getRandomColor();
        }

        while (this.findMatches().length > 0) {
            for (let i = 0; i < BOARD_ROWS * BOARD_COLS; i++) {
                this.board[i] = this.getRandomColor();
            }
        }
    }

    spawnJewel(index) {
        this.board[index] = this.getRandomColor();
    }
    
    getRandomColor() {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    
    getCandy(index) {
        return this.board[index];
    }
    
    setCandy(index, color) {
        this.board[index] = color;
    }
    
    swapCandies(index1, index2) {
        [this.board[index1], this.board[index2]] = [this.board[index2], this.board[index1]];
        const temp = this.specialCandies[index1];
        this.specialCandies[index1] = this.specialCandies[index2];
        this.specialCandies[index2] = temp;
    }
    
    removeCandy(index) {
        this.board[index] = null;
        delete this.specialCandies[index];
    }
    
    getSpecial(index) {
        return this.specialCandies[index];
    }
    
    setSpecial(index, special) {
        if (special) {
            this.specialCandies[index] = special;
        } else {
            delete this.specialCandies[index];
        }
    }
    
    findMatches() {
        const matches = new Set();
        
        for (let i = 0; i < BOARD_ROWS * BOARD_COLS; i++) {
            const row = Math.floor(i / BOARD_COLS);
            const col = i % BOARD_COLS;
            
            // Horizontal check
            if (col <= BOARD_COLS - 3 && this.board[i] !== null) {
                if (this.board[i] === this.board[i + 1] && this.board[i] === this.board[i + 2]) {
                    matches.add(i);
                    matches.add(i + 1);
                    matches.add(i + 2);
                    // Check for 4+ in a row
                    if (col <= BOARD_COLS - 4 && this.board[i] === this.board[i + 3]) {
                        matches.add(i + 3);
                    }
                }
            }
            
            // Vertical check
            if (row <= BOARD_ROWS - 3 && this.board[i] !== null) {
                if (this.board[i] === this.board[i + BOARD_COLS] && this.board[i] === this.board[i + 2 * BOARD_COLS]) {
                    matches.add(i);
                    matches.add(i + BOARD_COLS);
                    matches.add(i + 2 * BOARD_COLS);
                    // Check for 4+ in a row
                    if (row <= BOARD_ROWS - 4 && this.board[i] === this.board[i + 3 * BOARD_COLS]) {
                        matches.add(i + 3 * BOARD_COLS);
                    }
                }
            }
        }
        
        return Array.from(matches);
    }
    
    applyGravity() {
        for (let col = 0; col < BOARD_COLS; col++) {
            const column = [];
            const colSpecial = {};
            let currentRow = 0;
            
            for (let row = 0; row < BOARD_ROWS; row++) {
                const index = row * BOARD_COLS + col;
                if (this.board[index] !== null) {
                    column.push(this.board[index]);
                    if (this.specialCandies[index]) {
                        colSpecial[currentRow] = this.specialCandies[index];
                    }
                    currentRow++;
                }
            }
            
            const nulls = BOARD_ROWS - column.length;
            for (let row = 0; row < BOARD_ROWS; row++) {
                const index = row * BOARD_COLS + col;
                if (row < nulls) {
                    this.board[index] = null;
                    delete this.specialCandies[index];
                } else {
                    this.board[index] = column[row - nulls];
                    if (colSpecial[row - nulls]) {
                        this.specialCandies[index] = colSpecial[row - nulls];
                    } else {
                        delete this.specialCandies[index];
                    }
                }
            }
        }
    }
    
    fillEmptySpaces() {
        // Fill nulls with random colors while avoiding immediate new matches.
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === null) {
                this.board[i] = this._getSafeRandomColor(i);
            }
        }
    }

    _getSafeRandomColor(index) {
        let color = this.getRandomColor();
        let attempts = 0;
        while (this._wouldCreateMatch(index, color) && attempts < 12) {
            color = this.getRandomColor();
            attempts += 1;
        }
        return color;
    }

    _wouldCreateMatch(index, color) {
        const row = Math.floor(index / BOARD_COLS);
        const col = index % BOARD_COLS;

        const same = (otherIndex) => {
            return otherIndex >= 0 && otherIndex < this.board.length && this.board[otherIndex] === color;
        };

        // Horizontal checks
        if (col >= 2 && same(index - 1) && same(index - 2)) return true;
        if (col >= 1 && col <= BOARD_COLS - 2 && same(index - 1) && same(index + 1)) return true;
        if (col <= BOARD_COLS - 3 && same(index + 1) && same(index + 2)) return true;

        // Vertical checks
        if (row >= 2 && same(index - BOARD_COLS) && same(index - 2 * BOARD_COLS)) return true;
        if (row >= 1 && row <= BOARD_ROWS - 2 && same(index - BOARD_COLS) && same(index + BOARD_COLS)) return true;
        if (row <= BOARD_ROWS - 3 && same(index + BOARD_COLS) && same(index + 2 * BOARD_COLS)) return true;

        return false;
    }

    hasEmptySpaces() {
        return this.board.some(cell => cell === null);
    }

    fillSpace() {
        // Apply gravity first to collapse existing candies down
        console.log('Board.fillSpace: collapsing and filling empty spaces');
        this.applyGravity();
        // Then fill any empty spaces with new random candies
        this.fillEmptySpaces();
    }
    
    clear() {
        this.board = [];
        this.specialCandies = {};
    }
}
