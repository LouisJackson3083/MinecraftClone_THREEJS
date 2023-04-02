import * as THREE from 'three';

export class Chunk {

    constructor(scene, chunk_x, chunk_z) {
        this.scene = scene;
        this.chunk = {};
        this.chunk_x = chunk_x;
        this.chunk_z = chunk_z;

        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                for (let z = 0; z < 4; z++) {
                    this.chunk[this.voxelKey(x,y,z)] = {
                        position: [x, y, z],
                        facesHidden: [false, false, false, false, false, false],
                        visible: false,
                    };
                }
            }
        }
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
            var adjVoxel1, adjVoxel2, adjVoxel5, adjVoxel6;

            if (currentVoxel.position[0]+1 > 3 && adjacentChunk1 != null) {
                adjVoxel1 = adjacentChunk1.voxelKey(0, currentVoxel.position[1], currentVoxel.position[2]);
            } else {
                adjVoxel1 = this.voxelKey(currentVoxel.position[0]+1, currentVoxel.position[1], currentVoxel.position[2]);
            }

            if (currentVoxel.position[0]-1 < 0 && adjacentChunk2 != null) {
                adjVoxel2 = adjacentChunk2.voxelKey(3, currentVoxel.position[1], currentVoxel.position[2]);
            } else {
                adjVoxel2 = this.voxelKey(currentVoxel.position[0]-1, currentVoxel.position[1], currentVoxel.position[2]);
            }

            const adjVoxel3 = this.voxelKey(currentVoxel.position[0], currentVoxel.position[1]+1, currentVoxel.position[2]);
            const adjVoxel4 = this.voxelKey(currentVoxel.position[0], currentVoxel.position[1]-1, currentVoxel.position[2]);

            if (currentVoxel.position[2]+1 > 3 && adjacentChunk3 != null) {
                adjVoxel5 = adjacentChunk3.voxelKey(currentVoxel.position[0], currentVoxel.position[1], 0);
            } else {
                adjVoxel5 = this.voxelKey(currentVoxel.position[0], currentVoxel.position[1], currentVoxel.position[2]+1);
            }

            if (currentVoxel.position[2]-1 < 0 && adjacentChunk4 != null) {
                adjVoxel6 = adjacentChunk4.voxelKey(currentVoxel.position[0], currentVoxel.position[1], 3);
            } else {
                adjVoxel6 = this.voxelKey(currentVoxel.position[0], currentVoxel.position[1], currentVoxel.position[2]-1);
            }

            const voxelKeys = [adjVoxel1, adjVoxel2, adjVoxel3, adjVoxel4, adjVoxel5, adjVoxel6];
            
            for (let i = 0; i < 6; i++) {
                const isVoxelAdjacent = voxelKeys[i] in this.chunk;
                currentVoxel.facesHidden[i] = isVoxelAdjacent;
                if (!isVoxelAdjacent) {
                    currentVoxel.visible = true;
                }
            }

            if (currentVoxel.visible) {
                this.buildVoxelGeometry(currentVoxel);
            }
        }
    }
    
    buildVoxelGeometry(voxel) {
        const material = new THREE.MeshStandardMaterial({color: 0x00ff00,});
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const cube = new THREE.Mesh(
            geometry,
            [   (voxel.facesHidden[0]) ? null : material,
                (voxel.facesHidden[1]) ? null : material,
                (voxel.facesHidden[2]) ? null : material,
                (voxel.facesHidden[3]) ? null : material,
                (voxel.facesHidden[4]) ? null : material,
                (voxel.facesHidden[5]) ? null : material,
            ]
        );
        cube.position.set((this.chunk_x*4 + voxel.position[0]) * 1.25, voxel.position[1] * 1.25, (this.chunk_z*4 + voxel.position[2]) * 1.25);

        this.scene.add(cube);
    }
    
}

export class ChunkManager {
    constructor(scene) {
        this.scene = scene;
        this.chunkList = {};

        for (let x = 0; x < 4; x++) {
            for (let z = 0; z < 4; z++) {
                this.chunkList[this.chunkKey(x,z)] = {
                    position: [x, z],
                    chunk: new Chunk(scene, x, z),
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

            const adjacentChunkKey1 = this.chunkKey(currentChunk_x+1, currentChunk_z);
            const adjacentChunkKey2 = this.chunkKey(currentChunk_x-2, currentChunk_z);
            const adjacentChunkKey3 = this.chunkKey(currentChunk_x, currentChunk_z+1);
            const adjacentChunkKey4 = this.chunkKey(currentChunk_x, currentChunk_z-1);

            const adjacentChunk1 = (adjacentChunkKey1 in this.chunkList) ? this.chunkList[adjacentChunkKey1].chunk : null;
            const adjacentChunk2 = (adjacentChunkKey2 in this.chunkList) ? this.chunkList[adjacentChunkKey2].chunk : null;
            const adjacentChunk3 = (adjacentChunkKey3 in this.chunkList) ? this.chunkList[adjacentChunkKey3].chunk : null;
            const adjacentChunk4 = (adjacentChunkKey4 in this.chunkList) ? this.chunkList[adjacentChunkKey4].chunk : null;

            currentChunk.rebuildChunk(adjacentChunk1, adjacentChunk2, adjacentChunk3, adjacentChunk4);
        }
    }
}