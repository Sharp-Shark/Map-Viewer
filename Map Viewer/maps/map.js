// Geographic Map Class
class geoMap {
    constructor (name='0', label='default', vertices=[]) {
        this.name = name.split('"')[1];
        this.label = label.split('"')[1].replace(/�/gm, "#");
        this.vertices = vertices;
        this.centerX = 0;
        this.centerY = 0;
        this.findCenter();
    };
    findCenter() {
        this.centerX = 0;
        this.centerY = 0;
        for(let countVertice in this.vertices) {
            this.centerX += this.vertices[countVertice][0];
            this.centerY += this.vertices[countVertice][1];
        };
        this.centerX = this.centerX/len(this.vertices);
        this.centerY = this.centerY/len(this.vertices);
    };
    renderBody () {
        let origin = [mapCenter[0], mapCenter[1]];
        let polyStart = [];
        let mult = mapScale;

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = 'rgb(50, 75, 50, 1)';
        if(actionType=='none' && distance([(this.centerX-origin[0])*mult, (this.centerY-origin[1])*mult], [mTransX, mTransY])<=(5/camZoom)+5*(mapScale/275)) {
            elements[findElement('tooltip')].txt.push(this.label+' ('+this.name+')');
            ctx.font = '24px "Lucida Console", "Courier New", monospace';
            if(len(this.label+' ('+this.name+')')*14.6 > elements[findElement('tooltip')].width) {
                elements[findElement('tooltip')].width = len(this.label+' ('+this.name+')')*14.6;
            };
            elements[findElement('tooltip')].height = len(elements[findElement('tooltip')].txt)*24;
            ctx.fillStyle = 'rgb(135, 185, 35, '+fillAlpha+')';
        } else {
            ctx.fillStyle = 'rgb(100, 150, 0, '+fillAlpha+')'
        };

        // Draw Polygon
        for(let countVertice in this.vertices) {
            if(len(polyStart) == 0) {
                polyStart = [this.vertices[countVertice][0], this.vertices[countVertice][1]];
                ctx.beginPath();
                ctx.moveTo(xToCam((polyStart[0]-origin[0])*mult), yToCam((polyStart[1]-origin[1])*mult));
            } else if(this.vertices[countVertice][0] == polyStart[0] && this.vertices[countVertice][1] == polyStart[1]) {
                ctx.lineTo(xToCam((this.vertices[countVertice][0]-origin[0])*mult), yToCam((this.vertices[countVertice][1]-origin[1])*mult));
                ctx.fill();
                ctx.stroke();
                polyStart = [];
            } else {
                ctx.lineTo(xToCam((this.vertices[countVertice][0]-origin[0])*mult), yToCam((this.vertices[countVertice][1]-origin[1])*mult));
            };
        };

        ctx.lineJoin = 'miter';
        ctx.lineCap = 'butt';
    };
    renderCenter() {
        let origin = [mapCenter[0], mapCenter[1]];
        let mult = mapScale;

        circle(xToCam((this.centerX-origin[0])*mult), yToCam((this.centerY-origin[1])*mult), 5*camZoom*(mapScale/275), 'rgb(255, 255, 255, 0.4)');
    };
};

function generateMap (string) {
    // Generate a Map given a String
    string = string.split('\n');
    string[0] = string[0].split(',');

    let vertices = [];
    for(let countVertice = 1; countVertice <= string[0][2]; countVertice++) {
        vertices.push([parseFloat(string[countVertice].split(',')[0]), 0-parseFloat(string[countVertice].split(',')[1])]);
    };

    return new geoMap(string[0][0], string[0][1], vertices);
};

function generateMaps (string) {
    // Generate an Array of Maps given a String
    string = string.trim().split('\n');

    let maps = [];
    let build = '';
    for(countLine in string) {
        if((len(string[countLine].split(',')) == 3 && countLine != 0) || countLine >= len(string)-1) {
			if(countLine >= len(string)-1) {
				build = build + string[countLine] + '\n';
			};
            maps.push(generateMap(build));
            build = '';
            build = build + string[countLine] + '\n';
        } else {
            build = build + string[countLine] + '\n';
        };
    };

    // Find Middle of Map
    let total = [0, 0];
    for(countMap in maps) {
        total[0] += maps[countMap].vertices[0][0];
        total[1] += maps[countMap].vertices[0][1];
    };
    mapCenter = [total[0]/len(maps), total[1]/len(maps)];

    return maps;
};