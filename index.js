import { Picker } from "./modules/Picker.js";
import {assign, RGBtoHSB, HSBtoRGB, lerp, lerpPoint } from "./modules/globalFunctions.js";
import {ColorObject} from "./modules/ColorObject.js"

const container = document.getElementById("picker");
const picker2 = document.getElementById("picker2");
const picker3 = document.getElementById("picker3");
const colorPrev = document.getElementById("selectedColor");

let thePicker = new Picker(container);
console.log(thePicker);

window.addEventListener("colorChange", (e)=>console.log("fired"),false);

function updatePreview(RGB) {
    colorPrev.style.backgroundColor = `rgb(${RGB.r},${RGB.g},${RGB.b})`; 
}


