import { Picker } from "./modules/Picker.js";
import {assign, RGBtoHSB, HSBtoRGB, lerp, lerpPoint } from "./modules/globalFunctions.js";
import {ColorObject} from "./modules/ColorObject.js"

const container = document.getElementById("picker");
const colorPrev = document.getElementById("selectedColors");
const previewColors = [...colorPrev.children];
console.log(previewColors);

let thePicker = new Picker(container);

window.addEventListener("colorChange", (e)=>console.log("fired"),false);

function updatePreview(RGB) {
    colorPrev.style.backgroundColor = `rgb(${RGB.r},${RGB.g},${RGB.b})`; 
}


