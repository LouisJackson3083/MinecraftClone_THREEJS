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
    
    rebuildChunk() {
        for (let k in this.chunk) {
            const currentVoxel = this.chunk[k];
            console.log(currentVoxel);
            const adjVoxel1 = this.voxelKey(currentVoxel.position[0]+1, currentVoxel.position[1], currentVoxel.position[2]);
            const adjVoxel2 = this.voxelKey(currentVoxel.position[0]-1, currentVoxel.position[1], currentVoxel.position[2]);
            const adjVoxel3 = this.voxelKey(currentVoxel.position[0], currentVoxel.position[1]+1, currentVoxel.position[2]);
            const adjVoxel4 = this.voxelKey(currentVoxel.position[0], currentVoxel.position[1]-1, currentVoxel.position[2]);
            const adjVoxel5 = this.voxelKey(currentVoxel.position[0], currentVoxel.position[1], currentVoxel.position[2]+1);
            const adjVoxel6 = this.voxelKey(currentVoxel.position[0], currentVoxel.position[1], currentVoxel.position[2]-1);
            const voxelKeys = [adjVoxel1, adjVoxel2, adjVoxel3, adjVoxel4, adjVoxel5, adjVoxel6];
            for (let i = 0; i < 6; i++) {
                const isVoxelAdjacent = voxelKeys[i] in this.chunk;
                currentVoxel.facesHidden[i] = isVoxelAdjacent;
                if (!isVoxelAdjacent) {
                    currentVoxel.visible = true;
                }
            }
            console.log(currentVoxel.visible);

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
        cube.position.set((this.chunk_x + voxel.position[0]) * 1.25, voxel.position[1] * 1.25, (this.chunk_z + voxel.position[2]) * 1.25);

        this.scene.add(cube);
    }
    
}
