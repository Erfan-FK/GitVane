/**
 * One-off dev script: trace public/white-icon.png into an accurate SVG path
 * suitable for use in the Logo component. The script writes the result to
 * public/logo-trace.svg for inspection; the path data is then embedded into
 * src/components/brand/logo.tsx.
 *
 * Run: node scripts/trace-logo.cjs
 */
const fs = require("fs");
const path = require("path");
const potrace = require("potrace");

const INPUT = path.join(__dirname, "..", "public", "white-icon.png");
const OUTPUT = path.join(__dirname, "..", "public", "logo-trace.svg");

potrace.trace(
  INPUT,
  {
    background: "transparent",
    color: "currentColor",
    threshold: 180,
    blackOnWhite: false, // trace the WHITE foreground on a DARK background
    turdSize: 80,        // suppress tiny artifacts/noise
    alphaMax: 1.0,       // smoother corners
    optTolerance: 0.2,   // accuracy vs. simplicity of curves
    turnPolicy: "minority",
  },
  (err, svg) => {
    if (err) {
      console.error("trace failed:", err);
      process.exit(1);
    }
    fs.writeFileSync(OUTPUT, svg);
    console.log(`wrote ${OUTPUT} (${svg.length} bytes)`);
  },
);
