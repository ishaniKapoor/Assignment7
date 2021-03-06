const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"
const CIRCLE = "CIRCLE"
const STAR = "STAR"
const RED_HEX = "#FF0000"
const RED_RGB = webglUtils.hexToRgb(RED_HEX)
const BLUE_HEX = "#0000FF"
const BLUE_RGB = webglUtils.hexToRgb(BLUE_HEX)
const origin = { x: 0, y: 0 }
const sizeOne = { width: 1, height: 1 }
let shapes = [
    {
        type: RECTANGLE,
        position: origin,
        dimensions: sizeOne,
        color: BLUE_RGB,
        translation: { x: 200, y: 100 },
        rotation: { z: 0 },
        scale: { x: 50, y: 50 }
    },
    {
        type: TRIANGLE,
        position: origin,
        dimensions: sizeOne,
        color: RED_RGB,
        translation: { x: 300, y: 100 },
        rotation: { z: 0 },
        scale: {x: 50, y: 50}
    }
]

let gl
let attributeCoords
let uniformMatrix
let uniformColor
let bufferCoords

const selectColor = (event) => {
    const hex = event.target.value;
    const rgb = webglUtils.hexToRgb(hex);
}

const doMouseDown = (event) => {
    const boundingRectangle = canvas.getBoundingClientRect();
    const x = event.clientX - boundingRectangle.left;
    const y = event.clientY - boundingRectangle.top;
    const translation = {x, y}
    const shape = document.querySelector("input[name='shape']:checked").value;
    addShape(translation, shape);
    
}

const init = () => {

    //const colorElement = document.getElementById("color");
    //colorElement.onchange = selectColor;
    // get a reference to the canvas and WebGL context
    const canvas = document.querySelector("#canvas");
    gl = canvas.getContext("webgl");

    //event handler for mouse
    canvas.addEventListener(
        "mousedown",
        doMouseDown,
        false);

    // create and use a GLSL program
    const program = webglUtils.createProgramFromScripts(gl,
        "#vertex-shader-2d", "#fragment-shader-2d");
    gl.useProgram(program);

    // get reference to GLSL attributes and uniforms
    attributeCoords = gl.getAttribLocation(program, "a_coords");
    uniformMatrix = gl.getUniformLocation(program, "u_matrix");
    uniformColor = gl.getUniformLocation(program, "u_color");

    // initialize coordinate attribute to send each vertex to GLSL program
    gl.enableVertexAttribArray(attributeCoords);

    // initialize coordinate buffer to send array of vertices to GPU
    bufferCoords = gl.createBuffer();

    // configure canvas resolution and clear the canvas
    //gl.uniform2f(uniformResolution, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    document.getElementById("tx").onchange = event => updateTranslation(event, "x");
    document.getElementById("ty").onchange = event => updateTranslation(event, "y");
    

    document.getElementById("sx").onchange = event => updateScale(event, "x");
    document.getElementById("sy").onchange = event => updateScale(event, "y");
    

    document.getElementById("rz").onchange = event => updateRotation(event, "z");

    document.getElementById("color").onchange = event => updateColor(event);

    selectShape(0)
}


let selectedShapeIndex = 0

const updateTranslation = (event, axis) => {
    const value = event.target.value;
    shapes[selectedShapeIndex].translation[axis] = value;
    render();
}

const updateScale = (event, axis) => {
    // TODO: update the shapes scale property
    const value = event.target.value;
    shapes[selectedShapeIndex].scale[axis] = value;
    render();
}

const updateRotation = (event, axis) => {
    const value = event.target.value;
    const angleInDegrees = (360 - value) * Math.PI / 180;
    shapes[selectedShapeIndex].rotation[axis] = angleInDegrees;
    render();
}

const updateColor = (event) => {
    // TODO: update the color of the shape.
    // Use webglUtils.hexToRgb to convert hex color to rgb
    const value = event.target.value;
    const rgb = webglUtils.hexToRgb(value);
    shapes[selectedShapeIndex].color = rgb;
    render();
}


const render = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER,
        bufferCoords);
    gl.vertexAttribPointer(
        attributeCoords,
        2,
        gl.FLOAT,
        false,
        0,

        0);

    const $shapeList = $("#object-list");
    $shapeList.empty();
    shapes.forEach((shape, index) => {
        const $li = $(`
     <li>
        <button onclick="deleteShape(${index})">
          Delete
        </button>
       <label>
        <input
         type="radio"
         id="${shape.type}-${index}"
         name="shape-index"
         ${index === selectedShapeIndex ? "checked" : ""}
         onclick="selectShape(${index})"
         value="${index}"/>
         ${shape.type};
         X: ${shape.translation.x};
         Y: ${shape.translation.y}
       </label>
     </li>
   `)
        $shapeList.append($li);
    })
    shapes.forEach((shape, index) => {
        gl.uniform4f(uniformColor,
            shape.color.red,
            shape.color.green,
            shape.color.blue, 1);

        let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
        matrix = m3.translate(matrix, shape.translation.x, shape.translation.y);
        matrix = m3.rotate(matrix, shape.rotation.z);
        matrix = m3.scale(matrix, shape.scale.x, shape.scale.y);

        // apply transformation matrix.
        gl.uniformMatrix3fv(uniformMatrix, false, matrix);

        if (shape.type === RECTANGLE) {
            renderRectangle(shape)
        } else if (shape.type === TRIANGLE) {
            renderTriangle(shape)
        } else if (shape.type === CIRCLE) {
            renderCircle(shape)
        } else if (shape.type === STAR) {
            renderStar(shape)
        }
    })
}


const deleteShape = (shapeIndex) => {
    shapes.splice(shapeIndex, 1)
    render()
}


const selectShape = (selectedIndex) => {
    selectedShapeIndex = selectedIndex
    document.getElementById("tx").value = shapes[selectedIndex].translation.x
    document.getElementById("ty").value = shapes[selectedIndex].translation.y
    document.getElementById("sx").value = shapes[selectedIndex].scale.x
    document.getElementById("sy").value = shapes[selectedIndex].scale.y
    document.getElementById("rz").value = shapes[selectedIndex].rotation.z
    const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
    document.getElementById("color").value = hexColor
}

let resForCircle = 16;
const angleForCircle = 360 / resForCircle;
const renderCircle = (circle) => {
    var vertices = [];
    for (j = 0; j <= 360; j += angleForCircle) {
        var xcoord1 = Math.sin(j * (Math.PI / 180))
        var ycoord1 = Math.cos(j * (Math.PI / 180))
        var xcoord2 = Math.sin((j + angleForCircle) * (Math.PI / 180))
        var ycoord2 = Math.cos((j + angleForCircle) * (Math.PI / 180))
        vertices.push(xcoord1, ycoord1, 0, 0, xcoord2, ycoord2);
    }
    const float32Array = new Float32Array(vertices)
    gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 3 * resForCircle);
}

const renderStar = (star) => {
    //first triangle
    const xcoord1 = star.position.x - star.dimensions.width / 2
    const ycoord1 = star.position.y + star.dimensions.height / 2
    const xcoord2 = star.position.x + star.dimensions.width / 2
    const ycoord2 = star.position.y + star.dimensions.height / 2
    const xcoord3 = star.position.x
    const ycoord3 = star.position.y - star.dimensions.height / 2
    //second triangle
    const xcoord4 = star.position.x - star.dimensions.width / 2
    const ycoord4 = star.position.y - star.dimensions.height / 2 + .25
    const xcoord5 = star.position.x + star.dimensions.width / 2
    const ycoord5 = star.position.y - star.dimensions.height / 2 + .25
    const xcoord6 = star.position.x
    const ycoord6 = star.position.y + star.dimensions.height / 2 + .25

    const float32Array = new Float32Array([xcoord1, ycoord1, xcoord2, ycoord2, xcoord3, ycoord3,
                                           xcoord4, ycoord4, xcoord5, ycoord5, xcoord6, ycoord6
                                         ])
    gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const renderTriangle = (triangle) => {
    const x1 = triangle.position.x
        - triangle.dimensions.width / 2
    const y1 = triangle.position.y
        + triangle.dimensions.height / 2
    const x2 = triangle.position.x
        + triangle.dimensions.width / 2
    const y2 = triangle.position.y
        + triangle.dimensions.height / 2
    const x3 = triangle.position.x
    const y3 = triangle.position.y
        - triangle.dimensions.height / 2

    const float32Array = new Float32Array([
        x1, y1, x2, y2, x3, y3
    ])

    gl.bufferData(gl.ARRAY_BUFFER,
        float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

const renderRectangle = (rectangle) => {
    const x1 = rectangle.position.x
        - rectangle.dimensions.width / 2;
    const y1 = rectangle.position.y
        - rectangle.dimensions.height / 2;
    const x2 = rectangle.position.x
        + rectangle.dimensions.width / 2;
    const y2 = rectangle.position.y
        + rectangle.dimensions.height / 2;

    const float32Array = new Float32Array([
        x1, y1, x2, y1, x1, y2,
        x1, y2, x2, y1, x2, y2,
    ])

    gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}


const addShape = (translation, type) => {
    const colorHex = document.getElementById("color").value
    const colorRgb = webglUtils.hexToRgb(colorHex)
    let tx = 0
    let ty = 0
    if (translation) {
        tx = translation.x
        ty = translation.y
    }
    const shape = {
        type: type,
        position: origin,
        dimensions: sizeOne,
        color: colorRgb,
        translation: { x: tx, y: ty, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 20, y: 20, z: 20 }
    }
    shapes.push(shape)
    render()
}


