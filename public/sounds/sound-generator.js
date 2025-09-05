const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const SAMPLE_RATE = 44100;
const BIT_DEPTH = 16;

/**
 * Generate a sound sample
 * @param {number} frequency - The frequency of the sound
 * @param {number} duration - Duration in seconds
 * @param {string} type - Oscillator type ('sine', 'square', 'sawtooth', 'triangle')
 * @param {number} gain - Volume level (0-1)
 * @param {number} fadeIn - Fade in duration in seconds
 * @param {number} fadeOut - Fade out duration in seconds
 * @returns {Float32Array} - The audio sample
 */
function generateSample(frequency, duration, type = 'sine', gain = 0.5, fadeIn = 0.01, fadeOut = 0.01) {
    const numSamples = Math.floor(SAMPLE_RATE * duration);
    const buffer = new Float32Array(numSamples);
    const fadeInSamples = Math.floor(fadeIn * SAMPLE_RATE);
    const fadeOutSamples = Math.floor(fadeOut * SAMPLE_RATE);
    
    // Generate the waveform
    for (let i = 0; i < numSamples; i++) {
        const t = i / SAMPLE_RATE;
        let sample = 0;
        
        // Generate different waveforms based on type
        switch (type) {
            case 'sine':
                sample = Math.sin(2 * Math.PI * frequency * t);
                break;
            case 'square':
                sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
                break;
            case 'sawtooth':
                sample = 2 * ((t * frequency) % 1) - 1;
                break;
            case 'triangle':
                sample = 2 * Math.abs(2 * ((t * frequency) % 1) - 1) - 1;
                break;
        }
        
        // Apply fade in/out
        let amplitude = gain;
        if (i < fadeInSamples) {
            amplitude *= i / fadeInSamples;
        } else if (i > numSamples - fadeOutSamples) {
            amplitude *= (numSamples - i) / fadeOutSamples;
        }
        
        buffer[i] = sample * amplitude;
    }
    
    return buffer;
}

/**
 * Mix multiple sound samples together
 * @param {Array<Object>} sounds - Array of sound objects with sample and offset properties
 * @param {number} duration - Total duration in seconds
 * @returns {Float32Array} - The mixed audio sample
 */
function mixSamples(sounds, duration) {
    const numSamples = Math.floor(SAMPLE_RATE * duration);
    const mixedBuffer = new Float32Array(numSamples);
    
    // Fill with silence
    for (let i = 0; i < numSamples; i++) {
        mixedBuffer[i] = 0;
    }
    
    // Mix all sounds
    for (const sound of sounds) {
        const offsetSamples = Math.floor(sound.offset * SAMPLE_RATE);
        for (let i = 0; i < sound.sample.length; i++) {
            const mixIndex = i + offsetSamples;
            if (mixIndex < numSamples) {
                mixedBuffer[mixIndex] += sound.sample[i];
            }
        }
    }
    
    // Normalize to prevent clipping
    let maxAmplitude = 0;
    for (let i = 0; i < numSamples; i++) {
        maxAmplitude = Math.max(maxAmplitude, Math.abs(mixedBuffer[i]));
    }
    
    if (maxAmplitude > 1) {
        for (let i = 0; i < numSamples; i++) {
            mixedBuffer[i] /= maxAmplitude;
        }
    }
    
    return mixedBuffer;
}

/**
 * Convert audio samples to WAV format
 * @param {Float32Array} samples - The audio samples
 * @returns {Blob} - WAV blob
 */
function encodeWAV(samples) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    
    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, 1, true); // num channels (mono)
    view.setUint32(24, SAMPLE_RATE, true); // sample rate
    view.setUint32(28, SAMPLE_RATE * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, BIT_DEPTH, true); // bits per sample
    
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    
    // Write the PCM samples
    const volume = 1;
    let index = 44;
    for (let i = 0; i < samples.length; i++) {
        view.setInt16(index, samples[i] * 0x7FFF * volume, true);
        index += 2;
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Helper function to write a string to a DataView
 */
function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * Create a download link for a blob
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename
 */
function createDownloadLink(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// Sound generators
function createButtonClickSound() {
    const sounds = [
        { sample: generateSample(1800, 0.02, 'sine', 0.5), offset: 0 },
        { sample: generateSample(2400, 0.02, 'sine', 0.5), offset: 0.03 }
    ];
    return mixSamples(sounds, 0.1);
}

function createButtonHoverSound() {
    const sounds = [
        { sample: generateSample(1600, 0.01, 'sine', 0.3), offset: 0 }
    ];
    return mixSamples(sounds, 0.05);
}

function createAlertSound() {
    const sounds = [
        { sample: generateSample(1600, 0.1, 'square', 0.4), offset: 0 },
        { sample: generateSample(1200, 0.1, 'square', 0.4), offset: 0.15 },
        { sample: generateSample(1600, 0.1, 'square', 0.4), offset: 0.3 }
    ];
    return mixSamples(sounds, 0.5);
}

function createSuccessSound() {
    const sounds = [
        { sample: generateSample(1300, 0.04, 'sine', 0.4), offset: 0 },
        { sample: generateSample(1800, 0.04, 'sine', 0.4), offset: 0.05 },
        { sample: generateSample(2300, 0.04, 'sine', 0.4), offset: 0.1 }
    ];
    return mixSamples(sounds, 0.2);
}

function createNegativeSound() {
    const sounds = [
        { sample: generateSample(800, 0.1, 'sawtooth', 0.4), offset: 0 },
        { sample: generateSample(600, 0.1, 'sawtooth', 0.4), offset: 0.12 }
    ];
    return mixSamples(sounds, 0.3);
}

function createProcessingSound() {
    const sounds = [];
    for (let i = 0; i < 3; i++) {
        sounds.push({
            sample: generateSample(1400 + i * 200, 0.04, 'sine', 0.4),
            offset: i * 0.08
        });
    }
    return mixSamples(sounds, 0.3);
}

function createChartEditSound() {
    const sounds = [
        { sample: generateSample(1600, 0.02, 'triangle', 0.4), offset: 0 },
        { sample: generateSample(1900, 0.02, 'triangle', 0.4), offset: 0.03 },
        { sample: generateSample(2200, 0.02, 'triangle', 0.4), offset: 0.06 }
    ];
    return mixSamples(sounds, 0.15);
}

function createNotificationSound() {
    const sounds = [
        { sample: generateSample(2200, 0.03, 'sine', 0.4), offset: 0 },
        { sample: generateSample(1800, 0.03, 'sine', 0.4), offset: 0.04 },
        { sample: generateSample(2200, 0.03, 'sine', 0.4), offset: 0.08 }
    ];
    return mixSamples(sounds, 0.15);
}

function createShareReportSound() {
    const sounds = [
        { sample: generateSample(1200, 0.04, 'sine', 0.4), offset: 0 },
        { sample: generateSample(1600, 0.04, 'sine', 0.4), offset: 0.05 }
    ];
    return mixSamples(sounds, 0.15);
}

function createToggleOnSound() {
    const sounds = [
        { sample: generateSample(1400, 0.03, 'sine', 0.4), offset: 0 },
        { sample: generateSample(1800, 0.03, 'sine', 0.4), offset: 0.04 }
    ];
    return mixSamples(sounds, 0.1);
}

function createToggleOffSound() {
    const sounds = [
        { sample: generateSample(1800, 0.03, 'sine', 0.4), offset: 0 },
        { sample: generateSample(1400, 0.03, 'sine', 0.4), offset: 0.04 }
    ];
    return mixSamples(sounds, 0.1);
}

// Create and download all sound files
function generateAllSounds() {
    const sounds = [
        { name: 'lcars_beep1.mp3', generator: createButtonClickSound },
        { name: 'lcars_hover.mp3', generator: createButtonHoverSound },
        { name: 'lcars_alert.mp3', generator: createAlertSound },
        { name: 'lcars_success.mp3', generator: createSuccessSound },
        { name: 'lcars_negative.mp3', generator: createNegativeSound },
        { name: 'lcars_processing.mp3', generator: createProcessingSound },
        { name: 'lcars_edit.mp3', generator: createChartEditSound },
        { name: 'lcars_notification.mp3', generator: createNotificationSound },
        { name: 'lcars_share.mp3', generator: createShareReportSound },
        { name: 'lcars_toggle_on.mp3', generator: createToggleOnSound },
        { name: 'lcars_toggle_off.mp3', generator: createToggleOffSound }
    ];
    
    // Queue up all downloads with a delay between each
    sounds.forEach((sound, index) => {
        setTimeout(() => {
            const sample = sound.generator();
            const wav = encodeWAV(sample);
            createDownloadLink(wav, sound.name);
            console.log(`Generated ${sound.name}`);
        }, index * 1000);
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    generateButton.addEventListener('click', generateAllSounds);
    
    const playSoundButtons = document.querySelectorAll('[data-sound]');
    playSoundButtons.forEach(button => {
        button.addEventListener('click', () => {
            const soundType = button.getAttribute('data-sound');
            playSound(soundType);
        });
    });
});

// Play individual sounds for preview
function playSound(soundType) {
    let sample;
    
    switch(soundType) {
        case 'buttonClick': sample = createButtonClickSound(); break;
        case 'buttonHover': sample = createButtonHoverSound(); break;
        case 'alert': sample = createAlertSound(); break;
        case 'success': sample = createSuccessSound(); break;
        case 'negative': sample = createNegativeSound(); break;
        case 'processing': sample = createProcessingSound(); break;
        case 'chartEdit': sample = createChartEditSound(); break;
        case 'notification': sample = createNotificationSound(); break;
        case 'shareReport': sample = createShareReportSound(); break;
        case 'toggleOn': sample = createToggleOnSound(); break;
        case 'toggleOff': sample = createToggleOffSound(); break;
        default: return;
    }
    
    const buffer = audioContext.createBuffer(1, sample.length, SAMPLE_RATE);
    buffer.getChannelData(0).set(sample);
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
}
