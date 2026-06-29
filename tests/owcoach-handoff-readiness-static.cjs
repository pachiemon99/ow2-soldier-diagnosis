const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const fail = (msg) => { console.error(msg); process.exit(1); };
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));

const required = [
  'README_PACK_T_HANDOFF_READINESS.md',
  'HANDOFF_READINESS_CONTRACT_v50_20.md',
  'owcoach_handoff_readiness_contract_v50_20.json',
  'handoff_bundle/00_READ_ME_FIRST.md',
  'handoff_bundle/NEXT_CHAT_PROMPT.md',
  'handoff_bundle/CURRENT_STATE_v50_20.md',
  'handoff_bundle/PACK_HISTORY_A_TO_T.md',
  'handoff_bundle/QA_AND_GITHUB_REFLECTION_RUNBOOK.md',
  'handoff_bundle/NEXT_WORK_BACKLOG.md',
  'handoff_bundle/GITHUB_STATUS_AND_HOLD.md',
  'handoff_bundle/LATEST_FILES.md',
  'handoff_bundle/file_manifest_v50_20.csv',
  'handoff_bundle/file_manifest_v50_20.json'
];
for (const file of required) {
  if (!exists(file)) fail(`missing handoff file: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
if (!['50.20.0','50.21.0','50.22.0'].includes(pkg.version)) fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts['check:handoff-readiness']) fail('missing check:handoff-readiness script');
if (!pkg.scripts['check:syntax'].includes('check:handoff-readiness')) fail('check:syntax does not include handoff readiness');

const contract = JSON.parse(read('owcoach_handoff_readiness_contract_v50_20.json'));
if (contract.github_reflection !== 'on_hold') fail('handoff contract must keep GitHub reflection on hold');
if (contract.required_handoff_files.length < 10) fail('handoff contract required files too small');

const prompt = read('handoff_bundle/NEXT_CHAT_PROMPT.md');
for (const needle of ['GitHubへの反映は v50.0.0 以降しばらく保留', 'PlaywrightブラウザQAはPack A〜Tでは未実施', 'owcoach_v50_20_handoff_readiness_pack_t.zip']) {
  if (!prompt.includes(needle)) fail(`next chat prompt missing: ${needle}`);
}

const history = read('handoff_bundle/PACK_HISTORY_A_TO_T.md');
for (const needle of ['Pack A', 'Pack S', 'Pack T']) {
  if (!history.includes(needle)) fail(`pack history missing: ${needle}`);
}

const validation = JSON.parse(read('validation_report.json'));
if (validation.version !== 'v50.20 Pack T') fail(`validation version mismatch: ${validation.version}`);
if (validation.github_reflection !== 'on_hold') fail('validation must record GitHub reflection hold');
if (validation.browser_playwright !== 'pending_github_actions') fail('validation must keep browser QA pending');

const index = read('index.html');
if (!index.includes('owcoach_handoff_readiness_contract_v50_20.json')) fail('index metadata missing handoff contract reference');
if (!index.includes('v50.20 Pack T')) fail('index missing Pack T marker');

const manifest = JSON.parse(read('handoff_bundle/file_manifest_v50_20.json'));
if (!manifest.files || manifest.files.length < 100) fail('file manifest looks incomplete');

console.log('Handoff readiness static checks passed');
