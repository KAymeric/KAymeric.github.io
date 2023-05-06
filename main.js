const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );    

const renderer = new THREE.WebGLRenderer( {antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let cube ;

camera.position.z = 10;

let light =new THREE.PointLight(0xFFFFFF);
light.position.set(5,0,12);
scene.add(light);


let world;
let body;
let rotX = 0;
let rotY = 0;
let clock = new THREE.Clock();

function createCube(){
    const geometry = new THREE.BoxGeometry( 2, 2, 2 );
    const texture = new THREE.TextureLoader().load("textures/Carré.png");
    const material = new THREE.MeshBasicMaterial( { map: texture} );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
}

function createCubeRb(){
    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    let dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    let overlappingPairCache = new Ammo.btDbvtBroadphase();
    let solver = new Ammo.btSequentialImpulseConstraintSolver();
    world = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    world.setGravity(new Ammo.btVector3(0, -9.8, 0)); // Dé

    let mass = 1;
    let position = new Ammo.btVector3(0, 0, 0); // Position initiale du cube
    let shape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1)); // Forme du cube
    let localInertia = new Ammo.btVector3(0, 0, 0); // Inertie locale du cube
    shape.calculateLocalInertia(mass, localInertia);
    let motionState = new Ammo.btDefaultMotionState(new Ammo.btTransform(new Ammo.btQuaternion(0, 0, 0, 1), position));
    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    body = new Ammo.btRigidBody(rbInfo);
    world.addRigidBody(body);
    
    body.applyCentralForce(new Ammo.btVector3(0, -10, 0)); // Appliquer une force de gravité sur le cube
  }

function createGround(){
    const geometry = new THREE.BoxGeometry( 10, 10, 2 );
    const material = new THREE.MeshBasicMaterial();
    const ground = new THREE.Mesh( geometry, material );
    ground.position.z = -5;
    scene.add( ground );

    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    let dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    let overlappingPairCache = new Ammo.btDbvtBroadphase();
    let solver = new Ammo.btSequentialImpulseConstraintSolver();
    world = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    world.setGravity(new Ammo.btVector3(0, -9.8, 0)); // Dé

    let mass = 1;
    let position = new Ammo.btVector3(0, 0, 0); // Position initiale du cube
    let shape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1)); // Forme du cube
    let localInertia = new Ammo.btVector3(0, 0, 0); // Inertie locale du cube
    shape.calculateLocalInertia(mass, localInertia);
    let motionState = new Ammo.btDefaultMotionState(new Ammo.btTransform(new Ammo.btQuaternion(0, 0, 0, 1), position));
    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    let groundrb = new Ammo.btRigidBody(rbInfo);
    world.addRigidBody(groundrb);
}
  
let isFalling = false;

function animate() {
    requestAnimationFrame(animate);

    if (isFalling){
        // Step the simulation of the Ammo.js world
        let deltaTime = clock.getDelta(); // Obtenir le temps écoulé depuis la dernière frame
        world.stepSimulation(deltaTime, 10); // Step la simulation avec le deltaTime et un maximum de 10 sous-étapes
    
        // Mettre à jour la position et l'orientation de l'objet affiché en fonction de son corps rigide
        let transform = new Ammo.btTransform();
        let motionState = body.getMotionState();
        motionState.getWorldTransform(transform);
        let position = transform.getOrigin();
        let quaternion = transform.getRotation();
        cube.position.set(position.x(), position.y(), position.z());
        cube.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());

        cube.rotation.x += rotX++/100;
        cube.rotation.y += rotY++/100;
    
        renderer.render(scene, camera);
    } else {
        cube.rotation.x = rotX++/100;
        cube.rotation.y = rotY++/100;

        renderer.render(scene, camera);
    } 
}

function clearWorld(){
    Ammo.destroy(body);
}


window.addEventListener("load", ()=>{
    Ammo().then((lib) => {
    Ammo = lib;
    createCube();
    createCubeRb();
    //createGround()
    animate();
})
})

window.addEventListener("click",() =>{
    if (isFalling){
        while(scene.children.length > 0){ 
            scene.remove(scene.children[0]); 
        }
        clearWorld();
        createCube();
        createCubeRb();
        //createGround();
    }
    isFalling = !isFalling;
})