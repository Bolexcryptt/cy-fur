// Special Candy Mechanics Handler
class SpecialCandyHandler {
    constructor(game) {
        this.game = game;
    }

    /**
     * Activate a color bomb - clears all candies of a target color
     * When swapped with another candy, that candy's color is cleared
     */
    activateColorBomb(bombIndex, targetIndex) {
        const targetColor = this.game.board.getCandy(targetIndex);
        const targetSpecial = this.game.board.getSpecial(targetIndex);
        
        if (targetColor === null) return [];
        
        let indicesToClear = [];
        
        // Color bomb + regular candy = clear all of that color
        if (!targetSpecial) {
            for (let i = 0; i < BOARD_ROWS * BOARD_COLS; i++) {
                if (this.game.board.getCandy(i) === targetColor) {
                    indicesToClear.push(i);
                }
            }
            this.animateClearEffect(indicesToClear, 'color-bomb-clear');
        }
        // Color bomb + striped = all candies of that color become striped, then activate
        else if (targetSpecial === 'striped-h' || targetSpecial === 'striped-v') {
            for (let i = 0; i < BOARD_ROWS * BOARD_COLS; i++) {
                if (this.game.board.getCandy(i) === targetColor) {
                    indicesToClear.push(i);
                    // Use the same direction as the target striped
                    this.game.board.setSpecial(i, targetSpecial);
                }
            }
            this.animateClearEffect(indicesToClear, 'combo-animation');
            // Then trigger striped activations
            setTimeout(() => {
                this.activateStripedCandies(indicesToClear);
            }, 300);
            return indicesToClear;
        }
        // Color bomb + wrapped = all candies of that color become wrapped
        else if (targetSpecial === 'wrapped') {
            for (let i = 0; i < BOARD_ROWS * BOARD_COLS; i++) {
                if (this.game.board.getCandy(i) === targetColor) {
                    indicesToClear.push(i);
                    this.game.board.setSpecial(i, 'wrapped');
                }
            }
            this.animateClearEffect(indicesToClear, 'combo-animation');
            // Then trigger wrapped activations
            setTimeout(() => {
                this.activateWrappedCandies(indicesToClear);
            }, 300);
            return indicesToClear;
        }
        // Color bomb + color bomb = clear entire board
        else if (targetSpecial === 'bomb') {
            for (let i = 0; i < BOARD_ROWS * BOARD_COLS; i++) {
                if (this.game.board.getCandy(i) !== null) {
                    indicesToClear.push(i);
                }
            }
            this.animateClearEffect(indicesToClear, 'mega-blast');
        }
        
        return indicesToClear;
    }

    /**
     * Activate striped candy - clears row for horizontal, column for vertical
     */
    activateStriped(stripedIndex) {
        const row = Math.floor(stripedIndex / BOARD_COLS);
        const col = stripedIndex % BOARD_COLS;
        const special = this.game.board.getSpecial(stripedIndex);
        let indicesToClear = [];

        // Activate based on direction
        if (special === 'striped-h') {
            // Horizontal striped - clear entire row
            for (let c = 0; c < BOARD_COLS; c++) {
                indicesToClear.push(row * BOARD_COLS + c);
            }
        } else if (special === 'striped-v') {
            // Vertical striped - clear entire column
            for (let r = 0; r < BOARD_ROWS; r++) {
                indicesToClear.push(r * BOARD_COLS + col);
            }
        }

        this.animateClearEffect(indicesToClear, 'striped-activation');
        return indicesToClear;
    }

    /**
     * Activate multiple striped candies (combo)
     * Striped + Striped = Cross explosion (clears both row AND column for each striped)
     */
    activateStripedCombos(stripedIndices) {
        let allClear = new Set();
        
        stripedIndices.forEach(index => {
            const row = Math.floor(index / BOARD_COLS);
            const col = index % BOARD_COLS;
            
            // When 2+ striped candies are in a combo, BOTH clear their row AND column
            // Clear row
            for (let c = 0; c < BOARD_COLS; c++) {
                allClear.add(row * BOARD_COLS + c);
            }
            // Clear column
            for (let r = 0; r < BOARD_ROWS; r++) {
                allClear.add(r * BOARD_COLS + col);
            }
        });

        const indicesToClear = Array.from(allClear);
        this.animateClearEffect(indicesToClear, 'cross-explosion');
        return indicesToClear;
    }

    /**
     * Activate wrapped candy - clears 3x3 area around it
     */
    activateWrapped(wrappedIndex) {
        const row = Math.floor(wrappedIndex / BOARD_COLS);
        const col = wrappedIndex % BOARD_COLS;
        let indicesToClear = [];

        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) {
                    indicesToClear.push(r * BOARD_COLS + c);
                }
            }
        }

        this.animateClearEffect(indicesToClear, 'wrapped-activation');
        return indicesToClear;
    }

    /**
     * Activate wrapped candies (combo)
     * Striped + Wrapped = Giant blast (3 rows + 3 columns around striped)
     */
    activateStripedWrappedCombo(stripedIndex, wrappedIndex) {
        const sRow = Math.floor(stripedIndex / BOARD_COLS);
        const sCol = stripedIndex % BOARD_COLS;
        const wRow = Math.floor(wrappedIndex / BOARD_COLS);
        const wCol = wrappedIndex % BOARD_COLS;
        
        let indicesToClear = new Set();

        // From striped: clear entire row and column
        for (let c = 0; c < BOARD_COLS; c++) {
            indicesToClear.add(sRow * BOARD_COLS + c);
        }
        for (let r = 0; r < BOARD_ROWS; r++) {
            indicesToClear.add(r * BOARD_COLS + sCol);
        }

        // From wrapped: clear 3x3 area
        for (let r = wRow - 1; r <= wRow + 1; r++) {
            for (let c = wCol - 1; c <= wCol + 1; c++) {
                if (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) {
                    indicesToClear.add(r * BOARD_COLS + c);
                }
            }
        }

        const indices = Array.from(indicesToClear);
        this.animateClearEffect(indices, 'giant-blast');
        return indices;
    }

    /**
     * Activate all striped candies in a set
     */
    activateStripedCandies(stripedIndices) {
        let allClear = new Set();

        stripedIndices.forEach(index => {
            const clearSet = this.activateStriped(index);
            clearSet.forEach(i => allClear.add(i));
        });

        return Array.from(allClear);
    }

    /**
     * Activate all wrapped candies in a set
     */
    activateWrappedCandies(wrappedIndices) {
        let allClear = new Set();

        wrappedIndices.forEach(index => {
            const clearSet = this.activateWrapped(index);
            clearSet.forEach(i => allClear.add(i));
        });

        return Array.from(allClear);
    }

    /**
     * Check if two matched special candies should trigger a combo
     * Returns { shouldCombo: boolean, comboType: string, indicesToClear: [] }
     */
    checkForCombo(matchedIndices) {
        const matchSet = new Set(matchedIndices);
        let stripedIndices = [];
        let wrappedIndices = [];
        let bombIndices = [];

        // Categorize special candies in the match
        matchedIndices.forEach(index => {
            const special = this.game.board.getSpecial(index);
            if (special === 'striped-h' || special === 'striped-v') stripedIndices.push(index);
            else if (special === 'wrapped') wrappedIndices.push(index);
            else if (special === 'bomb') bombIndices.push(index);
        });

        // Combo logic
        if (stripedIndices.length >= 2 && wrappedIndices.length > 0) {
            // Striped + Wrapped combo
            return {
                shouldCombo: true,
                comboType: 'striped-wrapped',
                indicesToClear: this.activateStripedWrappedCombo(stripedIndices[0], wrappedIndices[0])
            };
        } else if (stripedIndices.length >= 2) {
            // Striped + Striped combo (cross explosion)
            return {
                shouldCombo: true,
                comboType: 'striped-striped',
                indicesToClear: this.activateStripedCombos(stripedIndices)
            };
        } else if (bombIndices.length >= 2) {
            // Color bomb + Color bomb = clear entire board
            const allIndices = [];
            for (let i = 0; i < BOARD_ROWS * BOARD_COLS; i++) {
                if (this.game.board.getCandy(i) !== null) {
                    allIndices.push(i);
                }
            }
            return {
                shouldCombo: true,
                comboType: 'bomb-bomb',
                indicesToClear: allIndices
            };
        }

        return { shouldCombo: false };
    }

    /**
     * Animate the clear effect for special candies
     */
    animateClearEffect(indicesToClear, effectType) {
        indicesToClear.forEach(index => {
            const candy = this.game.candyElements[index];
            if (candy) {
                candy.classList.remove('match-animation');
                candy.classList.add(effectType);
                
                // Force reflow to restart animation
                void candy.offsetWidth;
            }
        });
    }

    /**
     * Handle swap between two special candies
     */
    handleSpecialSwap(index1, index2) {
        const special1 = this.game.board.getSpecial(index1);
        const special2 = this.game.board.getSpecial(index2);

        let indicesToClear = [];

        // If one is a bomb (color bomb), handle it
        if (special1 === 'bomb' || special2 === 'bomb') {
            const bombIndex = special1 === 'bomb' ? index1 : index2;
            const otherIndex = special1 === 'bomb' ? index2 : index1;
            indicesToClear = this.activateColorBomb(bombIndex, otherIndex);
        }
        // If one is striped and other is wrapped
        else if (((special1 === 'striped-h' || special1 === 'striped-v') && special2 === 'wrapped') ||
                 ((special2 === 'striped-h' || special2 === 'striped-v') && special1 === 'wrapped')) {
            const stripedIndex = (special1 === 'striped-h' || special1 === 'striped-v') ? index1 : index2;
            const wrappedIndex = special1 === 'wrapped' ? index1 : index2;
            indicesToClear = this.activateStripedWrappedCombo(stripedIndex, wrappedIndex);
        }
        // If both are striped (cross explosion)
        else if ((special1 === 'striped-h' || special1 === 'striped-v') && (special2 === 'striped-h' || special2 === 'striped-v')) {
            indicesToClear = this.activateStripedCombos([index1, index2]);
        }

        return indicesToClear;
    }
}
