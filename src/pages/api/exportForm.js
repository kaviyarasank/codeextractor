import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

export default async function handler(req, res) {
  const { formName } = req.query;

  // Sanitize the form name
  const sanitizedFormName = formName?.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!sanitizedFormName) {
    res.status(400).json({ error: "Invalid form name" });
    return;
  }

  const zip = new JSZip();

  try {
    console.log("Start ZIP creation");

    // Add a basic package.json
    zip.file(
      "package.json",
      JSON.stringify(
        {
          name: `exported-${sanitizedFormName}-app`,
          version: "1.0.0",
          private: true,
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
          },
          dependencies: {
            react: "^18.0.0",
            "react-dom": "^18.0.0",
            next: "13.0.0",
          },
        },
        null,
        2
      )
    );

    console.log("Added package.json");

    // Add a simple index.js file
    zip.file(
      "src/pages/index.js",
      `export default function Home() { return <div>Hello, ${sanitizedFormName}!</div>; }`
    );

    console.log("Added index.js");

    // Add a global CSS file
    const globalCssPath = path.join(process.cwd(), "styles", "globals.css");
    if (fs.existsSync(globalCssPath)) {
      const globalCssContent = fs.readFileSync(globalCssPath, "utf-8");
      zip.file("src/styles/globals.css", globalCssContent);
    } else {
      zip.file("src/styles/globals.css", "/* Default styles */");
    }

    console.log("Added globals.css");

    // Generate the ZIP content
    const zipContent = await zip.generateAsync({ type: "nodebuffer" });

    console.log("ZIP file generated");

    // Set headers and send the ZIP
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${sanitizedFormName}-app.zip`
    );
    res.send(zipContent);

    console.log("ZIP file sent");
  } catch (error) {
    console.error("Error generating ZIP:", error);
    res.status(500).json({ error: "Failed to export the app" });
  }
}
