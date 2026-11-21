/* All homepage text, images and lists (logos, steps, pricing, testimonials, FAQ…) are written
   into the HTML by _build/build.py from _build/content.json, which the CMS at /admin/ edits.
   This file only adds the interactions. */

/* ---------- Helpers ---------- */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* One answer open at a time */
document.querySelectorAll('.q-top').forEach(b=>b.onclick=()=>{
  const q=b.parentElement, open=q.classList.contains('open');
  document.querySelectorAll('.q.open').forEach(o=>{o.classList.remove('open');o.querySelector('.q-top').setAttribute('aria-expanded','false')});
  if(!open){q.classList.add('open');b.setAttribute('aria-expanded','true')}
});

/* Split headings into words for reveal */
document.querySelectorAll('.reveal').forEach(h=>{
  const words=h.innerHTML.trim().split(/\s+/);
  h.innerHTML=words.map((w,i)=>w==='<br>'?'<br>':`<span class="w"><span style="transition-delay:${i*0.05}s">${w}</span></span>`).join(' ');
});

/* ---------- Forms (show a thank-you; nothing is sent yet) ---------- */
[['newsForm','newsToast'],['contactForm','contactToast']].forEach(([f,t])=>{
  if($(f))$(f).addEventListener('submit',e=>{e.preventDefault();e.target.reset();const el=$(t);el.classList.add('on');setTimeout(()=>el.classList.remove('on'),3000)});
});

/* ---------- Nav ---------- */
const nav=$('nav');
$('navToggle').onclick=()=>nav.classList.toggle('open');
nav.querySelectorAll('.nav-body a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
document.addEventListener('click',e=>{if(!nav.contains(e.target))nav.classList.remove('open')});

/* ---------- Scroll reveal ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  e.target.classList.add('in'); io.unobserve(e.target);
}),{threshold:.15,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.fade,.reveal,.wordmark').forEach(el=>io.observe(el));

/* ---------- Smooth scroll (Lenis-style lerp) + parallax ---------- */
const pars=[...document.querySelectorAll('.par')];
let cur=scrollY, target=scrollY, smooth=matchMedia('(pointer:fine)').matches && !reduced;
function scrollToY(y){
  y=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,y));
  if(smooth){target=y}else{window.scrollTo({top:y,behavior:reduced?'auto':'smooth'})}
}
(function onFrame(){
  pars.forEach(p=>{
    const r=p.parentElement.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight)return;
    p.style.translate=`0 ${(r.top+r.height/2-innerHeight/2)/innerHeight*-6}%`;
  });
  requestAnimationFrame(onFrame);
})();
if(smooth){
  window.addEventListener('wheel',e=>{
    if(e.ctrlKey||nav.contains(e.target))return;
    if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
    e.preventDefault();
    target=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,target+e.deltaY));
  },{passive:false});
  window.addEventListener('scroll',()=>{if(Math.abs(scrollY-cur)>2){cur=target=scrollY}});
  (function loop(){
    cur+=(target-cur)*0.1;
    if(Math.abs(target-cur)>0.5) window.scrollTo(0,cur); else cur=target;
    requestAnimationFrame(loop);
  })();
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href'); if(id.length<2)return;
  const el=document.querySelector(id); if(!el)return;
  e.preventDefault(); scrollToY(el.getBoundingClientRect().top+scrollY);
}));

/* ---------- Process: sticky stacking step cards ----------
   Cards stick and stack as you scroll; the step list on the left follows along and
   jumps to a step when clicked. Each card's picture settles from 110% to 100%. */
(function(){
  const wrap=$('prCards'); if(!wrap)return;
  const cards=[...wrap.querySelectorAll('.pr-card')], arts=cards.map(c=>c.querySelector('.pr-art'));
  const btns=[...document.querySelectorAll('#prNav button')];
  let active=-1;
  const metrics=()=>{
    const cs=getComputedStyle(cards[0]);
    return {stick:parseFloat(cs.top)||0, step:cards[0].offsetHeight+(parseFloat(cs.marginBottom)||0), top:wrap.getBoundingClientRect().top};
  };
  function update(){
    const m=metrics();
    let a=Math.floor((m.stick-m.top)/m.step+0.5); a=Math.max(0,Math.min(cards.length-1,a));
    if(a!==active){active=a;btns.forEach((b,i)=>{b.classList.toggle('on',i===a);b.setAttribute('aria-current',i===a?'step':'false')})}
    if(!reduced) cards.forEach((c,i)=>{
      const y=m.top+i*m.step;                        // where this card sits before it sticks
      const p=Math.max(0,Math.min(1,(y-m.stick)/Math.max(1,innerHeight-m.stick)));
      arts[i].style.transform=`scale(${(1+0.1*p).toFixed(4)})`;
    });
    else arts.forEach(a=>a.style.transform='none');
  }
  btns.forEach((b,i)=>b.addEventListener('click',()=>{
    const m=metrics(); scrollToY(m.top+scrollY+i*m.step-m.stick+1);
  }));
  addEventListener('scroll',update,{passive:true}); addEventListener('resize',update); update();
})();

/* ---------- Testimonials carousel ----------
   Infinite loop: the slides are copied once before and once after, and after each move
   the track jumps back to the matching real slide without animation, so it never ends.
   Centred slide with neighbours peeking in, arrows, drag/swipe and keyboard. */
(function(){
  const track=$('tTrack'); if(!track)return;
  const view=$('tView'), prev=$('tPrev'), next=$('tNext');
  const real=[...track.children], n=real.length; if(!n)return;
  const loop=n>1;
  if(loop){
    const copy=s=>{const c=s.cloneNode(true);c.setAttribute('aria-hidden','true');c.dataset.clone='1';return c};
    real.slice().reverse().forEach(s=>track.insertBefore(copy(s),track.firstChild));
    real.forEach(s=>track.appendChild(copy(s)));
  }
  const slides=[...track.children];
  slides.forEach(s=>s.querySelectorAll('img').forEach(i=>i.loading='eager'));
  const off=loop?n:0;                       // index of the first real slide
  let idx=off+Math.min(1,n-1), base=0, busy=false;
  function layout(){
    const W=view.clientWidth, w=Math.min(872, W<=700?W-40:W*0.62), gap=W<=700?12:55;   // Figma: 872px cards, 55px apart
    view.style.setProperty('--tw',w+'px'); view.style.setProperty('--tgap',gap+'px');
    return {W,w,gap};
  }
  function place(instant){
    const {W,w,gap}=layout();
    base=W/2-(idx*(w+gap)+w/2);
    track.classList.toggle('nt',!!instant||reduced);
    track.style.transform=`translate3d(${base}px,0,0)`;
    slides.forEach((s,k)=>{const on=k===idx;s.classList.toggle('on',on);s.setAttribute('aria-hidden',on?'false':'true')});
  }
  function settle(){                       // jump from a copy back to the real slide, invisibly
    if(!loop)return;
    if(idx<off||idx>=off+n){idx=off+((idx-off)%n+n)%n;place(true);void track.offsetWidth}
    busy=false;
  }
  function go(i,instant){
    if(!loop){idx=Math.max(0,Math.min(n-1,i));place(instant);prev.disabled=idx===0;next.disabled=idx===n-1;return}
    if(idx<off||idx>=off+n){const d=i-idx;clearTimeout(go.t);settle();i=idx+d}   // fast clicks: hop back to the real set first
    idx=Math.max(0,Math.min(slides.length-1,i));
    place(instant);
    if(instant||reduced){settle()}else{busy=true;clearTimeout(go.t);go.t=setTimeout(settle,1050)}
  }
  track.addEventListener('transitionend',e=>{if(e.target===track&&e.propertyName==='transform'){clearTimeout(go.t);settle()}});
  prev.onclick=()=>go(idx-1); next.onclick=()=>go(idx+1);
  slides.forEach((s,k)=>s.addEventListener('click',()=>{if(!moved&&k!==idx)go(k)}));
  view.tabIndex=0;
  view.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){go(idx-1);e.preventDefault()}if(e.key==='ArrowRight'){go(idx+1);e.preventDefault()}});
  /* drag / swipe */
  let down=false, sx=0, sy=0, dx=0, moved=false, horiz=null;
  view.addEventListener('pointerdown',e=>{if(e.button!==0)return;if(busy){clearTimeout(go.t);settle()}down=true;moved=false;horiz=null;sx=e.clientX;sy=e.clientY;dx=0});
  addEventListener('pointermove',e=>{
    if(!down)return; dx=e.clientX-sx; const dy=e.clientY-sy;
    if(horiz===null&&(Math.abs(dx)>6||Math.abs(dy)>6)){horiz=Math.abs(dx)>Math.abs(dy); if(horiz){view.classList.add('drag');track.classList.add('nt')}}
    if(!horiz)return; moved=true;
    const edge=!loop&&((idx===0&&dx>0)||(idx===n-1&&dx<0));
    track.style.transform=`translate3d(${base+dx*(edge?.35:1)}px,0,0)`;
  });
  addEventListener('pointerup',()=>{
    if(!down)return; down=false; view.classList.remove('drag');
    if(horiz){const {w}=layout(); const th=Math.min(80,w*.12); go(dx<-th?idx+1:dx>th?idx-1:idx)}
    setTimeout(()=>moved=false,0);
  });
  addEventListener('resize',()=>go(idx,true));
  go(idx,true);
})();

/* ---------- Moving wave backgrounds (hero + comparison card) ----------
   Edit the numbers in WAVES to change each effect.
   height: where the wave sits (0 = bottom, 1 = top) · hills: how wavy · speed: animation speed (0 = frozen)
   softness: how blurry the edge is · glow: lighter band inside the wave (0 = none)
   light1 → light2: sky colours, left to right · dark1 → dark2: wave colours, left to right · mouse: cursor reaction
   Text always sits on top and is never affected. */
const WAVES={
  hero:   {height:0.42, hills:1.85, speed:0.90, softness:0.16, glow:0.30, light1:'#b9c3ae', light2:'#ecc38c', dark1:'#e8823e', dark2:'#c9502a', mouse:true},
  compare:{height:0.36, hills:1.40, speed:0.70, softness:0.18, glow:0.30, light1:'#e2915c', light2:'#cfd3bd', dark1:'#d5481c', dark2:'#d6ab84', mouse:false},
};
(function(){
  const still=reduced;
  const fs=`precision highp float;uniform vec2 r;uniform float t,H,A,E,L;uniform vec2 m;uniform vec3 W1,W2,D1,D2;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  void main(){vec2 uv=gl_FragCoord.xy/r;float x=uv.x*(r.x/r.y);
    float b=H+A*(.11*sin(x*2.2+t*.35)+.06*sin(x*4.1-t*.27+1.3)+.035*sin(x*7.3+t*.5)+.05*(n(vec2(x*1.2,t*.15))-.5))+(m.y-.5)*.04*sin(x*3.+m.x*3.);
    float wave=1.-smoothstep(-E*.9,E*1.1,uv.y-b);
    float b2=b-.24+.06*sin(x*2.7-t*.3+2.);
    float lift=1.-smoothstep(-.25,.12,uv.y-b2);
    float sx=smoothstep(0.,1.,uv.x+.08*sin(uv.y*3.+t*.2));
    vec3 W=mix(W1,W2,sx); W=mix(W,vec3(.98,.95,.9),.25*smoothstep(.55,1.,uv.y));
    vec3 D=mix(D1,D2,sx); D=mix(D,mix(D,W2,.55),lift*L);
    vec3 col=mix(W,D,wave);
    col+=(h(gl_FragCoord.xy+fract(t))-.5)/255.;    // tiny dither: hides colour banding in the smooth gradient
    gl_FragColor=vec4(col,1.);}`;
  const hex=h=>[1,3,5].map(k=>parseInt(h.substr(k,2),16)/255);
  let tx=.5,ty=.5; addEventListener('mousemove',e=>{tx=e.clientX/innerWidth;ty=e.clientY/innerHeight});
  document.querySelectorAll('canvas.wave').forEach(c=>{
    const cfg=WAVES[c.dataset.wave]; if(!cfg)return;
    const gl=c.getContext('webgl',{antialias:false,premultipliedAlpha:false});
    if(!gl){c.remove();return}                         // the CSS background image shows instead
    const sh=(ty,src)=>{const o=gl.createShader(ty);gl.shaderSource(o,src);gl.compileShader(o);return o};
    const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}'));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)){c.remove();return}
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const lo=gl.getAttribLocation(p,'p');gl.enableVertexAttribArray(lo);gl.vertexAttribPointer(lo,2,gl.FLOAT,false,0,0);
    const U={};['r','t','H','A','E','L','m','W1','W2','D1','D2'].forEach(k=>U[k]=gl.getUniformLocation(p,k));
    gl.uniform3fv(U.W1,hex(cfg.light1));gl.uniform3fv(U.W2,hex(cfg.light2));gl.uniform3fv(U.D1,hex(cfg.dark1));gl.uniform3fv(U.D2,hex(cfg.dark2));
    function size(){const d=Math.min(devicePixelRatio,1.5);c.width=Math.max(1,c.clientWidth*d);c.height=Math.max(1,c.clientHeight*d);gl.viewport(0,0,c.width,c.height)}
    addEventListener('resize',size);size();
    let on=true; new IntersectionObserver(es=>{on=es[0].isIntersecting}).observe(c);   // only animate while visible
    let mx=.5,my=.5,T=8,last=performance.now();
    (function draw(now){
      const dt=(now-last)/1000;last=now;
      if(on){
        T+=dt*(still?0:cfg.speed);
        if(cfg.mouse){mx+=(tx-mx)*.04;my+=(ty-my)*.04}
        gl.uniform2f(U.r,c.width,c.height);gl.uniform1f(U.t,T);
        gl.uniform1f(U.H,cfg.height);gl.uniform1f(U.A,cfg.hills);gl.uniform1f(U.E,cfg.softness);gl.uniform1f(U.L,cfg.glow);
        gl.uniform2f(U.m,mx,my);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      }
      requestAnimationFrame(draw);
    })(performance.now());
  });
})();

/* ---------- Hero: background card shrinks + zooms out as you scroll away ---------- */
(function(){
  const hero=document.querySelector('.hero'); if(!hero||reduced)return;
  let last=-1;
  const hh=()=>hero.style.setProperty('--hh',hero.offsetHeight+'px'); hh(); addEventListener('resize',hh);
  (function tick(){
    const p=Math.max(0,Math.min(1,scrollY/(hero.offsetHeight*0.5)));
    const e=p*p*(3-2*p);                             // ease in-out
    if(Math.abs(e-last)>.0005){hero.style.setProperty('--hp',e.toFixed(4));last=e}
    requestAnimationFrame(tick);
  })();
})();

/* ---------- News ticker (hero announcement) ----------
   Repeats the message to fill the pill twice over, then scrolls it at 20px per second. */
(function(){
  const track=$('newsTrack'); if(!track)return;
  const item=track.firstElementChild, box=track.parentElement;
  function fill(){
    track.querySelectorAll('[aria-hidden]').forEach(n=>n.remove());
    const w=item.offsetWidth; if(!w)return;
    const per=Math.ceil(box.clientWidth/w)+1;            // copies in one half
    for(let i=1;i<per*2;i++){const c=item.cloneNode(true);c.setAttribute('aria-hidden','true');c.querySelectorAll('a').forEach(a=>a.tabIndex=-1);track.appendChild(c)}
    track.style.setProperty('--nd',(w*per/20)+'s');
  }
  fill(); addEventListener('resize',fill);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fill);
})();

/* ---------- Parallax gallery (between pricing and testimonials) ----------
   Each card has a depth (data-d): it sets the card's size and speed, so closer cards move faster.
   data-y places the card vertically (0 = top, 1 = bottom). Scrolling gives a small push and a
   slight vertical parallax. Pauses while off screen; stands still with reduced motion. */
(()=>{
  const box=$('pgal'); if(!box)return;
  const sec=box.parentElement, AR=.8, GAP=1.22;                    // every card is portrait 4:5 so the row reads as one set
  const src=[...box.children];
  let items=[], span=0, on=false, last=0, boost=0, lastY=scrollY;
  function build(vw){
    // enough cards to fill wide screens: repeat the set until it covers ~1.6 screens
    box.querySelectorAll('[data-clone]').forEach(n=>n.remove());
    const H=box.clientHeight, unit=Math.min(H*.44,vw*.34);
    const one=src.reduce((s,el)=>s+unit*(+el.dataset.d||1)*AR*GAP,0);
    const copies=Math.max(1,Math.ceil(vw*1.6/one));
    const els=[...src];
    for(let c=1;c<copies;c++)src.forEach(el=>{const n=el.cloneNode(true);n.dataset.clone='1';n.setAttribute('aria-hidden','true');n.querySelector('img').alt='';box.appendChild(n);els.push(n)});
    items=els.map((el,i)=>({el,i,d:+el.dataset.d||1,y:+el.dataset.y||.5,x:0}));
    let x=0;
    items.forEach(it=>{
      it.h=unit*it.d; it.w=it.h*AR; it.top=(H-it.h)*it.y;
      Object.assign(it.el.style,{width:it.w+'px',height:it.h+'px',zIndex:Math.round(it.d*100)});
      it.x=x; x+=it.w*GAP;                                // a small gap between neighbours
    });
    span=Math.max(x, vw+Math.max(...items.map(i=>i.w))+40);
    draw();
  }
  // the section's position on the page is measured once (and again when the page resizes),
  // not every frame: reading layout every frame while the page scrolls makes scrolling heavy
  let secMid=0;
  const measure=()=>{const r=box.getBoundingClientRect(); secMid=r.top+scrollY+r.height/2};
  new ResizeObserver(measure).observe(document.body);
  function draw(){
    const off=secMid-scrollY-innerHeight/2;
    items.forEach(it=>{
      const ty=-off*(it.d-.9)*.16;
      it.el.style.transform=`translate3d(${it.x.toFixed(1)}px,${(it.top+ty).toFixed(1)}px,0)`;
    });
  }
  function frame(t){
    if(!on){last=0;return}
    const dt=last?Math.min((t-last)/1000,.05):0; last=t;
    const v=Math.abs(scrollY-lastY); lastY=scrollY;
    boost+=(Math.min(v*6,260)-boost)*.08;               // scrolling speeds the drift up a little
    const speed=reduced?0:30+boost;
    items.forEach(it=>{it.x-=speed*it.d*dt; if(it.x<-it.w-20)it.x+=span});
    draw(); requestAnimationFrame(frame);
  }
  new IntersectionObserver(es=>{const was=on; on=es[0].isIntersecting; if(on){sec.classList.add('on'); if(!was)requestAnimationFrame(frame)}},{rootMargin:'100px 0px'}).observe(sec);
  let lw=0; const fit=()=>{measure(); const vw=box.clientWidth; if(Math.abs(vw-lw)<2)return; lw=vw; build(vw)};
  fit(); addEventListener('resize',fit);
})();

/* ---------- Page transition into a project (ONTO-style) ----------
   Clicking a project card does not switch pages straight away. A copy of the card's picture is laid
   exactly over the card (same crop and zoom), then grows to exactly where the project's cover sits on
   the project page, while the rest of the page zooms away around it (the menu stays put). Only then
   does the project page load, with its cover in that same spot, so the change of page is invisible;
   its title fades in (styles: "Page transition" in css/style.css). The project page is fetched
   on hover so it is ready. With reduced motion it is shorter and the page doesn't zoom. Skipped for modifier-clicks (new tab etc.). */
(()=>{
  const DUR=reduced?650:1150, EASE='cubic-bezier(.76,0,.2,1)';
  const sel='a.proj[href^="/projects/"],a.wk-card[href^="/projects/"]';
  const fetched=new Map();
  // load the project page early (fetch works in every browser, incl. Safari) so it opens instantly
  const prefetch=a=>{const u=a.getAttribute('href'); if(fetched.has(u))return fetched.get(u);
    const p=fetch(u,{credentials:'same-origin'}).then(r=>r.text()).catch(()=>{}); fetched.set(u,p); return p};
  document.addEventListener('pointerover',e=>{const a=e.target.closest(sel); if(a)prefetch(a)});
  document.addEventListener('touchstart',e=>{const a=e.target.closest(sel); if(a)prefetch(a)},{passive:true});

  // where the cover sits on a project page: --pj-cover-top (css/style.css) + .pj-cover (css/pages.css)
  function coverRect(){
    const vw=document.documentElement.clientWidth, mob=vw<=700;
    const pad=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad'))||61;
    const probe=document.createElement('div'); probe.style.cssText='position:absolute;visibility:hidden;height:var(--pj-cover-top)';
    document.body.appendChild(probe); const top=probe.offsetHeight; probe.remove();
    const w=vw-2*pad; return {left:pad, top, width:w, height:mob?w*1.25:w*9/16};
  }
  let running=null;
  function reset(){
    if(!running)return;
    running.anims.forEach(a=>a.cancel()); running.fly.remove(); running.card.style.visibility='';
    document.documentElement.classList.remove('vt-busy'); running=null;
  }
  addEventListener('pageshow',reset);           // back button: put everything back

  document.addEventListener('click',e=>{
    const a=e.target.closest(sel);
    if(!a||running||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const img=a.querySelector('.img'); if(!img)return;
    e.preventDefault(); const loaded=prefetch(a);
    try{
    const url=a.getAttribute('href');
    const c=a.getBoundingClientRect(), ir=img.getBoundingClientRect(), t=coverRect();
    const cs=getComputedStyle(a), radius=cs.borderTopLeftRadius;

    // the flying picture: an outer frame (crop + rounded corners) with the image inside it
    const fly=document.createElement('div'); fly.className='vt-fly';
    fly.style.cssText=`position:fixed;left:0;top:0;width:${c.width}px;height:${c.height}px;transform:translate(${c.left}px,${c.top}px);border-radius:${radius};overflow:hidden;z-index:45;background:#ddd;pointer-events:none`;   // 45: under the menu (50)
    const pic=document.createElement('div');
    pic.style.cssText=`position:absolute;left:${ir.left-c.left}px;top:${ir.top-c.top}px;width:${ir.width}px;height:${ir.height}px;background:${getComputedStyle(img).backgroundImage} center/cover no-repeat`;
    fly.appendChild(pic);
    // the card's dark shade and name come along and fade out as the picture starts to grow
    const after=getComputedStyle(a,'::after'), extras=[];
    if(after.backgroundImage!=='none'){const g=document.createElement('div');
      g.style.cssText=`position:absolute;left:0;right:0;bottom:0;height:${after.height};background:${after.backgroundImage}`;fly.appendChild(g);extras.push(g)}
    const meta=a.querySelector('.meta'); if(meta){const m=meta.cloneNode(true);const mr=meta.getBoundingClientRect();
      m.style.cssText+=`;position:absolute;margin:0;left:${mr.left-c.left}px;top:${mr.top-c.top}px;width:${mr.width}px;right:auto;bottom:auto`;fly.appendChild(m);extras.push(m)}
    document.body.appendChild(fly);
    a.style.visibility='hidden';
    document.documentElement.classList.add('vt-busy');

    const anims=[];
    const opts={duration:DUR,easing:EASE,fill:'forwards'};
    anims.push(fly.animate([
      {width:c.width+'px',height:c.height+'px',transform:`translate(${c.left}px,${c.top}px)`},
      {width:t.width+'px',height:t.height+'px',transform:`translate(${t.left}px,${t.top}px)`,borderRadius:'20px'}],opts));
    anims.push(pic.animate([
      {left:(ir.left-c.left)+'px',top:(ir.top-c.top)+'px',width:ir.width+'px',height:ir.height+'px'},
      {left:'0px',top:'0px',width:t.width+'px',height:t.height+'px'}],opts));

    extras.forEach(x=>anims.push(x.animate([{opacity:1},{opacity:0}],{duration:280,easing:'ease-out',fill:'forwards'})));

    // everything else zooms away around the card; the menu stays where it is
    const cx=c.left+c.width/2, cy=c.top+c.height/2;
    if(!reduced)[...document.body.children].forEach(el=>{
      if(el===fly||el.id==='nav'||/^(SCRIPT|STYLE|LINK)$/.test(el.tagName))return;
      const r=el.getBoundingClientRect(); if(!r.width||!r.height)return;
      el.style.transformOrigin=`${cx-r.left}px ${cy-r.top}px`;
      anims.push(el.animate([{transform:'none',opacity:1},{opacity:1,offset:.35},{transform:'scale(2.4)',opacity:0}],{duration:DUR*.85,easing:'cubic-bezier(.6,0,.4,1)',fill:'forwards'}));
    });
    running={anims,fly,card:a};
    let gone=false; const go=()=>{ if(gone)return; gone=true; location.href=url; };
    // open the project once the picture has landed AND the page is loaded (so it appears instantly);
    // on a very slow connection, stop waiting after 2.5s
    Promise.all([anims[0].finished.catch(()=>{}), Promise.race([loaded, new Promise(r=>setTimeout(r,2500))])]).then(go,go);
    }catch(err){ location.href=url; }                         // anything unexpected: just open the project
  });
})();

/* ---------- Ready (starts the hero animation) ---------- */
requestAnimationFrame(()=>document.body.classList.add('ready'));
