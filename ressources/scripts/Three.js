const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );    

const renderer = new THREE.WebGLRenderer( {antialias: true,alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let cubes = [];
let isTurning = 0;
let turn = 50;

camera.position.z = 10;

let light =new THREE.PointLight(0xFFFFFF);
light.position.set(5,0,12);
scene.add(light);

function createCube(x,y,z){
    const geometry = new THREE.BoxGeometry( 2, 2, 2 );
    const material = new THREE.MeshBasicMaterial( { color: 0xC98686} );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.set(x,y,z);
    scene.add( cube );
    cubes.push(cube);
}

function animate() {
    requestAnimationFrame(animate);
    cubes.forEach(cube => {
        cube.rotation.x += 0.01;
    });
    if (isTurning != 0){Turn(isTurning)}
    renderer.render(scene, camera);
}

function Turn(direction){
    turn-=1;
    switch (Math.floor(turn/10)){
        case 4:
            turnEveryCubes(direction);
            break;
        case 3:
            turnEveryCubes(direction*2);
            break;
        case 2:
            turnEveryCubes(direction*3);
            break;
        case 1:
            turnEveryCubes(direction*2);
            break;
        case 0:
            turnEveryCubes(direction);
            break;
        default:
            isTurning = 0;
            turn = 50;
    }
}

export function setIsTurning(value){
    isTurning = value;
}

function turnEveryCubes(turnrate){
    cubes.forEach(cube => {
        cube.rotation.y += turnrate*2/100;
    });
}

window.addEventListener("load", ()=>{
    createCube(0,0,0);
    createCube(-4,-5,-3);
    createCube(6,-5,2);
    createCube(3.3,5.5,0);
    createCube(-12,7.5,-2);
    animate();
})