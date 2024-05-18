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

//window.addEventListener("colorChange", (e)=>console.log("fired"),false);

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

// function PickerDisplayColors (){

// }

//set up 2 color preview elemnents
//Only one can be designated as "active" preview
//clicking on the inactive one will switch it to be "active" and the other to "inactive"
//"active" color will listen to updates from color picker to keep the display color in 
//parity with the picker.



//Would like to set up new objects for the 2 color displays. 
//Should they be a new structure that incorporates the color objects with the HTML elements?
//New Class? Just objects in this file? 
//Would like to make sure that the Elements are tied together with the Color Objects that are used in the picker process
//Especially since the goal will be to save them in the future.



