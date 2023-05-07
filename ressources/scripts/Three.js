const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );    

const renderer = new THREE.WebGLRenderer( {antialias: true,alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let cube ;

camera.position.z = 10;

let light =new THREE.PointLight(0xFFFFFF);
light.position.set(5,0,12);
scene.add(light);

function createCube(){
    const geometry = new THREE.BoxGeometry( 2, 2, 2 );
    const material = new THREE.MeshBasicMaterial( { color: 0xC98686} );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
}

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;

    renderer.render(scene, camera);
}

window.addEventListener("load", ()=>{
    createCube();
    animate();
})