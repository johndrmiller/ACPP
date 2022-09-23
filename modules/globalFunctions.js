import { svPicker } from "../modules/HTMLconstants.js";
export function assign(ele, obj) {
    let keys = Object.keys(obj);
    keys.forEach(x => {
        ele.setAttribute(x,obj[x])
    })
}
//*takes array of objects[{ele:element or array of elements, ev:event or array of events, fun:function, action:"add" or "remove", opts:optional, {} or options object}]
//*if element or event is an array, function runs through elements first, then events.
export const groupListeners = (arr) => {
    for (let i in arr) { 
        let ops = arr[i].opts || {};
        if (Array.isArray(arr[i].ele)) {
            arr[i].ele.forEach(el => {
                groupListeners([{ele:el, ev:arr[i].ev, fun:arr[i].fun, action:arr[i].action, opts:ops}]);
            });
        } else if (Array.isArray(arr[i].ev)) {
            arr[i].ev.forEach(e => {
                groupListeners([{ele:arr[i].ele, ev:e, fun:arr[i].fun, action:arr[i].action, opts:ops}]);
            })
        } else { 
            arr[i].ele[`${arr[i].action}EventListener`](arr[i].ev, arr[i].fun, ops);
        }
    }
}
//*Expects RGB color as object {r:0-255, g:0-255, b:0-255}
//*Returns HSB color as object {h:0-360, s:0-100, b:0-100}
export function RGBtoHSB(RGB){
    let nRGB = {
        r:RGB.r/255,
        g:RGB.g/255,
        b:RGB.b/255
    }
    let cmax = Math.max(nRGB.r, Math.max(nRGB.g,nRGB.b));
    let cmin = Math.min(nRGB.r, Math.min(nRGB.g,nRGB.b));
    let diff = cmax-cmin;
    let h = -1, s = -1, b=-1;
    if (cmax == cmin) {
        h = 0
    } else if (cmax == nRGB.r) {
        h = (60*((nRGB.g-nRGB.b)/diff)+360)%360;
    } else if (cmax == nRGB.g) {
        h = (60*((nRGB.b-nRGB.r)/diff)+120)%360;
    } else if(cmax == nRGB.b) {
        h = (60*((nRGB.r-nRGB.g)/diff)+240)%360;
    }

    if (cmax == 0) {
        s = 0;
    } else {
        s = (diff/cmax)*100;
    }
    b = cmax*100;
    return {h:Math.round(h*100)/100,s:Math.round(s*10)/10,b:Math.round(b*10)/10}
}

//*Expects HSB color as object {h:0-360, s:0-100, b:0-100}
//*Returns RGB color as object {r:0-255, g:0-255, b:0-255}
export function HSBtoRGB(HSB) {
    let chroma = (HSB.b/100)*(HSB.s/100);
    let h1 = HSB.h/60;
    let X = chroma*(1-Math.abs(h1%2-1));
    let m = HSB.b/100 - chroma;
    let RGB1;
    if (0<=h1&&h1<1) {
        RGB1 = {r:chroma, g:X, b:0}
    }
    if (1<=h1&&h1<2) {
        RGB1 = {r:X, g:chroma, b:0}
    }
    if (2<=h1&&h1<3) {
        RGB1 = {r:0, g:chroma, b:X}
    }
    if (3<=h1&&h1<4) {
        RGB1 = {r:0, g:X, b:chroma}
    }
    if (4<=h1&&h1<5) {
        RGB1 = {r:X, g:0, b:chroma}
    }
    if (5<=h1&&h1<6) {
        RGB1 = {r:chroma, g:0, b:X}
    }
    return {r:Math.round((RGB1.r+m)*255),g:Math.round((RGB1.g+m)*255),b:Math.round((RGB1.b+m)*255)}
}

//expects 4 values that correspond to the x and y values of 2 points 
//returns an object that represents a line segment with the 2 passed points as endpoints.
//includes slope, y-intercept, and lenght of line
export function line(x1, y1, x2, y2) {
    return {
        x1:x1,
        y1:svPicker.box.height-y1,
        x2:x2,
        y2:svPicker.box.height-y2,
        //if line is vertical returns undefined for slope and y-intercept
        get m(){
            if (x1 == x2) {
                return undefined;
            }
            return (this.y2-this.y1)/(this.x2-this.x1);
        },
        get b() {
            if (x1 == x2) {
                return undefined;
            }
            return this.y1-(this.x1*this.m);
        },
        get length() {
            return Math.sqrt(Math.pow(this.x2-this.x1,2) + Math.pow(this.y2-this.y1,2));
        }
    };
}

export function lerp(a, b, t) {
    return a + (b-a)*(t/100);
}

export function lerpPoint(point1, point2, t) {
    return {
        x: Math.round((lerp(point1.x, point2.x, t))*100)/100,
        y: Math.round((lerp(point1.y, point2.y, t))*100)/100    
    }
}

/*
x = a + (b-a)t
x-a = (b-a)t
(x-a)/(b-a) = t
    let satIntersection = lerpPoint({x:hueTriangle.sides.s2.x1, y:hueTriangle.sides.s2.y1} , {x:hueTriangle.sides.s2.x2, y:hueTriangle.sides.y2}, newHSB.s);
20 + (95-20)*t; 20+75*t
10 + (50-10)*t; 10+40*t
*/


/*
HSB color value precesion needs
Total RGB values (whole numbers): 16,777,216
Total HSB values (whole numbers): 3,600,000



Hue:
Number of RGB Hues: 1530
Degrees in H value:360
degrees per hue: 0.23529

Saturation & Brightness:
Range of S & B values: 0-100






*/