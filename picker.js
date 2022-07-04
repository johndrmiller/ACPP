import {hueWheel, hueTriangle, huePath, rgbReg, svPicker, html, RGBinputs, colorPrev} from "/modules/HTMLconstants.js";
import {assign, RGBtoHSB, HSBtoRGB, line } from "/modules/globalFunctions.js";
import {hueCircle, vsCircle} from "/modules/svgAssets.js"

let hueAngle = 0;//the relative angle of the hue-picker marker. Determines H value in HSB color space

hueCircle.addEventListener("pointerdown",hue_pointerdown_handler);
vsCircle.addEventListener("pointerdown", vs_pointerdown_handler);

function hue_pointerdown_handler(e){
    hueCircle.removeEventListener("pointerDown", hue_pointerdown_handler);
    window.addEventListener("pointermove",hue_pointermove_handler);
    window.addEventListener("pointerup", hue_pointerup_handler);
    window.addEventListener("pointerleave", hue_pointerup_handler);
    html.style.cursor = "grabbing";
    hueCircle.style.cursor = "inherit";
}

//calculates the new hsb hue angle from the x and y mouse coordinates when mouse moves.
function hue_pointermove_handler(e){
    let pointer, deltaX, deltaY;
    window.removeEventListener("pointermove",hue_pointermove_handler);
    pointer = {
        x: e.clientX,
        y: e.clientY
    }
    //calculate x position of mouse in relation to center of hue wheel
    //if x is right of hue wheel, value is positive; if left, value is negative
    if (pointer.x >= hueWheel.center.x) {
        deltaX = pointer.x - hueWheel.center.x;
    } else {
        deltaX = -1*(hueWheel.center.x - pointer.x);
    }
    //calculate y position of mouse in relation to center of hue wheel
    //if y is below hue wheel, value is negative; if above, value is positive
    if (pointer.y >= hueWheel.center.y) {
        deltaY = hueWheel.center.y-pointer.y;
    } else {
        deltaY = -1*(pointer.y-hueWheel.center.y);
    }    
    //use atan2 to calculate angle (in radians); atan2 takes into account the signs of the passed x and y values preventing the need for further interpretation to find the quadrant manually when using atan
    hueAngle = Math.atan2(deltaY, deltaX);
    //the conversion formulas for HSB to RGB don't like negative angles, this converts a negative value to positive
    hueAngle = hueAngle >= 0 ? hueAngle : hueAngle + (2*Math.PI);
    moveHuePicker();
    window.addEventListener("pointermove",hue_pointermove_handler);
}

//takes hue angle and updates the position of the grabber along the path of the hue track
//then updates the hue of the hue triangle and updates the text of the RGB input boxes
function moveHuePicker() {
    //use sin and cos of hueAngle to find new coordinates for circle marker inside of hue track
    //this way, picker coordinates aren't dependent on keeping mouse inside of track
    let cos = Math.cos(hueAngle);
    let sin = Math.sin(hueAngle);
    let newX = (cos*hueWheel.radius)+hueWheel.radius+(huePath*cos*-1);
    let newY = (sin*hueWheel.radius*-1)+hueWheel.radius+(huePath*sin);
    let hKeys = Object.keys(hueCircle.pieces);
    let hueDeg = hueAngle*180/Math.PI;
    let currentHue = hueTriangle.getAttribute("fill");
    let RGBarr = currentHue.match(rgbReg);//getting color values from current rgb color in triangle 
    let currentHSB = RGBtoHSB({r:RGBarr[0],g:RGBarr[1],b:RGBarr[2]});
    let newHSB = {h:hueDeg,s:currentHSB.s,b:currentHSB.b};//replace hue value with new hue angle, other values remain the same
    let newRGB = HSBtoRGB(newHSB);

    hKeys.forEach (x => {
        assign(hueCircle.pieces[x],{
            cx: newX,
            cy: newY
        });
    });
    hueTriangle.setAttribute("fill",`rgb(${newRGB.r},${newRGB.g},${newRGB.b})`);
    updateSV(vsCircle.pieces.b.getAttribute("cx"),vsCircle.pieces.b.getAttribute("cy"));
}

function hue_pointerup_handler(e){
    window.removeEventListener("pointermove",hue_pointermove_handler);
    window.removeEventListener("pointerup",hue_pointerup_handler);
    window.removeEventListener("pointerleave", hue_pointerup_handler);
    hueCircle.addEventListener("pointerdown",hue_pointerdown_handler);
    html.style.cursor = "";
    hueCircle.style.cursor = "";
}
moveHuePicker();

function RGBfocus(e) {
    let tar = e.currentTarget;
    console.log(e.currentTarget);
    tar.addEventListener("blur", RGBloseFocus);
    tar.addEventListener("change", RGBupdate);
}

function RGBloseFocus(e) {

}

function RGBupdate(e) {

}

function vs_pointerdown_handler(e) {
    vsCircle.removeEventListener("pointerDown", vs_pointerdown_handler);
    window.addEventListener("pointermove",vs_pointermove_handler);
    window.addEventListener("pointerup", vs_pointerup_handler);
    window.addEventListener("pointerleave", vs_pointerup_handler);
    html.style.cursor = "grabbing";
    vsCircle.style.cursor = "inherit";
}

//
function vs_pointermove_handler(e) {
    let pointer  = {
        x: e.clientX-svPicker.box.x,
        y: e.clientY-svPicker.box.y
    }
    let keys = Object.keys(vsCircle.pieces);
    let newX = pointer.x, newY = pointer.y, maxY, minY;

    if (pointer.x < hueTriangle.sides.s1.x1) {
        newX = hueTriangle.sides.s1.x1;
    } else if (pointer.x > hueTriangle.sides.s2.x2) {
        newX = hueTriangle.sides.s2.x2;
    }

    maxY = (newX*hueTriangle.sides.s2.m)+hueTriangle.sides.s2.b;
    minY = (newX*hueTriangle.sides.s3.m)+hueTriangle.sides.s3.b;

    if (pointer.y < minY) {
        newY = minY;
    } else if (pointer.y > maxY) {
        newY = maxY;
    }

    keys.forEach (x => {
        assign(vsCircle.pieces[x],{
            cx: newX,
            cy: newY
        });
    });
    updateSV(newX, newY);
}

function updateSV(x,y){
    //find equation of line that includes passed point and bottom point (side1: x1,y1)
    let vRay1 = line(hueTriangle.tPoints[4], hueTriangle.tPoints[5], x, y);
    //find intersection point of that line and side2
    //m1x + b1 = m2x + b2, set 2 equations equal to each other and solve for x
    //(m1-m2)x = b2-b1
    //x = (b2-b1)/(m1-m2)
    //then plug x into equation to find y
    let intersectionX = vRay1.b == undefined ? vRay1.x1 : (vRay1.b-hueTriangle.sides.s2.b)/(hueTriangle.sides.s2.m-vRay1.m);
    let intersectionY = vRay1.b == undefined ? hueTriangle.sides.s2.y1 : (vRay1.m*intersectionX)+vRay1.b;
    let vRay2 = line(vRay1.x1, vRay1.y1,intersectionX,intersectionY);
    //find percentage of where passed point sits between bottom point and point on side 2 to find value percentage
    let vPercent = Math.round((vRay1.length/vRay2.length)*100,2);
    //find length of side 2 point 1 to intersection point,
    let vRay3 = line(hueTriangle.sides.s2.x1, hueTriangle.sides.s2.y1,intersectionX,intersectionY);
    //find percentage of where point on side 2 sits between the two end points to find the 0 to 100 saturation
    let sPercent = Math.round((vRay3.length/hueTriangle.sides.s2.length)*100,2);
    //assign current hue along with v and s values to new hsv object and convert to RGB 
    let hueDeg = hueAngle*180/Math.PI;
    let newHSB = {h:hueDeg,s:sPercent,b:vPercent};
    let newRGB = HSBtoRGB(newHSB);
    RGBinputs.r.value = newRGB.r;
    RGBinputs.g.value = newRGB.g;
    RGBinputs.b.value = newRGB.b;
    colorPrev.style.backgroundColor = `rgb(${newRGB.r},${newRGB.g},${newRGB.b})`; 
}

function vs_pointerup_handler(e) {
    window.removeEventListener("pointermove",vs_pointermove_handler);
    window.removeEventListener("pointerup",vs_pointerup_handler);
    window.removeEventListener("pointerleave", vs_pointerup_handler);
    vsCircle.addEventListener("pointerdown",vs_pointerdown_handler);
    html.style.cursor = "";
    vsCircle.style.cursor = "";
}

//rgb regex match: /(\d+)/g
//string.match(regex) = array;