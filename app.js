// Personalise the greeting and secret here. This lock is a romantic interaction.
const CONFIG = { name: 'Уля', secret: 'банка жижи' };
const $ = s => document.querySelector(s);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let screen = 'lock', transitioning = false;
$('.envelope-label').textContent = `Это тебе, ${CONFIG.name}`;
$('.dedication').textContent = `это тебе, ${CONFIG.name}`;
$('.portrait-caption h2').textContent = CONFIG.name;
async function showScreen(id) {
  if(transitioning || screen === id) return;
  transitioning = true;
  const old = $('#'+screen), next = $('#'+id);
  old.classList.add('leaving');
  await new Promise(r=>setTimeout(r,reducedMotion?0:430));
  old.classList.remove('active','leaving');old.inert=true;
  next.inert=false;next.classList.add('active');screen=id;window.scrollTo(0,0);
  if(id==='universe-screen'){resize();startUniverse();}
  const focus = next.querySelector('button,input');if(focus)focus.focus({preventScroll:true});
  transitioning=false;
}
$('#unlock-form').addEventListener('submit',e=>{
  e.preventDefault();const value=$('#secret').value.toLowerCase().trim().replace(/[.!♥❤🤍]/gu,'').trim();
  if([CONFIG.secret,'я тебя '+CONFIG.secret].includes(value)){
    $('#unlock-error').textContent='';$('#secret').blur();showScreen('envelope-screen');
  }else{ $('#unlock-error').textContent=value?'Вспомни нашу секретную фразу ♥':'Введи нашу секретную фразу ♥';const f=$('#unlock-form');f.classList.remove('shake');void f.offsetWidth;f.classList.add('shake'); }
});
$('#envelope').addEventListener('click',async()=>{const el=$('#envelope');el.disabled=true;el.classList.add('opened');$('.open-hint').style.opacity=0;await new Promise(r=>setTimeout(r,reducedMotion?50:1500));showScreen('letter-screen');});
$('#to-galaxy').addEventListener('click',()=>showScreen('universe-screen'));
$('#restart').addEventListener('click',()=>showScreen('letter-screen'));
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3600);}
$('#share').addEventListener('click',async()=>{if(location.protocol==='file:'){toast('Отправь файл «Для Ули.html» — всё уже внутри ♥');return;}try{if(navigator.share){await navigator.share({title:'Для тебя, Уля',text:'Маленькая вселенная, в которой самая красивая звезда — ты.',url:location.href});}else{await navigator.clipboard.writeText(location.href);toast('Ссылка скопирована ♥');}}catch(e){if(e.name!=='AbortError')toast('Скопируй адрес страницы из браузера ♥');}});

const canvas=$('#universe'),ctx=canvas.getContext('2d',{alpha:false});
let W=0,H=0,dpr=1,particles=[],stars=[],imageReady=false,raf=0,running=false;
let mode='galaxy',morph=0,targetMorph=0,rotation=0,tilt=.34,lastTime=0,drag=null,dragMoved=false,flash=0;
const portraitImage = new Image();portraitImage.src='photo.jpg';
portraitImage.onload=()=>{createParticles();imageReady=true;};
portraitImage.onerror=()=>toast('Не удалось загрузить фото. Обнови страницу.');
const phrases=['Я тебя люблю','I love you','Je t’aime','Ti amo','Te amo','Ich liebe dich','Я кахаю цябе','Seni seviyorum','愛してる','사랑해','Eu te amo','Кохаю тебе'];
function random(a,b){return a+Math.random()*(b-a)}
function createParticles(){
  const off=document.createElement('canvas');off.width=132;off.height=166;
  const c=off.getContext('2d',{willReadFrequently:true});
  const sw=portraitImage.height*off.width/off.height,sx=(portraitImage.width-sw)*.92;
  c.drawImage(portraitImage,Math.max(0,sx),0,Math.min(sw,portraitImage.width),portraitImage.height,0,0,132,166);
  const pixels=c.getImageData(0,0,132,166).data;particles=[];
  for(let y=0;y<166;y++)for(let x=0;x<132;x++){
    const i=(y*132+x)*4,lum=(pixels[i]*.299+pixels[i+1]*.587+pixels[i+2]*.114)/255;
    if(lum<.065 && Math.random()>.08)continue;
    const r=Math.pow(Math.random(),.68),arm=Math.floor(Math.random()*3),angle=r*10.5+arm*Math.PI*2/3+random(-.32,.32),spread=random(-1,1)*(1-r)*.09;
    particles.push({px:(x/132-.5),py:(y/166-.5),lum,edge:Math.min(1,Math.min(x,131-x)/10)*Math.min(1,Math.min(y,165-y)/9),gx:Math.cos(angle)*r,gz:Math.sin(angle)*r,gy:spread,seed:Math.random()*Math.PI*2,speed:random(.6,1.4),size:random(.55,1.2),color:Math.random()});
  }
}
function resize(){
  const r=canvas.getBoundingClientRect();if(!r.width)return;W=r.width;H=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  stars=Array.from({length:55},()=>({x:Math.random()*W,y:Math.random()*H,a:random(.08,.3),s:random(.3,1),phase:random(0,6)}));
}
addEventListener('resize',resize);
function startUniverse(){if(running)return;running=true;lastTime=performance.now();raf=requestAnimationFrame(draw);}
function setMode(next){
  if(!imageReady){toast('Фото ещё загружается…');return;}
  mode=next;targetMorph=next==='portrait'?1:0;
  $('#universe-screen').classList.toggle('portrait-mode',next==='portrait');
  $('#back-to-stars').hidden=next!=='portrait';
  if(next==='portrait'){flash=1;$('#reveal').disabled=true;}
  else{$('#reveal').disabled=false;}
}
$('#reveal').addEventListener('click',()=>setMode('portrait'));
$('#back-to-stars').addEventListener('click',()=>setMode('galaxy'));
canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};dragMoved=false;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;dragMoved=dragMoved||Math.abs(dx)+Math.abs(dy)>2;if(mode==='galaxy'){rotation+=dx*.008;tilt=Math.max(.12,Math.min(.95,tilt+dy*.003));}drag={x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointerup',e=>{if(mode==='portrait' && dragMoved)setMode('galaxy');drag=null;});
canvas.addEventListener('pointercancel',()=>drag=null);
canvas.addEventListener('wheel',e=>{if(mode==='portrait'&&e.deltaY<0)setMode('galaxy');else if(mode==='galaxy')rotation+=e.deltaY*.001;},{passive:true});
function ease(t){return t*t*(3-2*t)}
function draw(now){
  if(screen!=='universe-screen'){running=false;return;}
  const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;
  if(Math.abs(morph-targetMorph)>.0001){morph+=Math.sign(targetMorph-morph)*Math.min(Math.abs(targetMorph-morph),dt/(reducedMotion?.15:3.6));}
  const blend=ease(morph),time=now*.001;
  if(!drag&&!reducedMotion)rotation+=dt*.085*(1-blend);
  ctx.fillStyle='#180e18';ctx.fillRect(0,0,W,H);
  let haze=ctx.createRadialGradient(W*.5,H*.38,0,W*.5,H*.4,Math.min(W*.8,H*.65));haze.addColorStop(0,'#40203450');haze.addColorStop(.5,'#30172922');haze.addColorStop(1,'#180e1800');ctx.fillStyle=haze;ctx.fillRect(0,0,W,H);
  for(const s of stars){ctx.globalAlpha=s.a*(.65+.35*Math.sin(time*.4+s.phase))*(1-blend*.8);ctx.fillStyle='#f6c5d7';ctx.fillRect(s.x,s.y,s.s,s.s);}
  ctx.globalAlpha=1;
  const radius=Math.min(W*.43,H*.34,290),cx=W*.5,cy=H*(H<720?.35:.38);
  const portraitHeight=Math.min(H*.57,W*1.1,470),portraitWidth=portraitHeight*132/166,portraitCy=H*(H<720?.32:.345);
  const co=Math.cos(rotation),si=Math.sin(rotation);
  const explosion=Math.sin(Math.PI*blend)*Math.min(W,H)*.12;
  if(blend<.97){ctx.save();ctx.translate(cx,cy);ctx.scale(1,.45);ctx.globalAlpha=(1-blend)*.75;const glow=ctx.createRadialGradient(0,0,0,0,0,radius*.6);glow.addColorStop(0,'#fff5ee');glow.addColorStop(.045,'#ffe5f1');glow.addColorStop(.16,'#ffb7d399');glow.addColorStop(.4,'#ff8cbb22');glow.addColorStop(1,'#ff70ad00');ctx.fillStyle=glow;ctx.fillRect(-radius,-radius,radius*2,radius*2);ctx.restore();}
  for(const p of particles){
    const xx=p.gx*co-p.gz*si,zz=p.gx*si+p.gz*co;
    const gx=cx+xx*radius,gy=cy+(zz*tilt+p.gy)*radius;
    const px=cx+p.px*portraitWidth,py=portraitCy+p.py*portraitHeight;
    const jitter=(1-blend)*blend*Math.sin(time*4+p.seed)*9;
    const x=gx*(1-blend)+px*blend+Math.cos(p.seed)*explosion+jitter;
    const y=gy*(1-blend)+py*blend+Math.sin(p.seed)*explosion;
    const galaxyAlpha=(.34+.65*(.5+.5*Math.sin(p.seed+time*p.speed)))*(1-Math.hypot(p.gx,p.gz)*.3);
    const portraitAlpha=Math.min(1,Math.pow(p.lum,.55)*1.3)*p.edge;
    ctx.globalAlpha=Math.max(.02,galaxyAlpha*(1-blend)+portraitAlpha*blend);
    const light=255,green=Math.round(202+blend*28),blue=Math.round(227+blend*13);
    ctx.fillStyle=`rgb(${light},${green},${blue})`;
    const size=p.size*(1-blend)+(portraitWidth/132)*.82*blend;
    ctx.fillRect(x,y,size*(1+blend*.28),Math.max(.65,size*(.8-blend*.35)));
  }
  if(blend<.9){ctx.save();ctx.globalAlpha=Math.sin(Math.PI*blend)*.45;ctx.font='11px Georgia';ctx.fillStyle='#f9d9e4';ctx.textAlign='center';for(let i=0;i<phrases.length;i++){const a=i/phrases.length*Math.PI*2+rotation*.5;ctx.fillText(phrases[i],cx+Math.cos(a)*radius*.85,cy+Math.sin(a)*radius*.5+radius*.35);}ctx.restore();}
  ctx.globalAlpha=1;
  if(flash>0){flash=Math.max(0,flash-dt*.7);ctx.fillStyle=`rgba(255,210,230,${Math.sin(flash*Math.PI)*.055})`;ctx.fillRect(0,0,W,H);}
  raf=requestAnimationFrame(draw);
}
$('#save').addEventListener('click',()=>{
  if(!imageReady){toast('Фото ещё загружается…');return;}
  const out=document.createElement('canvas');out.width=1080;out.height=1440;const c=out.getContext('2d');c.fillStyle='#180e18';c.fillRect(0,0,out.width,out.height);
  const sw=portraitImage.height*.795,sx=(portraitImage.width-sw)*.92;const temp=document.createElement('canvas');temp.width=180;temp.height=226;const t=temp.getContext('2d');t.drawImage(portraitImage,sx,0,sw,portraitImage.height,0,0,180,226);const data=t.getImageData(0,0,180,226).data;
  for(let y=0;y<226;y++)for(let x=0;x<180;x++){const i=(y*180+x)*4,l=(data[i]*.299+data[i+1]*.587+data[i+2]*.114)/255;if(l<.065)continue;const edge=Math.min(1,Math.min(x,179-x)/14)*Math.min(1,Math.min(y,225-y)/12);c.fillStyle=`rgba(255,230,240,${Math.min(1,Math.pow(l,.55)*1.3)*edge})`;c.fillRect(130+x*4.56,90+y*4.56,3.8,2.2);}
  c.textAlign='center';c.fillStyle='#f8e3eb';c.font='italic 62px Georgia';c.fillText(CONFIG.name,540,1210);c.font='26px Georgia';c.fillStyle='#d1a7b8';c.fillText('Я тебя люблю на всех языках мира',540,1270);c.font='26px Georgia';c.fillText('♥',540,1340);
  out.toBlob(blob=>{if(!blob){toast('Попробуй сохранить ещё раз');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Твоя-вселенная.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('Твой звёздный портрет сохранён ♥');},'image/png');
});

