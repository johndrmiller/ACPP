export const html = document.getElementsByTagName("html")[0];
export const container = document.getElementById("picker");
export const RGBinputElements = [...document.querySelectorAll(".rgbVals input")];
export const colorPrev = document.getElementById("selectedColor");
export const inputErr = document.getElementById("entryError");
export const rgbReg = /(\d+)/g;
export let RGBinputs;

RGBinputs = {
    r: RGBinputElements[0],
    g: RGBinputElements[1],
    b: RGBinputElements[2]
}
