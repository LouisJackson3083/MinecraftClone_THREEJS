import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Chunk } from './chunkUtils.js';

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

var chunk1 = new Chunk(scene, 0, 0);
var chunk2 = new Chunk(scene, 4, 0);
var chunk3 = new Chunk(scene, 0, 4);
var chunk4 = new Chunk(scene, 4, 4);
chunk1.rebuildChunk();
chunk2.rebuildChunk();
chunk3.rebuildChunk();
chunk4.rebuildChunk();

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