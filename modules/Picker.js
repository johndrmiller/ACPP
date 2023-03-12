import {assign, RGBtoHSB, HSBtoRGB, lerp, lerpPoint, line} from "./globalFunctions.js";
import { ColorObject } from "./ColorObject.js";

export class Picker {
    constructor(container){
        const baseHTML = this.#htmlTemplate();
        this.container = container;
        this.container.insertAdjacentHTML("afterbegin",baseHTML);
        this.#assignHTMLelements();
        this.#createSVGelements();
        this.#listenerInit();
        this.currentColor = new ColorObject("RAD",0);


        

        //after updating the color in the picker, fire a 
        //custom event and listen for it from the index.js file
    }

    #listenerInit() {
        window.addEventListener('resize', this.responsiveRecalc.bind(this));
        this.hueCircle.addEventListener("pointerdown", this.hue_pointerdown_handler.bind(this));
        this.vsCircle.addEventListener("pointerdown", this.vs_pointerdown_handler.bind(this));
    };

    hue_pointerdown_handler(e){
        this.hueCircle.removeEventListener("pointerDown", this.hue_pointerdown_handler.bind(this));
        window.addEventListener("pointermove",this.hue_pointermove_handler.bind(this));
        window.addEventListener("pointerup", this.hue_pointerup_handler.bind(this));
        window.addEventListener("pointerleave", this.hue_pointerup_handler.bind(this));
        this.html.style.cursor = "grabbing";
        this.hueCircle.style.cursor = "inherit";
    }
    
    vs_pointerdown_handler(e) {
        this.vsCircle.removeEventListener("pointerDown", this.vs_pointerdown_handler.bind(this));
        window.addEventListener("pointermove",this.vs_pointermove_handler.bind(this));
        window.addEventListener("pointerup", this.vs_pointerup_handler.bind(this));
        window.addEventListener("pointerleave", this.vs_pointerup_handler.bind(this));
        this.html.style.cursor = "grabbing";
        this.vsCircle.style.cursor = "inherit";
    }

    hue_pointermove_handler(e) {
        window.removeEventListener("pointermove",this.hue_pointermove_handler.bind(this));
        let hueRad = this.calcRads(e);
        this.currentColor.newRAD(hueRad);
        this.moveHuePicker();
        //updateUIColors();
        window.addEventListener("pointermove",this.hue_pointermove_handler.bind(this));
    }
    
    vs_pointermove_handler(e) {
        window.removeEventListener("pointermove",this.vs_pointermove_handler.bind(this));
        //let point = newSVcoords(e);
        //moveSVmarker(point);
        //let newSV = SVvals(point.x, point.y);
        //mainColor.newHSB({h:mainColor.hsb.h,s:newSV.s, b:newSV.b});
        //updateUIColors();
        window.addEventListener("pointermove",this.vs_pointermove_handler.bind(this));
    }

    hue_pointerup_handler(e){
        window.removeEventListener("pointermove", this.hue_pointermove_handler.bind(this));
        window.removeEventListener("pointerup", this.hue_pointerup_handler.bind(this));
        window.removeEventListener("pointerleave", this.hue_pointerup_handler.bind(this));
        this.hueCircle.addEventListener("pointerdown", this.hue_pointerdown_handler.bind(this));
        this.html.style.cursor = "";
        this.hueCircle.style.cursor = "";
    }
    
    vs_pointerup_handler(e) {
        window.removeEventListener("pointermove", this.vs_pointermove_handler.bind(this));
        window.removeEventListener("pointerup", this.vs_pointerup_handler.bind(this));
        window.removeEventListener("pointerleave", this.vs_pointerup_handler.bind(this));
        this.vsCircle.addEventListener("pointerdown", this.vs_pointerdown_handler.bind(this));
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

    #createSVGelements() {
        let nsp = "http://www.w3.org/2000/svg";
        this.hueCircle = document.createElementNS(nsp,"svg");
        this.vsCircle = document.createElementNS(nsp,"svg");
        this.pickerTriangle = document.createElementNS(nsp,"polygon");

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

        this.hueCircle.initial = {
            x: this.hueSelector.diameter/2,
            y: this.huePath
        }
        this.hueCircle.pieces= {
            b: document.createElementNS(nsp,"circle"),
            w: document.createElementNS(nsp, "circle")
        }
        this.vsCircle.pieces = {
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
        assign(this.pickerTriangle,{
            id: "pickerTriangle",
            points: this.hueTriangle.tPoints,
        });
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
        
        this.hueSelector.appendChild(this.hueCircle);
        this.hueCircle.appendChild(this.hueCircle.pieces.b);
        this.hueCircle.appendChild(this.hueCircle.pieces.w);
        
        this.svDefs.appendChild(this.pickerTriangle);
        
        this.sbSelector.appendChild(this.vsCircle);
        this.vsCircle.appendChild(this.vsCircle.pieces.b);
        this.vsCircle.appendChild(this.vsCircle.pieces.w);
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
        </div>`;
    }

    responsiveRecalc(e) {
        const {hueWheel, svPicker} = this;
        hueWheel.box = hueWheel.getBoundingClientRect();
        hueWheel.center.x = hueWheel.box.x+(hueWheel.box.width/2);
        hueWheel.center.y = hueWheel.box.y+(hueWheel.box.height/2);
        svPicker.box = svPicker.getBoundingClientRect();
    }

}