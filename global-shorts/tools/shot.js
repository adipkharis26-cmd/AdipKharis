const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1760,height:800},deviceScaleFactor:Number(process.argv[2]||1)});
const dir=path.join(__dirname,'..','storyboard');for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.html'))){await p.goto('file://'+path.join(dir,f));await p.screenshot({path:path.join(dir,f.replace('.html','.png')),fullPage:true});}
await b.close();console.log('png done')})();
