// Import Three.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';

// Get the canvas element
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Set up the Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

// Set up the game variables
let playerX = 0;
let playerY = 0;
let playerZ = 0;
let playerSpeed = 0.1;
let playerRotation = 0;
let playerHealth = 100;
let enemies = [];

// Set up the player model
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(playerMesh);

// Set up the enemy model
const enemyGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);

// Set up the event listeners
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            playerZ -= playerSpeed;
            break;
        case 'a':
            playerX -= playerSpeed;
            break;
        case 's':
            playerZ += playerSpeed;
            break;
        case 'd':
            playerX += playerSpeed;
            break;
        case ' ':
            // Shoot a bullet
            const bulletGeometry = new THREE.SphereGeometry(0.1, 32, 32);
            const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
            bulletMesh.position.set(playerX, playerY, playerZ);
            scene.add(bulletMesh);
            break;
    }
});

document.addEventListener('mousemove', (e) => {
    // Update the player rotation based on mouse movement
    playerRotation = (e.clientX / canvas.width) * Math.PI * 2;
});

// Game loop
function update() {
    // Update the player position and rotation
    playerMesh.position.set(playerX, playerY, playerZ);
    playerMesh.rotation.y = playerRotation;

    // Update the enemies
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        enemy.position.x += Math.random() - 0.5;
        enemy.position.z += Math.random() - 0.5;
        if (enemy.position.distanceTo(playerMesh.position) < 1) {
            // Enemy collision detection
            playerHealth -= 10;
        }
    }

    // Render the scene
    renderer.render(scene, camera);

    // Request the next frame
    requestAnimationFrame(update);
}

// Start the game loop
update();