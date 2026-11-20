// Pustaka gambar SVG orisinal: karakter Quibble & Snick + properti. Tanpa aset pihak ketiga.
const C = { bg:'#FFF4E0', ink:'#1E1E24', q:'#2EC4B6', s:'#FF6B6B', y:'#FFD23F', floor:'#EAD9BC', wall:'#FDE9C9', glass:'#BFE6F2', white:'#fff', paint:'#7B61FF' };
const sw = 5;
const L = (x1,y1,x2,y2,w=sw,c=C.ink)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
function eyes(cx,cy,gap,r,look=[0,0],cross=false,blink=false){
  if(blink) return L(cx-gap-r,cy,cx-gap+r,cy,sw)+L(cx+gap-r,cy,cx+gap+r,cy,sw);
  const p=(ex,dx)=>`<circle cx="${ex}" cy="${cy}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="${sw-1}"/><circle cx="${ex+dx[0]}" cy="${cy+dx[1]}" r="${r*0.42}" fill="${C.ink}"/>`;
  if(cross) return p(cx-gap,[r*0.4,0])+p(cx+gap,[-r*0.4,0]);
  return p(cx-gap,[look[0]*r*0.45,look[1]*r*0.45])+p(cx+gap,[look[0]*r*0.45,look[1]*r*0.45]);
}
function brows(cx,cy,gap,len,kind){
  const a={flat:[0,0],angry:[8,-8],sad:[-8,8],up:[-4,-4],smug:[6,-2]}[kind]||[0,0];
  const lift = kind==='up'?-6:0;
  return L(cx-gap-len/2,cy+a[1]*-1+lift,cx-gap+len/2,cy+a[0]+lift,6)+L(cx+gap-len/2,cy+a[0]+lift,cx+gap+len/2,cy+a[1]*-1+lift,6);
}
function mouth(cx,cy,kind,w=22){
  switch(kind){
    case 'smile': return `<path d="M${cx-w/2},${cy} Q${cx},${cy+14} ${cx+w/2},${cy}" fill="none" stroke="${C.ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
    case 'grin': return `<path d="M${cx-w/2-4},${cy-2} Q${cx},${cy+22} ${cx+w/2+4},${cy-2} Z" fill="#fff" stroke="${C.ink}" stroke-width="${sw-1}" stroke-linejoin="round"/>`;
    case 'o': return `<ellipse cx="${cx}" cy="${cy+4}" rx="7" ry="10" fill="${C.ink}"/>`;
    case 'frown': return `<path d="M${cx-w/2},${cy+8} Q${cx},${cy-4} ${cx+w/2},${cy+8}" fill="none" stroke="${C.ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
    case 'teeth': return `<rect x="${cx-14}" y="${cy-4}" width="28" height="14" rx="3" fill="#fff" stroke="${C.ink}" stroke-width="${sw-1}"/>${L(cx,cy-4,cx,cy+10,3)}`;
    case 'wavy': return `<path d="M${cx-w/2},${cy} q5,-6 10,0 t10,0 t10,0" fill="none" stroke="${C.ink}" stroke-width="${sw-1}" stroke-linecap="round"/>`;
    default: return L(cx-w/2,cy+4,cx+w/2,cy+4);
  }
}
// Quibble: kapsul toska, alis tebal = mesin ekspresi. (x,y)=titik kaki tengah
function quibble(x,y,s=1,o={}){
  const {look=[0,0],brow='flat',m='flat',arms='down',cross=false,squash=1,flip=false,stripes=false,legs='stand',hold='',blink=false}=o;
  const w=74, h=118*squash, top=-20-h;
  let g='';
  const leg = legs==='stand'? L(-14,-22,-16,0)+L(14,-22,16,0)+L(-16,0,-26,0)+L(16,0,26,0)
            : legs==='sit'? L(-14,-22,-30,-6)+L(14,-22,30,-6)
            : legs==='run'? L(-12,-22,-30,-4)+L(12,-22,26,-14)+L(26,-14,34,0) : '';
  g+=leg;
  const armsSvg={
    down: L(-w/2,top+h*0.6,-w/2-14,top+h*0.85)+L(w/2,top+h*0.6,w/2+14,top+h*0.85),
    up: L(-w/2,top+h*0.45,-w/2-22,top+h*0.1)+L(w/2,top+h*0.45,w/2+22,top+h*0.1),
    reachR: L(-w/2,top+h*0.6,-w/2-14,top+h*0.85)+L(w/2,top+h*0.55,w/2+46,top+h*0.5),
    pointL: L(w/2,top+h*0.6,w/2+14,top+h*0.85)+L(-w/2,top+h*0.45,-w/2-50,top+h*0.3)+`<circle cx="${-w/2-54}" cy="${top+h*0.28}" r="4" fill="${C.ink}"/>`,
    hips: `<path d="M${-w/2},${top+h*0.5} l-18,14 l18,12" fill="none" stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M${w/2},${top+h*0.5} l18,14 l-18,12" fill="none" stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round"/>`,
    holdR: L(-w/2,top+h*0.6,-w/2-14,top+h*0.85)+L(w/2,top+h*0.6,w/2+22,top+h*0.55),
  }[arms]||'';
  g+=armsSvg;
  g+=`<rect x="${-w/2}" y="${top}" width="${w}" height="${h}" rx="${w/2}" fill="${C.q}" stroke="${C.ink}" stroke-width="${sw}"/>`;
  g+=`<rect x="${-w/2+10}" y="${top+12}" width="10" height="${Math.max(10,h*0.35)}" rx="5" fill="#fff" opacity=".45"/>`;
  if(stripes) for(let i=0;i<3;i++) g+=`<rect x="${-w/2+3}" y="${top+h*0.62+i*13}" width="${w-6}" height="6" fill="${C.paint}"/>`;
  const ey=top+34*Math.min(1,squash+0.2);
  g+=eyes(0,ey,15,12,look,cross,blink)+brows(0,ey-20,15,20,brow)+mouth(0,ey+30,m);
  if(hold) g+=`<g transform="translate(${w/2+26},${top+h*0.5})">${hold}</g>`;
  return `<g transform="translate(${x},${y}) scale(${flip?-s:s},${s})">${g}</g>`;
}
// Snick: segitiga koral kecil, satu jambul, senyum licik
function snick(x,y,s=1,o={}){
  const {look=[0,0],brow='smug',m='grin',arms='down',flip=false,hold='',blink=false}=o;
  let g=L(-10,-14,-12,0,4)+L(10,-14,12,0,4)+L(-12,0,-20,0,4)+L(12,0,20,0,4);
  const ar={down:L(-22,-36,-34,-22,4)+L(22,-36,34,-22,4), wave:L(-22,-36,-34,-22,4)+L(22,-40,40,-66,4)+`<circle cx="42" cy="-70" r="5" fill="${C.ink}"/>`, up:L(-20,-40,-36,-64,4)+L(20,-40,36,-64,4), reachL:L(22,-36,34,-22,4)+L(-22,-38,-56,-44,4)}[arms]||'';
  g+=ar;
  g+=`<path d="M0,-96 L34,-14 L-34,-14 Z" fill="${C.s}" stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  g+=`<path d="M0,-96 q-4,-14 6,-20 q-2,10 6,12" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`;
  g+=eyes(0,-52,9,8,look,false,blink)+brows(0,-66,9,12,brow)+mouth(0,-36,m,16);
  if(hold) g+=`<g transform="translate(-40,-46)">${hold}</g>`;
  return `<g transform="translate(${x},${y}) scale(${flip?-s:s},${s})">${g}</g>`;
}
const P = {
  slice:(x,y,s=1,rot=0)=>`<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><path d="M0,-34 L28,22 Q0,32 -28,22 Z" fill="${C.y}" stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M-28,22 Q0,36 28,22" fill="none" stroke="#C98B3B" stroke-width="9" stroke-linecap="round"/><circle cx="-4" cy="0" r="5" fill="${C.s}"/><circle cx="8" cy="14" r="5" fill="${C.s}"/><circle cx="-12" cy="16" r="4" fill="${C.s}"/></g>`,
  table:(x,y,w=200)=>`<rect x="${x-w/2}" y="${y}" width="${w}" height="14" rx="4" fill="#C98B3B" stroke="${C.ink}" stroke-width="${sw}"/>${L(x-w/2+20,y+14,x-w/2+20,y+90)}${L(x+w/2-20,y+14,x+w/2-20,y+90)}`,
  plate:(x,y,w=90)=>`<ellipse cx="${x}" cy="${y}" rx="${w/2}" ry="10" fill="#fff" stroke="${C.ink}" stroke-width="${sw}"/>`,
  box:(x,y)=>`<g transform="translate(${x},${y})"><rect x="-55" y="-14" width="110" height="18" fill="#E9C38A" stroke="${C.ink}" stroke-width="${sw}"/><path d="M-55,-14 L-40,-70 L60,-70 L55,-14" fill="#F3D9A9" stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round"/></g>`,
  bench:(x,y,w=170,wet=false)=>`<g><rect x="${x-w/2}" y="${y-60}" width="${w}" height="14" rx="4" fill="${wet?C.paint:'#8FB46A'}" stroke="${C.ink}" stroke-width="${sw}"/><rect x="${x-w/2}" y="${y-30}" width="${w}" height="14" rx="4" fill="${wet?C.paint:'#8FB46A'}" stroke="${C.ink}" stroke-width="${sw}"/>${L(x-w/2+16,y-16,x-w/2+16,y)}${L(x+w/2-16,y-16,x+w/2-16,y)}</g>`,
  sign:(x,y,side='front')=>`<g transform="translate(${x},${y})">${L(0,0,0,-90)}<rect x="-30" y="-130" width="60" height="50" rx="6" fill="#fff" stroke="${C.ink}" stroke-width="${sw}"/>${side==='front'
    ? `<rect x="-14" y="-122" width="20" height="10" rx="2" fill="${C.paint}" stroke="${C.ink}" stroke-width="3"/>${L(6,-117,16,-117,3)}<path d="M-8,-108 q4,8 0,12 q-4,-4 0,-12" fill="${C.paint}" stroke="${C.ink}" stroke-width="2"/>`
    : `${L(0,-122,0,-92,5)}<path d="M-10,-100 L0,-88 L10,-100" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M14,-108 q4,8 0,12 q-4,-4 0,-12" fill="${C.paint}" stroke="${C.ink}" stroke-width="2"/>`}</g>`,
  cone:(s=1)=>`<g transform="scale(${s})"><path d="M-10,0 L10,0 L0,30 Z" fill="#E9C38A" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/><circle cx="0" cy="-8" r="13" fill="#FFB5C8" stroke="${C.ink}" stroke-width="4"/></g>`,
  door:(x,y,open=0,light='red')=>`<g><rect x="${x-80}" y="${y-260}" width="160" height="260" fill="#9AA3AF" stroke="${C.ink}" stroke-width="${sw}"/><rect x="${x-76+0}" y="${y-256}" width="${74-open}" height="252" fill="${C.glass}" stroke="${C.ink}" stroke-width="4" opacity=".9"/><rect x="${x+2+open}" y="${y-256}" width="${74-open}" height="252" fill="${C.glass}" stroke="${C.ink}" stroke-width="4" opacity=".9"/><rect x="${x-18}" y="${y-286}" width="36" height="16" rx="5" fill="#333" stroke="${C.ink}" stroke-width="3"/><circle cx="${x}" cy="${y-278}" r="5" fill="${light==='red'?'#FF3B3B':'#3BE37A'}"/></g>`,
  hand:(x,y)=>`<g transform="translate(${x},${y})"><rect x="-16" y="-16" width="32" height="32" rx="6" fill="#fff" stroke="${C.ink}" stroke-width="3"/><path d="M-6,8 v-14 m4,14 v-18 m4,18 v-16 m4,16 v-12 M-10,6 q2,8 10,8 q8,0 10,-8" fill="none" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round"/></g>`,
  lines:(x,y,dir=1)=>[0,1,2].map(i=>L(x,y+i*14,x+dir*30,y+i*14,4)).join(''),
  burst:(x,y,r=34,fill=C.y)=>{let d='';for(let i=0;i<16;i++){const a=i*Math.PI/8,rr=i%2?r*0.55:r;d+=(i?'L':'M')+(x+Math.cos(a)*rr).toFixed(1)+','+(y+Math.sin(a)*rr).toFixed(1);}return `<path d="${d}Z" fill="${fill}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`;},
  wind:(x,y)=>`<path d="M${x},${y} q30,-14 60,0 t40,-10 M${x+10},${y+18} q30,-10 70,0" fill="none" stroke="#9AA3AF" stroke-width="4" stroke-linecap="round"/>`,
  drop:(x,y,s=1,c=C.paint)=>`<path transform="translate(${x},${y}) scale(${s})" d="M0,-12 Q9,2 0,8 Q-9,2 0,-12Z" fill="${c}" stroke="${C.ink}" stroke-width="2.5"/>`,
  sweat:(x,y)=>`<path transform="translate(${x},${y})" d="M0,-10 Q7,2 0,7 Q-7,2 0,-10Z" fill="#BFE6F2" stroke="${C.ink}" stroke-width="2.5"/>`,
  shine:(x,y,w=40)=>`<line x1="${x}" y1="${y}" x2="${x+w}" y2="${y}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`,
  sparkle:(x,y)=>`<path d="M${x},${y-10} L${x+3},${y-3} L${x+10},${y} L${x+3},${y+3} L${x},${y+10} L${x-3},${y+3} L${x-10},${y} L${x-3},${y-3}Z" fill="${C.y}" stroke="${C.ink}" stroke-width="2"/>`,
};
// Safe zone Shorts (9:16): bawah ~20% (judul/caption), kolom kanan bawah (tombol like/komentar/share), atas ~6%.
const FLOOR=312, K=0.8, TX=8, TY=FLOOR-400*K;
function safeOverlay(){
  const h='url(#hatch)';
  return `<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#000" opacity=".18"/><line x1="0" y1="0" x2="0" y2="8" stroke="#000" stroke-width="3" opacity=".25"/></pattern></defs>
  <rect y="384" width="270" height="96" fill="${h}"/><rect x="226" y="190" width="44" height="194" fill="${h}"/><rect width="270" height="28" fill="${h}"/>
  <text x="8" y="474" font-size="10" font-family="sans-serif" fill="#000" opacity=".55">UI SHORTS (judul/caption)</text>`;
}
function panel(inner,{bg=C.bg,floor=true,wall=false,raw=false,floorY=FLOOR}={}){
  const fy = raw? floorY : FLOOR;
  const body = raw? inner : `<g transform="translate(${TX},${TY}) scale(${K})">${inner}</g>`;
  return `<svg viewBox="0 0 270 480" width="270" height="480" xmlns="http://www.w3.org/2000/svg"><rect width="270" height="480" fill="${bg}"/>${wall?`<rect width="270" height="${fy}" fill="${C.wall}"/>`:''}${floor?`<rect y="${fy}" width="270" height="${480-fy}" fill="${C.floor}"/>${L(0,fy,270,fy,4)}`:''}${body}${safeOverlay()}</svg>`;
}
export {C,quibble,snick,P,panel,L,eyes,brows,mouth};
