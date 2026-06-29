const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const bundlePath = path.join(root, 'diagnosis_text', 'bundle.json');
const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
const labels = ['ダイブ救助構成','長射線＋空中圧力構成','分断射線構成','ラッシュ継戦構成','高耐久継戦構成','救助継戦構成','バランス構成'];
const sections = ['opening','highground','peak','ultimate','forbidden'];
function fail(msg){ console.error(msg); process.exit(1); }
if(bundle.version !== '50.22.0') fail('diagnosis_text bundle version must be 50.22.0');
for(const label of labels){
  const profile = bundle.composition_profiles?.[label];
  if(!profile) fail(`missing composition profile: ${label}`);
  if(!bundle.composition_win_conditions?.[label]) fail(`missing win condition: ${label}`);
  for(const section of sections){
    if(!Array.isArray(profile[section]) || profile[section].length === 0) fail(`missing ${section} for ${label}`);
    for(const line of profile[section]){
      if(typeof line !== 'string' || line.length < 12) fail(`too short ${section} line for ${label}`);
    }
  }
}
if(!bundle.target_role_templates?.default) fail('missing default target role template');
if(!Array.isArray(bundle.target_role_templates?.groups) || bundle.target_role_templates.groups.length < 4) fail('target role template groups are incomplete');
const sourceFiles = [
  'diagnosis_text/bundle.json',
  'diagnosis_text/ja/composition_profiles.json',
  'diagnosis_text/ja/composition_win_conditions.json',
  'diagnosis_text/ja/target_role_templates.json',
  'diagnosis_text/ja/section_titles.json',
  'diagnosis_text/output_rules.json',
  'diagnosis_text/rewrite_rules.json'
];
const forbidden = bundle.rewrite_rules?.forbidden_terms || [];
for(const rel of sourceFiles){
  const text = fs.readFileSync(path.join(root, rel), 'utf8');
  JSON.parse(text);
}
const visibleText = JSON.stringify({
  composition_profiles: bundle.composition_profiles,
  composition_win_conditions: bundle.composition_win_conditions,
  target_role_templates: bundle.target_role_templates,
  section_titles: bundle.section_titles,
  output_rules: bundle.output_rules
});
for(const term of forbidden){
  if(term === '入り口') continue;
  if(visibleText.includes(term)) fail(`forbidden diagnosis text term found in visible diagnosis bundle: ${term}`);
}
const combined = fs.readFileSync(path.join(root, '_combined.js'), 'utf8');
if(!combined.includes('OWC_DIAGNOSIS_TEXT_BUNDLE')) fail('embedded diagnosis text bundle is missing');
if(!combined.includes("fetch('diagnosis_text/bundle.json'")) fail('external diagnosis_text bundle loader is missing');
console.log('Diagnosis text structure static checks passed');
