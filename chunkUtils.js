import * as THREE from 'three';
import {NoiseGenerator} from './noise.js';

export class Chunk {

    constructor(scene, chunk_x, chunk_z, chunk_size, noise) {
        this.scene = scene;
        this.chunk = {};
        this.chunk_x = chunk_x;
        this.chunk_z = chunk_z;
        this.chunk_size = chunk_size;
        this.noise = noise;

        for (let x = 0; x < chunk_size; x++) {
            for (let z = 0; z < chunk_size; z++) {

                let y = this.getElevation(x+chunk_x,z+chunk_z);
                
                this.chunk[this.voxelKey(x+chunk_x,y,z+chunk_z)] = {
                    position: [x+chunk_x, y, z+chunk_z],
                    facesHidden: [false, false, false, false, false, false],
                    visible: false,
                };

                // for (let y = 0; y < height; y++) {
                //     this.chunk[this.voxelKey(x+chunk_x,y,z+chunk_z)] = {
                //         position: [x+chunk_x, y, z+chunk_z],
                //         facesHidden: [false, false, false, false, false, false],
                //         visible: false,
                //     };
                // }
            }
        }
    }

    getElevation(x, z) {
        return this.noise.getStupid(x, z, 0.0);
    }

    getChunk() {
        return this.chunk;
    }

    getVoxelAtPosition(x, y, z) {
        if (voxelKey(x, y, z) in this.chunk) {
            return this.chunk[voxelKey(x, y, z)];
        }
        else {
            return false;
        }
    }

    voxelKey(x, y, z) {
        return x + '.' + y + '.' + z;
    }
    
    rebuildChunk(adjacentChunk1, adjacentChunk2, adjacentChunk3, adjacentChunk4) {

        for (let k in this.chunk) {
            const currentVoxel = this.chunk[k];

            const adjVoxel1 = this.voxelKey(currentVoxel.position[0]+1, currentVoxel.position[1], currentVoxel.position[2]);
            const adjVoxel2 = this.voxelKey(currentVoxel.position[0]-1, currentVoxel.position[1], currentVoxel.position[2]);
            const adjVoxel3 = this.voxelKey(currentVoxel.position[0], currentVoxel.position[1]+1, currentVoxel.position[2]);
            const adjVoxel4 = this.voxelKey(currentVoxel.position[0], currentVoxel.position[1]-1, currentVoxel.position[2]);
            const adjVoxel5 = this.voxelKey(currentVoxel.position[0], currentVoxel.position[1], currentVoxel.position[2]+1);
            const adjVoxel6 = this.voxelKey(currentVoxel.position[0], currentVoxel.position[1], currentVoxel.position[2]-1);

            const voxelKeys = [adjVoxel1, adjVoxel2, adjVoxel3, adjVoxel4, adjVoxel5, adjVoxel6];
            var voxelCheck = [null, null, null, null, null, null]


            if ((currentVoxel.position[0]+1) % this.chunk_size == 0 && adjacentChunk1 != null) {
                voxelCheck[0] = adjVoxel1 in adjacentChunk1;
            }
            if ((currentVoxel.position[0]-1) % this.chunk_size == this.chunk_size-1 && adjacentChunk2 != null) {
                voxelCheck[1] = adjVoxel2 in adjacentChunk2;
            }
            if ((currentVoxel.position[2]+1) % this.chunk_size == 0 && adjacentChunk3 != null) {
                voxelCheck[4] = adjVoxel5 in adjacentChunk3;
            }
            if ((currentVoxel.position[2]-1) % this.chunk_size == this.chunk_size-1 && adjacentChunk4 != null) {
                voxelCheck[5] = adjVoxel6 in adjacentChunk4;
            }
            
            for (let i = 0; i < 6; i++) {
                if (voxelCheck[i] == null) { voxelCheck[i] = voxelKeys[i] in this.chunk; }

                currentVoxel.facesHidden[i] = voxelCheck[i];
                if (!voxelCheck[i]) {
                    currentVoxel.visible = true;
                }
            }


            if (currentVoxel.visible) {
                this.buildVoxelGeometry(currentVoxel);
            }
        }
    }
    
    buildVoxelGeometry(voxel) {
        // voxel.position[1]
        const grass_color = new THREE.Color( 0, 0.5+(voxel.position[1]), 0 );
        const grass_material = new THREE.MeshStandardMaterial({color: grass_color,});
        const dirt_material = new THREE.MeshStandardMaterial({color: 0x773333,});
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const cube = new THREE.Mesh(
            geometry,
            [   (voxel.facesHidden[0]) ? null : dirt_material,
                (voxel.facesHidden[1]) ? null : dirt_material,
                (voxel.facesHidden[2]) ? null : grass_material,
                (voxel.facesHidden[3]) ? null : dirt_material,
                (voxel.facesHidden[4]) ? null : dirt_material,
                (voxel.facesHidden[5]) ? null : dirt_material,
            ]
        );
        cube.position.set(voxel.position[0], voxel.position[1], voxel.position[2]);

        this.scene.add(cube);
    }
    
}

export class ChunkManager {
    constructor(scene) {
        this.scene = scene;
        this.chunkList = {};
        this.chunk_size = 8;
        // this.noise = new NoiseGenerator(10,1,100,0.5,2,128,3);
        // this.noise = new NoiseGenerator(10, 1, 100, 1, 5, 16, 1);
        this.noise = new NoiseGenerator({
            seed: 6,
            scale: 32,
            octaves: 8,
            amplitude: 4,
        });

        for (let x = 0; x < 8; x++) {
            for (let z = 0; z < 8; z++) {
                const chunk_x = x*this.chunk_size;
                const chunk_z = z*this.chunk_size;
                this.chunkList[this.chunkKey(chunk_x,chunk_z)] = {
                    position: [chunk_x, chunk_z],
                    chunk: new Chunk(scene, chunk_x, chunk_z, this.chunk_size, this.noise),
                };
            }
        }
    }

    chunkKey(x, z) {
        return x + '.' + z;
    }

    rebuildChunks() {
        for (let k in this.chunkList) {
            const currentChunk = this.chunkList[k].chunk;
            const currentChunk_x = currentChunk.chunk_x;
            const currentChunk_z = currentChunk.chunk_z;

            const adjacentChunkKey1 = this.chunkKey(currentChunk_x + this.chunk_size, currentChunk_z);
            const adjacentChunkKey2 = this.chunkKey(currentChunk_x - this.chunk_size, currentChunk_z);
            const adjacentChunkKey3 = this.chunkKey(currentChunk_x, currentChunk_z + this.chunk_size);
            const adjacentChunkKey4 = this.chunkKey(currentChunk_x, currentChunk_z - this.chunk_size);

            const adjacentChunk1 = (adjacentChunkKey1 in this.chunkList) ? this.chunkList[adjacentChunkKey1].chunk.chunk : null;
            const adjacentChunk2 = (adjacentChunkKey2 in this.chunkList) ? this.chunkList[adjacentChunkKey2].chunk.chunk : null;
            const adjacentChunk3 = (adjacentChunkKey3 in this.chunkList) ? this.chunkList[adjacentChunkKey3].chunk.chunk : null;
            const adjacentChunk4 = (adjacentChunkKey4 in this.chunkList) ? this.chunkList[adjacentChunkKey4].chunk.chunk : null;

            currentChunk.rebuildChunk(adjacentChunk1, adjacentChunk2, adjacentChunk3, adjacentChunk4);
        }
    }
}