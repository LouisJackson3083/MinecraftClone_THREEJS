import {simplex} from './simplex-noise.js';

export class NoiseGenerator {

    constructor(params) {
        this.params = params;
        this.noise = new simplex.SimplexNoise(this.params.seed);
        // Seed - determines the random seed to generate noise from
        // Scale - determines the scale the noise should be generated at. Larger = smoother, smaller = rougher
        // Octaves - determines how fractal the noise should be, a larger octave creates a larger complexity
        // Amplitude - determines how dramatic the terrain should be
        // exponentiation - determines the exponent of our y value
    }

    // get(x, y, z) {
    //     let xs = x / this.scale;
    //     let ys = y / this.scale;
    //     let zs = z / this.scale;

    //     let frequency = 1;
    //     let amplitude = 1;
    //     let normalization = 0;
    //     let total = 0;

    //     for (let octave = 0; octave < this.octaves; octave++) {
    //         let noiseValue = this.noise.noise3D(x * frequency, y * frequency, z * frequency);
    //         total += noiseValue * amplitude;
    //         normalization += amplitude;
    //         amplitude *= this.persistence;
    //         frequency *= this.lacunarity;
    //     }

    //     total /= normalization;
    //     total *= 100;
    //     total = Math.min(Math.max(total, this.range_min), this.range_max);
    //     return Math.round(total);
    // }

    getStupid(x, y, z) {
        let xs = x / this.params.scale;
        let ys = y / this.params.scale;
        let zs = z / this.params.scale;

        let totalNoise = 0;
        let frequency = 1;
        let amplitude = this.params.amplitude;
        
        for (let octave = 0; octave < this.params.octaves; octave++ ) {
            totalNoise += amplitude * this.noise.noise3D((xs + octave) * frequency, (ys + octave) * frequency, (zs + octave) * frequency) / frequency;
            frequency += 1;
            amplitude /= frequency;
            
        }

        totalNoise = Math.pow(totalNoise, 2);

        return totalNoise;
    }
}