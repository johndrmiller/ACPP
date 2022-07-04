export function Axes(x, y, width, height, canvas, ctx, color="black") {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.color = color;
    this.graphic = new Path2D();

    let graphic = this.graphic;

    graphic.moveTo(this.x, this.y);
    graphic.lineTo(this.x, this.y+this.height);
    graphic.lineTo(this.x+this.width,this.y+this.height);
    ctx.strokeStyle = color;
    ctx.stroke(graphic);
}

export function Circle(x,y,r=1, ctx, c="red"){
    this.x = x;
    this.y = y;
    this.r = r;
    this.c = c;
    this.graphic = new Path2D();

    let graphic = this.graphic;
    
    graphic.moveTo(this.x, this.y);
    graphic.arc(this.x,this.y,this.r,0,Math.PI*2,true);
    ctx.fillStyle = this.c;
    ctx.fill(graphic);
}

