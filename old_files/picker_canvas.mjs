import {createColorObject,luminanceOfGroup, contrastValue, numberToHex} from "/contrast.mjs"
import {Axes, Circle} from "/graphics.mjs"

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const rainbow = document.getElementById("rainbow");
const rctx = rainbow.getContext("2d");
const rainbow2 = document.getElementById("rainbow2");
const rctx2 = rainbow2.getContext("2d");
const body = document.querySelector("body");
let grad, grad2;
const outer = new Circle(canvas.width/2 , canvas.height/2, 190, ctx,"#00ff00");
ctx.globalCompositeOperation = "destination-out";
let chroma = [[255,0,0]];
//console.log(chroma.length);

const inner = new Circle(canvas.width/2, canvas.height/2, 160, ctx, "#0000ff");
grad = rctx.createLinearGradient(2,2,rainbow.width-2, rainbow.height-2);
grad2 = rctx.createLinearGradient(2,2,rainbow2.width-2, rainbow2.height-2);

rainbowStops(grad);
rainbowStops(grad2);

function rainbowStops(grad) {
    grad.addColorStop(0, "#ff0000");
    grad.addColorStop(1/6, "#FFFF00");
    grad.addColorStop(1/3, "#00ff00");
    grad.addColorStop(0.5, "#00ffff");
    grad.addColorStop(2/3, "#0000ff");
    grad.addColorStop(5/6, "#ff00ff");
    grad.addColorStop(1, "#ff0000");
}

rctx.fillStyle = grad;
rctx2.fillStyle = grad2;
rctx.fillRect(0,0,rainbow.width, rainbow.height);
rctx2.fillRect(0,0, rainbow2.width, rainbow2.height);

function chromaBuild(arr, pos, steps, dir) {
    
    for (var i=(dir?1:steps-1), d=(dir?1:-1); (dir?i <= steps:i>=0); i+=d) {
        //console.log(i);
        let temp = [];
        //let val = i-1;
        //let arrPiece = arr[val];
        //console.log(arrPiece);
        for (let j = 0; j < arr[arr.length-1].length; j++) {
            temp[j] = arr[arr.length-1][j];
        }
        temp[pos] = i;
        arr.push(temp);
    }
}
//chromaBuild(chroma,1, 10, 1);

let test2 = [[255,255,0]];

chromaBuild(test2,1,255,0);

//chromaBuild(chroma, 1);

//console.log(chroma);
//console.log(test2);


//dir?{var i=1;i<=steps;i++}:{var i=steps-1;i>=0;i--}