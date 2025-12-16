const svg = document.getElementsByTagName("svg")[0];
const pt = svg.createSVGPoint();

let canvas = document.getElementById('canvas');
let editor = new Editor(document, canvas);

let newProcessBtn = document.getElementById('new-process--btn');
newProcessBtn.addEventListener('click', () => editor.createRect());

function clicked(evt){
    pt.x = evt.clientX;
    pt.y = evt.clientY;

    // The cursor point, translated into svg coordinates
    var cursorpt =  pt.matrixTransform(svg.getScreenCTM().inverse());
    console.log("(" + cursorpt.x + ", " + cursorpt.y + ")");
}

canvas.addEventListener('click', () => clicked(event));
