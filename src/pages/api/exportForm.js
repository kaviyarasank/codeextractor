// pages/api/exportApp.js
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

export default async function handler(req, res) {
  const { formName } = req.query;

  // Sanitize form name input
  const sanitizedFormName = formName.replace(/[^a-zA-Z0-9_-]/g, "");

  // Initialize the ZIP file
  const zip = new JSZip();

  try {
    // Define the Next.js application structure with a `src` root folder

    // 1. Add package.json
    const packageJsonContent = JSON.stringify({
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
        next: "13.0.0", // or whichever version you're using
        "react-hook-form": "^7.0.0",
        yup: "^0.32.0",
      },
    }, null, 2);
    zip.file("package.json", packageJsonContent);

    // 2. Add next.config.js
    const nextConfigContent = `module.exports = { reactStrictMode: true };`;
    zip.file("next.config.js", nextConfigContent);

    // 3. Add src/pages/_app.js
    const appJsContent = `
      import '../styles/globals.css';
      export default function App({ Component, pageProps }) {
        return <Component {...pageProps} />;
      }
    `;
    zip.file("src/pages/_app.js", appJsContent);

    // 4. Add src/pages/index.js to render the form component
    const indexJsContent = `
      import ${sanitizedFormName} from '../components/${sanitizedFormName}';
      export default function Home() {
        return <${sanitizedFormName} />;
      }
    `;
    zip.file("src/pages/index.js", indexJsContent);

    // 5. Copy the form component to src/components
    const formPath = path.join(process.cwd(),'src', 'components', 'forms', `${sanitizedFormName}.tsx`);
    const formContent = fs.readFileSync(formPath, 'utf-8');
    zip.file(`src/components/${sanitizedFormName}.js`, formContent);

    // 6. Copy global CSS to src/styles
    const globalCssPath = path.join(process.cwd(), 'styles', 'globals.css');
    if (fs.existsSync(globalCssPath)) {
      const globalCssContent = fs.readFileSync(globalCssPath, 'utf-8');
      zip.file('src/styles/globals.css', globalCssContent);
    } else {
      zip.file('src/styles/globals.css', '/* Global styles here */');
    }

    // 7. Include validations if they exist
    const validationFilePath = path.join(process.cwd(), 'utils', 'validations', `${sanitizedFormName}Validation.js`);
    if (fs.existsSync(validationFilePath)) {
      const validationContent = fs.readFileSync(validationFilePath, 'utf-8');
      zip.file(`src/utils/validations/${sanitizedFormName}Validation.js`, validationContent);
    }

    // Generate the ZIP file as a buffer
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    // Set response headers for download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFormName}-app.zip`);

    // Send the ZIP file as the response
    res.send(zipContent);
  } catch (error) {
    console.error('Error exporting app:', error);
    res.status(500).json({ error: 'Failed to export app' });
  }
}
