#!/usr/bin/env python3
import wave
import struct
import math

def generate_tone(frequency, duration, sample_rate=44100, volume=0.7):
    """Generate a sine wave tone"""
    frames = []
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        value = int(volume * 32767 * math.sin(2 * math.pi * frequency * t))
        frames.append(struct.pack('<h', value))
    return b''.join(frames)

def generate_pop_sound(filename):
    """Generate a bubble pop sound (descending frequencies)"""
    sample_rate = 44100
    sound = b''
    
    # Quick descending pitch for pop effect
    for freq in [800, 600, 400]:
        sound += generate_tone(freq, 0.05, sample_rate, 0.6)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(sound)
    print(f"✓ Created {filename}")

def generate_swipe_sound(filename):
    """Generate a swoosh/swipe sound (ascending frequency sweep)"""
    sample_rate = 44100
    duration = 0.3
    frames = []
    
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        # Sweep from 200Hz to 800Hz
        freq = 200 + (600 * t / duration)
        value = int(0.5 * 32767 * math.sin(2 * math.pi * freq * t))
        frames.append(struct.pack('<h', value))
    
    sound = b''.join(frames)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(sound)
    print(f"✓ Created {filename}")

def generate_combo_sound(filename):
    """Generate an ascending success/combo sound"""
    sample_rate = 44100
    sound = b''
    
    # Rising notes (C major scale)
    notes = [262, 294, 330, 392, 440]  # C, D, E, G, A
    
    for note in notes:
        sound += generate_tone(note, 0.12, sample_rate, 0.7)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(sound)
    print(f"✓ Created {filename}")

def generate_success_sound(filename):
    """Generate a success/wonderful sound (happy chime)"""
    sample_rate = 44100
    sound = b''
    
    # Happy chord progression
    duration_per_note = 0.3
    chords = [
        [262, 330, 392],  # C major
        [294, 370, 440],  # D major-ish
        [330, 415, 523]   # E major-ish
    ]
    
    for chord in chords:
        chord_sound = b''
        for i in range(int(sample_rate * duration_per_note)):
            t = i / sample_rate
            value = 0
            for freq in chord:
                value += math.sin(2 * math.pi * freq * t)
            value = int((value / len(chord)) * 0.6 * 32767)
            chord_sound += struct.pack('<h', value)
        sound += chord_sound
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(sound)
    print(f"✓ Created {filename}")

def generate_wonderful_voice(filename):
    """Generate a 'wonderful' voice-like sound using formants"""
    sample_rate = 44100
    duration = 1.2
    frames = []
    
    # Simulate speech using overlapped sine waves at different frequencies
    # Formant frequencies approximate to create vowel-like sounds
    fundamental = 120  # Base pitch
    formants = [700, 1220, 2600]  # F1, F2, F3 (approximates 'oo' sound)
    
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        
        # Envelope (attack-sustain-release)
        if t < 0.2:
            envelope = t / 0.2  # Attack
        elif t < 1.0:
            envelope = 1.0  # Sustain
        else:
            envelope = max(0, (1.2 - t) / 0.2)  # Release
        
        # Generate harmonics with formants
        value = 0
        for harmonic in range(1, 4):
            freq = fundamental * harmonic
            value += 0.3 * math.sin(2 * math.pi * freq * t)
        
        for formant in formants:
            value += 0.2 * math.sin(2 * math.pi * formant * t)
        
        # Apply envelope
        value = int(envelope * value * 0.5 * 32767)
        frames.append(struct.pack('<h', value))
    
    sound = b''.join(frames)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(sound)
    print(f"✓ Created {filename}")

def generate_clapping_sound(filename):
    """Generate a clapping/applause sound"""
    sample_rate = 44100
    sound = b''
    
    # Create 3 claps with slight delays
    for clap_num in range(3):
        clap_sound = b''
        clap_duration = 0.15
        
        # Each clap has a burst of noise
        for i in range(int(sample_rate * clap_duration)):
            t = i / sample_rate
            
            # Envelope for clap (quick attack, medium decay)
            if t < 0.02:
                envelope = t / 0.02  # Quick attack
            else:
                envelope = max(0, 1 - (t / clap_duration))  # Decay
            
            # Generate noise-like sound using multiple frequencies
            noise = 0
            for freq in [200, 400, 800, 1600, 3200]:
                noise += 0.1 * math.sin(2 * math.pi * freq * t * (1 + 0.1 * math.sin(20 * t)))
            
            value = int(envelope * noise * 0.4 * 32767)
            clap_sound += struct.pack('<h', value)
        
        sound += clap_sound
        
        # Add short silence between claps
        if clap_num < 2:
            silence_duration = 0.08
            silence = struct.pack('<h', 0) * int(sample_rate * silence_duration)
            sound += silence
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(sound)
    print(f"✓ Created {filename}")

if __name__ == '__main__':
    import os
    
    base_path = r'c:\Users\h\OneDrive\Documents\fur game\assets\audio'
    os.makedirs(base_path, exist_ok=True)
    
    print("Generating game sound effects...")
    generate_pop_sound(os.path.join(base_path, 'match.wav'))
    generate_swipe_sound(os.path.join(base_path, 'swipe.wav'))
    generate_combo_sound(os.path.join(base_path, 'combo.wav'))
    generate_success_sound(os.path.join(base_path, 'success.wav'))
    generate_wonderful_voice(os.path.join(base_path, 'wonderful.wav'))
    generate_clapping_sound(os.path.join(base_path, 'clapping.wav'))
    print("\n✓ All sound effects generated successfully!")
