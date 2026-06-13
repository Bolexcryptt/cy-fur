## Special Candy Mechanics Guide

### Overview
The game now includes comprehensive special candy mechanics with proper animations and combo systems.

---

## Special Candy Types

### 1. **Striped Candy**
- **Created by:** Matching 4 candies in a row (horizontal or vertical)
- **Effect:** Clears an entire row and column (cross pattern)
- **Visual:** White diagonal stripes overlay
- **Animation:** `stripedCrack` - dramatic crack effect with directional momentum

### 2. **Wrapped Candy**
- **Created by:** Matching 5 candies in a row (anywhere)
- **Effect:** Clears a 3x3 area around the wrapped candy
- **Visual:** Sparkle emoji (✨) overlay with spinning animation
- **Animation:** `wrappedExplode` - expanding burst effect

### 3. **Color Bomb** (Cygem Bomb)
- **Created by:** Matching 5+ candies in a row
- **Effect:** Clears all candies of a target color
- **Visual:** Black background with white asterisk (*)
- **Animation:** `bombBlast` - intense implosion effect

---

## Combo Mechanics

### Striped + Striped Combo
**Effect:** Cross Explosion - clears both a row AND column for each striped candy matched together
- Multiplies the clearing power
- Animation: `crossBlast` - dual directional blast
- Bonus: 50% extra points

### Striped + Wrapped Combo
**Effect:** Giant Blast - clears 3 rows, 3 columns, AND 3x3 area
- Massive board clear
- Animation: `megaBlast` - expanding purple explosion
- Bonus: 100% extra points

### Striped + Color Bomb Combo
**Effect:** All candies of target color turn into striped candies and activate
- Creates a chain reaction of row/column clears
- Animation: `comboFlash` - color cycling flash
- Bonus: Varies based on total clears

### Wrapped + Color Bomb Combo
**Effect:** All candies of target color turn into wrapped candies and explode
- Fills board with 3x3 explosions
- Animation: `megaBlast` with extended duration
- Bonus: Varies based on total clears

### Color Bomb + Color Bomb Combo
**Effect:** Entire board clears instantly
- Maximum destruction
- Animation: `wholeBoardClear` - board-wide implosion
- Bonus: 500+ points

---

## How to Trigger Combos

1. **Standard Match:** When you match 3+ candies normally, special candies trigger if involved
2. **Special Swap:** Swap two special candies together to trigger combo effects
3. **Cascade:** When gravity causes special candies to match, their effects activate

### Example Scenarios

**Scenario 1: Striped + Regular Candy**
```
Swap: Striped Candy + Red Candy
Result: All red candies disappear from board
Animation: Color bomb clearing effect
```

**Scenario 2: Striped + Striped**
```
Swap: Striped Candy #1 + Striped Candy #2
Result: Both candies' rows and columns clear (cross pattern)
Bonus: Massive board clear
```

**Scenario 3: Wrapped + Wrapped**
```
Match: Wrapped Candy #1 + Wrapped Candy #2
Result: Two 3x3 explosions clear overlapping areas
Bonus: Up to 18 candies cleared
```

---

## Animation Effects

All special candy activations include distinct visual feedback:

| Special Candy | Activation Animation | Duration | Effect |
|---|---|---|---|
| Striped | `stripedCrack` | 0.6s | Rotating crack with yellow glow |
| Wrapped | `wrappedExplode` | 0.5s | Scaling burst with blue glow |
| Color Bomb | `bombBlast` | 0.7s | Implosion with red glow |
| Striped+Striped | `crossBlast` | 0.8s | Dual directional explosion (yellow) |
| Striped+Wrapped | `megaBlast` | 1.0s | Massive expansion (purple) |
| Bomb+Bomb | `wholeBoardClear` | 1.2s | Board-wide implosion (pink) |

---

## Implementation Details

### SpecialCandyHandler Class
Located in `special-candies.js`, this class handles:
- Detecting special candy activations
- Calculating affected cells
- Managing combo logic
- Applying animations
- Sound effect triggers

### Key Methods

```javascript
// Activate a color bomb
specialCandyHandler.activateColorBomb(bombIndex, targetIndex)

// Activate striped candy
specialCandyHandler.activateStriped(stripedIndex, direction)

// Activate wrapped candy
specialCandyHandler.activateWrapped(wrappedIndex)

// Check for combos in matched candies
specialCandyHandler.checkForCombo(matchedIndices)

// Handle swap between two special candies
specialCandyHandler.handleSpecialSwap(index1, index2)
```

---

## Integration Points

1. **Board System:** Tracks special candy types in `specialCandies` object
2. **Game Logic:** `swapCandies()` checks for special candy effects before processing matches
3. **Match Processing:** `removeCandies()` triggers combo checks
4. **UI Rendering:** Classes applied dynamically for animations
5. **Sound System:** Music manager plays combo sounds

---

## Tips for Gameplay

1. **Plan Combos:** Try to set up situations where special candies align
2. **Stack Effects:** Multiple special candies together = exponential clearing power
3. **Color Bombs:** Most powerful single mechanic for targeted clears
4. **Striped Chains:** Create cascades by using striped candies
5. **Watch Animations:** Visual feedback shows what effects are active

---

## Debugging

If animations don't show:
1. Verify `special-candies.js` is loaded (check browser console)
2. Check that CSS animations are applied (inspect element classes)
3. Verify `SpecialCandyHandler` is initialized in game constructor
4. Check console for combo detection messages

If combos don't trigger:
1. Ensure special candies are being created (check `createSpecialCandies`)
2. Verify `swapCandies()` includes special swap logic
3. Check `removeCandies()` for combo check call
4. Monitor console logs for "Combo detected" messages
