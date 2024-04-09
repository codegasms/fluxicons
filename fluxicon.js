/**
 * [codegasms-fluxicons]{@link https://github.com/codegasms/fluxicons.git}
 * 
 * @author VoiD [void@codegasms.com]
 * @copyright codegams, 2024
 * @license MIT
 */

const hashString = require('@codegasms/sha256');

var Canvas = require('canvas');

/*
   0  1  2  3  4
   5  6  7  8  9
  10 11 12 13 14
  15 16 17 18 19
  20 21 22 23 24
 */
var shape0 = new Array(0, 4, 24, 20);
var shape1 = new Array(0, 4, 20);
var shape2 = new Array(2, 24, 20);
var shape3 = new Array(0, 2, 20, 22);
var shape4 = new Array(2, 14, 22, 10);
var shape5 = new Array(0, 14, 24, 22);
var shape6 = new Array(2, 24, 22, 13, 11, 22, 20);
var shape7 = new Array(0, 14, 22);
var shape8 = new Array(6, 8, 18, 16);
var shape9 = new Array(4, 20, 10, 12, 2);
var shape10 = new Array(0, 2, 12, 10);
var shape11 = new Array(10, 14, 22);
var shape12 = new Array(20, 12, 24);
var shape13 = new Array(10, 2, 12);
var shape14 = new Array(0, 2, 10);

var shapeType = new Array(shape0, shape1, shape2, shape3, shape4, shape5, shape6, shape7, shape8, shape9, shape10, shape11, shape12, shape13, shape14, shape0);
var middleShapeType = new Array(0, 4, 8, 15)   // shape0, shape4, shape8, Special shape (Inverse Middle Shape)

function generateFluxiconData(string, size) {
    var hash = hashString(string, 'binary');

    var genCode = (hash.charCodeAt(0) << 24) | (hash.charCodeAt(1) << 16) | (hash.charCodeAt(2) << 8) | hash.charCodeAt(3);

    return {
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
    };
}

function generateShape(context2d, xCoordinate, yCoordinate, size, shape, invert, turn, fColor, bColor) {
    shape = shape % shapeType.length;           // To make sure the shape is within the range of the shapeType array
    turn = turn % 4;                            // To make sure the turn is 0, 90, 18 or 270 degrees
    invert = (shape === 15) ? !invert : invert; // Invert the shape color if the shape is 15 (SPECIAL CASE)

    var points = shapeType[shape];
    var shapeScale = size / 4;
    var shapeOffset = size / 2;

    context2d.save();

    // Fill The Background
    context2d.fillStyle = invert ? fColor : bColor;
    context2d.fillRect(xCoordinate, yCoordinate, size, size);

    // Build The Shape Path
    context2d.translate(xCoordinate + shapeOffset, yCoordinate + shapeOffset);
    context2d.rotate(turn * Math.PI / 2);

    context2d.beginPath();

    context2d.moveTo((points[0] % 5 * shapeScale - shapeOffset), (Math.floor(points[0] / 5) * shapeScale - shapeOffset));
    for (var i = 1; i < points.length; i++) {
        context2d.lineTo((points[i] % 5 * shapeScale - shapeOffset), (Math.floor(points[i] / 5) * shapeScale - shapeOffset));
    }

    context2d.closePath();

    // Fill The Shape
    context2d.fillStyle = invert ? bColor : fColor;
    context2d.fill();

    // Restore The Context
    context2d.restore();
}

function generateFluxicon(data) {
    var canvas = Canvas.createCanvas(data.size, data.size);
    var context2d = canvas.getContext('2d');

    var shapeDivision = data.size / 3;

    var middleType = data.middleType;
    var middleInvert = data.middleInvert;
    var cornerType = data.cornerType;
    var cornerInvert = data.cornerInvert;
    var cornerTurn = data.cornerTurn;
    var sideType = data.sideType;
    var sideInvert = data.sideInvert;
    var sideTurn = data.sideTurn;

    var red = data.red;
    var green = data.green;
    var blue = data.blue;

    var foreGroundColor = 'rgb(' + (red << 3) + ',' + (green << 3) + ',' + (blue << 3) + ')';
    var backGroundColor = 'rgb(' + (255 - red) + ',' + (255 - green) + ',' + (255 - blue) + ')';

    // Draw Middle Shape
    generateShape(context2d = context2d, xCoordinate = shapeDivision, yCoordinate = shapeDivision, size = shapeDivision, shape = middleType, invert = middleInvert, 0, fColor = foreGroundColor, bColor = backGroundColor);

    // Draw Side Shape (Top, Right, Bottom, Left)
    generateShape(context2d = context2d, xCoordinate = shapeDivision, yCoordinate = 0, size = shapeDivision, shape = sideType, invert = sideInvert, sideTurn++, fColor = foreGroundColor, bColor = backGroundColor);
    generateShape(context2d = context2d, xCoordinate = shapeDivision * 2, yCoordinate = shapeDivision, size = shapeDivision, shape = sideType, invert = sideInvert, sideTurn++, fColor = foreGroundColor, bColor = backGroundColor);
    generateShape(context2d = context2d, xCoordinate = shapeDivision, yCoordinate = shapeDivision * 2, size = shapeDivision, shape = sideType, invert = sideInvert, sideTurn++, fColor = foreGroundColor, bColor = backGroundColor);
    generateShape(context2d = context2d, xCoordinate = 0, yCoordinate = shapeDivision, size = shapeDivision, shape = sideType, invert = sideInvert, sideTurn++, fColor = foreGroundColor, bColor = backGroundColor);

    // Draw Corner Shape (Top Left, Top Right, Bottom Left, Bottom Right)
    generateShape(context2d = context2d, xCoordinate = 0, yCoordinate = 0, size = shapeDivision, shape = cornerType, invert = cornerInvert, cornerTurn++, fColor = foreGroundColor, bColor = backGroundColor);
    generateShape(context2d = context2d, xCoordinate = shapeDivision * 2, yCoordinate = 0, size = shapeDivision, shape = cornerType, invert = cornerInvert, cornerTurn++, fColor = foreGroundColor, bColor = backGroundColor);
    generateShape(context2d = context2d, xCoordinate = 0, yCoordinate = shapeDivision * 2, size = shapeDivision, shape = cornerType, invert = cornerInvert, cornerTurn++, fColor = foreGroundColor, bColor = backGroundColor);
    generateShape(context2d = context2d, xCoordinate = shapeDivision * 2, yCoordinate = shapeDivision * 2, size = shapeDivision, shape = cornerType, invert = cornerInvert, cornerTurn++, fColor = foreGroundColor, bColor = backGroundColor);

    return canvas.toBuffer();
}

exports.fluxicon = function (str, size, operation) {
    var data = generateFluxiconData(str, size);
    var buffer = generateFluxicon(data);

    if (operation == 'data') {
        return data;
    }
    else if (operation == 'image') {
        return buffer;
    }
    else {
        return null;
    }
}