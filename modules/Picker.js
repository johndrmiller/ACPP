import {assign, RGBtoHSB, HSBtoRGB, lerp, lerpPoint, line} from "./globalFunctions.js";
import { ColorObject } from "./ColorObject.js";

export class Picker {
    constructor(container){
        this.container = container;
        this.container.insertAdjacentHTML("afterbegin",this.#htmlTemplate());
        this.currentColor = new ColorObject("RGB",{r:255,g:0,b:0});
        this.#assignHTMLelements();
        this.#createSVGelements();
        this.#bindMyFunctions();
        this.#listenerInit();
        this.moveHuePicker();
        this.SVvals(this.vsCircle.pieces.b.getAttribute("cx"),this.vsCircle.pieces.b.getAttribute("cy"));
        this.updateUIColors();
        container.classList.add("picker");
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
        let wheelCenterOffsetX, wheelCenterOffsetY, hueRadians;
        //for later implementation to account for scrolled page
        let gapX = window.scrollX;
        let gapY = window.scrollY;
    
        let pointer = {
            x: e.pageX,
            y: e.pageY-window.scrollY
        }

        hueWheel.box = hueWheel.getBoundingClientRect();
        hueWheel.center =  {
            x: hueWheel.box.x+(hueWheel.box.width/2),
            y: hueWheel.box.y+(hueWheel.box.height/2)
        }
    
        wheelCenterOffsetX = pointer.x >= hueWheel.center.x ? pointer.x - hueWheel.center.x : -1*(hueWheel.center.x - pointer.x);
        wheelCenterOffsetY = pointer.y >= hueWheel.center.y ? hueWheel.center.y-pointer.y : -1*(pointer.y-hueWheel.center.y);
        //atan2 takes into account the signs of the passed x and y values preventing the need to also find the quadrant manually when using atan
        hueRadians = Math.atan2(wheelCenterOffsetY, wheelCenterOffsetX);
        //The conversion formulas for HSB to RGB don't like negative angles, this converts a negative value to positive
        hueRadians = hueRadians >= 0 ? hueRadians : hueRadians + (2*Math.PI);
        return hueRadians;
    }
    
    moveHuePicker() {
        const {currentColor, hueWheel, hueCircle, huePath} = this;

        let cos = Math.cos(currentColor.rad);
        let sin = Math.sin(currentColor.rad);
        let newX = (cos*hueWheel.radius)+hueWheel.radius+(huePath*cos*-1);
        let newY = (sin*hueWheel.radius*-1)+hueWheel.radius+(huePath*sin);
        let hueCircleKeys = Object.keys(hueCircle.pieces);

        hueCircleKeys.forEach (x => {
            assign(hueCircle.pieces[x],{
                cx: newX,
                cy: newY
            });
        });    
    }

    newSVcoords(e){
        const {svPicker, hueTriangle} = this;
        
        svPicker.box = svPicker.getBoundingClientRect();    

        let pointer  = {
            x: e.pageX-svPicker.box.x,
            y: e.pageY-svPicker.box.y-window.scrollY
        }
        let newX = pointer.x, newY = pointer.y, maxY, minY;
        
        if (pointer.x < hueTriangle.sides.left.x1) {
            newX = hueTriangle.sides.left.x1;
        } else if (pointer.x > hueTriangle.sides.top.x2) {
            newX = hueTriangle.sides.top.x2;
        }
        //For current X value find max and min y values based on top and bottom line equations
        maxY = (newX*hueTriangle.sides.top.m)+hueTriangle.sides.top.b;
        minY = (newX*hueTriangle.sides.bottom.m)+hueTriangle.sides.bottom.b;
        
        //If actual y falls outside of those bounds assign newY as maxY or minY, respectively
        if (pointer.y < minY) {
            newY = minY;
        } else if (pointer.y > maxY) {
            newY = maxY;
        }
        return {x:newX, y:newY}
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
        /*1*/let shortRay = line(hueTriangle.tPoints[4], hueTriangle.tPoints[5], x, y, svPicker.box);
        /*2*/let intersectionX = shortRay.b == undefined ? shortRay.x1 : (shortRay.b-hueTriangle.sides.top.b)/(hueTriangle.sides.top.m-shortRay.m);
        /*3*/let intersectionY = shortRay.b == undefined ? hueTriangle.sides.top.y1 : (shortRay.m*intersectionX)+shortRay.b;
        /*4*/let valueRay = line(shortRay.x1, shortRay.y1,intersectionX,intersectionY, svPicker.box);
        /*5*/let vPercent = Math.round((shortRay.length/valueRay.length)*10000)/100;
        /*6*/let satRay = line(hueTriangle.sides.top.x1, hueTriangle.sides.top.y1,intersectionX,intersectionY, svPicker.box);
        /*7*/let sPercent = Math.round((satRay.length/hueTriangle.sides.top.length)*10000)/100;
        return {s:sPercent, b:vPercent}
    }

    updateUIColors(){
        const event = new Event("colorChange");
        const color = this.currentColor;
        this.updateHue(color.deg);
        dispatchEvent(event);
        this.updateRGBVals(color.rgb);
        this.updateHEXVals(color.hex);
    }

    updateHue(DEG) {
        let hueColor = HSBtoRGB({h:DEG, s:100, b:100});
        this.hueTriangle.setAttribute("fill",`rgb(${hueColor.r},${hueColor.g},${hueColor.b})`);
    }

    updateRGBVals(RGB){
        const {RGBinputs} = this;
        RGBinputs.r.value = RGB.r;
        RGBinputs.g.value = RGB.g;
        RGBinputs.b.value = RGB.b;
    }

    updateHEXVals(HEX) {
        this.HEXinput.value = HEX;
    }

    RGBupdate(e) {
        const {currentColor, rgbError, RGBinputElements, RGBfocus, colorFormat, RGBinputs, hueTriangle, svPicker} = this;
        const valid = /^\d{1,3}$/g;
        let entry = e.target.value;
        const correctFormat = valid.test(entry);
        const inRange = 0<=entry&&entry<=255;
        let otherInputs = RGBinputElements.filter(el => el.id != e.target.id);
        let errorHidden = rgbError.classList.contains("hide");
        let newRGBs, satIntersection, valLine, valIntersection, oldDeg;
    
        oldDeg = currentColor.deg;
        
        if (!correctFormat || !inRange) {
            if (errorHidden) {
                rgbError.classList.remove("hide");
                for (const el of otherInputs) {
                    el.disabled = true;
                    el.removeEventListener("focus", RGBfocus);
                }
                colorFormat.disabled = true;
            }
            return;
        }
        if ((correctFormat && inRange) && !errorHidden) {
            rgbError.classList.add("hide");
            for (const el of otherInputs) {
                el.disabled = false;
                el.addEventListener("focus", RGBfocus);
            }
            colorFormat.disabled = false;
        }

        newRGBs = {r:RGBinputs.r.value ,g:RGBinputs.g.value , b:RGBinputs.b.value };
        
        currentColor.newRGB(newRGBs);
        satIntersection = lerpPoint({x:hueTriangle.sides.top.x1, y:hueTriangle.sides.top.y1} , {x:hueTriangle.sides.top.x2, y:hueTriangle.sides.top.y2}, currentColor.hsb.s);
        valLine = line(hueTriangle.sides.left.x1, hueTriangle.sides.left.y1, satIntersection.x, satIntersection.y, svPicker.box);
        valIntersection = lerpPoint({x:valLine.x1, y:valLine.y1}, {x:valLine.x2,y:valLine.y2},currentColor.hsb.b);
        
        if (currentColor.deg !== oldDeg) {
            this.moveHuePicker();
            this.updateHue(currentColor.deg);
        }
        this.moveSVmarker(valIntersection);
        this.updateHEXVals(currentColor.hex);
    }

    HEXfocus(e) {
        let tar = e.currentTarget;
        tar.addEventListener("input", this.HEXonInput);
        tar.addEventListener("blur", this.HEXloseFocus);
    }

    HEXonInput(e) {
        let test = /(#?)[^#a-f\d]/gi;
        let entry = e.target.value;
        let invalidCharacters = test.test(entry);
        let errorHidden = this.hexError.classList.contains("hide");
        if (invalidCharacters) {
            if (errorHidden) {
                this.hexError.classList.remove("hide");
            }
            return
        }
        if (!errorHidden) {
            this.hexError.classList.add("hide");
        }
    }

    HEXloseFocus(e) {
        const {currentColor, hexError, hueTriangle, svPicker} = this;
        let validHEX = /(#?)[a-f\d]{3}(?:[a-f\d]{3})?\b/gi;
        let entry = e.target.value;
        let correctFormat = validHEX.test(entry);
        let errorHidden = hexError.classList.contains("hide");
        let oldDeg = currentColor.deg;
        let satIntersection, valLine, valIntersection;

        if (!correctFormat) {
            if (errorHidden) {
                hexError.classList.remove("hide");
            }
            return;
        }
        if (!errorHidden) {
            hexError.classList.add("hide");
        }
        if (entry[0]=="#") {
            entry=entry.slice(1);
            e.target.value = entry;
        }

        currentColor.newHEX(entry);
        satIntersection = lerpPoint({x:hueTriangle.sides.top.x1, y:hueTriangle.sides.top.y1} , {x:hueTriangle.sides.top.x2, y:hueTriangle.sides.top.y2}, currentColor.hsb.s);
        valLine = line(hueTriangle.sides.left.x1, hueTriangle.sides.left.y1, satIntersection.x, satIntersection.y, svPicker.box);
        valIntersection = lerpPoint({x:valLine.x1, y:valLine.y1}, {x:valLine.x2,y:valLine.y2},currentColor.hsb.b);

        if (currentColor.deg !== oldDeg) {
            this.moveHuePicker();
            this.updateHue(currentColor.deg);
        }
        this.moveSVmarker(valIntersection);
        this.updateRGBVals(currentColor.rgb);
    }

    responsiveRecalc(e) {
        const {hueWheel, svPicker} = this;
        hueWheel.box = hueWheel.getBoundingClientRect();
        hueWheel.center.x = hueWheel.box.x+(hueWheel.box.width/2);
        hueWheel.center.y = hueWheel.box.y+(hueWheel.box.height/2);
        svPicker.box = svPicker.getBoundingClientRect();
    }

    switchColorFormat(e) {
        //if we expand this to any more formats this will need a heavy rewrite.
        this.RGBvalues.classList.toggle("hide");
        this.HEXvalues.classList.toggle("hide");
    }
    
    #listenerInit() {
        window.addEventListener('resize', this.responsiveRecalc);
        this.hueCircle.addEventListener("pointerdown", this.hue_pointerdown_handler);
        this.vsCircle.addEventListener("pointerdown", this.vs_pointerdown_handler);
        for (const prop in this.RGBinputs) {
            this.RGBinputs[prop].addEventListener("input", this.RGBupdate);
        }
        this.HEXinput.addEventListener("focus", this.HEXfocus);
        this.colorFormat.addEventListener("change", this.switchColorFormat);
    };

    #bindMyFunctions(){
        this.responsiveRecalc = this.responsiveRecalc.bind(this);
        this.hue_pointerdown_handler = this.hue_pointerdown_handler.bind(this);
        this.hue_pointermove_handler = this.hue_pointermove_handler.bind(this);
        this.hue_pointerup_handler = this.hue_pointerup_handler.bind(this);
        this.vs_pointerdown_handler = this.vs_pointerdown_handler.bind(this);
        this.vs_pointermove_handler = this.vs_pointermove_handler.bind(this);
        this.vs_pointerup_handler = this.vs_pointerup_handler.bind(this);
        this.HEXfocus = this.HEXfocus.bind(this);
        this.HEXloseFocus = this.HEXloseFocus.bind(this);
        this.updateUIColors = this.updateUIColors.bind(this);
        this.updateRGBVals = this.updateRGBVals.bind(this);
        this.updateHEXVals = this.updateHEXVals.bind(this);
        this.RGBupdate = this.RGBupdate.bind(this);
        this.switchColorFormat = this.switchColorFormat.bind(this);
        this.HEXonInput = this.HEXonInput.bind(this);
    }

    #createSVGelements() {
        let nsp = "http://www.w3.org/2000/svg";
        this.hueCircle = document.createElementNS(nsp,"svg");
        this.hueTrackDepth = (this.hueWheel.diameter - this.wheelCenter.diameter)/2;
        this.huePath = this.hueTrackDepth/2;
        this.vsCircle = document.createElementNS(nsp,"svg");
        this.pickerTriangle = document.createElementNS(nsp,"polygon");
        const {hueSelector, hueTriangle, svPicker, hueCircle, huePath, vsCircle, pickerTriangle} = this;
        hueSelector.diameter = hueSelector.getBoundingClientRect().width;
        svPicker.box = svPicker.getBoundingClientRect();
        hueTriangle.tPoints = [20, 10, 89.29, 50, 20, 90].map(x => svPicker.box.width*(x/100));
        hueTriangle.sides = {
            left: line(hueTriangle.tPoints[4],hueTriangle.tPoints[5],hueTriangle.tPoints[0],hueTriangle.tPoints[1], svPicker.box),
            top: line(hueTriangle.tPoints[0],hueTriangle.tPoints[1],hueTriangle.tPoints[2],hueTriangle.tPoints[3], svPicker.box),
            bottom: line(hueTriangle.tPoints[2],hueTriangle.tPoints[3],hueTriangle.tPoints[4],hueTriangle.tPoints[5], svPicker.box)
        }
        hueCircle.initial = {
            x: hueSelector.diameter/2,
            y: huePath
        }
        hueCircle.pieces= {
            b: document.createElementNS(nsp,"circle"),
            w: document.createElementNS(nsp, "circle")
        }
        assign(hueCircle,{
            id:`${this.container.id}hueCircle`
        })
        assign(hueCircle.pieces.b,{
            cx: hueCircle.initial.x,
            cy: hueCircle.initial.y,
            r: huePath,
            fill: "none",
            stroke: "var(--outside-ring)",
            ["stroke-width"]: "1"
        });
        assign(hueCircle.pieces.w,{
            cx: hueCircle.initial.x,
            cy: hueCircle.initial.y,
            r: huePath-2,
            fill: "rgba(255,255,255,0)",
            stroke: "var(--inside-ring)",
            ["stroke-width"]:"2"
        });
        hueSelector.appendChild(hueCircle);
        hueCircle.appendChild(hueCircle.pieces.b);
        hueCircle.appendChild(hueCircle.pieces.w);
        
        vsCircle.pieces = {
            b: document.createElementNS(nsp,"circle"),
            w: document.createElementNS(nsp, "circle")
        }
        assign(vsCircle.pieces.b,{
            cx: hueTriangle.tPoints[2],
            cy: hueTriangle.tPoints[3],
            r:huePath,
            fill: "none",
            stroke: "var(--outside-ring)",
            ["stroke-width"]: "1",
            ["shape-rendering"]: "auto"
        });
        assign(vsCircle.pieces.w,{
            cx: hueTriangle.tPoints[2],
            cy: hueTriangle.tPoints[3],
            r: huePath-2,
            fill: "rgba(255,255,255,0)",
            stroke: "var(--inside-ring)",
            ["stroke-width"]: "2",
            ["shape-rendering"]: "auto"
        });
        this.sbSelector.appendChild(vsCircle);
        vsCircle.appendChild(vsCircle.pieces.b);
        vsCircle.appendChild(vsCircle.pieces.w);
        
        assign(pickerTriangle,{
            id: `${this.container.id}Triangle`,
            points: hueTriangle.tPoints,
        });
        this.svDefs.appendChild(pickerTriangle);
    }

    #assignHTMLelements() {
        this.html = document.getElementsByTagName("html")[0];
        this.hueWheel = this.container.querySelector(".hueWheel");
        this.hueWheel.diameter = this.hueWheel.clientHeight;
        this.hueWheel.radius = this.hueWheel.diameter/2;
        this.hueWheel.box = this.hueWheel.getBoundingClientRect();
        this.hueWheel.center =  {
            x: this.hueWheel.box.x+(this.hueWheel.box.width/2),
            y: this.hueWheel.box.y+(this.hueWheel.box.height/2)
        }

        this.hueSelector = this.hueWheel.querySelector(".hueSelector");
        this.wheelCenter = this.hueWheel.querySelector(".wheelCenter");
        this.wheelCenter.diameter = this.wheelCenter.clientHeight;
        
        this.svPicker = this.wheelCenter.querySelector(".SVpicker");
        this.svDefs = this.svPicker.getElementsByTagName("defs")[0];
        this.hueTriangle = this.svPicker.querySelector(".hueTriangle");
    
        this.valueTriangle = this.svPicker.querySelector(".valueTriangle");
        this.sbSelector = this.svPicker.querySelector(".satBrightSelector");

        this.colorFormat = this.container.querySelector(".colorFormat");
        this.RGBvalues = this.container.querySelector(".RGBvalues");
        this.HEXvalues = this.container.querySelector(".HEXvalues");
        this.RGBinputElements = [...this.container.querySelectorAll(".rgbVals input")];
        this.RGBinputs = {
            r: this.RGBinputElements[0],
            g: this.RGBinputElements[1],
            b: this.RGBinputElements[2]
        }
        this.HEXinput = this.container.querySelector(".hexVals input");
        this.rgbError = this.container.querySelector(".rgbError");
        this.hexError = this.container.querySelector(".hexError");
    }

    #htmlTemplate() {
        return `<div class="hueWheel">
            <div class="wheelCenter">
                <svg class="SVpicker" shape-rendering="crispEdges">
                    <defs>
                        <linearGradient id="${this.container.id}valueGradient" gradientTransform="rotate(90)">
                            <stop offset="10%" stop-color="white" stop-opacity="1" />
                            <stop offset="85%" stop-color="black" stop-opacity="1" />
                        </linearGradient>
                        <linearGradient id="${this.container.id}maskGradient">
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
                        <mask id="${this.container.id}valueMask">
                            <use href="#${this.container.id}Triangle" fill="url(#${this.container.id}maskGradient)" />
                        </mask>
                    </defs>
                    <use class="hueTriangle" href="#${this.container.id}Triangle" fill="rgb(255,0,0)" x="0" y="0"/>
                    <use class="valueTriangle" href="#${this.container.id}Triangle" fill="url(#${this.container.id}valueGradient)" mask="url(#${this.container.id}valueMask)" x="0" y="0"/>
                    <svg class="satBrightSelector"></svg>
                </svg>
            </div>
            <svg class="hueSelector"></svg>
        </div>
        <div class="colorValues">
            <select name="format" class="colorFormat">
                <option value="RGB">RGB</option>
                <option value="HEX">HEX</option>
            </select>
            <div ="valueEntry">
                <div class="RGBvalues">
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
                <div class="HEXvalues hide">
                    <div class="hexVals">
                        <label for="hextext">#</label>
                        <input type="text" name="hextext" id="hextext" maxlength="7">
                    </div>
                </div>
            </div>
                
            <div class="hide entryError" class="rgbError">
                <p>Please enter a number between <span>0</span> and <span>255</span>.</p>
            </div>
            <div class="hide entryError" class="hexError">
                <p>Please enter a valid hex string.</p>
            </div>
        </div>`;
    }
}