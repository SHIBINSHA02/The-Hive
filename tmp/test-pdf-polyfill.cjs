
// Mocking browser globals that pdf-parse v2.4.5 depends on
if (typeof global.DOMMatrix === "undefined") {
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
  };
}
if (typeof global.ImageData === "undefined") {
  global.ImageData = class ImageData {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  };
}
if (typeof global.Path2D === "undefined") {
  global.Path2D = class Path2D {};
}

try {
  console.log("Testing require('pdf-parse') with polyfills...");
  const pdf = require("pdf-parse");
  console.log("Success! require('pdf-parse') loaded.");
  
  // Test if it actually works
  // (We need a dummy PDF buffer to really test it, but loading is the first hurdle)
} catch (e) {
  console.error("Failed even with polyfills:", e);
}
