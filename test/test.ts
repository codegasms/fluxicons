import { fluxicon } from "../fluxicon";
import * as fs from "fs";

interface StringData {
  str: string;
  size: number;
}

const strings: StringData[] = [
  { str: "codegasms", size: 64 },
  { str: "codegasms", size: 128 },
  { str: "codegasms", size: 256 },
  { str: "codegasms", size: 512 },
  { str: "codegasms", size: 1024 },
  { str: "flux", size: 64 },
  { str: "flux", size: 128 },
  { str: "flux", size: 256 },
  { str: "flux", size: 512 },
  { str: "flux", size: 1024 },
  { str: "fluxicons", size: 64 },
  { str: "fluxicons", size: 128 },
  { str: "fluxicons", size: 256 },
  { str: "fluxicons", size: 512 },
  { str: "fluxicons", size: 1024 },
];

const imagePath: string = "./images";
const dataPath: string = "./data";

strings.forEach(({ str, size }) => {
  const data: Buffer = fluxicon(str, size, "data");
  const buffer: Buffer = fluxicon(str, size, "image");
  const base64Buffer: string = buffer.toString("base64");

  //   fs.writeFileSync(`${dataPath}/fluxicons_data_${str}_${size}.txt`, data);
  fs.writeFileSync(`${dataPath}/fluxicons_${str}_${size}.txt`, base64Buffer);
  fs.writeFileSync(`${imagePath}/fluxicons_${str}_${size}.png`, buffer);
});
