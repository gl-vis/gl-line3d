gl-line-plot
============
A 3D line plot for WebGL

# Example

```javascript
var shell = require("gl-now")({ clearColor: [0,0,0,0] })
var camera = require("game-shell-orbit-camera")(shell)
var createSelect = require("gl-select")
var createAxes = require("gl-axes")
var createSpikes = require("gl-spikes")
var createLines = require("gl-lines")

var mat4 = require("gl-matrix").mat4

//State variables
var  axes, lines, select, spikes

var pickPoint = null

//Set up camera
camera.lookAt(
  [10, 0, 0], 
  [ 0, 0, 0], 
  [ 0, 1, 0])

shell.on("gl-init", function() {
  var gl = shell.gl

  //Create the line plot
  var polyline = []
  for(var i=0; i<100; ++i) {
    var theta = (i / 100.0) * Math.PI
    polyline.push([
        Math.cos(3*theta),
        Math.sin(3*theta),
        (i/50) - 1.0
      ])
  }
  lines = createLines(gl, {
    position: polyline,
    color: [1,0,0]
  })

  //Create axes object
  axes = createAxes(gl, {
    bounds: [[-1,-1,-1],[ 1, 1, 1]]
  })

  //Create selection buffer
  select = createSelect(gl, [shell.height, shell.width])

  //Create axes spikes
  spikes = createSpikes(gl, {bounds: [[-1,-1,-1], [1,1,1]]})
})

function drawPick(cameraParameters) {
  select.shape = [shell.height, shell.width]
  select.begin(shell.mouse[0], shell.mouse[1], 30)
  lines.drawPick(cameraParameters)
  var selected = select.end()
  pickPoint = lines.pick(selected)
}

shell.on("gl-render", function() {
  var gl = shell.gl
  gl.enable(gl.DEPTH_TEST)

  //Compute camera parameters
  var cameraParameters = {
    view: camera.view(),
    projection: mat4.perspective(
        mat4.create(),
        Math.PI/4.0,
        shell.width/shell.height,
        0.1,
        1000.0)
  }

  //Compute user selection
  drawPick(cameraParameters)

  //Draw the axes + lines
  axes.draw(cameraParameters)
  lines.draw(cameraParameters)

  //If a point is picked, draw it
  if(pickPoint) {
    spikes.position = pickPoint.position
    spikes.draw(cameraParameters)
  }
})
```

# Install

```
npm install gl-line-plot
```

# API

```javascript
var createLinePlot = require("gl-line-plot")
```

## Constructor

#### `var plot = createLinePlot(gl, options)`

## Methods

### Basic Drawing

#### `plot.draw(camera)`
Draws the line plot with the given camera parameters

* `camera` is an object with the model, view and projection matrices of the plot as properties.

#### `plot.update(options)`
Updates the plot

#### `plot.dispose()`

Destroys the plot and releases all associated resources

### Picking

#### `plot.drawPick(camera)`
Draws the line plot for picking purposes from the given camera

#### `plot.pick(selection)`
Returns selection information from the given user selection data.

* `selection` is the output from `gl-select`

**Returns** An object with the following properties:

* `arcLength` the arc length parameter of the selection
* `position` the position of the vertex at the selected point

## Properties

#### `plot.bounds` 

Gives the bounds on the line plot in data coordinates.

#### `plot.clipBounds`

Sets a clipping bound on the line plot

# Credits
(c) 2014 Mikola Lysenko. MIT License