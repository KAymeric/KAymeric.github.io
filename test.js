import * as THREE from 'https://cdn.skypack.dev/three@0.136';

import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';

const DEFAULT_MASS = 0;


class RigidBody {
  constructor() {
  }

  setRestitution(val) {
    this.body_.setRestitution(val);
  }

  setFriction(val) {
    this.body_.setFriction(val);
  }

  setRollingFriction(val) {
    this.body_.setRollingFriction(val);
  }

  createBox(mass, pos, quat, size) {
    this.transform_ = new Ammo.btTransform();
    this.transform_.setIdentity();
    this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    this.transform_.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);

    const btSize = new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5);
    this.shape_ = new Ammo.btBoxShape(btSize);
    this.shape_.setMargin(0.05);

    this.inertia_ = new Ammo.btVector3(0, 0, 0);
    if (mass > 0) {
      this.shape_.calculateLocalInertia(mass, this.inertia_);
    }

    this.info_ = new Ammo.btRigidBodyConstructionInfo(
        mass, this.motionState_, this.shape_, this.inertia_);
    this.body_ = new Ammo.btRigidBody(this.info_);

    Ammo.destroy(btSize);
  }

  createSphere(mass, pos, size) {
    this.transform_ = new Ammo.btTransform();
    this.transform_.setIdentity();
    this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    this.transform_.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
    this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);

    this.shape_ = new Ammo.btSphereShape(size);
    this.shape_.setMargin(0.05);

    this.inertia_ = new Ammo.btVector3(0, 0, 0);
    if(mass > 0) {
      this.shape_.calculateLocalInertia(mass, this.inertia_);
    }

    this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this.shape_, this.inertia_);
    this.body_ = new Ammo.btRigidBody(this.info_);
  }
}


class BasicWorldDemo {
  constructor(x,y,z) {
    this.box = new THREE.Mesh(
      new THREE.BoxGeometry(x,y,z),
      new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load("textures/Carré.png")} ));
  }

  initialize() {
    this.collisionConfiguration_ = new Ammo.btDefaultCollisionConfiguration();
    this.dispatcher_ = new Ammo.btCollisionDispatcher(this.collisionConfiguration_);
    this.broadphase_ = new Ammo.btDbvtBroadphase();
    this.solver_ = new Ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld_ = new Ammo.btDiscreteDynamicsWorld(
        this.dispatcher_, this.broadphase_, this.solver_, this.collisionConfiguration_);
    this.physicsWorld_.setGravity(new Ammo.btVector3(0, -100, 0));

    this.threejs_ = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.threejs_.shadowMap.enabled = true;
    this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap;
    this.threejs_.setPixelRatio(window.devicePixelRatio);
    this.threejs_.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.threejs_.domElement);

    window.addEventListener('resize', () => {
      this.onWindowResize_();
    }, false);

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera_.position.set(40, 15, 0);

    this.scene_ = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this.scene_.add(light);

    light = new THREE.AmbientLight(0x101010);
    this.scene_.add(light);

    const controls = new OrbitControls(
      this.camera_, this.threejs_.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        './resources/posx.jpg',
        './resources/negx.jpg',
        './resources/posy.jpg',
        './resources/negy.jpg',
        './resources/posz.jpg',
        './resources/negz.jpg',
    ]);
    this.scene_.background = texture;

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(100, 1, 100),
      new THREE.MeshStandardMaterial({color: 0x404040}));
    ground.castShadow = false;
    ground.receiveShadow = true;
    this.scene_.add(ground);

    const rbGround = new RigidBody();
    rbGround.createBox(0, ground.position, ground.quaternion, new THREE.Vector3(100, 1, 100));
    rbGround.setRestitution(0.99);
    this.physicsWorld_.addRigidBody(rbGround.body_);

    this.rigidBodies_ = [];

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(4, 4, 4),
      new THREE.MeshStandardMaterial({color: 0x808080}));
    box.position.set(0, 40, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    this.scene_.add(box);

    const rbBox = new RigidBody();
    rbBox.createBox(1, box.position, box.quaternion, new THREE.Vector3(4, 4, 4));
    rbBox.setRestitution(0.25);
    rbBox.setFriction(1);
    rbBox.setRollingFriction(5);
    this.physicsWorld_.addRigidBody(rbBox.body_);
    
    this.rigidBodies_.push({mesh: box, rigidBody: rbBox});

    
    this.box.position.set(0, Math.random() * 5 + 40, 0);
    this.box.castShadow = true;
    this.box.receiveShadow = true;
    this.scene_.add(this.box);

    // const rbBox = new RigidBody();
    // rbBox.createBox(1, this.box.position, this.box.quaternion, new THREE.Vector3(4, 4, 4));
    // rbBox.setRestitution(0.25);
    // rbBox.setFriction(1);
    // rbBox.setRollingFriction(5);
    // this.physicsWorld_.addRigidBody(rbBox.body_);
    
    this.rigidBodies_.push({mesh: this.box, rigidBody: rbBox});

    this.tmpTransform_ = new Ammo.btTransform();

    this.countdown_ = 1.0;
    this.count_ = 0;
    this.previousRAF_ = null;
    this.raf_();
  }

  onWindowResize_() {
    this.camera_.aspect = window.innerWidth / window.innerHeight;
    this.camera_.updateProjectionMatrix();
    this.threejs_.setSize(window.innerWidth, window.innerHeight);
  }

  raf_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      }

      this.step_(t - this.previousRAF_);
      this.threejs_.render(this.scene_, this.camera_);
      this.raf_();
      this.previousRAF_ = t;
    });
  }

  spawn_() {
    const scale = Math.random() * 4 + 4;
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(scale, scale, scale),
      new THREE.MeshStandardMaterial({
          color: 0x808080,
      }));
    box.position.set(Math.random() * 2 - 1, 200.0, Math.random() * 2 - 1);
    box.quaternion.set(0, 0, 0, 1);
    box.castShadow = true;
    box.receiveShadow = true;

    const rb = new RigidBody();
    rb.createBox(DEFAULT_MASS, box.position, box.quaternion, new THREE.Vector3(scale, scale, scale), null);
    rb.setRestitution(0.125);
    rb.setFriction(1);
    rb.setRollingFriction(5);

    this.physicsWorld_.addRigidBody(rb.body_);

    this.rigidBodies_.push({mesh: box, rigidBody: rb});

    this.scene_.add(box);
  }

  step_(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;

    this.countdown_ -= timeElapsedS;
    if (this.countdown_ < 0 && this.count_ < 10) {
      this.countdown_ = 0.25;
      this.count_ += 1;
      this.spawn_();
    }

    this.physicsWorld_.stepSimulation(timeElapsedS, 10);

    for (let i = 0; i < this.rigidBodies_.length; ++i) {
      this.rigidBodies_[i].rigidBody.motionState_.getWorldTransform(this.tmpTransform_);
      const pos = this.tmpTransform_.getOrigin();
      const quat = this.tmpTransform_.getRotation();
      const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
      const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());

      this.rigidBodies_[i].mesh.position.copy(pos3);
      this.rigidBodies_[i].mesh.quaternion.copy(quat3);
    }
  }
}


class CubeBox {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );    
  
    this.renderer = new THREE.WebGLRenderer( {antialias: true});
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );
  
    this.geometry = new THREE.BoxGeometry( 2, 2, 2 );
    this.texture = new THREE.TextureLoader().load("textures/Carré.png");
    this.material = new THREE.MeshBasicMaterial( { map: this.texture} );
    this.cube = new THREE.Mesh( this.geometry, this.material );
    this.scene.add( this.cube );
  
    this.camera.position.z = 5;
  
    this.light =new THREE.PointLight(0xFFFFFF);
    this.light.position.set(5,0,12);
    this.scene.add(this.light);
  }  
}

// let APP_ = null;
// let req;

// APP_ = new CubeBox();
// function animate() {
//   APP_.cube.rotation.x += 0.02;
//   APP_.cube.rotation.y += 0.01;
//   APP_.renderer.render( APP_.scene, APP_.camera );
//   req = requestAnimationFrame( animate );
// }
// animate()

// window.addEventListener('click', async () => {
//   window.cancelAnimationFrame(req);
//   Ammo().then((lib) => {
//     Ammo = lib;
//     APP_ = new BasicWorldDemo(APP_.cube.position.x,APP_.cube.position.y,APP_.cube.position.z);
//     APP_.initialize();
//   });
// });

function createCube(){
  let mass = 1;
  let position = new Ammo.btVector3(0, 10, 0); // Position initiale du cube
  let shape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1)); // Forme du cube
  let localInertia = new Ammo.btVector3(0, 0, 0); // Inertie locale du cube
  shape.calculateLocalInertia(mass, localInertia);
  let motionState = new Ammo.btDefaultMotionState(new Ammo.btTransform(new Ammo.btQuaternion(0, 0, 0, 1), position));
  let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
  let body = new Ammo.btRigidBody(rbInfo);
  
  world.addRigidBody(body);
  
  body.applyCentralForce(new Ammo.btVector3(0, -10, 0)); // Appliquer une force de gravité sur le cube
}


function animate() {
    requestAnimationFrame(animate);
  
    // Step the simulation of the Ammo.js world
    let deltaTime = clock.getDelta(); // Obtenir le temps écoulé depuis la dernière frame
    world.stepSimulation(deltaTime, 10); // Step la simulation avec le deltaTime et un maximum de 10 sous-étapes
  
    // Mettre à jour la position et l'orientation de l'objet affiché en fonction de son corps rigide
    let transform = new Ammo.btTransform();
    let motionState = body.getMotionState();
    motionState.getWorldTransform(transform);
    let position = transform.getOrigin();
    let quaternion = transform.getRotation();
    mesh.position.set(position.x(), position.y(), position.z());
    mesh.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());
  
    renderer.render(scene, camera);
  }
  
  
  window.addEventListener("load", ()=>{
    Ammo().then((lib) => {
      Ammo = lib;
      createCube();
      animate();
  })
})