// Debugging
var debug = '';
function log(txt, breakLine=true, update=true, log2Console=false) {
	debug = debug + txt;
	if(breakLine) {debug = debug + '<br>';};
	if(update && HTMLconsoleVisible) {document.getElementById('debug').innerHTML = debug;};
	if(log2Console) {console.log(txt);};
};

// General functions
function range (start, end) {
    if(end <= 0) {
        return [];
    };
    return [...Array(end).keys()];
};
function len(array) {
    return array.length;
};
function tutorialPopup () {
    window.alert(`
    || Welcome to Map Viwer -- Bem Vindo ao Visualizador de Mapas ||
    WASD to Move Camera -- WASD para Mover a Camera
    Mouse to Grab -- Mouse para Segurar
    Q and E to Zoom -- Q e E para Zoom
    B to Reset Camera -- B para Resetar a Camera
    H for Help Menu -- H para Menu de Ajuda
    0 for Fullscreen -- 0 para Tela Cheia
    `);
};

// Geometry and Math functions
function sort (array) {
    let originalLen = len(array);
    let sorted = array;
    let otherCount = 0;
    let count = 0;
    while(count < originalLen) {
        current = array[count];
        for(otherCount in array) {
            if(sorted[otherCount] >= current) {
                break;
            };
        };
        sorted.splice(count, 1);
        sorted.splice(otherCount, 0, current);
        count = parseInt(count) + 1;
    };
    return sorted;
};
function arrayAnd (arrA, arrB) {
    // Get Intersection
    let intersection = arrA.filter(x => arrB.includes(x));
    // Remove Repeats
    return [...new Set(intersection)];
};
function lerp (n, min=0, max=1) {
    return min*(1-n) + max*(n);
};
function invLerp (n, min=0, max=1) {
    return (n-min)/(max-min);
};
function average (array) {
    let toReturn = 0;
    for(let i in array) {
        toReturn = toReturn + parseInt(array[i]);
    };
    return toReturn/len(array);
};
function pointTowards (p1, p2) {
    // P1 is self, P2 is target.
    return Math.atan2( (p2[0] - p1[0]), (p2[1] - p1[1]) );
};
function distance (p1, p2) {
    // P1 is self, P2 is target.
    return Math.sqrt((p1[0] - p2[0])**2 + (p1[1]-p2[1])**2);
};
function angleFix (a) {
    // 180-180 to 360
    let toReturn = a%(Math.PI*2);
    if(toReturn < 0) {
        toReturn += (Math.PI*2);
    };
    return toReturn;
};
function angleMod (a) {
    return angleFix(pointTowards([0, 0], [Math.sin(a), Math.cos(a)]));
};
function angleStuff (a1, a2) {
    let toReturn = 0;
    let a360 = Math.PI*2;
    //let answers = [Math.abs((a1-a360)-a2), Math.abs(a1-(a2-a360))];
    if(Math.abs((a1-a360)-a2) < Math.abs(a1-a2)) {
        toReturn = (a1-a360)-a2;
    } else if(Math.abs(a1-(a2-a360)) < Math.abs(a1-a2)) {
        toReturn = a1 - (a2-a360);
    } else {
        toReturn = a1 - a2;
    };
    return toReturn;
};


// Console HTML DiV Element
var HTMLdivElement = `
		<div class="debug">
            eval(<input placeholder="insert code here..." id="cheatInput" onchange="eval(document.getElementById('cheatInput').value);document.getElementById('cheatInput').value='';"></input>);
			<pre id="debug"></pre>
		</div>
`;
var HTMLconsoleVisible = false;
// Screen Vars
var screen = document.getElementById('screen');
//screen.width = document.body.clientWidth;
//screen.height = document.body.clientHeight;
var screenWidth = screen.width;
var screenHeight = screen.height;
var screenX = screen.getBoundingClientRect().left;
var screenY = screen.getBoundingClientRect().top;
var ctx = screen.getContext("2d");
// FPS
var FPS_average = 0;
var FPS_sample = [];
// General Vars
var time = 0;
var lastTime = 0;
var frame = 0;
// Mouse vars
var oldMouseX = 0;
var oldMouseY = 0;
var mouseX = 0;
var mouseY = 0;
var mouseOffsetX = 0;
var mouseOffsetY = 0;
var mouseState = 0;
var mTransX = 0;
var mTransY = 0;
// Keyboard vars
var kbKeys = {};
var paused = 0;
// Selection
var actionType = 'none';
var selected = -1;
// Camera vars
var camX = 0;
var camY = 0;
var camZoom = 1;
var camVelX = 0;
var camVelY = 0;
var camVelZoom = 0;
// elements
var elements = [];
//  maps
var geoMaps = [];
// Settings
let mapCenter = [0, 0];
let mapScale = 275;
let fillAlpha = 1;
let lineWidth = 2.5;
// Constants
//


// Drawing/screen functions
function resizeCanvas () {
    let WHICH = 2;
    if(WHICH == 1) {
        screen.width = HTMLconsoleVisible?800:document.body.clientWidth;
        screen.height = HTMLconsoleVisible?450:document.body.clientHeight;
    } else if(WHICH == 2) {
        screen.width = HTMLconsoleVisible?800:document.documentElement.clientWidth - 4;
        screen.height = HTMLconsoleVisible?450:document.documentElement.clientHeight - 4;
    } else if(WHICH == 3) {
        screen.width = HTMLconsoleVisible?800:window.innerWidth;
        screen.height = HTMLconsoleVisible?450:window.innerHeight;
    };
    screenWidth = screen.width;
    screenHeight = screen.height;
    document.getElementById('debugdiv').innerHTML = HTMLconsoleVisible?HTMLdivElement:'';
};

function circle (x, y, radius, color=null) {
    ctx.beginPath();
    if(color != null) {
        ctx.fillStyle = color;
    };
    ctx.arc(x, y, radius, 0, Math.PI*2);
    ctx.fill();
};

function xyToCam (x, y) {
    return [(x-camX)*camZoom, (y-camY)*camZoom];
};

function xToCam (x) {
    return ((x-camX)*camZoom) + screenWidth/2;
};

function yToCam (y) {
    return ((y-camY)*camZoom) + screenHeight/2;
};

function camToX (x) {
    return (((x - screenWidth/2)/camZoom)+camX);
};

function camToY (y) {
    return (((y - screenHeight/2)/camZoom)+camY);
};

function clearScreen () {
    ctx.clearRect(0, 0, screen.width, screen.height);
    ctx.beginPath();
};

function report () {
};

// Misc Functions
function resetSelected () {
    // Reset Selection Vars
    actionType = 'none';
    selected = -1;
    // Reset Mouse Offset
    mouseOffsetX = 0;
    mouseOffsetY = 0;
};
function isKeyDown (k) {
    if(!(k in kbKeys)) {
        kbKeys[k] = 0;
    };
    return kbKeys[k];
};
function updateMouse (event) {
    screenX = screen.getBoundingClientRect().left;
    screenY = screen.getBoundingClientRect().top;
    mouseX = event.clientX - screenX;
    mouseY = event.clientY - screenY;
};
function findElement (label) {
    for(let countElement in elements) {
        if(elements[countElement].label == label) {
            return countElement;
        };
    };
};

// Main Loop Function
function main () {
    // Debug Clear
    debug = '';
    // If Selected Stack Doesn't Exist, Unselect
    //if(selected > len(objects)-1) {resetSelected();};
    // Mouse Position Translated into World Position
    mTransX = camToX(mouseX);
    mTransY = camToY(mouseY);
    // Panning
    if(actionType != 'pan') {
        oldMouseX = mTransX;
        oldMouseY = mTransY;
    };
    // Keyboard Cam Movement
    camVelX += (2/camZoom) * (isKeyDown('d') - isKeyDown('a'));
    camVelY += (2/camZoom) * (isKeyDown('s') - isKeyDown('w'));
    camVelZoom += (camZoom/200) * (isKeyDown('q') - isKeyDown('e'));
    // Add Zoom Velocty
    camZoom += camVelZoom;
    // Cap camZoom
    camZoom = Math.max(Math.min(camZoom, 50), 0.5);
    // Camera Panning
    camX = oldMouseX - ((mouseX - screenWidth/2)/camZoom);
    camY =  oldMouseY - ((mouseY - screenHeight/2)/camZoom);
    //  Add Camera Velocity
    camX += camVelX;
    camY += camVelY;
    // Apply Friction
    camVelZoom = camVelZoom/1.2;
    camVelX = camVelX/1.2;
    camVelY = camVelY/1.2;

    // Clear Screen
    toRender = [];
    clearScreen();

    // Dot at (0, 0)
    circle(xToCam(0), yToCam(0), 5*camZoom, 'grey');

    // Actions
    if(mouseState && actionType == 'none') {
        actionType = 'pan';
    } else if(!mouseState && actionType == 'pan') {
        actionType = 'none';
    } else if(!mouseState && actionType == 'wait') {
        actionType = 'none';
    };
    closestObjectToMouseId = -1;
    closestObjectToMouseDistance = -1;

    elements[findElement('tooltip')].txt = [];
    elements[findElement('tooltip')].width = 0;
    elements[findElement('tooltip')].height = 0;
    // Render Map Polygons
    for(let countMap in geoMaps) {
        geoMaps[countMap].renderBody();
    };
    // Render Map Center
    for(let countMap in geoMaps) {
        geoMaps[countMap].renderCenter();
    };

    // Outline for Grabbing Background
    if(actionType == 'pan') {
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.arc(mouseX, mouseY, 10, 0, Math.PI*2);
        ctx.stroke();
    };

    // Get FPS
    time = parseInt(performance.now());
    FPS_sample.push(time - lastTime);
    if(len(FPS_sample)>29) {
        FPS_average = 1/(average(FPS_sample)/1000);
        FPS_sample = [];
    };
    lastTime = parseInt(performance.now());

    // Physical Text
    ctx.fillStyle = 'black';
    ctx.font = (24*camZoom)+'px "Lucida Console", "Courier New", monospace';
    ctx.textAlign = 'left';

    // Update Tooltip
    elements[findElement('tooltip')].hide = len(elements[findElement('tooltip')].txt)>0?false:true;
    elements[findElement('tooltip')].x = mouseX + elements[findElement('tooltip')].width/2;
    elements[findElement('tooltip')].y = mouseY - elements[findElement('tooltip')].height/2;

    // GUI Text
    ctx.fillStyle = 'black';
    ctx.font = '24px "Lucida Console", "Courier New", monospace';
    // Paused
    ctx.textAlign = 'center';
    ctx.font = '48px "Lucida Console", "Courier New", monospace';
    ctx.fillText(paused?'PAUSED':'', screenWidth/2, screenHeight/2);
  
    // Update Text from GUI Element "info"
    elements[findElement('info')].x = elements[findElement('info')].width/2;
    elements[findElement('info')].y = elements[findElement('info')].height/2;
    elements[findElement('info')].txt[1] = actionType;
    elements[findElement('info')].txt[2] = Math.round(FPS_average);
    
    // Show Sliders on Pause, Hide Otherwise
    elements[findElement('info')].height = paused?285:105;
    elements[findElement('mapScale')].hide = !paused;
    elements[findElement('fillAlpha')].hide = !paused;
    elements[findElement('lineWidth')].hide = !paused;

    // Setting Sliders
    mapScale = elements[findElement('mapScale')].getSlideValue();
    fillAlpha = elements[findElement('fillAlpha')].getSlideValue()/100;
    lineWidth = Math.max(elements[findElement('lineWidth')].getSlideValue(),1)/10;

    // Process GUI Elements
    for(let countElement in elements) {
        elements[countElement].tick();
    };
    
    // Cursor
    if(selected == -1) {circle(mouseX, mouseY, 5, 'black');};

    frame += 1;
    frame = frame * (frame < 9999);

    screenWidth = screen.width;
    screenHeight = screen.height;

    report();
};

// User Input
window.addEventListener('click', (event) => {
});

window.addEventListener('contextmenu', (event) => {
});

window.addEventListener('keypress', (event) => {
});

window.onresize = () => {
    resizeCanvas();
};

window.addEventListener('keydown', (event) => {
    if(event.code == 'Space' && !isKeyDown('Space')) {
        paused = !paused;
    };
    if(event.key == 'b' && !isKeyDown('b')) {
        camX = 0; camY = 0; camZoom = 1;
    };
    if(event.key == 'h' && !isKeyDown('h')) {
        tutorialPopup();
    };
    if(event.key == 'p' && !isKeyDown('p')) {
        noSweepNPrune = !noSweepNPrune;
    };
    if(event.key == '0' && !isKeyDown('0')) {
        HTMLconsoleVisible = !HTMLconsoleVisible;
        resizeCanvas();
    };
    // Update kbKeys
    if(event.code == 'Space') {
        kbKeys['space'] = 1;
    };
    kbKeys[event.key] = 1;
});

window.addEventListener('keyup', (event) => {
    if(event.code == 'Space') {
        kbKeys['space'] = 0;
    };
    kbKeys[event.key] = 0;
});

window.addEventListener('wheel', (event) => {
    camVelZoom += (camZoom/2) * event.deltaY * -0.0002;

    updateMouse(event);
});

onmousemove = function (event) {
    updateMouse(event);
};

onmousedown = function (event) {
    mouseState = 1;
    // Iterate over Elements in Reverse Order
    for(let countElement in elements) {
        currentElement = elements[len(elements)-countElement-1];
        if(currentElement.isMouseOver() && currentElement.clickable && !currentElement.hide && actionType == 'none') {
            currentElement.clicked = 1;
            currentElement.onClick();
            actionType = 'wait';
        };
    };

    updateMouse(event);
};

onmouseup = function (event) {
    mouseState = 0;
    resetSelected();
    // Iterate over Elements
    for(let countElement in elements) {
        if(elements[countElement].isMouseOver() && elements[countElement].clicked && elements[countElement].clickable) {
            elements[countElement].clicked = 0;
            elements[countElement].onRelease();
        }
    };

    updateMouse(event);
};

// Pre-Loop
resizeCanvas();
HTMLconsoleVisible = !true;

// Geomap
geoMaps = [...generateMaps(rj_municip)];

// Tooltip Text Element
elements.push(new element('tooltip', 0, 0, 280, 145));
elements[len(elements)-1].color = 'rgb(200, 200, 200, 0.5)';
elements[len(elements)-1].align = 'topleft';
elements[len(elements)-1].txt = [];
elements[len(elements)-1].txtAlign = 'left';

// Info Button Element
elements.push(new button('info', 0, 0, 280, 145));
elements[len(elements)-1].color = 'rgb(200, 200, 200, 0.5)';
elements[len(elements)-1].align = 'topleft';
elements[len(elements)-1].txt = ['Click for Help Menu', 'Sweep&Prune', 'none', 0];
elements[len(elements)-1].txtAlign = 'left';
elements[len(elements)-1].onClick = function () {
    tutorialPopup();
};

// mapScale Slider Element
elements.push(new slider('mapScale', 250/2 + 15, 140, 250, 25));
elements[len(elements)-1].align = 'abovecenter';
elements[len(elements)-1].txt = ['Map Scale'];
elements[len(elements)-1].slideMin = 50;
elements[len(elements)-1].slideMax = 500;
elements[len(elements)-1].slidePos = invLerp(275, elements[len(elements)-1].slideMin, elements[len(elements)-1].slideMax);
elements[len(elements)-1].setSnapInterval(50);

// fillAlpha Slider Element
elements.push(new slider('fillAlpha', 250/2 + 15, 200, 250, 25));
elements[len(elements)-1].align = 'abovecenter';
elements[len(elements)-1].txt = ['Fill Alpha'];
elements[len(elements)-1].slideMin = 0;
elements[len(elements)-1].slideMax = 100;
elements[len(elements)-1].slidePos = invLerp(100, elements[len(elements)-1].slideMin, elements[len(elements)-1].slideMax);
elements[len(elements)-1].setSnapInterval(10);

// lineWidth Slider Element
elements.push(new slider('lineWidth', 250/2 + 15, 260, 250, 25));
elements[len(elements)-1].align = 'abovecenter';
elements[len(elements)-1].txt = ['Line Width'];
elements[len(elements)-1].slideMin = 0;
elements[len(elements)-1].slideMax = 100;
elements[len(elements)-1].slidePos = invLerp(25, elements[len(elements)-1].slideMin, elements[len(elements)-1].slideMax);
elements[len(elements)-1].setSnapInterval(10);

// Tutorial
tutorialPopup();

// Loop
setInterval(main, 0);

/*
TO-DO LIST
    -Implement Polygon-Point Collision Detection for Tooltip/Hint
*/