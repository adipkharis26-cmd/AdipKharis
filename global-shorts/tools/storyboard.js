const {C,quibble:q,snick:s,P,panel,L}=require('./draw.js');
const fs=require('fs'), path=require('path');
const OUT=path.join(__dirname,'..','storyboard');
const eps=[
 {id:'ep01-last-slice',title:'EP01 · The Last Slice',dur:'18 dtk',panels:[
  {t:'0.0–1.0',hook:true,a:'HOOK: close-up wajah melotot + tangan menyentuh pizza terakhir bersamaan; zoom-in cepat 0→1 dtk, keringat menetes',sfx:'sting tegang "dun!"',
   svg:panel(P.plate(118,262,170)+P.slice(118,232,2.3)+q(36,445,1.75,{arms:'reachR',brow:'angry',look:[1,-0.3],m:'frown'})+s(178,360,1.4,{arms:'reachL',brow:'angry',m:'flat',look:[-1,-0.3]})+P.sweat(96,300)+P.sweat(196,200),{floor:false,raw:true,bg:'#FFE3B3'})},
  {t:'1.0–4.0',a:'Saling melotot. GAG: Snick tarik piring 1 cm, Quibble tarik balik (2×, makin cepat)',sfx:'tik-tok pelan',
   svg:panel(P.table(135,330,220)+P.plate(135,326,80)+P.slice(135,312,0.9)+q(55,400,1,{brow:'angry',look:[1,0],m:'frown'})+s(220,400,1,{brow:'angry',look:[-1,0],m:'flat'}),{wall:true})},
  {t:'4.0–7.5',a:'Quibble menunjuk ke kiri, kaget berlebihan; Snick menoleh. GAG: Snick menoleh terlalu jauh, badan berputar 360°',sfx:'whoosh',
   svg:panel(P.table(150,330,200)+P.plate(150,326,80)+P.slice(150,312,0.9)+q(110,400,1,{arms:'pointL',brow:'up',m:'o',look:[-1,0]})+s(235,400,1,{look:[-1,-0.3],brow:'up',m:'o'})+P.lines(20,200,1),{wall:true})},
  {t:'7.5–11.0',a:'Quibble menggigit penuh kemenangan → ternyata pizza plastik! Gigi memantul, mata juling',sfx:'squeak + "boing"',
   svg:panel(P.burst(215,120,34)+q(135,400,1.25,{cross:true,brow:'sad',m:'teeth',arms:'holdR',hold:P.slice(0,0,0.8,-30)}),{wall:true})},
  {t:'11.0–15.0',a:'Kamera geser: Snick di atas lemari, memeluk kotak pizza utuh, melambai sambil mengunyah',sfx:'kunyah + siul jahil',
   svg:panel(`<rect x="70" y="250" width="200" height="150" fill="#C98B3B" stroke="${C.ink}" stroke-width="5"/>`+P.box(190,246)+s(130,246,1,{arms:'wave',m:'grin'})+q(40,400,0.8,{brow:'sad',m:'frown',look:[1,-1]}),{wall:true})},
  {t:'15.0–18.0',loop:true,a:'Snick menaruh pizza plastik baru di piring lalu jinjit pergi → komposisi = panel 1 (LOOP)',sfx:'"tink" halus',
   svg:panel(P.table(135,330,220)+P.plate(135,326,80)+P.slice(135,312,0.9)+P.sparkle(170,290)+s(200,400,1,{brow:'smug',m:'smile',look:[-1,0],arms:'up'}),{wall:true})},
 ]},
 {id:'ep02-wet-paint',title:'EP02 · Wet Paint',dur:'16 dtk',panels:[
  {t:'0.0–1.0',hook:true,a:'HOOK: Quibble membeku 2 cm di atas bangku ungu mengkilap; tetesan cat jatuh (animasi) — mata melirik ke bawah',sfx:'rem mendadak "screech"',
   svg:panel(P.bench(150,400,190,true)+P.shine(80,343,50)+P.shine(150,373,40)+P.drop(90,372)+P.drop(170,388,0.8)+P.drop(120,420,1.1)+P.sign(35,400,'front')+q(150,330,1.15,{legs:'sit',brow:'up',m:'o',look:[0,1],arms:'holdR',hold:P.cone(0.9)})+P.sweat(110,180),{bg:'#D8F0FF'})},
  {t:'1.0–4.0',a:'Sok pintar duduk di tanah. GAG: ia mengetuk kepala sendiri (bangga), es krim menetes ke alisnya',sfx:'nada kazoo "hmm-hm"',
   svg:panel(P.bench(170,400,150,true)+P.sign(45,400,'front')+q(110,400,0.9,{legs:'sit',brow:'smug',m:'smile',arms:'holdR',hold:P.cone(0.9)}),{bg:'#D8F0FF'})},
  {t:'4.0–7.0',a:'Angin membalik papan: sisi belakang = panah ke bawah + tetes cat → TANAH yang basah',sfx:'angin + kertas berbalik',
   svg:panel(P.wind(150,120)+P.sign(60,400,'back')+`<rect y="400" width="270" height="80" fill="${C.paint}" opacity=".85"/>`+q(170,400,0.9,{legs:'sit',brow:'up',m:'o',look:[-1,-1],arms:'holdR',hold:P.cone(0.9)}),{bg:'#D8F0FF'})},
  {t:'7.0–10.0',a:'Coba berdiri, badan molor seperti permen karet → TERPENTAL balik ke tanah (snap)',sfx:'"boinnng" melar',
   svg:panel(`<rect y="400" width="270" height="80" fill="${C.paint}"/>`+q(135,400,1,{squash:1.9,brow:'angry',m:'teeth',arms:'up',stripes:true})+P.lines(60,150,-1),{bg:'#D8F0FF'})},
  {t:'10.0–13.5',a:'Snick melompat ke bangku (ternyata kering), duduk santai, mencomot es krim Quibble',sfx:'"pop" + seruput',
   svg:panel(P.bench(170,400,150,false)+s(170,342,1,{arms:'reachL',hold:P.cone(0.8),m:'grin'})+`<rect y="400" width="270" height="80" fill="${C.paint}" opacity=".85"/>`+q(50,400,0.8,{legs:'sit',brow:'sad',m:'frown',look:[1,-1],stripes:true}),{bg:'#D8F0FF'})},
  {t:'13.5–16.0',loop:true,a:'Wajah datar Quibble penuh garis cat; angin membalik papan ke depan → LOOP ke panel 1',sfx:'angin + flip',
   svg:panel(P.wind(110,110)+P.sign(225,400,'front')+q(120,400,1.2,{brow:'flat',m:'flat',stripes:true,look:[0.5,0]}),{bg:'#D8F0FF'})},
 ]},
 {id:'ep03-the-door',title:'EP03 · The Door',dur:'15 dtk',panels:[
  {t:'0.0–1.0',hook:true,a:'HOOK: wajah Quibble gepeng menempel di pintu kaca otomatis',sfx:'"thud" kaca',
   svg:panel(`<rect width="270" height="480" fill="${C.glass}"/>`+q(118,440,2.0,{squash:0.8,brow:'sad',m:'wavy',cross:true})+`<rect width="270" height="480" fill="#fff" opacity=".18"/>`+L(20,40,80,100,6,'#fff')+L(40,40,120,120,4,'#fff'),{floor:false,raw:true})},
  {t:'1.0–4.0',a:'Melambai & lompat ke sensor; lompatan ke-3 kepalanya terbentur kusen',sfx:'"boing" lompatan',
   svg:panel(P.door(135,400,0,'red')+q(135,360,0.9,{arms:'up',brow:'up',m:'o',look:[0,-1]})+P.lines(100,380,-1),{wall:true})},
  {t:'4.0–7.0',a:'Joget putus asa; pintu terbuka 1 cm… lalu menutup lagi (prank pintu)',sfx:'riff kazoo cepat',
   svg:panel(P.door(135,400,0,'red')+q(135,400,0.9,{arms:'hips',brow:'angry',m:'grin',look:[0,-1]}),{wall:true})},
  {t:'7.0–10.0',a:'Snick lewat santai → pintu langsung terbuka (lampu hijau). Quibble lari menyusul',sfx:'whoosh + "ding"',
   svg:panel(P.door(135,400,55,'green')+s(135,400,0.9,{m:'smile',brow:'flat'})+q(40,400,0.8,{legs:'run',brow:'up',m:'o',look:[1,0]}),{wall:true})},
  {t:'10.0–12.5',a:'Pintu menutup tepat saat Quibble lewat → badan terjepit gepeng',sfx:'"squish"',
   svg:panel(q(135,400,1,{squash:1.1,brow:'sad',cross:true,m:'wavy'})+P.door(135,400,14,'red')+P.burst(200,140,26),{wall:true})},
  {t:'12.5–15.0',loop:true,a:'Lepas, ia lihat ikon tangan "dorong" di kaca; dorong → di baliknya ada pintu kaca lagi → LOOP',sfx:'"creak" + "thud"',
   svg:panel(P.door(135,400,0,'red')+P.hand(135,230)+q(60,400,0.85,{brow:'flat',m:'flat',look:[1,-0.6]}),{wall:true})},
 ]},
];
const css=`body{margin:0;background:#16161a;color:#eee;font-family:system-ui,Segoe UI,Arial,sans-serif;padding:28px}h1{margin:0 0 4px;font-size:30px}.sub{color:#aaa;margin-bottom:20px;font-size:15px}.grid{display:grid;grid-template-columns:repeat(6,270px);gap:18px}.card{background:#222228;border-radius:12px;overflow:hidden}.card svg{display:block}.n{padding:10px 12px;font-size:13px;line-height:1.35}.tm{font-weight:700;font-size:15px;color:#FFD23F}.tag{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:9px;font-size:11px;background:#FF6B6B;color:#111}.tag.l{background:#2EC4B6}.sfx{color:#9ad;margin-top:6px}`;
for(const e of eps){
  const cards=e.panels.map((p,i)=>`<div class="card">${p.svg}<div class="n"><span class="tm">${i+1}. ${p.t}s</span>${p.hook?'<span class="tag">HOOK</span>':''}${p.loop?'<span class="tag l">LOOP</span>':''}<div>${p.a}</div><div class="sfx">♪ ${p.sfx}</div></div></div>`).join('');
  fs.writeFileSync(path.join(OUT,e.id+'.html'),`<!doctype html><meta charset="utf-8"><style>${css}</style><h1>${e.title}</h1><div class="sub">Durasi ${e.dur} · tanpa dialog/teks di layar · musik & SFX orisinal (sintesis) · area arsir = tertutup UI Shorts, aksi harus di luar arsir</div><div class="grid">${cards}</div>`);
}
// character sheet
const cs=[['Quibble — netral',q(135,420,1.5,{})],['Quibble — marah',q(135,420,1.5,{brow:'angry',m:'frown',arms:'hips'})],['Quibble — kaget',q(135,420,1.5,{brow:'up',m:'o',arms:'up'})],['Quibble — sedih',q(135,420,1.5,{brow:'sad',m:'frown',look:[0,1]})],['Snick — licik',s(135,420,2,{})],['Snick — melambai',s(135,420,2,{arms:'wave',m:'smile',brow:'flat'})]];
fs.writeFileSync(path.join(OUT,'00-character-sheet.html'),`<!doctype html><meta charset="utf-8"><style>${css}</style><h1>Character Sheet · Quibble &amp; Snick</h1><div class="sub">Gaya: flat 2D, outline tebal #1E1E24, palet toska/koral/kuning, emosi lewat alis & mata (universal, tanpa kata)</div><div class="grid">${cs.map(([n,g])=>`<div class="card">${panel(g,{wall:true,floorY:420})}<div class="n"><span class="tm">${n}</span></div></div>`).join('')}</div>`);
console.log('html done');
