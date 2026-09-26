var gl;
var points = [];
var numSubdivisions = 3;
var bufferId;
var uColorLoc;

var currentColor = vec4(0.0, 0.5, 0.5, 1.0);

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL을 지원하지 않는 브라우저입니다.");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    uColorLoc = gl.getUniformLocation(program, "uColor");

    setupUIControls();
    updateCarpet();
};

function setupUIControls() {
    var slider = document.getElementById("subdiv-slider");
    var sliderVal = document.getElementById("subdiv-val");
    slider.oninput = function(event) {
        numSubdivisions = parseInt(event.target.value);
        sliderVal.textContent = numSubdivisions;
        updateCarpet();
    };

    var colorPicker = document.getElementById("color-picker");
    colorPicker.oninput = function(event) {
        var hex = event.target.value;
        var r = parseInt(hex.substr(1, 2), 16) / 255.0;
        var g = parseInt(hex.substr(3, 2), 16) / 255.0;
        var b = parseInt(hex.substr(5, 2), 16) / 255.0;
        currentColor = vec4(r, g, b, 1.0);
        render();
    };
}

function square(pMin, pMax) {
    var x1 = pMin[0], y1 = pMin[1];
    var x2 = pMax[0], y2 = pMax[1];

    var v0 = vec2(x1, y1);
    var v1 = vec2(x1, y2);
    var v2 = vec2(x2, y2);
    var v3 = vec2(x2, y1);

    points.push(v0, v1, v2);
    points.push(v0, v2, v3);
}

function divideSquare(pMin, pMax, count) {
    if (count === 0) {
        square(pMin, pMax);
        return;
    }

    var dx = (pMax[0] - pMin[0]) / 3.0;
    var dy = (pMax[1] - pMin[1]) / 3.0;

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (i === 1 && j === 1) {
                continue;
            }

            var subMin = vec2(pMin[0] + i * dx, pMin[1] + j * dy);
            var subMax = vec2(pMin[0] + (i + 1) * dx, pMin[1] + (j + 1) * dy);

            divideSquare(subMin, subMax, count - 1);
        }
    }
}

function updateCarpet() {
    points = [];

    var minCorner = vec2(-0.9, -0.9);
    var maxCorner = vec2(0.9, 0.9);

    divideSquare(minCorner, maxCorner, numSubdivisions);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform4fv(uColorLoc, currentColor);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}