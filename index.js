import { Picker } from "./modules/Picker.js";
import {assign, RGBtoHSB, HSBtoRGB, lerp, lerpPoint } from "./modules/globalFunctions.js";
import {ColorObject} from "./modules/ColorObject.js"

const container = document.getElementById("picker");
const displayColorElements = [...document.getElementById("selectedColors").children];
let thePicker = new Picker(container, new ColorObject("RGB",{r:255,g:0,b:0}));

let displayColors = PickerDisplayColors([
    {element:displayColorElements[0],color:"ff0000"},
    {element:displayColorElements[1],color:"ffffff"}
]);

function PickerDisplayColors(inputs){
    let PickerDisplay ={};
    PickerDisplay.elements = [];

    for (let i=0; i<inputs.length; i++) {
        let current = PickerDisplay[`color${i+1}`] = displayColor(inputs[i].element, inputs[i].color);
        PickerDisplay.elements.push(current);
    }
    for (const el of PickerDisplay.elements) {
        if (el.classList.contains("selected")){
            PickerDisplay.selected = el;
        } else {
            el.addEventListener("pointerdown", changeSelected);
            el.classList.toggle("pointer");
        }
    }

    function changeSelected(e){
        let newBGcolor;
        e.target.classList.toggle("selected");
        e.target.classList.toggle("pointer");
        e.target.removeEventListener("pointerdown", changeSelected);
        PickerDisplay.selected.classList.toggle("selected");
        PickerDisplay.selected.classList.toggle("pointer");
        PickerDisplay.selected.addEventListener("pointerdown", changeSelected);
        PickerDisplay.selected = e.target;
        newBGcolor = PickerDisplay.selected.style.backgroundColor.match(/\d+/g);
        console.log( PickerDisplay.selected.style.backgroundColor.match(/\d+/g));
        thePicker.externalUpdate({r:newBGcolor[0] ,g:newBGcolor[1] ,b:newBGcolor[2]});
    }
    
    function updateSelected(e){
        console.log(PickerDisplay.selected);
        PickerDisplay.selected.style.backgroundColor=`#${thePicker.currentColor.hex}`;
    }

    window.addEventListener("colorChange", updateSelected);
    
    return PickerDisplay;
}

function displayColor (element, initialColor) {
    let color = element;
    color.style.backgroundColor = `#${initialColor}`;
    color.update = function (hex) {
        color.style.backgroundColor = `#${hex}`;
    }
    return color;
}




