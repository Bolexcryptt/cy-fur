# Cy-fur Game - Audio Setup Guide

## Free Audio Resources

Download sound effects from these free libraries:

### **Best Options:**
1. **Zapsplat.com** ⭐ (Recommended - High Quality)
   - https://www.zapsplat.com
   - Free to use, no attribution required
   - 100,000+ sound effects

2. **Freesound.org**
   - https://freesound.org
   - Search by license (free to use)

3. **BBC Sound Effects Library**
   - https://sound-effects.bbcrewind.co.uk
   - Public domain, professional quality

---

## Sounds to Download

### 1. **Match/Break Sound** (When candies pop)
   - Search on Zapsplat: "bubble pop", "glass break", "bell pop"
   - Recommended: Short, punchy sound (0.2-0.5 seconds)
   - Format: MP3 or WAV

### 2. **Swipe Sound** (When you drag a candy)
   - Search on Zapsplat: "swoosh", "swipe", "whoosh"
   - Recommended: Light, quick sound (0.1-0.3 seconds)
   - Format: MP3 or WAV

### 3. **Combo/Cascade Sound** (Multiple matches in a row)
   - Search on Zapsplat: "ascending", "power up", "chime"
   - Recommended: Uplifting, energetic (0.3-0.8 seconds)
   - Format: MP3 or WAV

### 4. **Success/Wonderful Voice** (Achievement unlocked)
   - Search on Zapsplat: "wonderful", "excellent", "great job"
   - Or use speech synthesis options
   - Format: MP3 or WAV

---

## How to Add Audio to Your Game

### Step 1: Download Audio Files
- Go to Zapsplat.com or your chosen library
- Download each sound as MP3 (smaller file size)
- Save to `fur game/assets/audio/` folder

### Step 2: Create Audio Folder
```
fur game/
├── assets/
│   ├── audio/
│   │   ├── match.mp3
│   │   ├── swipe.mp3
│   │   ├── combo.mp3
│   │   └── success.mp3
```

### Step 3: Set Audio URLs in Game
In `music-manager.js`, find the `initializeSoundEffects()` method and set the URLs:

```javascript
initializeSoundEffects() {
    this.sfxSounds = {
        match: new Audio('assets/audio/match.mp3'),
        swipe: new Audio('assets/audio/swipe.mp3'),
        combo: new Audio('assets/audio/combo.mp3'),
        success: new Audio('assets/audio/success.mp3')
    };
    
    Object.values(this.sfxSounds).forEach(sound => {
        sound.volume = this.sfxVolume;
    });
}
```

### Step 4: Trigger Sounds in Game Logic
The game already has these methods ready to use:

```javascript
// In game.js or board.js, call:
game.musicManager.playMatchSound();      // When candies match
game.musicManager.playSwipeSound();      // When user drags
game.musicManager.playComboSound();      // On cascade/combo
game.musicManager.playSuccessSound();    // On achievement
```

---

## Example Audio Integration Points

### 1. **Match Sound** - In `game-rules.js` or `board.js`
When checking for matches:
```javascript
if (hasMatch) {
    game.musicManager.playMatchSound();
}
```

### 2. **Swipe Sound** - In `game-handler.js`
On mouse/touch move:
```javascript
onCandyDrag() {
    game.musicManager.playSwipeSound();
}
```

### 3. **Combo Sound** - In `game.js`
On cascade/multiple matches:
```javascript
if (cascadeCount > 1) {
    game.musicManager.playComboSound();
}
```

### 4. **Success Sound** - In `ui-manager.js`
On game completion or achievement:
```javascript
showResultPopup() {
    game.musicManager.playSuccessSound();
}
```

---

## Volume Control

Users can adjust SFX volume in settings:

```javascript
// Set SFX volume (0.0 - 1.0)
game.musicManager.setSFXVolume(0.7);
```

---

## Tips
- Keep sound files small (< 50KB per file) for fast loading
- Test on mobile - some browsers require user interaction first
- Keep audio lengths short for UI feedback
- Check license before using commercial

---

## Recommended Free Downloads to Try

**Zapsplat Direct Links (examples):**
- Bubble Pop: "bubble pop single" type sounds
- Swoosh: "sci-fi swoosh" type sounds  
- Ascending: "notification success" type sounds
- Voice: "voice wonderful" or use text-to-speech

Enjoy! 🎮🔊
