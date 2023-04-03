import {simplex} from './simplex-noise.js';

export class NoiseGenerator {

    constructor(seed, min, max, persistence, lacunarity, scale, octaves) {
        this.seed = seed;
        this.range_min = min;
        this.range_max = max;
        this.persistence = persistence;
        this.lacunarity = 2.0**(-lacunarity);
        this.scale = scale;
        this.octaves = octaves;
        this.noise = new simplex.SimplexNoise(seed);
    }

    get(x, y, z) {
        let xs = x / this.scale;
        let ys = y / this.scale;
        let zs = z / this.scale;

        let frequency = 1;
        let amplitude = 1;
        let normalization = 0;
        let total = 0;

        for (let octave = 0; octave < this.octaves; octave++) {
            let noiseValue = this.noise.noise3D(x * frequency, y * frequency, z * frequency);
            total += noiseValue * amplitude;
            normalization += amplitude;
            amplitude *= this.persistence;
            frequency *= this.lacunarity;
        }

        total /= normalization;
        total *= 100;
        total = Math.min(Math.max(total, this.range_min), this.range_max);
        return Math.round(total);
    }
}