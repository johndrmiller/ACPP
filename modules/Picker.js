import {assign, RGBtoHSB, HSBtoRGB, lerp, lerpPoint, line} from "./globalFunctions.js";
import { ColorObject } from "./ColorObject.js";

export class Picker {
    constructor(container){
        const baseHTML = this.#htmlTemplate();
        this.container = container;
        this.container.insertAdjacentHTML("afterbegin",baseHTML);
        this.currentColor = new ColorObject("RGB",{r:255,g:0,b:0});
        this.#assignHTMLelements();
        this.#createSVGelements();
        this.#bindMyFunctions();
        this.#listenerInit();
        this.moveHuePicker();
        this.SVvals(this.vsCircle.pieces.b.getAttribute("cx"),this.vsCircle.pieces.b.getAttribute("cy"));
        this.updateUIColors();

        

        //after updating the color in the picker, fire a 
        //custom event and listen for it from the index.js file
    }

    hue_pointerdown_handler(e){
        this.hueCircle.removeEventListener("pointerDown", this.hue_pointerdown_handler);
        window.addEventListener("pointermove",this.hue_pointermove_handler);
        window.addEventListener("pointerup", this.hue_pointerup_handler);
        window.addEventListener("pointerleave", this.hue_pointerup_handler);
        this.html.style.cursor = "grabbing";
        this.hueCircle.style.cursor = "inherit";
    }
    
    vs_pointerdown_handler(e) {
        this.vsCircle.removeEventListener("pointerDown", this.vs_pointerdown_handler);
        window.addEventListener("pointermove",this.vs_pointermove_handler);
        window.addEventListener("pointerup", this.vs_pointerup_handler);
        window.addEventListener("pointerleave", this.vs_pointerup_handler);
        this.html.style.cursor = "grabbing";
        this.vsCircle.style.cursor = "inherit";
    }

    hue_pointermove_handler(e) {
        window.removeEventListener("pointermove",this.hue_pointermove_handler);
        let hueRad = this.calcRads(e);
        this.currentColor.newRAD(hueRad);
        this.moveHuePicker();
        this.updateUIColors();
        window.addEventListener("pointermove",this.hue_pointermove_handler);
    }
    
    vs_pointermove_handler(e) {
        window.removeEventListener("pointermove",this.vs_pointermove_handler);
        let point = this.newSVcoords(e);
        this.moveSVmarker(point);
        let newSV = this.SVvals(point.x, point.y);
        this.currentColor.newHSB({h:this.currentColor.hsb.h,s:newSV.s, b:newSV.b});
        this.updateUIColors();
        window.addEventListener("pointermove",this.vs_pointermove_handler);
    }

    hue_pointerup_handler(e){
        window.removeEventListener("pointermove", this.hue_pointermove_handler);
        window.removeEventListener("pointerup", this.hue_pointerup_handler);
        window.removeEventListener("pointerleave", this.hue_pointerup_handler);
        this.hueCircle.addEventListener("pointerdown", this.hue_pointerdown_handler);
        this.html.style.cursor = "";
        this.hueCircle.style.cursor = "";
    }
    
    vs_pointerup_handler(e) {
        window.removeEventListener("pointermove", this.vs_pointermove_handler);
        window.removeEventListener("pointerup", this.vs_pointerup_handler);
        window.removeEventListener("pointerleave", this.vs_pointerup_handler);
        this.vsCircle.addEventListener("pointerdown", this.vs_pointerdown_handler);
        this.html.style.cursor = "";
        this.vsCircle.style.cursor = "";
    }

    calcRads(e) {
        const {hueWheel} = this;
        let deltaX, deltaY, hueRad;
        //for later implementation to account for scrolled page
        let gapX = window.scrollX;
        let gapY = window.scrollY;
    
        let pointer = {
            x: e.clientX,
            y: e.clientY
        }
        //1&2) Calculate x (1) and y (2) position of mouse in relation to center of hue wheel
        //   if x is right of hue wheel, value is positive; if left, value is negative
        //   if y is below hue wheel, value is negative; if above, value is positive
        //3) Use atan2 to calculate angle (in radians);
        //   atan2 takes into account the signs of the passed x and y values preventing the need to also find the quadrant manually when using atan
        //4) The conversion formulas for HSB to RGB don't like negative angles, this converts a negative value to positive
    
        //1)
        deltaX = pointer.x >= hueWheel.center.x ? pointer.x - hueWheel.center.x : -1*(hueWheel.center.x - pointer.x);
        //2)
        deltaY = pointer.y >= hueWheel.center.y ? hueWheel.center.y-pointer.y : -1*(pointer.y-hueWheel.center.y);
        //3)
        hueRad = Math.atan2(deltaY, deltaX);
        //4)
        hueRad = hueRad >= 0 ? hueRad : hueRad + (2*Math.PI);
        return hueRad;
    }
    
    moveHuePicker() {
        const {currentColor, hueWheel, hueCircle, huePath} = this;
            //1) Use sin and cos of hueAngle to find new coordinates for circle marker inside of hue track
        //   Sign of Y value is flipped due to Y values going opposite direction in coordinate plane vs on html page
        //   (there may be a better way to calculate, but this is what I came up with)    
        //2) Update position of hue picker circles

        //1)
        //console.log("yes");
        let cos = Math.cos(currentColor.rad);
        let sin = Math.sin(currentColor.rad);
        let newX = (cos*hueWheel.radius)+hueWheel.radius+(huePath*cos*-1);
        let newY = (sin*hueWheel.radius*-1)+hueWheel.radius+(huePath*sin);
        let hKeys = Object.keys(hueCircle.pieces);
        //2)
        hKeys.forEach (x => {
            assign(hueCircle.pieces[x],{
                cx: newX,
                cy: newY
            });
        });    
    }

    newSVcoords(e){
        const {svPicker, hueTriangle} = this;
        //1) Assign pointer to mouse coordinates adjusted to be relative to the saturation and value triangle container
        //2) Assign initial newX and newY values to pointer coordinates
        //3) If x value were to go left or right of bounds of triangle assign newX to left or right edges of triangle, respectively 
        //4) For current X value find max and min y values based on top and bottom line equations
        //   If actual y falls outside of those bounds assign newY as maxY or minY, respectively
        //5) Assign picker elements to new x and y values, then call sVvals function with them
    
        //1)
        let pointer  = {
            x: e.clientX-svPicker.box.x,
            y: e.clientY-svPicker.box.y
        }
        //2)
        let newX = pointer.x, newY = pointer.y, maxY, minY;
        //3)
        if (pointer.x < hueTriangle.sides.s1.x1) {
            newX = hueTriangle.sides.s1.x1;
        } else if (pointer.x > hueTriangle.sides.s2.x2) {
            newX = hueTriangle.sides.s2.x2;
        }
        //4)
        maxY = (newX*hueTriangle.sides.s2.m)+hueTriangle.sides.s2.b;
        minY = (newX*hueTriangle.sides.s3.m)+hueTriangle.sides.s3.b;
        
        if (pointer.y < minY) {
            newY = minY;
        } else if (pointer.y > maxY) {
            newY = maxY;
        }
        return {x:newX, y:newY}
        //5)
    }

    moveSVmarker(point) {
        const {vsCircle} = this;
        let keys = Object.keys(vsCircle.pieces);
        
        keys.forEach (x => {
            assign(vsCircle.pieces[x],{
                cx: point.x,
                cy: point.y
            });
        });
    }
    
    SVvals(x,y){
        const {hueTriangle, svPicker} = this;
        //1) Find equation of line that includes passed point and bottom point (side1: x1,y1)
        //2) Find x value of intersection point of that line and side2
        //    m1x + b1 = m2x + b2, set 2 equations equal to each other and solve for x
        //    (m1-m2)x = b2-b1
        //    x = (b2-b1)/(m1-m2)
        //3) Plug x back into equation to find y
        //4) Create line object for full value line
        //5) Find percentage of value line where passed point sits
        //6) Create line segment from beginning of side 2 (saturation line) to intersection point
        //7) Find percentage of saturation line where passed point sits.
        //8) assign current hue (hueAngle) along with v and s values to new hsb object. Then convert to RGB.
        //9) Update RGB input text boxes and Triangle BG color.
        //1)
        let shortRay = line(hueTriangle.tPoints[4], hueTriangle.tPoints[5], x, y, svPicker.box);
        //2)
        let intersectionX = shortRay.b == undefined ? shortRay.x1 : (shortRay.b-hueTriangle.sides.s2.b)/(hueTriangle.sides.s2.m-shortRay.m);
        //3)
        let intersectionY = shortRay.b == undefined ? hueTriangle.sides.s2.y1 : (shortRay.m*intersectionX)+shortRay.b;
        //4)
        let valueRay = line(shortRay.x1, shortRay.y1,intersectionX,intersectionY, svPicker.box);
        //5)
        let vPercent = Math.round((shortRay.length/valueRay.length)*10000)/100;
        //6)
        let satRay = line(hueTriangle.sides.s2.x1, hueTriangle.sides.s2.y1,intersectionX,intersectionY, svPicker.box);
        //7)
        let sPercent = Math.round((satRay.length/hueTriangle.sides.s2.length)*10000)/100;
        //8)
        return {s:sPercent, b:vPercent}
        //9)
    }

    updateUIColors(){
        const event = new Event("colorChange");
        const color = this.currentColor;
        this.updateHue(color.deg);
        dispatchEvent(event);
        this.updateRGBVals(color.rgb);
    }

    updateHue(DEG) {
        let hueColor = HSBtoRGB({h:DEG, s:100, b:100});
        this.hueTriangle.setAttribute("fill",`rgb(${hueColor.r},${hueColor.g},${hueColor.b})`);
    }

    updateRGBVals(RGB){
        this.RGBinputs.r.value = RGB.r;
        this.RGBinputs.g.value = RGB.g;
        this.RGBinputs.b.value = RGB.b;
    }

    RGBupdate(e) {
        let valid = /^\d{1,3}$/g;
        let entry = e.target.value;
        let res = valid.test(entry);
        let newRGBs, satIntersection, valLine, valIntersection, oldDeg;
    
        oldDeg = this.currentColor.deg;
        // if(!this.entryError.classList.contains("hide")) {
        //     this.entryError.classList.add("hide");
        // }
        // if (entry.length === 0) return;
        // //<<<This part hides the preview color and shows the error message
        // //need to find alternative if the color preview is going to be a separate element
        // if (!res || !(0<=entry&&entry<=255)) {
        //     // if (colorPrev.classList.contains("hide")) {
        //     //     return;
        //     // }
        //     //colorPrev.classList.add("hide");
        //     this.entryError.classList.remove("hide");
        //     return;
        // }
        // if (colorPrev.classList.contains("hide")) {
        //     inputErr.classList.add("hide");
        //     colorPrev.classList.remove("hide");
        // }
        //<<<<

        newRGBs = {r:this.RGBinputs.r.value ,g:this.RGBinputs.g.value , b:this.RGBinputs.b.value };
        
        this.currentColor.newRGB(newRGBs);
        satIntersection = lerpPoint({x:this.hueTriangle.sides.s2.x1, y:this.hueTriangle.sides.s2.y1} , {x:this.hueTriangle.sides.s2.x2, y:this.hueTriangle.sides.s2.y2}, this.currentColor.hsb.s);
        valLine = line(this.hueTriangle.sides.s1.x1, this.hueTriangle.sides.s1.y1, satIntersection.x, satIntersection.y, this.svPicker.box);
        valIntersection = lerpPoint({x:valLine.x1, y:valLine.y1}, {x:valLine.x2,y:valLine.y2},this.currentColor.hsb.b);
        
        if (this.currentColor.deg !== oldDeg) {
            this.moveHuePicker();
        }
        this.moveSVmarker(valIntersection);
        this.updateHue(this.currentColor.deg);
        //updatePreview(mainColor.rgb);
    
        //we have input, what do we do with it?
        //1) Grab all RGB input values
        //2) Convert to HSB
        //3) If h is different than hueAngle, set hue angle and update hue picker and triangle color
            //is there any way to make use of what we've already written or will it need to be completely novel?
        //4) Update SV picker position 
        //  a) Take S value and find position on saturation line that correlates
        //  b) Draw line between new point and (s=0, v=0)
        //  c) Tacke V value and find position on new line that correlates
        //  d) Move SV marker to new position
        //5) Update current color in preview
    }
    

    RGBfocus(e) {
        let tar = e.currentTarget;
        tar.addEventListener("blur", this.RGBloseFocus);
        tar.addEventListener("input", this.RGBupdate);
    }

    RGBloseFocus(e) {
        console.log("lost");
    }

    responsiveRecalc(e) {
        const {hueWheel, svPicker} = this;
        hueWheel.box = hueWheel.getBoundingClientRect();
        hueWheel.center.x = hueWheel.box.x+(hueWheel.box.width/2);
        hueWheel.center.y = hueWheel.box.y+(hueWheel.box.height/2);
        svPicker.box = svPicker.getBoundingClientRect();
    }

    #listenerInit() {
        window.addEventListener('resize', this.responsiveRecalc);
        this.hueCircle.addEventListener("pointerdown", this.hue_pointerdown_handler);
        this.vsCircle.addEventListener("pointerdown", this.vs_pointerdown_handler);
        for (const prop in this.RGBinputs) {
            this.RGBinputs[prop].addEventListener("focus", this.RGBfocus);
        }
    };

    #bindMyFunctions(){
        this.responsiveRecalc = this.responsiveRecalc.bind(this);
        this.hue_pointerdown_handler = this.hue_pointerdown_handler.bind(this);
        this.hue_pointermove_handler = this.hue_pointermove_handler.bind(this);
        this.hue_pointerup_handler = this.hue_pointerup_handler.bind(this);
        this.vs_pointerdown_handler = this.vs_pointerdown_handler.bind(this);
        this.vs_pointermove_handler = this.vs_pointermove_handler.bind(this);
        this.vs_pointerup_handler = this.vs_pointerup_handler.bind(this);
        this.RGBfocus = this.RGBfocus.bind(this);
        this.RGBloseFocus = this.RGBloseFocus.bind(this);
        this.updateUIColors = this.updateUIColors.bind(this);
        this.updateRGBVals = this.updateRGBVals.bind(this);
        this.RGBupdate = this.RGBupdate.bind(this);
    }

    #createSVGelements() {
        let nsp = "http://www.w3.org/2000/svg";
        
        this.hueSelector.diameter = this.hueSelector.getBoundingClientRect().width;
        this.hueTrackDepth = (this.hueWheel.diameter - this.wheelCenter.diameter)/2;
        this.huePath = this.hueTrackDepth/2;
        this.svPicker.box = this.svPicker.getBoundingClientRect();

        this.hueTriangle.tPoints = [20, 10, 89.29, 50, 20, 90].map(x => this.svPicker.box.width*(x/100));
        this.hueTriangle.sides = {
            s1: line(this.hueTriangle.tPoints[4],this.hueTriangle.tPoints[5],this.hueTriangle.tPoints[0],this.hueTriangle.tPoints[1], this.svPicker.box),
            s2: line(this.hueTriangle.tPoints[0],this.hueTriangle.tPoints[1],this.hueTriangle.tPoints[2],this.hueTriangle.tPoints[3], this.svPicker.box),
            s3: line(this.hueTriangle.tPoints[2],this.hueTriangle.tPoints[3],this.hueTriangle.tPoints[4],this.hueTriangle.tPoints[5], this.svPicker.box)
        }

        this.hueCircle = document.createElementNS(nsp,"svg");
        this.hueCircle.initial = {
            x: this.hueSelector.diameter/2,
            y: this.huePath
        }
        this.hueCircle.pieces= {
            b: document.createElementNS(nsp,"circle"),
            w: document.createElementNS(nsp, "circle")
        }
        assign(this.hueCircle,{
            id:"hueCircle"
        })
        assign(this.hueCircle.pieces.b,{
            cx: this.hueCircle.initial.x,
            cy: this.hueCircle.initial.y,
            r: this.huePath,
            fill: "none",
            stroke: "var(--outside-ring)",
            ["stroke-width"]: "1"
        });
        assign(this.hueCircle.pieces.w,{
            cx: this.hueCircle.initial.x,
            cy: this.hueCircle.initial.y,
            r: this.huePath-2,
            fill: "rgba(255,255,255,0)",
            stroke: "var(--inside-ring)",
            ["stroke-width"]:"2"
        });
        this.hueSelector.appendChild(this.hueCircle);
        this.hueCircle.appendChild(this.hueCircle.pieces.b);
        this.hueCircle.appendChild(this.hueCircle.pieces.w);
        
        this.vsCircle = document.createElementNS(nsp,"svg");
        this.vsCircle.pieces = {
            b: document.createElementNS(nsp,"circle"),
            w: document.createElementNS(nsp, "circle")
        }
        assign(this.vsCircle.pieces.b,{
            cx: this.hueTriangle.tPoints[2],
            cy: this.hueTriangle.tPoints[3],
            r:this.huePath,
            fill: "none",
            stroke: "var(--outside-ring)",
            ["stroke-width"]: "1",
            ["shape-rendering"]: "auto"
        });
        assign(this.vsCircle.pieces.w,{
            cx: this.hueTriangle.tPoints[2],
            cy: this.hueTriangle.tPoints[3],
            r: this.huePath-2,
            fill: "rgba(255,255,255,0)",
            stroke: "var(--inside-ring)",
            ["stroke-width"]: "2",
            ["shape-rendering"]: "auto"
        });
        this.sbSelector.appendChild(this.vsCircle);
        this.vsCircle.appendChild(this.vsCircle.pieces.b);
        this.vsCircle.appendChild(this.vsCircle.pieces.w);
        
        this.pickerTriangle = document.createElementNS(nsp,"polygon");
        assign(this.pickerTriangle,{
            id: "pickerTriangle",
            points: this.hueTriangle.tPoints,
        });
        this.svDefs.appendChild(this.pickerTriangle);
    }

    #assignHTMLelements() {
        this.html = document.getElementsByTagName("html")[0];
        this.hueWheel = this.container.querySelector("#hueWheel");
        this.hueWheel.diameter = this.hueWheel.clientHeight;
        this.hueWheel.radius = this.hueWheel.diameter/2;
        this.hueWheel.box = this.hueWheel.getBoundingClientRect();
        this.hueWheel.center =  {
            x: this.hueWheel.box.x+(this.hueWheel.box.width/2),
            y: this.hueWheel.box.y+(this.hueWheel.box.height/2)
        }

        this.hueSelector = this.hueWheel.querySelector("#hueSelector");
        this.wheelCenter = this.hueWheel.querySelector("#wheelCenter");
        this.wheelCenter.diameter = this.wheelCenter.clientHeight;
        
        this.svPicker = this.wheelCenter.querySelector("#SVpicker");
        this.svDefs = this.svPicker.getElementsByTagName("defs")[0];
        this.hueTriangle = this.svPicker.querySelector("#hueTriangle");
    
        this.valueTriangle = this.svPicker.querySelector("#valueTriangle");
        this.sbSelector = this.svPicker.querySelector("#satBrightSelector");

        this.RGBinputElements = [...this.container.querySelectorAll(".rgbVals input")];
        this.RGBinputs = {
            r: this.RGBinputElements[0],
            g: this.RGBinputElements[1],
            b: this.RGBinputElements[2]
        }
        this.entryError = this.container.querySelector("#entryError");
    }

    #htmlTemplate() {
        return `<div id="hueWheel">
            <div id="wheelCenter">
                <svg id="SVpicker" shape-rendering="crispEdges">
                    <defs>
                        <linearGradient id="valueGradient" gradientTransform="rotate(90)">
                            <stop offset="10%" stop-color="white" stop-opacity="1" />
                            <stop offset="85%" stop-color="black" stop-opacity="1" />
                        </linearGradient>
                        <linearGradient id="maskGradient">
                            <stop offset="5%" stop-color="white" stop-opacity="1" />
                            <stop offset="90%" stop-color="black" stop-opacity="1" />
                        </linearGradient>
                        <linearGradient id="whiteMaskGradient" gradientTransform="rotate(45)">
                            <stop offset="0%" stop-color="white" stop-opacity="1" />
                            <stop offset="100%" stop-color="white" stop-opacity="0" />
                        </linearGradient>
                        <linearGradient id="blackMaskGradient" gradientTransform="rotate(45)">
                            <stop offset="0%" stop-color="black" stop-opacity="1" />
                            <stop offset="100%" stop-color="black" stop-opacity="0" />
                        </linearGradient>
                        <mask id="valueMask">
                            <use href="#pickerTriangle" fill="url(#maskGradient)" />
                        </mask>
                    </defs>
                    <use id="hueTriangle" href="#pickerTriangle" fill="rgb(255,0,0)" x="0" y="0"/>
                    <use id="valueTriangle" href="#pickerTriangle" fill="url(#valueGradient)" mask="url(#valueMask)" x="0" y="0"/>
                    <svg id="satBrightSelector"></svg>
                </svg>
            </div>
            <svg id="hueSelector"></svg>
        </div>
        <div id="colorValues">
            <select name="format" id="colorFormat">
                <option value="RGB">RGB</option>
                <option value="HEX">HEX</option>
            </select>
            <div id="RGBvalues">
                <div class="rgbVals">
                    <label for="rtext">R:</label>
                    <input type="text" name="rtext" id="rtext" size="3" maxlength="3">
                </div>
                <div class="rgbVals">
                    <label for="gtext">G:</label>
                    <input type="text" name="gtext" id="gtext" size="3" maxlength="3">
                </div>
                <div class="rgbVals">
                    <label for="btext">B:</label>
                    <input type="text" name="btext" id="btext" size="3" maxlength="3">
                </div>
            </div>
            <div class="hide" id="entryError">
                <p>Please enter a number between <span>0</span> and <span>255</span>.</p>
            </div>
        </div>`;
    }
}