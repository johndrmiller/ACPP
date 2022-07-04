const nsp = "http://www.w3.org/2000/svg";
const body = document.querySelector("body");

let svg = document.createElementNS(nsp,"svg");
// svg.setAttribute("xmlns", nsp);
// svg.setAttribute("width", "400");
// svg.setAttribute("height", "400");
// svg.setAttribute("viewbox", "0 0 400 400");
assign(svg,{
    xmlns:nsp,
    width:"400",
    height: "400",
    viewbox: "0 0 400 400"
});

let defs = document.createElementNS(nsp,"defs");

let circleMask = document.createElementNS(nsp,"mask");
assign(circleMask,{
    id:"myMask"
})

let rect = document.createElementNS(nsp,"rect");
assign(rect, {
    width: "400",
    height: "400",
    x: 0,
    y: 0,
    fill: "#445544"
})

let circle = document.createElementNS(nsp,"circle");
assign(circle,{
   cx: rect.getAttribute("width")/2,
   cy: rect.getAttribute("height")/2,
   r: "180",
   fill: "#eeeeee"
});

let maskRect = document.createElementNS(nsp,"rect");
assign(maskRect, {
    width:"400",
    height:"400",
    x:0,
    y:0,
    fill: "white"
});

let innerCircle = document.createElementNS(nsp,"circle");
assign(innerCircle, {
    cx: rect.getAttribute("width")/2,
    cy: rect.getAttribute("height")/2,
    r: "150",
    fill: "#000000"
});

let group = document.createElementNS(nsp,"g");
assign(group,{
    mask:"url(#myMask)"
})

let path = document.createElementNS(nsp,"path");
assign(path, {
    d: `M ${rect.getAttribute("width")/2} ${rect.getAttribute("height")/2} l 0 -180z`,
    stroke: "green"
})

body.appendChild(svg);
svg.appendChild(defs);
svg.appendChild(rect);
svg.appendChild(circle);
svg.appendChild(group);
group.appendChild(path);
defs.appendChild(circleMask);
circleMask.appendChild(maskRect);
circleMask.appendChild(innerCircle);


function assign(ele, obj) {
    let keys = Object.keys(obj);
    keys.forEach(x => {
        ele.setAttribute(x,obj[x])
    })
    console.log(keys);
}

console.log(svg.getAttribute("height"));