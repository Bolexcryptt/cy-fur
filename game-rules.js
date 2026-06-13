// Game Rules and Mechanics
class GameRules {
    applySpecialEffects(board, matches) {
        matches.forEach(index => {
            const special = board.getSpecial(index);
            
            if (special === 'striped-h') {
                // Horizontal striped - clear entire row
                const row = Math.floor(index / BOARD_COLS);
                for (let c = 0; c < BOARD_COLS; c++) {
                    board.removeCandy(row * BOARD_COLS + c);
                }
            } else if (special === 'striped-v') {
                // Vertical striped - clear entire column
                const col = index % BOARD_COLS;
                for (let r = 0; r < BOARD_ROWS; r++) {
                    board.removeCandy(r * BOARD_COLS + col);
                }
            } else if (special === 'wrapped') {
                // Clear 3x3 area
                const row = Math.floor(index / BOARD_COLS);
                const col = index % BOARD_COLS;
                
                for (let r = row - 1; r <= row + 1; r++) {
                    for (let c = col - 1; c <= col + 1; c++) {
                        if (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) {
                            board.removeCandy(r * BOARD_COLS + c);
                        }
                    }
                }
            } else if (special === 'bomb') {
                // Bomb is handled in combos, but if alone, clear nothing (it needs a swap)
            }
            
            board.setSpecial(index, null);
        });
    }
    
    createSpecialCandies(board, matches, matchSet, swipeDirection = null, completingIndex = null) {
        console.log(`Creating special candies for ${matches.length} matches, swipeDirection: ${swipeDirection}, completingIndex: ${completingIndex}`);
        
        // Only the candy at completingIndex should become special (if it's in the match)
        if (completingIndex !== null && matchSet.has(completingIndex)) {
            const index = completingIndex;
            if (!board.getSpecial(index)) {
                const row = Math.floor(index / BOARD_COLS);
                const col = index % BOARD_COLS;
                const color = board.getCandy(index);
                
                let hCount = 0;
                for (let c = 0; c < BOARD_COLS; c++) {
                    if (matchSet.has(row * BOARD_COLS + c) && board.getCandy(row * BOARD_COLS + c) === color) {
                        hCount++;
                    }
                }
                
                let vCount = 0;
                for (let r = 0; r < BOARD_ROWS; r++) {
                    if (matchSet.has(r * BOARD_COLS + col) && board.getCandy(r * BOARD_COLS + col) === color) {
                        vCount++;
                    }
                }
                
                // Create special candy based on match size
                if (hCount >= 5 || vCount >= 5) {
                    console.log(`Setting wrapped at ${index}`);
                    board.setSpecial(index, 'wrapped');
                } else if (hCount >= 4 || vCount >= 4) {
                    // Use swipe direction if available
                    if (swipeDirection === 'horizontal') {
                        console.log(`Setting striped-h at ${index} (swipeDirection: ${swipeDirection})`);
                        board.setSpecial(index, 'striped-h');
                    } else if (swipeDirection === 'vertical') {
                        console.log(`Setting striped-v at ${index} (swipeDirection: ${swipeDirection})`);
                        board.setSpecial(index, 'striped-v');
                    } else {
                        // Fallback: determine by match count
                        if (hCount > vCount) {
                            console.log(`Setting striped-h at ${index} (fallback, hCount: ${hCount}, vCount: ${vCount})`);
                            board.setSpecial(index, 'striped-h');
                        } else {
                            console.log(`Setting striped-v at ${index} (fallback, hCount: ${hCount}, vCount: ${vCount})`);
                            board.setSpecial(index, 'striped-v');
                        }
                    }
                }
            }
        }
        // If no completingIndex, don't create special candies (cascade matches)
    }
    
    isValidSwap(index1, index2) {
        const row1 = Math.floor(index1 / BOARD_COLS);
        const col1 = index1 % BOARD_COLS;
        const row2 = Math.floor(index2 / BOARD_COLS);
        const col2 = index2 % BOARD_COLS;
        
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        
        return (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0);
    }
}
