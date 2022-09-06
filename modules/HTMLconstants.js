import { line } from "../modules/globalFunctions.js";

export const html = document.getElementsByTagName("html")[0];
export const picker = document.getElementById("picker");
export const hueSelector = document.getElementById("hueSelector");
export const sbSelector = document.getElementById("satBrightSelector");
export const hueWheel = document.getElementById("hueWheel");
export const wheelCenter = document.getElementById("wheelCenter");
export const svPicker = document.getElementById("SVpicker");
export const svDefs = svPicker.getElementsByTagName("defs")[0];
export const hueTriangle = document.getElementById("hueTriangle");
export const valueTriangle = document.getElementById("valueTriangle");
export const RGBinputElements = [...document.querySelectorAll(".rgbVals input")];
export const colorPrev = document.getElementById("selectedColor");
export const inputErr = document.getElementById("entryError");
export const rgbReg = /(\d+)/g;
export let hueTrackDepth, huePath, RGBinputs, tAxis;

hueWheel.diameter = hueWheel.clientHeight;
hueWheel.radius = hueWheel.diameter/2;
hueWheel.box = hueWheel.getBoundingClientRect();
hueWheel.center =  {
    x: hueWheel.box.x+(hueWheel.box.width/2),
    y: hueWheel.box.y+(hueWheel.box.height/2)
}

wheelCenter.diameter = wheelCenter.clientHeight;
hueSelector.diameter = hueSelector.getBoundingClientRect().width;

hueTrackDepth = (hueWheel.diameter - wheelCenter.diameter)/2;
huePath = hueTrackDepth/2;

svPicker.box = svPicker.getBoundingClientRect();

hueTriangle.tPoints = [20, 10, 95, 50, 20, 90].map(x => Math.round(svPicker.box.width*(x/100)));
hueTriangle.sides = {
    s1: line(hueTriangle.tPoints[4],hueTriangle.tPoints[5], hueTriangle.tPoints[0],hueTriangle.tPoints[1]),
    s2: line(hueTriangle.tPoints[0],hueTriangle.tPoints[1], hueTriangle.tPoints[2],hueTriangle.tPoints[3]),
    s3: line(hueTriangle.tPoints[2],hueTriangle.tPoints[3], hueTriangle.tPoints[4],hueTriangle.tPoints[5])
}
RGBinputs = {
    r: RGBinputElements[0],
    g: RGBinputElements[1],
    b: RGBinputElements[2]
}

window.addEventListener('resize', recalc);

function recalc(e){
    hueWheel.box = hueWheel.getBoundingClientRect();
    hueWheel.center.x = hueWheel.box.x+(hueWheel.box.width/2);
    hueWheel.center.y = hueWheel.box.y+(hueWheel.box.height/2);
    svPicker.box = svPicker.getBoundingClientRect();
}

//line equation: y=mx+b
//m=(y2-y1)/(x2/x1)
//need to solve for b
//triangle s1 = line between points 3 and 1;
//triangle s2 = line between points 1 and 2;
//triangle s3 = line between points 2 and 3;
//    
//need to calibrate triangle points based on a more standard axis?
//or at least multiply the results to account for the inverted coordinate directions?
//
//box height - point.y = polar coordinate
//box height - polar coordinate = point.y
