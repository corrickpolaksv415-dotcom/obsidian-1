import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function buildPlugin() {
  console.log('Building Obsidian Plugin...');
  const result = await esbuild.build({
    entryPoints: [path.join(__dirname, 'main.tsx')],
    bundle: true,
    external: ['obsidian'],
    format: 'cjs',
    write: false,
    minify: true,
  });

  const mainJsCode = result.outputFiles[0].text;

  const manifest = {
    id: "diary-insight",
    name: "日记洞察 (Diary Insight Pro)",
    version: "1.0.0",
    minAppVersion: "0.15.0",
    description: "功能强大的日记管理、人名统计、图表生成及自动标签化插件原生版本",
    author: "AI Studio",
    authorUrl: "",
    isDesktopOnly: false
  };

  const zip = new JSZip();
  const folder = zip.folder("diary-insight");
  folder.file("main.js", mainJsCode);
  folder.file("manifest.json", JSON.stringify(manifest, null, 2));
  folder.file("styles.css", "/* Obsidian plugin custom styles */\n.stats-header { color: var(--interactive-accent); }");
  folder.file("data.json", JSON.stringify({ trackedNames: [], autoTagNames: true }, null, 2));

  const content = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync(path.join(publicDir, 'diary-insight-plugin.zip'), content);
  console.log('Obsidian Plugin built to public/diary-insight-plugin.zip');
}

buildPlugin().catch(err => {
  console.error(err);
  process.exit(1);
});
