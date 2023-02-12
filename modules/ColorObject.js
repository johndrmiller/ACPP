import {RGBtoHSB, HSBtoRGB} from "./globalFunctions.js";

//takes a string representing type of information passed in second parameter 
//Either "RGB", "HSB", "DEG" (HSB hue value in degrees), or "RAD" (hue angle in radians)
//makes an object that stores a color in RGB and HSB. Also stores the hue angle in both degrees and radians
//contains methods to convert radians to degrees, degrees to radians,
//RGB to HSB, HSB to RGB (using functions from global functions list),
//and updating the color based on a new RGB, HSB, hue degree value, or hue radian value
export class ColorObject {
    constructor(type,value) {
        this.rgb = {r:0,g:0,b:0};
        this.hsb = {h:0,s:0,b:0};
        this.rad = 0;
        this.deg = 0;
        switch (type) {
            case "RGB": this.newRGB(value);
            break;
            case "HSB": this.newHSB(value);
            break;
            case "DEG": this.newDEG(value);
            break;
            case "RAD": this.newRAD(value);
            break;
        };
    };
    r2d() {
        this.deg = this.rad*180/Math.PI;
    };
    d2r(){
        this.rad = this.deg*Math.PI/180;
    };
    hsbtorgb(){
        this.rgb = HSBtoRGB(this.hsb);
    };
    rgbtohsb(){
        this.hsb = RGBtoHSB(this.rgb);
    };
    newRGB(rgb) {
        this.rgb = rgb;
        this.rgbtohsb();
        this.deg = this.hsb.h;
        this.d2r();
    };
    newHSB(hsb) {
        this.hsb = hsb;
        this.hsbtorgb();
        this.deg = this.hsb.h;
        this.d2r();
    };
    newDEG(deg) {
        this.newHSB({h:deg,s:this.hsb.s,b:this.hsb.b});
    }
    newRAD(rad) {
        this.rad = rad;
        this.r2d();
        this.newDEG(this.deg);
    };
}
