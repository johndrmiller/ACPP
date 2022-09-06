import {RGBtoHSB, HSBtoRGB} from "../modules/globalFunctions.js";

//makes an object that stores a color in RGB and HSB. Also stores the hue angle in both degrees and radians
//contains methods to convert radians to degrees, degrees to radians,
//RGB to HSB, HSB to RGB (using functions from global functions list),
//and updating the color based on a new RGB, HSB, hue degree value, or hue radian value
export function createColor() {
    const color = {};
    color.rgb = {r:0,g:0,b:0};
    color.hsb = {h:0,s:0,b:0};
    color.rad = 0;
    color.deg = 0;
    color.r2d = function() {
        this.deg = this.rad*180/Math.PI;
    };
    color.d2r = function(){
        this.rad = this.deg*Math.PI/180;
    };
    color.hsbtorgb = function(){
        this.rgb = HSBtoRGB(this.hsb);
    };
    color.rgbtohsb = function(){
        this.hsb = RGBtoHSB(this.rgb);
    };
    color.newRGB = function(rgb) {
        this.rgb = rgb;
        console.log(this.rgb);
        this.rgbtohsb();
        this.deg = this.hsb.h;
        this.d2r();
    };
    color.newHSB = function(hsb) {
        this.hsb = hsb;
        this.hsbtorgb();
        this.deg = this.hsb.h;
        this.d2r();
    };
    color.newDEG = function(deg) {
        this.newHSB({h:deg,s:this.hsb.s,b:this.hsb.b});
    }
    color.newRAD = function(rad) {
        this.rad = rad;
        this.r2d();
        this.newDEG(this.deg);
    };
    return color;
}