gl-line-plot
============
A 3D line plot for WebGL

# Example

```javascript
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

#### `plot.pick(pickId)`

## Properties

#### `plot.bounds` 

Gives the bounds on the line plot in data coordinates.

#### `plot.clipBounds`

# Credits
(c) 2014 Mikola Lysenko. MIT License