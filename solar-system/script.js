// Initialize scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Enhanced lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2, 100);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Create Sun (larger and brighter)
const sunGeometry = new THREE.SphereGeometry(6, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 2
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planet data with enhanced visibility
const planets = [
    { name: 'Mercury', radius: 1.2, color: 0xBBBBBB, distance: 15, speed: 0.04 },
    { name: 'Venus', radius: 1.5, color: 0xE6C229, distance: 25, speed: 0.03 },
    { name: 'Earth', radius: 1.6, color: 0x6B93D6, distance: 35, speed: 0.02 },
    { name: 'Mars', radius: 1.3, color: 0xE27B58, distance: 45, speed: 0.015 },
    { name: 'Jupiter', radius: 2.8, color: 0xE3DCCB, distance: 65, speed: 0.01 },
    { name: 'Saturn', radius: 2.4, color: 0xF5E4B7, distance: 85, speed: 0.007, hasRing: true },
    { name: 'Uranus', radius: 2.0, color: 0xACE5EE, distance: 105, speed: 0.005 },
    { name: 'Neptune', radius: 2.0, color: 0x4169E1, distance: 125, speed: 0.003 }
];

const planetObjects = [];
let globalSpeedMultiplier = 1;

// Create planets with clear revolution paths
planets.forEach(planet => {
    const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: planet.color,
        shininess: 10
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position in circular orbit
    mesh.position.x = planet.distance;
    
    // Add ring for Saturn
    if (planet.hasRing) {
        const ringGeometry = new THREE.RingGeometry(
            planet.radius * 1.3, 
            planet.radius * 2, 
            32
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xDDDDDD,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
    }
    
    scene.add(mesh);
    planetObjects.push({
        mesh,
        distance: planet.distance,
        speed: planet.speed,
        angle: Math.random() * Math.PI * 2 // Random starting position
    });
    
    // Add orbit path (visible guide)
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0x444444,
        transparent: true,
        opacity: 0.5
    });
    const points = [];
    const segments = 64;
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
            Math.cos(theta) * planet.distance,
            0,
            Math.sin(theta) * planet.distance
        ));
    }
    
    orbitGeometry.setFromPoints(points);
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbit);
});

// Set camera view
camera.position.set(0, 50, 150);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.minDistance = 50;
controls.maxDistance = 300;

// Animation control
let isPaused = false;
document.getElementById('pause-btn').addEventListener('click', () => {
    isPaused = !isPaused;
    document.getElementById('pause-btn').textContent = isPaused ? "▶ Play" : "⏸ Pause";
});

// Speed controls
document.getElementById('speed-up').addEventListener('click', () => {
    globalSpeedMultiplier *= 1.5;
});

document.getElementById('slow-down').addEventListener('click', () => {
    globalSpeedMultiplier /= 1.5;
});

// Animation loop with clear revolution
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (!isPaused) {
        planetObjects.forEach(planet => {
            // Update revolution angle
            planet.angle += planet.speed * delta * globalSpeedMultiplier;
            
            // Calculate new position
            planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
            planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
            
            // Rotate planet on axis
            planet.mesh.rotation.y += 0.01 * globalSpeedMultiplier;
        });
    }
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});