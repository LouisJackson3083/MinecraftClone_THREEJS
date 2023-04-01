import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function initializeThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );    
    controls = new OrbitControls( camera, renderer.domElement );
}

var scene, camera, renderer, controls;
initializeThreeJS();

const voxelMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00,});
const voxelGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
var facesHidden = [false, false, false, false, false, false];
const chunk = {};

function voxelKey(x, y, z) {
    return x + '.' + y + '.' + z;
}

for (let x = 0; x < 4; x++) {
    for (let z = 0; z < 4; z++) {
        chunk[voxelKey(x,0,z)] = {
            position: [x, 0, z],
            facesHidden: [false, false, false, false, false, false],
        };
        // const cube = new THREE.Mesh(
        //     voxelGeometry,
        //     voxelMaterial);
        // cube.position.set(x * 1.25, 0, z * 1.25);
        // scene.add(cube);
        
    }
}

for (let k in chunk) {
    const currentVoxel = chunk[k];
    console.log(currentVoxel);
    const adjVoxel1 = voxelKey(currentVoxel.position[0]+1, currentVoxel.position[1], currentVoxel.position[2]);
    const adjVoxel2 = voxelKey(currentVoxel.position[0]-1, currentVoxel.position[1], currentVoxel.position[2]);
    const adjVoxel3 = voxelKey(currentVoxel.position[0], currentVoxel.position[1]+1, currentVoxel.position[2]);
    const adjVoxel4 = voxelKey(currentVoxel.position[0], currentVoxel.position[1]-1, currentVoxel.position[2]);
    const adjVoxel5 = voxelKey(currentVoxel.position[0], currentVoxel.position[1], currentVoxel.position[2]+1);
    const adjVoxel6 = voxelKey(currentVoxel.position[0], currentVoxel.position[1], currentVoxel.position[2]-1);
    const voxelKeys = [adjVoxel1, adjVoxel2, adjVoxel3, adjVoxel4, adjVoxel5, adjVoxel6];
    for (let i = 0; i < 6; i++) {
        currentVoxel.facesHidden[i] = (voxelKeys[i] in chunk);
    }
    console.log(currentVoxel.facesHidden);

    const cube = new THREE.Mesh(
        voxelGeometry,
        [   (currentVoxel.facesHidden[0]) ? null : voxelMaterial,
            (currentVoxel.facesHidden[1]) ? null : voxelMaterial,
            (currentVoxel.facesHidden[2]) ? null : voxelMaterial,
            (currentVoxel.facesHidden[3]) ? null : voxelMaterial,
            (currentVoxel.facesHidden[4]) ? null : voxelMaterial,
            (currentVoxel.facesHidden[5]) ? null : voxelMaterial,
        ]
    );
    cube.position.set(currentVoxel.position[0] * 1.25, currentVoxel.position[1], currentVoxel.position[2] * 1.25);
    scene.add(cube);
}


// console.log(chunk);

// Object.keys(chunk).forEach( cell => {
//     console.log("Position of cell :", cell.position);
//     console.log("facesHidden of cell :", cell.facesHidden);
// });



// set up ground
const groundGeometry = new THREE.BoxGeometry(8, 0.5, 8);
const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xfafafa });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.receiveShadow = true;
groundMesh.position.y = -2;
scene.add(groundMesh);

const al = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(al);

const dl = new THREE.DirectionalLight(0xffffff, 0.5);
dl.position.set(-2, 5, -5);
dl.castShadow = true;
const dlHelper = new THREE.DirectionalLightHelper(dl, 3);
scene.add(dl);

camera.position.set( 5, 5, 5 );
controls.update();



function animate() {
	requestAnimationFrame( animate );

	controls.update();

	renderer.render( scene, camera );
}

animate();