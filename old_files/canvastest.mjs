import {createColorObject,luminanceOfGroup, contrastValue, numberToHex} from "/contrast.mjs"
import {Axes, Circle} from "./graphics.mjs"

let canvas1 = document.getElementById("canvas1");
let canvas2 = document.getElementById("canvas2");
let canvas3 = document.getElementById("canvas3");
let canvas4 = document.getElementById("canvas4");
let canvas5 = document.getElementById("canvas5");
let canvas6 = document.getElementById("canvas6");
let canvas7 = document.getElementById("canvas7");
let ctx1 = canvas1.getContext("2d");
let ctx2 = canvas2.getContext("2d");
let ctx3 = canvas3.getContext("2d");
let ctx4 = canvas4.getContext("2d");
let ctx5 = canvas5.getContext("2d");
let ctx6 = canvas6.getContext("2d");
let ctx7 = canvas7.getContext("2d");

//console.log(ctx);
// ctx.beginPath();
// ctx.moveTo(75, 25);
// ctx.quadraticCurveTo(25, 25, 25, 62.5);
// ctx.quadraticCurveTo(25, 100, 75, 100);
//ctx.quadraticCurveTo(50, 120, 30, 125);
//ctx.quadraticCurveTo(60, 120, 65, 100);
// ctx.quadraticCurveTo(125, 100, 125, 62.5);
// ctx.quadraticCurveTo(125, 25, 75, 25);
// ctx.stroke();
// ctx.closePath();
// ctx.moveTo(75,25);
// circle(25,25,);
// circle(25,100,);
// circle(125,100,);
// circle(125,25,);
// circle(25,62.5,);
// circle(75,100,)
// circle(125,62.5,);
// circle(75,25,);
//testj
//axes lines



function plotDots(axes, colorObject, r, x, ctx) {
    let allDots = [];
    let radius = r;
    let counter = 0;
    let topmargin = axes.y;
    let bottom = axes.height+axes.y;
    let heightRange = axes.height;

    for (let color in colorObject) {
        let currentY = bottom - (heightRange*colorObject[color].lum);
        allDots[counter] = new Circle(x+(r*2), currentY, radius, ctx, colorObject[color].hex);
        counter++;
    }
    return allDots;
} 



// console.log(canvasDimensions);
//console.log(grayscaleDots);
//console.log(primaryDots);    

function test1(){
    const axes = new Axes(20, 20, 80, 550, canvas1, ctx1);
    let numberList = [...Array(256).keys()];
    let grayscaleObjs = createColorObject(numberList.map(x=>numberToHex([x,x,x])));
    luminanceOfGroup(grayscaleObjs);
    let primaries = createColorObject([["red","#ff0000"],["magenta","#ff00ff"],["blue","#0000ff"],["cyan","#00ffff"],["green","#00ff00"],["yellow","#ffff00"]]);
    luminanceOfGroup(primaries);
    let canvasDimensions = canvas1.getBoundingClientRect();
    console.log(primaries);
    let r = 2;
    let grayscaleDots = plotDots(axes, grayscaleObjs, r, canvasDimensions.x, ctx1);
    let primaryDots = plotDots(axes, primaries,r, axes.x+(2*r), ctx1);
}

test1();

let redslice = [];
function red255(){
    const axes = new Axes(20,20,550,550,canvas2,ctx2);
    let canvasDimensions = canvas2.getBoundingClientRect();
    let rad=2;
    for (let i = 0; i < 256; i++) {
        let column = [];
        let r = i;
        for (let gb = 0; gb <= r && r < 256;) {
            let hex = numberToHex([r,gb,gb]);
            column.push(hex);
            gb++;
            r++;
        }
       let colorObjs = createColorObject(column);
       luminanceOfGroup(colorObjs);
       let dotColumn = plotDots(axes, colorObjs, rad, axes.x+(rad*i), ctx2);    
       redslice.push(dotColumn);   
    }
}

let greenslice = [];
function green255(){
    const axes = new Axes(20,20,550,550,canvas3,ctx3);
    let canvasDimensions = canvas3.getBoundingClientRect();
    let rad=2;
    for (let i = 0; i < 256; i++) {
        let column = [];
        let g = i;
        for (let rb = 0; rb <= g && g < 256;) {
            let hex = numberToHex([rb,g,rb]);
            column.push(hex);
            rb++;
            g++;
        }
        let colorObjs = createColorObject(column);
        luminanceOfGroup(colorObjs);
        let dotColumn = plotDots(axes, colorObjs, rad, axes.x+(rad*i), ctx3);    
        redslice.push(dotColumn);   
     }

}

function blue255(){
    const axes = new Axes(20,20,550,550,canvas4,ctx4);
    let canvasDimensions = canvas4.getBoundingClientRect();
    let rad=2;
    for (let i = 0; i < 256; i++) {
        let column = [];
        let b = i;
        for (let rg = 0; rg <= b && b < 256;) {
            let hex = numberToHex([rg,rg,b]);
            column.push(hex);
            rg++;
            b++;
        }
        let colorObjs = createColorObject(column);
        luminanceOfGroup(colorObjs);
        let dotColumn = plotDots(axes, colorObjs, rad, axes.x+(rad*i), ctx4);    
        redslice.push(dotColumn);   
     }

}

function cyan255(){
    const axes = new Axes(20,20,550,550,canvas5,ctx5);
    let canvasDimensions = canvas5.getBoundingClientRect();
    let rad=2;
    for (let i = 0; i < 256; i++) {
        let column = [];
        let bg = i;
        for (let r = 0; r <= bg && bg < 256;) {
            let hex = numberToHex([r,bg,bg]);
            column.push(hex);
            bg++;
            r++;
        }
        let colorObjs = createColorObject(column);
        luminanceOfGroup(colorObjs);
        let dotColumn = plotDots(axes, colorObjs, rad, axes.x+(rad*i), ctx5);    
        redslice.push(dotColumn);   
     }

}

function magenta255(){
    const axes = new Axes(20,20,550,550,canvas6,ctx6);
    let canvasDimensions = canvas6.getBoundingClientRect();
    let rad=2;
    for (let i = 0; i < 256; i++) {
        let column = [];
        let br = i;
        for (let g = 0; g <= br && br < 256;) {
            let hex = numberToHex([br,g,br]);
            column.push(hex);
            br++;
            g++;
        }
        let colorObjs = createColorObject(column);
        luminanceOfGroup(colorObjs);
        let dotColumn = plotDots(axes, colorObjs, rad, axes.x+(rad*i), ctx6);    
        redslice.push(dotColumn);   
     }

}

function yellow255(){
    const axes = new Axes(20,20,550,550,canvas7,ctx7);
    let canvasDimensions = canvas7.getBoundingClientRect();
    let rad=2;
    for (let i = 0; i < 256; i++) {
        let column = [];
        let rg = i;
        for (let b = 0; b <= rg && rg < 256;) {
            let hex = numberToHex([rg,rg,b]);
            column.push(hex);
            rg++;
            b++;
        }
        let colorObjs = createColorObject(column);
        luminanceOfGroup(colorObjs);
        let dotColumn = plotDots(axes, colorObjs, rad, axes.x+(rad*i), ctx7);    
        redslice.push(dotColumn);   
     }

}

function plotSlice(canvas, ctx, primary, secondary) {
    const axes = new Axes(20,20,550,550, canvas, ctx);
    let canvasDimensions = canvas.getBoundingClientRect();
    let rad = 2;
    // for (let i = 0) {

    // }
}

red255();
green255();
blue255();
cyan255();
magenta255();
yellow255();

//angles
//0 = 255,0,0
//60 = 255, 255, 0
//120 - 0, 255, 0
//180 - 0, 255, 255
//240 - 0, 0, 255
//300 - 255, 0, 255



