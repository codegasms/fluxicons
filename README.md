# Fluxicon (Identicon For FLUX)

## Usage

```typescript
    import fluxicons from '@codegasms/fluxicons';

    const message = 'Hello World';
    const size = 512;

    // Method 1
    const fluxiconData: Buffer = fluxicons.fluxicon(message, size, 'data');
    const fluxiconBuffer: Buffer = fluxicons.fluxicon(fluxiconData);

    fs.writeFileSync('fluxicons_hello_world.png', fluxiconBuffer);

    // Method 2
    const fluxiconBuffer: Buffer = fluxicons.fluxicon(message, size, 'image');
    fs.writeFileSync('fluxicons_hello_world.png', fluxiconBuffer);
```

## What Is A Fluxicon?

```Fluxicons```, our Identicons, are simple “pixel” sprites that are generated using a hash (using ```@codegasms/sha256```) of (anything).

The algorithm walks through the hash and generates a tom loads of properties such as:

1. The shape defining the Fluxicon grid
2. Color of the Fluxicon
3. Type of the shapes
4. Rotation of the shapes
5. Inversion of the shapes

These shapes are then stitched together to ```create a buffer``` which defines the Fluxicon. Due to a variety in the properties, each generated Fluxicon is ensured to be ```unique```.

## Generating A Fluxicon

### Defining Shapes In The Grid

The ```Grid``` is indexed as follows:

```shell
   0  1  2  3  4
   5  6  7  8  9
  10 11 12 13 14
  15 16 17 18 19
  20 21 22 23 24
```

We need to create some shapes using combination of indices.

| Shape# | Indices                    | Shape Description                                     |
|--------|----------------------------|------------------------------------------------------|
| Shape 0      | (0, 4, 24, 20)             | ```Square Shape (4x4), Covers The Entire Grid```           |
| Shape 1      | (0, 4, 20)                 | ```Triangle Shape (3x3), Covers The Top-Left Corner```     |
| Shape 2      | (2, 24, 20)                | ```Equilateral Triangle Shape (3x3), Covers The Middle```  |
| Shape 3      | (0, 2, 20, 22)             | ```Z-Shape, Covers The Left Side```                        |
| Shape 4      | (2, 14, 22, 10)            | ```Diamond Shape, Covers The Middle```                      |
| Shape 5      | (0, 14, 24, 22)            | ```Kite Shape, Covers The Middle With Buldge On Right```    |
| Shape 6      | (2, 24, 22, 13, 11, 22, 20)| ```Serpienski Triangle Shape, Covers The Middle```          |
| Shape 7      | (0, 14, 22)                | ```Triangle Shape, Covers The Middle```                     |
| Shape 8      | (6, 8, 18, 16)             | ```Square Shape (2x2), Covers The Middle```                 |
| Shape 9      | (4, 20, 10, 12, 2)         | ```2 x Triangle Shape, Covers The Middle With Buldge On Left``` |
| Shape 10     | (0, 2, 12, 10)             | ```Square Shape (2x2), Covers The Top-Left Corner```        |
| Shape 11     | (10, 14, 22)               | ```Triangle Shape, Covers The Bottom With Buldge Towards Bottom``` |
| Shape 12     | (20, 12, 24)               | ```Triangle Shape, Covers The Bottom With Buldge Towards Top``` |
| Shape 13     | (10, 2, 12)                | ```Triangle Shape, Covers The Top-Left Corner With Buldge Towards Right``` |
| Shape 14     | (0, 2, 10)                 | ```Triangle Shape, Covers The Top-Left Corner With Buldge``` |

```javascript
var shape0 = new Array(0, 4, 24, 20);
...
var shape14 = new Array(0, 2, 10);

var middleShapeType = new Array(0, 4, 8, 15)   // shape0, shape4, shape8, Special shape (Inverse Middle Shape)
var shapeType = new Array(shape0, shape1, shape2, shape3, shape4, shape5, shape6, shape7, shape8, shape9, shape10, shape11, shape12, shape13, shape14, shape0);
```

### Defining Properties For The Grid

The entire ```Grid``` is divided into 3 parts:

1. Center Shape (Middle Shape)
2. Corner Shape (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
3. Side Shape (Top, Bottom, Left, Right)

We have to define the following set of properties for each of the Shapes:

1. Type (Taken from the ```shapeType``` array) : ```0-14```
2. Invert (Boolean, whether to invert the shape or not) : ```True/False```
3. Turn (Number, how many times to turn/rotate the shape) : ```0-3 represents 0, 90, 180, 270 degrees```

```javascript
    // genCode is SHA256 Hashed Value i.e.
    // var genCode = (hash.charCodeAt(0) << 24) | (hash.charCodeAt(1) << 16) | (hash.charCodeAt(2) << 8) | hash.charCodeAt(3); 

    genCode,
    size,

    middleType: middleShapeType[genCode & 3],
    middleInvert: ((genCode >> 2) & 1) != 0,

    cornerType: (genCode >> 3) & 15,
    cornerInvert: ((genCode >> 7) & 1) != 0,
    cornerTurn: (genCode >> 8) & 3,

    sideType: (genCode >> 10) & 15,
    sideInvert: ((genCode >> 14) & 1) != 0,
    sideTurn: (genCode >> 15) & 3,

    red: (genCode >> 27) & 31,
    green: (genCode >> 21) & 31,
    blue: (genCode >> 16) & 31,
```

### Generating The Fluxicon Shapes

To generate the shapes, we need to define the path and color of the shape in a canvas. In order to do this, we do the following steps:

1. Define the properties of the shape w.r.t. the canvas
    - ```shapeType``` is smashed within the defined array size
    - ```turn``` is smashed within the range ```0-3``` representing ```0, 90, 180, 270``` degrees
    - ```invert``` is set to ```True``` if the shape is ```15``` (Special Case)
    - ```vertices``` of the shapes are extracted from the ```shapeType``` array into ```points``` variable
    - ```shapeScale``` & ```shapeOffset``` is calculated based on the size of the shape
2. Fill the ```Background``` of the canvas with foreground or background color depending on the ```invert``` property
3. Build the path of the shape
    - Translate the canvas to the center of the shape
    - Rotate the canvas based on the ```turn``` property
    - Begin the path
    - Move the canvas to the first vertex of the shape
    - Loop through the vertices of the shape and draw the path
    - Close the path
4. Fill the shape with the foreground or background color depending on the ```invert``` property
5. Restore the context of the canvas

```javascript
function generateShape(context2d, xCoordinate, yCoordinate, size, shape, invert, turn, foregroundColor, backGroundColor) {
    shape = shape % shapeType.length;           // To make sure the shape is within the range of the shapeType array
    turn % 4;                            // To make sure the turn is 0, 90, 18 or 270 degrees
    invert = shape == 15 ? !invert : invert;    // Invert the shape if the shape is 15 (SPECIAL CASE)

    var points = shapeType[shape];
    var shapeScale = size / 4;
    var shapeOffset = size / 2;

    context2d.save();

    // Fill The Background
    context2d.fillStyle = invert ? foregroundColor : backGroundColor;
    context2d.fillRect(xCoordinate, yCoordinate, size, size);

    // Build The Shape Path
    context2d.translate(xCoordinate + shapeOffset, yCoordinate + shapeOffset);
    context2d.rotate(turn * (Math.PI / 2));

    context2d.beginPath();

    context2d.moveTo((points[0] % 5 * shapeScale - shapeOffset), (Math.floor(points[0] / 5) * shapeScale - shapeOffset));
    for (var i = 1; i < points.length; i++) {
        context2d.lineTo((points[i] % 5 * shapeScale - shapeOffset), (Math.floor(points[i] / 5) * shapeScale - shapeOffset));
    }

    context2d.closePath();

    // Fill The Shape
    context2d.fillStyle = invert ? backGroundColor : foregroundColor;
    context2d.fill();

    // Restore The Context
    context2d.restore();
}
```

### Generating The Fluxicon

Now that we have the ```Data``` and the ```Shapes``` defined, we can generate the Fluxicon iteratively by drawing each generated shape on the canvas. The iteration is as follows:

1. Draw The Middle Shape
2. Draw The Corner Shapes
    - Top Left
    - Top Right
    - Bottom Right
    - Bottom Left
3. Draw The Side Shapes
    - Top
    - Right
    - Bottom
    - Left

The colors are generated based on the ```RGB``` values of the ```Data``` and the ```Shapes``` are generated based on the properties of the ```Data```.

```javascript
function generateFluxicon(data) {
    var canvas = Canvas.createCanvas(data.size, data.size);
    var context2d = canvas.getContext('2d');

    var shapeDivision = data.size / 3;

    var middleType = data.middleType;
    ...
    var blue = data.blue;

    var foreGroundColor = 'rgb(' + (red << 3) + ',' + (green << 3) + ',' + (blue << 3) + ')';
    var backGroundColor = 'rgb(' + (255 - red) + ',' + (255 - green) + ',' + (255 - blue) + ')';

    // Draw The Middle Shape
    generateShape(context2d, shapeDivision, shapeDivision, shapeDivision, middleType, middleInvert, 0, foreGroundColor, backGroundColor);

    // Draw The Corner Shapes (Top Left, Top Right, Bottom Right, Bottom Left)
    generateShape(context2d, 0, 0, shapeDivision, cornerType, cornerInvert, cornerTurn++, foreGroundColor, backGroundColor);
    generateShape(context2d, shapeDivision * 2, 0, shapeDivision, cornerType, cornerInvert, cornerTurn++, foreGroundColor, backGroundColor);
    generateShape(context2d, shapeDivision * 2, shapeDivision * 2, shapeDivision, cornerType, cornerInvert, cornerTurn++, foreGroundColor, backGroundColor);
    generateShape(context2d, 0, shapeDivision * 2, shapeDivision, cornerType, cornerInvert, cornerTurn++, foreGroundColor, backGroundColor);

    // Draw The Side Shapes (Top, Right, Bottom, Left)
    generateShape(context2d, shapeDivision, 0, shapeDivision, sideType, sideInvert, sideTurn++, foreGroundColor, backGroundColor);
    generateShape(context2d, shapeDivision * 2, shapeDivision, shapeDivision, sideType, sideInvert, sideTurn++, foreGroundColor, backGroundColor);
    generateShape(context2d, shapeDivision, shapeDivision * 2, shapeDivision, sideType, sideInvert, sideTurn++, foreGroundColor, backGroundColor);
    generateShape(context2d, 0, shapeDivision, shapeDivision, sideType, sideInvert, sideTurn++, foreGroundColor, backGroundColor);

    return canvas.toBuffer();
}
```

> The generated Fluxicon is returned as a ```Buffer``` object, so that it can be converted into any desirable file format.
