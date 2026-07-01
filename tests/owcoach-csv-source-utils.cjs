const fs = require('fs');
const path = require('path');

function parseCsv(text){
  const rows=[]; let row=[], cell='', quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i], next=text[i+1];
    if(quoted){
      if(ch==='"' && next==='"'){ cell+='"'; i++; }
      else if(ch==='"'){ quoted=false; }
      else cell+=ch;
    } else {
      if(ch==='"') quoted=true;
      else if(ch===','){ row.push(cell); cell=''; }
      else if(ch==='\n'){ row.push(cell); rows.push(row); row=[]; cell=''; }
      else if(ch !== '\r') cell+=ch;
    }
  }
  if(cell || row.length){ row.push(cell); rows.push(row); }
  const header=rows.shift() || [];
  return rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]||''])));
}

function loadManifest(root){
  const manifestPath = path.join(root, 'data/shared/owcoach_csv_compaction_manifest_v50_25.json');
  if(!fs.existsSync(manifestPath)) return {files:{}, hero_registry:'data/shared/owcoach_hero_registry_v50_25.csv'};
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function loadHeroRegistry(root, manifest){
  const rel = manifest.hero_registry || 'data/shared/owcoach_hero_registry_v50_25.csv';
  const p = path.join(root, rel);
  const rows = fs.existsSync(p) ? parseCsv(fs.readFileSync(p, 'utf8')) : [];
  return new Map(rows.map(r => [r.hero_id, r]));
}

function readCompactCsv(root, rel){
  return parseCsv(fs.readFileSync(path.join(root, rel), 'utf8'));
}

function readExpandedCsv(root, rel){
  const manifest = loadManifest(root);
  const registry = loadHeroRegistry(root, manifest);
  const meta = manifest.files && manifest.files[rel] ? manifest.files[rel] : {};
  const rows = readCompactCsv(root, rel);
  return rows.map(row => {
    const out = {...row};
    for(const [key,value] of Object.entries(meta.constant_columns || {})) out[key] = value;
    for(const [alias,source] of Object.entries(meta.alias_columns || {})) out[alias] = out[source] || '';
    const aliases = manifest.target_id_aliases || {};
    const target = registry.get(out.target_id) || registry.get(aliases[out.target_id]);
    const enemy = registry.get(out.enemy_id) || registry.get(aliases[out.enemy_id]);
    if(target){
      if(!out.target_ja) out.target_ja = target.hero_ja || '';
    }
    if(enemy){
      if(!out.enemy_ja) out.enemy_ja = enemy.hero_ja || '';
      if(!out.enemy_role) out.enemy_role = enemy.role || '';
      if(!out.enemy_sub_role) out.enemy_sub_role = enemy.sub_role || '';
    }
    if(out.hero_id){
      const hero = registry.get(out.hero_id) || registry.get(aliases[out.hero_id]);
      if(hero){
        if(!out.hero_ja) out.hero_ja = hero.hero_ja || '';
        if(!out.role) out.role = hero.role || '';
        if(!out.sub_role) out.sub_role = hero.sub_role || '';
      }
    }
    return out;
  });
}

function rowCountBy(rows, key){
  const m = new Map();
  for(const row of rows) m.set(row[key], (m.get(row[key]) || 0) + 1);
  return m;
}

module.exports = { parseCsv, loadManifest, loadHeroRegistry, readCompactCsv, readExpandedCsv, rowCountBy };
