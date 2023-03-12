
// const nsp = "http://www.w3.org/2000/svg";
// export const hueCircle = document.createElementNS(nsp,"svg");
// export const vsCircle = document.createElementNS(nsp,"svg");
// export const pickerTriangle = document.createElementNS(nsp,"polygon");

// hueCircle.initial = {
//     x: hueSelector.diameter/2,
//     y: hueTrackDepth/2
// }
// hueCircle.pieces= {
//     b:  document.createElementNS(nsp,"circle"),
//     w: document.createElementNS(nsp, "circle")
// }

// vsCircle.pieces = {
//     b:  document.createElementNS(nsp,"circle"),
//     w: document.createElementNS(nsp, "circle")
// }

// assign(hueCircle,{
//     id:"hueCircle"
// })
// assign(hueCircle.pieces.b,{
//     cx: hueCircle.initial.x,
//     cy: hueCircle.initial.y,
//     r: huePath,
//     fill: "none",
//     stroke: "var(--outside-ring)",
//     ["stroke-width"]: "1"
// });
// assign(hueCircle.pieces.w,{
//     cx: hueCircle.initial.x,
//     cy: hueCircle.initial.y,
//     r: huePath-2,
//     fill: "rgba(255,255,255,0)",
//     stroke: "var(--inside-ring)",
//     ["stroke-width"]:"2"
// });

// assign(pickerTriangle,{
//     id: "pickerTriangle",
//     points: hueTriangle.tPoints,
// });

// assign(vsCircle.pieces.b,{
//     cx: hueTriangle.tPoints[2],
//     cy: hueTriangle.tPoints[3],
//     r:huePath,
//     fill: "none",
//     stroke: "var(--outside-ring)",
//     ["stroke-width"]: "1",
//     ["shape-rendering"]: "auto"
// });
// assign(vsCircle.pieces.w,{
//     cx: hueTriangle.tPoints[2],
//     cy: hueTriangle.tPoints[3],
//     r: huePath-2,
//     fill: "rgba(255,255,255,0)",
//     stroke: "var(--inside-ring)",
//     ["stroke-width"]: "2",
//     ["shape-rendering"]: "auto"
// });

// hueSelector.appendChild(hueCircle);
// hueCircle.appendChild(hueCircle.pieces.b);
// hueCircle.appendChild(hueCircle.pieces.w);

// svDefs.appendChild(pickerTriangle);

// sbSelector.appendChild(vsCircle);
// vsCircle.appendChild(vsCircle.pieces.b);
// vsCircle.appendChild(vsCircle.pieces.w);