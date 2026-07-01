const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function readIndex(root) {
  return fs.readFileSync(path.join(root, 'index.html'), 'utf8');
}

function extractInlineScripts(html) {
  const scripts = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) {
    const attrs = String(match[1] || '').toLowerCase();
    if (attrs.includes('src=')) continue;
    scripts.push(match[2] || '');
  }
  return scripts;
}

function readAppSource(root) {
  return extractInlineScripts(readIndex(root)).join('\n;\n');
}

function assertAppSourceSyntax(root) {
  const source = readAppSource(root);
  if (!source.includes('OWCOACH_DATA')) throw new Error('extracted app source is missing OWCOACH_DATA');
  if (!source.includes('window.diagnose')) throw new Error('extracted app source is missing diagnose entrypoint');
  const tmp = path.join(os.tmpdir(), `owcoach_app_source_${process.pid}_${Date.now()}.js`);
  fs.writeFileSync(tmp, source, 'utf8');
  const result = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' });
  try { fs.unlinkSync(tmp); } catch (_) {}
  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`extracted index.html app source has a syntax error\n${details}`);
  }
  return { script_count: extractInlineScripts(readIndex(root)).length, byte_length: Buffer.byteLength(source, 'utf8') };
}

module.exports = { readIndex, extractInlineScripts, readAppSource, assertAppSourceSyntax };
