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

  var onKeyDown = function (event) {
      if (scope.enabled === false) return;

      switch (event.keyCode) {
          case 38: // up
          case 87: // w
              moveForward = true;
              break;
          case 37: // left
          case 65: // a
              moveLeft = true;
              break;
          case 40: // down
          case 83: // s
              moveBackward = true;
              break;
          case 39: // right
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
  }.bind(this);

  var onKeyUp = function (event) {
      if (scope.enabled === false) return;

      switch (event.keyCode) {
          case 38: // up
          case 87: // w
              moveForward = false;
              break;
          case 37: // left
          case 65: // a
              moveLeft = false;
              break;
          case 40: // down
          case 83: // s
              moveBackward = false;
              break;
          case 39: // right
          case 68: // d
              moveRight = false;
              break;
          case 16: // shift
              run = false;
              break;
      }
  }.bind(this);

  var onMouseDownClick = function (event) {
      if (scope.enabled === false) return;
      scope.click = true;
  }.bind(this);

  var onMouseUpClick = function (event) {
      if (scope.enabled === false) return;
      scope.click = false;
  }.bind(this);

  scope.dispose = function () {
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('keydown', onKeyDown, false);
      document.removeEventListener('keyup', onKeyUp, false);
      document.removeEventListener('mousedown', onMouseDownClick, false);
      document.removeEventListener('mouseup', onMouseUpClick, false);
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
      if (run && (moveForward || moveBackward || moveLeft || moveRight)) {
          currentSpeed += currentSpeed * 1.1;
      }

      if (moveForward || moveBackward) {
          velocity.z -= direction.z * currentSpeed * delta;
      }
      if (moveLeft || moveRight) {
          velocity.x -= direction.x * currentSpeed * delta;
      }

      camera.position.add(velocity.clone().multiplyScalar(delta));
      camera.position.y = scope.height; // Maintain height

      prevTime = time;
  };
};

// Create a function to shoot a beam of particles
function shootBeam(origin, direction) {
  var totalParticles = 100; // Number of particles in the beam
  var pointsGeometry = new THREE.Geometry();
  var colors = [];
  var beamLength = 50; // Length of the beam

  for (var i = 0; i < totalParticles; i++) {
      var position = new THREE.Vector3().copy(direction).multiplyScalar((i / totalParticles) * beamLength).add(origin);
      pointsGeometry.vertices.push(position);

      var color = new THREE.Color(Math.random() * 0xffffff);
      colors.push(color);
  }
  pointsGeometry.colors = colors;

  var pointsMaterial = new THREE.PointsMaterial({
      size: 0.2,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      transparent: true,
      vertexColors: THREE.VertexColors
  });

  var points = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(points);

  // Update function to animate the beam
  points.update = function() {
      for (var j = 0; j < pointsGeometry.vertices.length; j++) {
          pointsGeometry.vertices[j].y -= 0.2; // Make particles move downwards
          if (pointsGeometry.vertices[j].y < 0) {
              pointsGeometry.vertices.splice(j, 1);
              j--; // Adjust index after removal
          }
      }
      pointsGeometry.verticesNeedUpdate = true; // Notify THREE.js that vertices have changed
      if (pointsGeometry.vertices.length === 0) {
          scene.remove(points); // Remove from scene if all particles are gone
      }
  };
}

// Initialize the scene
var camera, scene, renderer, controls, raycaster, arrow, world;

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

  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;
  dirLight.shadow.camera.far = 3000;

  controls = new THREE.FirstPersonControls(camera);
  scene.add(controls.getObject());

  // Floor
  var floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100);
  var floorMaterial = new THREE.MeshLambertMaterial();
  floorMaterial.color.setHSL(0.095, 1, 0.75);

  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  world.add(floor);

  // Objects
  var boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
  boxGeometry.translate(0, 0.5, 0);

  for (var i = 0; i < 100; i++) {
      var boxMaterial = new THREE.MeshLambertMaterial();
      boxMaterial.color.setHSL(Math.random(), 1, 0.75);
      var mesh = new THREE.Mesh(boxGeometry, boxMaterial);

      mesh.position.x = Math.floor(Math.random() * 50) - 25;
      mesh.position.y = 0;
      mesh.position.z = Math.floor(Math.random() * 50) - 25;

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      world.add(mesh);
  }

  scene.add(world);

  document.addEventListener('mousemove', onMouseMove, false);
  document.addEventListener('mousedown', onMouseDownClick, false);
  document.addEventListener('mouseup', onMouseUpClick, false);
  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (controls.enabled === true) {
      controls.update();

      raycaster.set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()));
      scene.remove(arrow);
      arrow = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 5, 0x000000);
      scene.add(arrow);

      if (controls.click === true) {
          // Call the shooting logic in the mouse down
          var direction = new THREE.Vector3();
          camera.getWorldDirection(direction);
          shootBeam(camera.position, direction);
          controls.click = false; // Reset click state after shooting
      }
  }

  // Update particles
  scene.children.forEach(function(child) {
      if (child instanceof THREE.Points) {
          child.update();
      }
  });

  renderer.render(scene, camera);
}
