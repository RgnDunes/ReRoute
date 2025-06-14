// This is a Node.js script to generate PNG icons from the SVG file
// To use this script, you need to install the following packages:
// npm install sharp

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const sizes = [16, 48, 128];
const svgPath = path.join(__dirname, "icons", "icon.svg");
const svgBuffer = fs.readFileSync(svgPath);

async function generateIcons() {
  console.log("Generating icons from SVG...");

  for (const size of sizes) {
    const outputPath = path.join(__dirname, "icons", `icon${size}.png`);

    await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);

    console.log(`Created icon${size}.png`);
  }

  console.log("All icons generated successfully!");
}

generateIcons().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
