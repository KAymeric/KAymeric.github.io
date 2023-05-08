import { data } from "./data.js";
import { setIsTurning } from "./Three.js";
let div;
let center = 0;
let offset = 0;
let direction = 0;

document.querySelectorAll(".arrow").forEach(arrow => {
    arrow.addEventListener("click", ()=>{
        if (arrow.classList.contains("left")){
            direction = -1;
        } else {
            direction = 1;
        }
        div =document.querySelector("#page");
        offset = 0;
        center -= direction;
        setIsTurning(direction);
        debugCenter();
        move();
    })
})

function demoContent(){
    for (let index = center-1; index <= center+1; index++) {
        const element = data[getIndex(index)];
        const parent = document.querySelector("#page");
        const container = document.createElement("div");
        const title = document.createElement("h3");
        const desciption = document.createElement("div");
        const img = document.createElement("img");
        
        title.innerText = element.Title;
        desciption.innerText = element.Desciption;
    
        container.classList.add("demoContent");
        title.classList.add("overlay");
        desciption.classList.add("overlay");
        img.classList.add("overlay");
        container.appendChild(title);
        container.appendChild(desciption);
        container.appendChild(img);
        parent.appendChild(container);
    }
}

function move(){
    if (Math.abs(offset)<34){
        div.style.marginLeft = offset+"%";
        offset+=direction;
        window.setTimeout(move,25);
    } else {
        deleteChild(div);
        div.style.marginLeft = "0";
        demoContent();
        offset = 0;
    }
}

function deleteChild(parent){
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function getIndex(index){
    if(index<0){
        return data.length+index
    } else if (index>=data.length){
        return index-data.length
    }
    return index
}

function debugCenter(){
    if (center == data.length){ 
        center = 0
    } else if (center == -1){ 
        center =  data.length-1
    };
}

demoContent();