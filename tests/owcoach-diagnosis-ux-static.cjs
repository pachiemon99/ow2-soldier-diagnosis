#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
function assert(cond, msg){ if(!cond){ console.error('Diagnosis UX check failed:', msg); process.exit(1); } }
assert(index.includes('v50.19 Pack S') || index.includes('diagnosis result UX restructure'), 'Pack S marker missing');
assert(index.includes('OWC_UX_SECTION_ORDER'), 'UX section order missing');
assert(index.includes('owcRenderCompositionUxJa'), 'Japanese composition UX renderer missing');
assert(index.includes('owcRenderDetailUxJa'), 'Japanese detail UX renderer missing');
assert(index.includes('今回の最重要ポイント'), 'Japanese top-three summary missing');
assert(index.includes('初心者向け要約'), 'Japanese beginner summary missing');
assert(index.includes('Top 3 Priorities'), 'English top-three summary missing');
assert(index.includes('Beginner Summary'), 'English beginner summary missing');
assert((index.match(/class=\\?"owcUxDetails/g)||[]).length >= 2, 'collapsible UX details not used');
assert(index.includes('owcUxSectionNav'), 'section navigation missing');
assert(['50.19.0','50.20.0','50.21.0','50.22.0'].includes(pkg.version), 'package version must be 50.19.0, 50.20.0, or 50.21.0');
assert(pkg.scripts && pkg.scripts['check:diagnosis-ux'], 'check:diagnosis-ux script missing');
console.log('Diagnosis result UX static checks passed');
