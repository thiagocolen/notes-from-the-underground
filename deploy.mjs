import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const FILES_TO_COPY = ['main.js', 'manifest.json', 'styles.css'];
const DESTINATION = "D:\\GDrives\\thiago.souzacolen\\SinkholeFolder\\.obsidian\\plugins\\notes-from-the-underground";

function deploy() {
    try {
        console.log('Building plugin...');
        // Run the actual build script
        execSync('npm run build', { stdio: 'inherit' });

        console.log(`Ensuring destination directory exists: ${DESTINATION}`);
        if (!fs.existsSync(DESTINATION)) {
            fs.mkdirSync(DESTINATION, { recursive: true });
        }

        console.log('Copying files...');
        for (const file of FILES_TO_COPY) {
            const src = path.join(process.cwd(), file);
            const dest = path.join(DESTINATION, file);
            
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                console.log(`- Copied ${file} to ${DESTINATION}`);
            } else {
                console.warn(`- Warning: ${file} not found, skipping.`);
            }
        }
        console.log('Deployment complete!');
    } catch (err) {
        console.error('Deployment failed:', err.message);
        process.exit(1);
    }
}

deploy();
