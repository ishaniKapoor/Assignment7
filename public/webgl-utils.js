const webglUtils = {
  hexToRgb: (hex) => {
    let parseRgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let rgb = {
      red: parseInt(parseRgb[1], 16),
      green: parseInt(parseRgb[2], 16),
      blue: parseInt(parseRgb[3], 16)
    }
    rgb.red /= 256
    rgb.green /= 256
    rgb.blue /= 256
    return rgb
  },
  componentToHex: (c) => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
    },
    radToDeg: (radians) => radians * 180 / Math.PI,

    degToRad: (degrees) => degrees * Math.PI / 180,
  rgbToHex: (rgb) => {
    const redHex = webglUtils.componentToHex(rgb.red * 256)
    const greenHex = webglUtils.componentToHex(rgb.green * 256)
    const blueHex = webglUtils.componentToHex(rgb.blue * 256)
    return `#${redHex}${greenHex}${blueHex}`
  },
  createProgramFromScripts: (gl, vertexShaderElementId, fragmentShaderElementId) => {
    // Get the strings for our GLSL shaders
    const vertexShaderElement = document.querySelector(vertexShaderElementId)
    const fragmentShaderElement = document.querySelector(fragmentShaderElementId)


    const vertexShaderSource   = vertexShaderElement.text;
    const fragmentShaderSource = fragmentShaderElement.text;

    // Create GLSL shaders, upload the GLSL source, compile the shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Link the two shaders into a program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program
  },
  updateCameraAngle: (event) => {
    cameraAngleRadians = m4.degToRad(event.target.value);
    render();
  },
  updateLookUp: (event) => {
    lookAt = event.target.checked
    render();
  },
  updateFieldOfView: (event) => {
    fieldOfViewRadians = m4.degToRad(event.target.value);
    render();
  },
  updateTranslation: (event, axis) => {
    shapes[selectedShapeIndex].translation[axis] = event.target.value
    render()
  },
  updateRotation: (event, axis) => {
    shapes[selectedShapeIndex].rotation[axis] = event.target.value
    render();
  },
  updateScale: (event, axis) => {
    shapes[selectedShapeIndex].scale[axis] = event.target.value
    render()
  },
  updateColor: (event) => {
    const hex = event.target.value
    const rgb = webglUtils.hexToRgb(hex)
    shapes[selectedShapeIndex].color = rgb
    render()
  },
  updateCameraTranslation: (event, axis) => {
    camera.translation[axis] = event.target.value
    render()
  },
  updateCameraRotation: (event, axis) => {
    camera.rotation[axis] = event.target.value
    render();
  },
  updateLookAtTranslation: (event, index) => {
    target[index] = event.target.value
    render();
   },
   toggleLookAt: (event) => {
        lookAt = event.target.checked
        render()
   },
   
  addShape: (newShape, type) => {
    const colorHex = document.getElementById("color").value
    const colorRgb = webglUtils.hexToRgb(colorHex)
    let tx = 0
    let ty = 0
    let tz = 0
    let shape = {
      type: type,
      position: origin,
      dimensions: sizeOne,
      color: colorRgb,
      translation: {x: tx, y: ty, z: tz},
      rotation: {x: 0, y: 0, z: 0},
      scale: {x: 20, y: 20, z: 20}
    }
    if (newShape) {
      Object.assign(shape, newShape)
    }
    shapes.push(shape)
    render()
  },
  deleteShape: (shapeIndex) => {
    shapes.splice(shapeIndex, 1)
    if(shapes.length > 0) {
      webglUtils.selectShape(0)
      render()
    } else {
      selectedShapeIndex = -1
    }
  },
  selectShape: (selectedIndex) => {
    selectedShapeIndex = selectedIndex
    document.getElementById("tx").value = shapes[selectedIndex].translation.x
    document.getElementById("ty").value = shapes[selectedIndex].translation.y
    document.getElementById("tz").value = shapes[selectedIndex].translation.z
    document.getElementById("sx").value = shapes[selectedIndex].scale.x
    document.getElementById("sy").value = shapes[selectedIndex].scale.y
    document.getElementById("sz").value = shapes[selectedIndex].scale.z
    document.getElementById("rx").value = shapes[selectedIndex].rotation.x
    document.getElementById("ry").value = shapes[selectedIndex].rotation.y
      document.getElementById("rz").value = shapes[selectedIndex].rotation.z
      document.getElementById("fv").value = webglUtils.radToDeg(fieldOfViewRadians)
    const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
    document.getElementById("color").value = hexColor
  },
  doMouseDown: (event) => {
    const boundingRectangle = canvas.getBoundingClientRect();
    const x =  Math.round(event.clientX - boundingRectangle.left - boundingRectangle.width/2);
    const y = -Math.round(event.clientY - boundingRectangle.top  - boundingRectangle.height/2);
    const translation = {x, y, z: -150}
    const rotation = {x: 0, y: 0, z: 180}
    const shapeType = document.querySelector("input[name='shape']:checked").value
    const shape = {
      translation, rotation, type: shapeType
    }

    webglUtils.addShape(shape, shapeType)
    },
    updateLightDirection: (event, index) => {
        lightSource[index] = parseFloat(event.target.value)
        render()
    },

  renderCube: (cube) => {
    let geometry = [
      0,  0,  0,    0, 30, 0,    30,  0,  0,
      0, 30,  0,   30, 30, 0,    30,  0,  0,
      0,  0, 30,   30,  0, 30,    0, 30, 30,
      0, 30, 30,   30,  0, 30,   30, 30, 30,
      0, 30,  0,    0, 30, 30,   30, 30, 30,
      0, 30,  0,   30, 30, 30,   30, 30,  0,
      0,  0,  0,   30,  0,  0,   30,  0, 30,
      0,  0,  0,   30,  0, 30,    0,  0, 30,
      0,  0,  0,    0,  0, 30,    0, 30, 30,
      0,  0,  0,    0, 30, 30,    0, 30,  0,
      30,  0, 30,   30,  0,  0,   30, 30, 30,
      30, 30, 30,   30,  0,  0,   30, 30,  0,
    ]
      geometry = new Float32Array(geometry)
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
      gl.bufferData(gl.ARRAY_BUFFER, geometry, gl.STATIC_DRAW)

      var normals = new Float32Array([
          0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
          0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
          0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
          0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
          -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
          1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
      ]);
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

      gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);

  },
  renderRectangle: (rectangle) => {
    const x1 = rectangle.position.x
      - rectangle.dimensions.width / 2;
    const y1 = rectangle.position.y
      - rectangle.dimensions.height / 2;
    const x2 = rectangle.position.x
      + rectangle.dimensions.width / 2;
    const y2 = rectangle.position.y
      + rectangle.dimensions.height / 2;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1, 0,  x2, y1, 0,  x1, y2, 0,
      x1, y2, 0,  x2, y1, 0,  x2, y2, 0,
    ]), gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  },
  renderTriangle: (triangle) => {
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
      x1, y1, 0, x3, y3, 0, x2, y2, 0])

    gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  },
}
