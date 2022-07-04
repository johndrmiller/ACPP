//contrast formula
//(L1 + 0.05) / (L2 + 0.05)
//relative luminance (l1, L2)
//0.2126*R + 0.7152*G + 0.0722*B
//R, G, B definitions
//if (R,G,B)sRGB <= 0.03928 then (R,G,B) = (R,G,B)sRGB/12.92 else
//(R,G,B) = (((R,G,B)sRGB + 0.055)/1.055)^2.4
//(R,G,B)sRBG = (R,G,B)/255

//enter value as hex value with or without "#" or as rgb values formatted RGB(r, g, b)

//expects a 6-digit hexadecimal string with or without a hash in front
//returns an array of 3 2-digit numbers 
function splitHex(hexColor) {
    let input = hexColor;
    if (input.length < 6 || input.length > 7) {
        console.log("Please input a six digit Hex value");
        return
    }
    if (input[0] == "#") {
        input = input.replace("#","");
    }
    if (input.match(/[^a-zA-Z-0-9]/g)) {
        console.log("Entry is not a valid hex code");
        return
    }
    return input.match(/\S{2}/g)
}

//expects an array of 3 2-digit numbers each between 0 and 255
//returns an array of 3 values between 0 and 1
function hextosRGB(hexArray) {
    return hexArray.map(x => parseInt(x,16)/255);
}

//expects an array of 3 values between 0 and 1
//returns an array of 3 values between 0 and 1(???)
function sRGBtoRGB(sRGB){
    return sRGB.map(x => {
        if (x <= 0.03928) {
            return x/12.92
        } else {
            return Math.pow((x+0.055)/1.055, 2.4)
        }
    })
}

//expects an array of 3 values between 0 and 1 (???)
//returns a single value between 0 and 1
function calculateLuminance(RGB){
    return RGB[0]*0.2126+RGB[1]*0.7152+RGB[2]*0.0722
}

//expects hex value
//returns relative lumninance of that hex value
function relativeLuminance(hex){
    return calculateLuminance(sRGBtoRGB(hextosRGB(splitHex(hex))))
}

//expects 2 values between 0 and 1
//returns a value between 1 and 21
export function contrastValue(l1, l2) {
    let L1, L2;
    if (l1 > l2) {
        L1 = l1;
        L2 = l2;
    } else {
        L1 = l2;
        L2 = l1;
    }
    return (L1+0.05)/(L2+0.05)
}

//expects object composed of named color objects with hex values
//updates objects to assign value to new or existing luminance (lum) value
export function luminanceOfGroup(colorObj) {
    for(const color in colorObj) {
        //console.log(baseCases[color].hex);
        colorObj[color].lum = relativeLuminance(colorObj[color].hex)
    }
}

//expects array of either hex color values or arrays containing color name and hex value
//returns an object with color names as keys and hex values as property "hex"
export function createColorObject(arrayOfColors) {
    let obj = {};
    for (var i=0; i<arrayOfColors.length; i++) {
        let val1, val2;
        if (Array.isArray(arrayOfColors[i])) {
            val1 = arrayOfColors[i][0];
            val2 = arrayOfColors[i][1];
        } else {
            val1 = val2 = arrayOfColors[i];
        }
        obj[val1] = {
            hex: val2
        }
    }
    return obj
}

//let hex = "#000000";
//let split = splitHex(hex);
// console.log(split);
//let sRGB = hextosRGB(split);
// console.log(sRGB)
//let RGB = sRGBtoRGB(sRGB);
// console.log(RGB)
//let lum = calculateLuminance(RGB)
// console.log(lum)
//let test = calculateLuminance(sRGBtoRGB(hextosRGB(splitHex("#ffffff"))));
//console.log(test)
//let test2 = calculateLuminance(sRGBtoRGB(hextosRGB(splitHex("#000000"))));
// console.log(test2)
// console.log(contrastValue(test, test2))

//let primaries = createColorObject([["red","#ff0000"],["magenta","#ff00ff"],["blue","#0000ff"],["cyan","00ffff"],["green","#00ff00"],["yellow","#ffff00"]]);
//let grayscale = createColorObject(["#000000","#111111","#222222","#333333","#444444","#555555","#666666","#","#888888","#999999","#aaaaaa","#bbbbbb","#cccccc","#dddddd","#eeeeee","#ffffff"]);
//let grayscale = createColorObject([["0%","#000000"],["25%","#3f3f3f"],["50%","#7f7f7f"],["75%","#bfbfbf"],["100%","#ffffff"]]);
//let array256 = [...Array(256).keys()];//.filter(x=>x%10==0);

//luminanceOfGroup(primaries);
//luminanceOfGroup(grayscale);
//console.log(primaries);
//console.log(grayscale);
//console.log(array256);


//expects array or base10 r,g,b values
//returns corresponding hex value
export function numberToHex(numbers) {
    let temp = numbers.map(x => {
        return x.toString(16).padStart(2,0);
    });
    return "#"+temp[0]+temp[1]+temp[2];
}

//let hexes = createColorObject(array256.map(x=>numberToHex(x)));
//luminanceOfGroup(hexes);
//console.log(hexes);

//x*0.2126+x*0.7152+x*0.0722 = x


function hexFromLuminance(lum){
    //reverse srgbtoRGB
    //reverse hextosrgb
    //return hex
}