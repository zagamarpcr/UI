THREE.FirstPersonControls = function (camera, MouseMoveSensitivity = 0.002, speed = 800.0, jumpHeight = 350.0, height = 30.0) {
  var scope = this;

  scope.MouseMoveSensitivity = MouseMoveSensitivity;
  scope.speed = speed;
  scope.height = height;
  scope.jumpHeight = scope.height + jumpHeight;
  scope.click = false;

  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;
  var canJump = false;
  var run = false;

  var velocity = new THREE.Vector3();
  var direction = new THREE.Vector3();

  var prevTime = performance.now();

  camera.rotation.set(0, 0, 0);

  var pitchObject = new THREE.Object3D();
  pitchObject.add(camera);

  var yawObject = new THREE.Object3D();
  yawObject.position.y = 10;
  yawObject.add(pitchObject);

  var PI_2 = Math.PI / 2;

  var onMouseMove = function (event) {
    if (scope.enabled === false) return;

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    yawObject.rotation.y -= movementX * scope.MouseMoveSensitivity;
    pitchObject.rotation.x -= movementY * scope.MouseMoveSensitivity;

    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
  };

  var onKeyDown = (function (event) {
    if (scope.enabled === false) return;

    switch (event.keyCode) {
      case 87: // w
        moveForward = true;
        break;

      case 65: // a
        moveLeft = true;
        break;

      case 83: // s
        moveBackward = true;
        break;

      case 68: // d
        moveRight = true;
        break;

      case 32: // space
        if (canJump === true) velocity.y += run === false ? scope.jumpHeight : scope.jumpHeight + 50;
        canJump = false;
        break;

      case 16: // shift
        run = true;
        break;
    }
  }).bind(this);

  var onKeyUp = (function (event) {
    if (scope.enabled === false) return;

    switch (event.keyCode) {
      case 87: // w
        moveForward = false;
        break;

      case 65: // a
        moveLeft = false;
        break;

      case 83: // s
        moveBackward = false;
        break;

      case 68: // d
        moveRight = false;
        break;

      case 16: // shift
        run = false;
        break;
    }
  }).bind(this);

  var onMouseDownClick = (function (event) {
    if (scope.enabled === false) return;
    scope.click = true;
  }).bind(this);

  var onMouseUpClick = (function (event) {
    if (scope.enabled === false) return;
    scope.click = false;
  }).bind(this);

  scope.dispose = function () {
    document.removeEventListener('mousemove', onMouseMove, false);
    document.removeEventListener('keydown', onKeyDown, false);
    document.removeEventListener('keyup', onKeyUp, false);
    document.removeEventListener('mousedown', onMouseDownClick, false);
    document.removeEventListener('mouseup', onMouseUpClick, false);
  };

  document.addEventListener('mousemove', onMouseMove, false);
  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);
  document.addEventListener('mousedown', onMouseDownClick, false);
  document.addEventListener('mouseup', onMouseUpClick, false);

  scope.enabled = false;

  scope.getObject = function () {
    return yawObject;
  };

  scope.update = function () {
    var time = performance.now();
    var delta = (time - prevTime) / 1000;

    velocity.y -= 9.8 * 100.0 * delta;
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    var currentSpeed = scope.speed;
    if (run && (moveForward || moveBackward || moveLeft || moveRight)) currentSpeed *= 1.1;

    if (moveForward || moveBackward) velocity.z -= direction.z * currentSpeed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * currentSpeed * delta;

    scope.getObject().translateX(-velocity.x * delta);
    scope.getObject().translateZ(velocity.z * delta);

    scope.getObject().position.y += (velocity.y * delta);

    if (scope.getObject().position.y < scope.height) {
      velocity.y = 0;
      scope.getObject().position.y = scope.height;
      canJump = true;
    }
    prevTime = time;
  };
};

var instructions = document.querySelector("#instructions");
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if (havePointerLock) {
  var element = document.body;
  var pointerlockchange = function (event) {
    if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
      controls.enabled = true;
      instructions.style.display = 'none';
    } else {
      controls.enabled = false;
      instructions.style.display = '-webkit-box';
    }
  };
  var pointerlockerror = function (event) {
    instructions.style.display = 'none';
  };

  document.addEventListener('pointerlockchange', pointerlockchange, false);
  document.addEventListener('mozpointerlockchange', pointerlockchange, false);
  document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
  document.addEventListener('pointerlockerror', pointerlockerror, false);
  document.addEventListener('mozpointerlockerror', pointerlockerror, false);
  document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

  instructions.addEventListener('click', function (event) {
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    if (/Firefox/i.test(navigator.userAgent)) {
      var fullscreenchange = function (event) {
        if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
          document.removeEventListener('fullscreenchange', fullscreenchange);
          document.removeEventListener('mozfullscreenchange', fullscreenchange);
          element.requestPointerLock();
        }
      };
      document.addEventListener('fullscreenchange', fullscreenchange, false);
      document.addEventListener('mozfullscreenchange', fullscreenchange, false);
      element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
      element.requestFullscreen();
    } else {
      element.requestPointerLock();
    }
  }, false);
} else {
  instructions.innerHTML = 'Your browser does not support PointerLock';
}

var camera, scene, renderer, controls, raycaster, arrow, world, particlesArray = [];

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
  
  world = new THREE.Group();
  
  raycaster = new THREE.Raycaster(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()));
  arrow = new THREE.ArrowHelper(camera.getWorldDirection(new THREE.Vector3()), camera.getWorldPosition(new THREE.Vector3()), 3, 0x000000);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 0, 2000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
  renderer.outputEncoding = THREE.sRGBEncoding;

  window.addEventListener('resize', onWindowResize, false);

  var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0, 100, 0.4);
  scene.add(light);

  var dirLight = new THREE.SpotLight(0xffffff, .5, 0.0, 180.0);
  dirLight.color.setHSL(0.1, 1, 0.95);
  dirLight.position.set(0, 300, 100);
  dirLight.castShadow = true;
  dirLight.lookAt(new THREE.Vector3());
  scene.add(dirLight);
  
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 100;
  dirLight.shadow.camera.far = 2000;
  dirLight.shadow.camera.fov = 50;

  controls = new THREE.FirstPersonControls(camera);
  controls.enabled = true;
}

function randomPosition(scale) {
  return [
    (Math.random() - 0.5) * scale,
    (Math.random() - 0.5) * scale,
    (Math.random() - 0.5) * scale
  ];
}

function makeParticles(intersectPosition) {
  var totalParticles = 80;
  var pointsGeometry = new THREE.BufferGeometry();
  var positions = new Float32Array(totalParticles * 3); // 3 for x, y, z
  var colors = new Float32Array(totalParticles * 3); // 3 for r, g, b

  for (var i = 0; i < totalParticles; i++) {
    var position = randomPosition(0.5);
    positions[i * 3] = intersectPosition.x + position[0];
    positions[i * 3 + 1] = intersectPosition.y + position[1];
    positions[i * 3 + 2] = intersectPosition.z + position[2];

    var color = new THREE.Color(Math.random());
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  var pointsMaterial = new THREE.PointsMaterial({
    size: 0.8,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    transparent: true,
    vertexColors: true // Use vertex colors
  });

  var particles = new THREE.Points(pointsGeometry, pointsMaterial);

  // Update particles over time (gravity)
  particles.update = function () {
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < totalParticles; i++) {
      positions[i * 3 + 1] -= 0.03; // Apply gravity

      // Check if particle is below ground level
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 0; // Reset to ground level
      }
    }
    particles.geometry.attributes.position.needsUpdate = true; // Notify Three.js to update
  };

  particlesArray.push(particles);
  scene.add(particles);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  
  if (controls.enabled) {
    controls.update();
  }

  if (controls.click) {
    raycaster.set(camera.position, camera.getWorldDirection(new THREE.Vector3()));
    var intersects = raycaster.intersectObjects([/* your scene objects here */]);
    if (intersects.length > 0) {
      makeParticles(intersects[0].point);
      controls.click = false;
    }
  }

  if (particlesArray.length > 0) {
    particlesArray.forEach((particleSystem) => {
      particleSystem.update();
      // Optionally remove if needed
    });
  }

  renderer.render(scene, camera);
}
