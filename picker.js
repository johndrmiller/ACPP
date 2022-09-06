import {hueWheel, hueTriangle, huePath, rgbReg, svPicker, html, RGBinputs, colorPrev, inputErr} from "./modules/HTMLconstants.js";
import {assign, RGBtoHSB, HSBtoRGB, line, lerp, lerpPoint } from "./modules/globalFunctions.js";
import {hueCircle, vsCircle} from "./modules/svgAssets.js"
import {createColor} from "./modules/createColor.js"

//the relative angle of the hue-picker marker in radians. Determines H value in HSB color space, 
//can be in either degrees or radians, and has methods to convert one to the other
let hueAngle = {
    rad:0,
    deg:0,
    r2d: function(){
        this.deg = this.rad*180/Math.PI;
    },
    d2r: function(){
        this.rad = this.deg*Math.PI/180;
    }
};

let mainColor = createColor();
mainColor.newRGB({r:255,g:0,b:0});

hueCircle.addEventListener("pointerdown",hue_pointerdown_handler);
vsCircle.addEventListener("pointerdown", vs_pointerdown_handler);

for (const prop in RGBinputs) {
    RGBinputs[prop].addEventListener("focus", RGBfocus);
}

function hue_pointerdown_handler(e){
    hueCircle.removeEventListener("pointerDown", hue_pointerdown_handler);
    window.addEventListener("pointermove",hue_pointermove_handler);
    window.addEventListener("pointerup", hue_pointerup_handler);
    window.addEventListener("pointerleave", hue_pointerup_handler);
    html.style.cursor = "grabbing";
    hueCircle.style.cursor = "inherit";
}

function vs_pointerdown_handler(e) {
    vsCircle.removeEventListener("pointerDown", vs_pointerdown_handler);
    window.addEventListener("pointermove",vs_pointermove_handler);
    window.addEventListener("pointerup", vs_pointerup_handler);
    window.addEventListener("pointerleave", vs_pointerup_handler);
    html.style.cursor = "grabbing";
    vsCircle.style.cursor = "inherit";
}

//calculates the new hsb hue angle from the x and y mouse coordinates when mouse moves.
function hue_pointermove_handler(e){
    //calculate angle (in Radians)
    //move picker
    //update UI
    let pointer, deltaX, deltaY;
    let gapX = window.scrollX;
    let gapY = window.scrollY;
    let hueRad;
    window.removeEventListener("pointermove",hue_pointermove_handler);
    pointer = {
        x: e.clientX,
        y: e.clientY
    }
    //1&2) Calculate x (1) and y (2) position of mouse in relation to center of hue wheel
    //   if x is right of hue wheel, value is positive; if left, value is negative
    //   if y is below hue wheel, value is negative; if above, value is positive
    //3) Use atan2 to calculate angle (in radians);
    //   atan2 takes into account the signs of the passed x and y values preventing the need to also find the quadrant manually when using atan
    //4) The conversion formulas for HSB to RGB don't like negative angles, this converts a negative value to positive
    //5) Convert hueAngle rad value to deg to maintain parity
    //6) Call moveHuePicker to actually move the element

    //1)
    deltaX = pointer.x >= hueWheel.center.x ? pointer.x - hueWheel.center.x : -1*(hueWheel.center.x - pointer.x);
    //2)
    deltaY = pointer.y >= hueWheel.center.y ? hueWheel.center.y-pointer.y : -1*(pointer.y-hueWheel.center.y);
    //3)
    hueRad = Math.atan2(deltaY, deltaX);
    //4)
    hueRad = hueRad >= 0 ? hueRad : hueRad + (2*Math.PI);
    //5)
    mainColor.newRAD(hueRad);
    //hueAngle.r2d();
    //6)
    moveHuePicker();
    window.addEventListener("pointermove",hue_pointermove_handler);
}

//calculates xy coordinates within triangle from mouse coordinates
function vs_pointermove_handler(e) {
    window.removeEventListener("pointermove",vs_pointermove_handler);
    //1) Assign pointer to mouse coordinates adjusted to be relative to the saturation and value triangle container
    //2) Assign initial newX and newY values to pointer coordinates
    //3) If x value were to go left or right of bounds of triangle assign newX to left or right edges of triangle, respectively 
    //4) For current X value find max and min y values based on top and bottom line equations
    //   If actual y falls outside of those bounds assign newY as maxY or minY, respectively
    //5) Assign picker elements to new x and y values, then call sVvals function with them

    //1)
    let pointer  = {
        x: e.clientX-svPicker.box.x,
        y: e.clientY-svPicker.box.y
    }
    let keys = Object.keys(vsCircle.pieces);
    //2)
    let newX = pointer.x, newY = pointer.y, maxY, minY;
    //3)
    if (pointer.x < hueTriangle.sides.s1.x1) {
        newX = hueTriangle.sides.s1.x1;
    } else if (pointer.x > hueTriangle.sides.s2.x2) {
        newX = hueTriangle.sides.s2.x2;
    }
    //4)
    maxY = (newX*hueTriangle.sides.s2.m)+hueTriangle.sides.s2.b;
    minY = (newX*hueTriangle.sides.s3.m)+hueTriangle.sides.s3.b;

    if (pointer.y < minY) {
        newY = minY;
    } else if (pointer.y > maxY) {
        newY = maxY;
    }
    //5)
    keys.forEach (x => {
        assign(vsCircle.pieces[x],{
            cx: newX,
            cy: newY
        });
    });
    SVvals(newX, newY);
    window.addEventListener("pointermove",vs_pointermove_handler);
}

function hue_pointerup_handler(e){
    window.removeEventListener("pointermove",hue_pointermove_handler);
    window.removeEventListener("pointerup",hue_pointerup_handler);
    window.removeEventListener("pointerleave", hue_pointerup_handler);
    hueCircle.addEventListener("pointerdown",hue_pointerdown_handler);
    html.style.cursor = "";
    hueCircle.style.cursor = "";
}

function vs_pointerup_handler(e) {
    window.removeEventListener("pointermove",vs_pointermove_handler);
    window.removeEventListener("pointerup",vs_pointerup_handler);
    window.removeEventListener("pointerleave", vs_pointerup_handler);
    vsCircle.addEventListener("pointerdown",vs_pointerdown_handler);
    html.style.cursor = "";
    vsCircle.style.cursor = "";
}

//takes hue angle and updates the position of the grabber along the path of the hue track
//then updates the hue of the hue triangle and updates the text of the RGB input boxes
function moveHuePicker() {
    //1) Use sin and cos of hueAngle to find new coordinates for circle marker inside of hue track
    //   Sign of Y value is flipped due to Y values going opposite direction in coordinate plane vs on html page
    //   (there may be a better way to calculate, but this is what I came up with)    
    //2) Convert hueAngle with full saturation and brightness from HSB to RGB
    //3) Update position of hue picker circles
    //4) Update fill color of hue triangle and pass existing SV marker coordinates to SVvals to make any adjustment needed and update RGB text boxes

    //1)
    let cos = Math.cos(mainColor.rad);
    let sin = Math.sin(mainColor.rad);
    let newX = (cos*hueWheel.radius)+hueWheel.radius+(huePath*cos*-1);
    let newY = (sin*hueWheel.radius*-1)+hueWheel.radius+(huePath*sin);
    let hKeys = Object.keys(hueCircle.pieces);
    //2)
    //let newRGB = HSBtoRGB({h:hueAngle.deg,s:100,b:100});
    //3)
    hKeys.forEach (x => {
        assign(hueCircle.pieces[x],{
            cx: newX,
            cy: newY
        });
    });
    //4) NEEDS UPDATED!
    updateRGBVals(mainColor.rgb);
    updatePreview(mainColor.rgb);
    hueTriangle.setAttribute("fill",`rgb(${mainColor.rgb.r},${mainColor.rgb.g},${mainColor.rgb.b})`);
    
}

moveHuePicker();
SVvals(vsCircle.pieces.b.getAttribute("cx"),vsCircle.pieces.b.getAttribute("cy"));

//uses passed x and y coordinates to calculate brightness and saturation values of color
//then converts them back to RGB and updates the color preview and the
function SVvals(x,y){
    //1) Find equation of line that includes passed point and bottom point (side1: x1,y1)
    //2) Find x value of intersection point of that line and side2
    //    m1x + b1 = m2x + b2, set 2 equations equal to each other and solve for x
    //    (m1-m2)x = b2-b1
    //    x = (b2-b1)/(m1-m2)
    //3) Plug x back into equation to find y
    //4) Create line object for full value line
    //5) Find percentage of value line where passed point sits
    //6) Create line segment from beginning of side 2 (saturation line) to intersection point
    //7) Find percentage of saturation line where passed point sits.
    //8) assign current hue (hueAngle) along with v and s values to new hsb object. Then convert to RGB.
    //9) Update RGB input text boxes and Triangle BG color.

    //1)
    let shortRay = line(hueTriangle.tPoints[4], hueTriangle.tPoints[5], x, y);
    //2)
    let intersectionX = shortRay.b == undefined ? shortRay.x1 : (shortRay.b-hueTriangle.sides.s2.b)/(hueTriangle.sides.s2.m-shortRay.m);
    //3)
    let intersectionY = shortRay.b == undefined ? hueTriangle.sides.s2.y1 : (shortRay.m*intersectionX)+shortRay.b;
    //4)
    let valueRay = line(shortRay.x1, shortRay.y1,intersectionX,intersectionY);
    //5)
    let vPercent = Math.round((shortRay.length/valueRay.length)*10)/10;
    //6)
    let satRay = line(hueTriangle.sides.s2.x1, hueTriangle.sides.s2.y1,intersectionX,intersectionY);
    //7)
    let sPercent = Math.round((satRay.length/hueTriangle.sides.s2.length)*10)/100;
    //8)
    console.log(sPercent, vPercent);  
    mainColor.newHSB({h:mainColor.hsb.h,s:sPercent, b:vPercent});
    //9)

    updateRGBVals(mainColor.rgb);
    updatePreview(mainColor.rgb);
}

function updateColor(h,s,v) {
    let hueDeg = h*180/Math.PI;
    //let newRGB = 
}

function RGBfocus(e) {
    let tar = e.currentTarget;
    tar.addEventListener("blur", RGBloseFocus);
    tar.addEventListener("input", RGBupdate);
}

function RGBloseFocus(e) {
    console.log("lost");
}

function RGBupdate(e) {
    let valid = /^\d{1,3}$/g;
    let entry = e.target.value;
    let res = valid.test(entry);
    
    if (entry.length === 0) return;
    if (!res || !(0<=entry&&entry<=255)) {
        if (colorPrev.classList.contains("hide")) {
            return;
        }
        colorPrev.classList.add("hide");
        inputErr.classList.remove("hide");
        return;
    }
    if (colorPrev.classList.contains("hide")) {
        inputErr.classList.add("hide");
        colorPrev.classList.remove("hide");
    }
    let newRGBs = {r:RGBinputs.r.value ,g:RGBinputs.g.value , b:RGBinputs.b.value };
    
    mainColor.newRGB(newRGBs);
    console.log(newRGBs, mainColor);
    //let newHSB = RGBtoHSB(newRGBs);
    //console.log(newHSB);
    //console.log(hueTriangle.sides.s2.x1, hueTriangle.sides.s2.y1, );
    
    let satIntersection = lerpPoint({x:hueTriangle.sides.s2.x1, y:hueTriangle.sides.s2.y1} , {x:hueTriangle.sides.s2.x2, y:hueTriangle.sides.s2.y2}, mainColor.hsb.s);
    let valLine = line(hueTriangle.sides.s1.x1, hueTriangle.sides.s1.y1, satIntersection.x, satIntersection.y);
    let valIntersection = lerpPoint({x:valLine.x1, y:valLine.y1}, {x:valLine.x2,y:valLine.y2},mainColor.hsb.b);

    //console.log(valIntersection);
    SVvals(valIntersection.x, valIntersection.y);
    //moveHuePicker();
    // if (newHSB.h !== mainColor.deg) {
    //     mainColor.newDEG(newHSB.h);
    //     start repeat code
    //     moveHuePicker();
    // }
    //let valuePercent = newHSB.b;
    //let satPercent = newHSB.s;
    //console.log(valuePercent, satPercent, newRGBs);



    //we have input, what do we do with it?
    //1) Grab all RGB input values
    //2) Convert to HSB
    //3) If h is different than hueAngle, set hue angle and update hue picker and triangle color
        //is there any way to make use of what we've already written or will it need to be completely novel?
    //4) Update SV picker position 
    //  a) Take S value and find position on saturation line that correlates
    //  b) Draw line between new point and (s=0, v=0)
    //  c) Tacke V value and find position on new line that correlates
    //  d) Move SV marker to new position
    //5) Update current color in preview
}

function updateRGBVals(RGB) {
    RGBinputs.r.value = RGB.r;
    RGBinputs.g.value = RGB.g;
    RGBinputs.b.value = RGB.b;
}

function updatePreview(RGB) {
    colorPrev.style.backgroundColor = `rgb(${RGB.r},${RGB.g},${RGB.b})`; 
}

//rgb regex match: /(\d+)/g
//1-3 digit number exact match test: /^\d{1,3}$/
//not match: /^?!\d{1,3}$/
//string.match(regex) = array;

//when updating colors from text input need to reverse calculation
//to find position from HSB percentages
//use saturation percentage first to find point on side 2
//then use value percentage to find point on that new segment
//how to get x and y coordinates from those?
//Compare percentage to rise and then run of lines to get values?


