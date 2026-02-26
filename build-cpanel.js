import { exec } from 'child_process';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fungsi pembantu mengeksekusi shell command (npm run build)
async function runCommand(command) {
    return new Promise((resolve, reject) => {
        console.log(`> Menjalankan: ${command}`);
        const child = exec(command);
        
        child.stdout.on('data', data => process.stdout.write(data));
        child.stderr.on('data', data => process.stderr.write(data));
        
        child.on('close', code => {
            if (code !== 0) {
                return reject(new Error(`Command ${command} gagal dengan exit code ${code}`));
            }
            resolve();
        });
    });
}

// Fungsi untuk zip direktori dengan struktur yang dipertahankan
function zipDirectory(sourceDir, outPath, ignorePatterns = []) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } }); // Maximum compression

        output.on('close', () => {
            const sizeMegabytes = (archive.pointer() / 1024 / 1024).toFixed(2);
            console.log(`✅ [Berhasil] ${path.basename(outPath)} dibuat (${sizeMegabytes} MB)`);
            resolve();
        });

        archive.on('error', (err) => reject(err));

        archive.pipe(output);

        // Menambahkan seluruh isi folder sourceDir tanpa foldernya sendiri,
        // misal: isi folder dist/ langsung ada di ZIP root.
        archive.glob('**/*', {
            cwd: sourceDir,
            ignore: ignorePatterns,
            dot: true // Menyertakan hidden files misalnya .htaccess atau .env.example
        });

        archive.finalize();
    });
}

async function main() {
    try {
        console.log("🚀 Memulai proses build dan packaging...");
        
        // 1. Build Vue Frontend
        console.log("\n📦 1/3: Membangun Frontend Vue.js...");
        try {
            await runCommand('npm run build');
        } catch (e) {
            console.error("\n❌ Gagal melakukan build frontend Vue.");
            process.exit(1);
        }

        const distDir = path.join(__dirname, 'dist');
        const serverDir = path.join(__dirname, 'server');
        
        const frontendZip = path.join(__dirname, 'frontend_mycoinflips.zip');
        const backendZip = path.join(__dirname, 'backend_mycoinflips.zip');

        // 2. Zip Frontend
        if (!fs.existsSync(distDir)) {
            console.error(`\n❌ Folder dist/ tidak ditemukan. Build gagal?`);
            process.exit(1);
        }
        console.log(`\n📦 2/3: Mengompresi Frontend (${distDir}) ...`);
        await zipDirectory(distDir, frontendZip, []);

        // 3. Zip Backend
        if (!fs.existsSync(serverDir)) {
             console.error(`\n❌ Folder server/ tidak ditemukan.`);
             process.exit(1);
        }
        console.log(`\n📦 3/3: Mengompresi Backend (${serverDir}) ...`);
        
        // Pola pengecualian untuk backend
        const ignoreListBackend = [
            'node_modules/**', // Jangan masukkan node_modules
            '.env',            // Jangan sertakan env (konfigurasi cPanel berbeda)
            '.git/**',
            'package-lock.json'
        ];
        
        await zipDirectory(serverDir, backendZip, ignoreListBackend);

        console.log("\n🎉 Proses packaging selesai!");
        console.log("👉 Silakan upload frontend_mycoinflips.zip dan backend_mycoinflips.zip ke cPanel.");

    } catch (error) {
        console.error("\nTerjadi kesalahan tidak terduga:", error);
    }
}

main();
