/**
 * [codegasms-fluxicons]{@link https://github.com/codegasms/fluxicons.git}
 *
 * @author VoiD [void@codegasms.com]
 * @copyright codegams, 2024
 * @license MIT
 */

import hashString from "@codegasms/sha256";

import { CanvasRenderingContext2D, createCanvas } from "canvas";

/*
   0  1  2  3  4
   5  6  7  8  9
  10 11 12 13 14
  15 16 17 18 19
  20 21 22 23 24
 */
const shape0: number[] = [0, 4, 24, 20];
const shape1: number[] = [0, 4, 20];
const shape2: number[] = [2, 24, 20];
const shape3: number[] = [0, 2, 20, 22];
const shape4: number[] = [2, 14, 22, 10];
const shape5: number[] = [0, 14, 24, 22];
const shape6: number[] = [2, 24, 22, 13, 11, 22, 20];
const shape7: number[] = [0, 14, 22];
const shape8: number[] = [6, 8, 18, 16];
const shape9: number[] = [4, 20, 10, 12, 2];
const shape10: number[] = [0, 2, 12, 10];
const shape11: number[] = [10, 14, 22];
const shape12: number[] = [20, 12, 24];
const shape13: number[] = [10, 2, 12];
const shape14: number[] = [0, 2, 10];

const shapeType: number[][] = [
  shape0,
  shape1,
  shape2,
  shape3,
  shape4,
  shape5,
  shape6,
  shape7,
  shape8,
  shape9,
  shape10,
  shape11,
  shape12,
  shape13,
  shape14,
  shape0,
];

// shape0, shape4, shape8, Special shape (Inverse Middle Shape)
const middleShapeType: number[] = [0, 4, 8, 15];

interface FluxiconData {
  genCode: number;
  size: number;
  middleType: number;
  middleInvert: boolean;
  cornerType: number;
  cornerInvert: boolean;
  cornerTurn: number;
  sideType: number;
  sideInvert: boolean;
  sideTurn: number;

  red: number;
  green: number;
  blue: number;
}

function generateFluxiconData(string: string, size: number): FluxiconData {
  const hash: string = hashString(string, "binary");

  const genCode: number =
    (hash.charCodeAt(0) << 24) |
    (hash.charCodeAt(1) << 16) |
    (hash.charCodeAt(2) << 8) |
    hash.charCodeAt(3);

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

function generateShape(
  context2d: CanvasRenderingContext2D,
  xCoordinate: number,
  yCoordinate: number,
  size: number,
  shape: number,
  invert: boolean,
  turn: number,
  fColor: string,
  bColor: string
): void {
  shape = shape % shapeType.length; // To make sure the shape is within the range of the shapeType array
  turn = turn % 4; // To make sure the turn is 0, 90, 18 or 270 degrees
  invert = shape === 15 ? !invert : invert; // Invert the shape color if the shape is 15 (SPECIAL CASE)

  const points: number[] = shapeType[shape];
  const shapeScale: number = size / 4;
  const shapeOffset: number = size / 2;

  context2d.save();

  // Fill The Background
  context2d.fillStyle = invert ? fColor : bColor;
  context2d.fillRect(xCoordinate, yCoordinate, size, size);

  // Build The Shape Path
  context2d.translate(xCoordinate + shapeOffset, yCoordinate + shapeOffset);
  context2d.rotate((turn * Math.PI) / 2);

  context2d.beginPath();

  context2d.moveTo(
    (points[0] % 5) * shapeScale - shapeOffset,
    Math.floor(points[0] / 5) * shapeScale - shapeOffset
  );
  for (let i = 1; i < points.length; i++) {
    context2d.lineTo(
      (points[i] % 5) * shapeScale - shapeOffset,
      Math.floor(points[i] / 5) * shapeScale - shapeOffset
    );
  }

  context2d.closePath();

  // Fill The Shape
  context2d.fillStyle = invert ? bColor : fColor;
  context2d.fill();

  // Restore The Context
  context2d.restore();
}

function generateFluxicon(data: FluxiconData) {
  let canvas = createCanvas(data.size, data.size);
  let context2d: CanvasRenderingContext2D = canvas.getContext("2d");

  let shapeDivision: number = data.size / 3;

  let middleType: number = data.middleType;
  let middleInvert: boolean = data.middleInvert;
  let cornerType: number = data.cornerType;
  let cornerInvert: boolean = data.cornerInvert;
  let cornerTurn: number = data.cornerTurn;
  let sideType: number = data.sideType;
  let sideInvert: boolean = data.sideInvert;
  let sideTurn: number = data.sideTurn;

  let red: number = data.red;
  let green: number = data.green;
  let blue: number = data.blue;

  let foreGroundColor: string =
    "rgb(" + (red << 3) + "," + (green << 3) + "," + (blue << 3) + ")";
  let backGroundColor: string =
    "rgb(" + (255 - red) + "," + (255 - green) + "," + (255 - blue) + ")";

  // Draw Middle Shape
  generateShape(
    context2d,
    shapeDivision,
    shapeDivision,
    shapeDivision,
    middleType,
    middleInvert,
    0,
    foreGroundColor,
    backGroundColor
  );

  // Draw Side Shape (Top, Right, Bottom, Left)
  generateShape(
    context2d,
    shapeDivision,
    0,
    shapeDivision,
    sideType,
    sideInvert,
    sideTurn++,
    foreGroundColor,
    backGroundColor
  );
  generateShape(
    context2d,
    shapeDivision * 2,
    shapeDivision,
    shapeDivision,
    sideType,
    sideInvert,
    sideTurn++,
    foreGroundColor,
    backGroundColor
  );
  generateShape(
    context2d,
    shapeDivision,
    shapeDivision * 2,
    shapeDivision,
    sideType,
    sideInvert,
    sideTurn++,
    foreGroundColor,
    backGroundColor
  );
  generateShape(
    context2d,
    0,
    shapeDivision,
    shapeDivision,
    sideType,
    sideInvert,
    sideTurn++,
    foreGroundColor,
    backGroundColor
  );

  // Draw Corner Shape (Top Left, Top Right, Bottom Left, Bottom Right)
  generateShape(
    context2d,
    0,
    0,
    shapeDivision,
    cornerType,
    cornerInvert,
    cornerTurn++,
    foreGroundColor,
    backGroundColor
  );
  generateShape(
    context2d,
    shapeDivision * 2,
    0,
    shapeDivision,
    cornerType,
    cornerInvert,
    cornerTurn++,
    foreGroundColor,
    backGroundColor
  );
  generateShape(
    context2d,
    0,
    shapeDivision * 2,
    shapeDivision,
    cornerType,
    cornerInvert,
    cornerTurn++,
    foreGroundColor,
    backGroundColor
  );
  generateShape(
    context2d,
    shapeDivision * 2,
    shapeDivision * 2,
    shapeDivision,
    cornerType,
    cornerInvert,
    cornerTurn++,
    foreGroundColor,
    backGroundColor
  );

  return canvas.toBuffer();
}

export function fluxicon(
  str: string | { str: string; size: number },
  size: number,
  operation: string
): any {
  if (typeof str === "object") {
    return generateFluxicon(generateFluxiconData(str.str, str.size));
  }

  const data = generateFluxiconData(str, size);
  const buffer = generateFluxicon(data);

  if (operation == "data") {
    return data;
  } else if (operation == "image") {
    return buffer;
  } else {
    return null;
  }
}
