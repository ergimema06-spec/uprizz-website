/* Image lookup used by the lists below. Files live in /images. */
const IMGS = {"0NDss4ZK4LfbAR5If8bMXKzBg":"images/client-logo-2.jpg","3YI5ZMJHWykL7CJilFWl7N7Y":"images/tool-2.jpg","4uKZFKAgzKrLp8abxifrfuvOmwI":"images/testimonial-5-mara-silva.jpg","9Ah7ernDCt093a0kQy9yocw4U9g":"images/service-2-art-direction-a.jpg","HzfpuaiVNTJAuOCvFkp72nnBaQ":"images/tool-4.jpg","J4UMK0WsFcWZfZhWtWjArb2Zl10":"images/service-4-content-systems-a.jpg","Mebh1ArfFyG7uTRV6OES4VoQFKc":"images/service-1-brand-identity-a.jpg","NQMInMV5WAnkdNeGjam5dyfpSE0":"images/client-logo-5.jpg","NnkJQmixEc3kfDGn80kjyc0iq4":"images/service-3-motion-film-b.jpg","NzhqG7p5HhhnZRPJpLazVJLfd8":"images/tool-1.jpg","OYVVc5sceAthIw7oZZQ9HAZvq4":"images/service-1-brand-identity-b.jpg","PfC7Q8S9Yu5aBGlDbl9tnU7EF8":"images/service-4-content-systems-b.jpg","QChnPUsDPccua0Pz2jqRbRjBUQ":"images/tool-6.jpg","Ry7pigBil5jVruYMA4iW3nIAw":"images/client-logo-1.jpg","WFnux8W63LzFPOyKQoFeziDYo":"images/testimonial-4-tomas-eriksen.jpg","Y0hljgPS8SwdA7sNxU2dDV0Qc":"images/testimonial-3-aisha-rahman.jpg","aSW506EYKNiNGbpc25JlnRhfsY":"images/tool-3.jpg","bK0oB63QEr9273N12rZEVH8SXkU":"images/service-2-art-direction-b.jpg","eowOPsvYJd4n1QXKQdfMHcZABR0":"images/service-2-art-direction-c.jpg","fZPcsbH8BO0jNBtZkcAG5WM1gY":"images/tool-5.jpg","h7ZYgXS7kmmqYwWstDqmR5Fqs4":"images/client-logo-3.jpg","lOcHUc8Ig2dmZet90b9C7t1BbNE":"images/testimonial-1-lena-park.jpg","lfqdH0JH6KbxPiaviG38htCdfI":"images/client-logo-4.jpg","nhbdXu5xAv3f5wyc1TA7cvduYfY":"images/service-4-content-systems-c.jpg","oRGUNfHF453RwHfaanWKt8LYh4":"images/testimonial-2-daniel-mercer.jpg","z9dKOrXoBbVcwwOyfMAwV0O0":"images/service-3-motion-film-c.jpg","zKLyKFAL5Jv7GaGaE9YVgFPGac":"images/service-1-brand-identity-c.jpg","zn5bWiaTikvNR8c61OTlYDbvQ":"images/service-3-motion-film-a.jpg"};
const IMG = (id) => IMGS[id.split('.')[0]];

/* ---------- Data ---------- */
const logos=['Ry7pigBil5jVruYMA4iW3nIAw.svg','0NDss4ZK4LfbAR5If8bMXKzBg.svg','h7ZYgXS7kmmqYwWstDqmR5Fqs4.svg','lfqdH0JH6KbxPiaviG38htCdfI.svg','NQMInMV5WAnkdNeGjam5dyfpSE0.svg'];
const tools=['NzhqG7p5HhhnZRPJpLazVJLfd8.svg','3YI5ZMJHWykL7CJilFWl7N7Y.svg','aSW506EYKNiNGbpc25JlnRhfsY.svg','HzfpuaiVNTJAuOCvFkp72nnBaQ.svg','fZPcsbH8BO0jNBtZkcAG5WM1gY.svg','QChnPUsDPccua0Pz2jqRbRjBUQ.svg'];
const services=[
  ['A look people remember','A unique identity that makes you stand out from day one, so customers trust you before they\'ve even bought.',['Mebh1ArfFyG7uTRV6OES4VoQFKc.jpeg','OYVVc5sceAthIw7oZZQ9HAZvq4.jpeg','zKLyKFAL5Jv7GaGaE9YVgFPGac.jpeg']],
  ['A home online','A fast, mobile-first place where customers find you, get it, and buy. Easy for you to edit, no coding.',['J4UMK0WsFcWZfZhWtWjArb2Zl10.png','PfC7Q8S9Yu5aBGlDbl9tnU7EF8.png','nhbdXu5xAv3f5wyc1TA7cvduYfY.png']],
  ['Ready for socials','Everything you need to post, share and grow on Instagram and TikTok, from day one.',['9Ah7ernDCt093a0kQy9yocw4U9g.jpg','bK0oB63QEr9273N12rZEVH8SXkU.jpg','eowOPsvYJd4n1QXKQdfMHcZABR0.jpg']],
  ['Launch support &amp; 100% yours','We help you go live, not just hand over files. Full ownership, no strings, no royalties.',['zn5bWiaTikvNR8c61OTlYDbvQ.jpg','NnkJQmixEc3kfDGn80kjyc0iq4.jpg','z9dKOrXoBbVcwwOyfMAwV0O0.jpg']],
];
/* Placeholder reviews: replace each quote, name and business with a real customer review before going live. */
const testimonials=[
  ['[Name], 22','Founder of [Business] · Launch','lOcHUc8Ig2dmZet90b9C7t1BbNE.jpg','I had the idea for two years. uprizz made it real in a weekend.'],
  ['[Name], 25','Founder of [Business] · Starter','oRGUNfHF453RwHfaanWKt8LYh4.jpg','Agencies quoted me €4k. This cost less than my phone and looks better than my competitors.'],
  ['[Name], 19','Founder of [Business] · Empire','Y0hljgPS8SwdA7sNxU2dDV0Qc.jpg','My first customer said, \'Wow, you guys look established.\' We\'d launched that morning.'],
];
const faqs=[
  ['Is 48 hours real?','Yep. The clock starts once we have your brief. Most orders land in 40–48 hours. Need it faster? Add 24h express at checkout.'],
  ['Why is it so cheap compared to agencies?','No fancy office, no 6-week discovery phase, no account managers. A focused process and a team that does this every day. You pay for design, not overhead.'],
  ['I only have an idea, no business yet. Is that okay?','That\'s exactly who we\'re for. Tell us the idea and who it\'s for. We\'ll help with the rest, including the name if you need one.'],
  ['What if I don\'t like the designs?','We revise until you do. If we still can\'t get it right, you get your money back.'],
  ['Do I own everything?','100%. Every design, every file, all yours, forever. No royalties, no monthly fees.'],
  ['Which platform do you build on?','[Framer / Webflow / Shopify / WordPress]. We set it up so you can edit text and photos yourself, no coding.'],
  ['Do you use AI?','Real designers work on every project. We use tools to move fast, never to replace taste.'],
  ['Do you include a domain and hosting?','We\'ll connect your domain and set up hosting. Add the domain + hosting setup add-on if you want us to handle the purchase too.'],
];

/* ---------- Build ---------- */
const $=id=>document.getElementById(id);
const lt=$('logoTrack');
if(lt)lt.innerHTML=[...logos,...logos,...logos,...logos].map(l=>`<div class="logo-card"><img src="${IMG(l)}" alt=""></div>`).join('');
const tt=$('toolTrack');
if(tt)tt.innerHTML=[...tools,...tools,...tools,...tools].map(l=>`<div class="tool"><img src="${IMG(l)}" alt=""></div>`).join('');

if($('svcList'))$('svcList').innerHTML=services.map((s,i)=>`
  <div class="svc fade ${i%2?'alt':''}">
    <div class="num">0${i+1}</div>
    <div class="stack">${s[2].map((im,j)=>`<div class="img ${'abc'[j]}" style="background-image:url(${IMG(im,512)})"></div>`).join('')}</div>
    <div class="txt"><h3>${s[0]}</h3><p>${s[1]}</p></div>
  </div>`).join('');

if($('faqList'))$('faqList').innerHTML=faqs.map(f=>`
  <div class="q fade"><button type="button"><span>${f[0]}</span><span class="pl"></span></button><div class="a"><div><p>${f[1]}</p></div></div></div>`).join('');
document.querySelectorAll('.q button').forEach(b=>b.onclick=()=>{
  const q=b.parentElement, open=q.classList.contains('open');
  document.querySelectorAll('.q.open').forEach(o=>o.classList.remove('open'));
  if(!open) q.classList.add('open');
});

/* Counters */
document.querySelectorAll('.counter').forEach(c=>{
  const to=c.dataset.to;
  c.innerHTML=[...to].map(d=>`<span class="digit"><span class="col" data-d="${d}">${Array.from({length:30},(_,k)=>`<span>${k%10}</span>`).join('')}</span></span>`).join('')+`<sup>${c.dataset.suffix||'%'}</sup>`;
});

/* Split headings into words for reveal */
document.querySelectorAll('.reveal').forEach(h=>{
  const words=h.innerHTML.trim().split(/\s+/);
  h.innerHTML=words.map((w,i)=>w==='<br>'?'<br>':`<span class="w"><span style="transition-delay:${i*0.05}s">${w}</span></span>`).join(' ');
});

/* ---------- Testimonials ---------- */
if($('people')){
const ppl=document.getElementById('people'), qText=document.getElementById('qText'), qBar=document.getElementById('qBar');
ppl.innerHTML=testimonials.map((t,i)=>`<div class="pp" data-i="${i}"><img src="${IMG(t[2],128)}" alt=""><div class="who2">${t[0]}<small>${t[1]}</small></div></div>`).join('');
let qi=0, qTimer;
function showQ(i){
  qi=i; qText.classList.add('hide');
  setTimeout(()=>{qText.textContent='“'+testimonials[i][3]+'”';qText.classList.remove('hide')},350);
  ppl.querySelectorAll('.pp').forEach((p,k)=>p.classList.toggle('on',k===i));
  qBar.style.transition='none';qBar.style.width='0';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{qBar.style.transition='width 6s linear';qBar.style.width='100%'}));
  clearTimeout(qTimer); qTimer=setTimeout(()=>showQ((qi+1)%testimonials.length),6000);
}
ppl.querySelectorAll('.pp').forEach(p=>p.onclick=()=>showQ(+p.dataset.i));
showQ(0);
}

/* ---------- Forms ---------- */
[['newsForm','newsToast'],['contactForm','contactToast']].forEach(([f,t])=>{
  if($(f))$(f).addEventListener('submit',e=>{e.preventDefault();e.target.reset();const el=document.getElementById(t);el.classList.add('on');setTimeout(()=>el.classList.remove('on'),3000)});
});

/* ---------- Nav ---------- */
const nav=document.getElementById('nav');
document.getElementById('navToggle').onclick=()=>nav.classList.toggle('open');
nav.querySelectorAll('.nav-body a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
document.addEventListener('click',e=>{if(!nav.contains(e.target))nav.classList.remove('open')});

/* ---------- Sticky launch offer (shows after the hero) ---------- */
const offer=document.getElementById('offer');
if(offer){const tick=()=>offer.classList.toggle('on',scrollY>innerHeight*.6);addEventListener('scroll',tick,{passive:true});tick();}

/* ---------- Scroll reveal ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  const el=e.target; el.classList.add('in');
  el.querySelectorAll('.digit .col').forEach((col,k)=>{const d=+col.dataset.d;col.style.transitionDelay=(k*0.12)+'s';col.style.transform=`translateY(-${(20+d)*(100/30)}%)`});
  io.unobserve(el);
}),{threshold:.15,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.fade,.reveal,.wordmark').forEach(el=>io.observe(el));

/* ---------- Smooth scroll (Lenis-style lerp) + parallax ---------- */
const pars=[...document.querySelectorAll('.par')];
let cur=scrollY, target=scrollY, smooth=matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
function onFrame(){
  pars.forEach(p=>{
    const r=p.parentElement.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight)return;
    const prog=(r.top+r.height/2-innerHeight/2)/innerHeight;
    p.style.translate=`0 ${prog*-6}%`;
  });
  requestAnimationFrame(onFrame);
}
requestAnimationFrame(onFrame);
if(smooth){
  window.addEventListener('wheel',e=>{
    if(e.ctrlKey||nav.contains(e.target))return;
    e.preventDefault();
    target=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,target+e.deltaY));
  },{passive:false});
  window.addEventListener('scroll',()=>{if(Math.abs(scrollY-cur)>2){cur=target=scrollY}});
  (function loop(){
    cur+= (target-cur)*0.1;
    if(Math.abs(target-cur)>0.5) window.scrollTo(0,cur); else cur=target;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href'); if(id.length<2)return;
    const el=document.querySelector(id); if(!el)return;
    e.preventDefault(); target=Math.min(el.getBoundingClientRect().top+scrollY,document.documentElement.scrollHeight-innerHeight);
  }));
}

/* ---------- Grain shader hero ---------- */
(function(){
  const c=document.getElementById('gl'); if(!c)return; const gl=c.getContext('webgl');
  if(!gl){c.style.background='linear-gradient(#f5f5f5 45%,#111 70%,#555)';return}
  const vs=`attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
  const fs=`precision highp float;uniform vec2 r;uniform float t;uniform vec2 m;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  void main(){
    vec2 uv=gl_FragCoord.xy/r; float x=uv.x*(r.x/r.y);
    float b=.47+.11*sin(x*2.2+t*.35)+.06*sin(x*4.1-t*.27+1.3)+.035*sin(x*7.3+t*.5)+.05*(n(vec2(x*1.2,t*.15))-.5)+ (m.y-.5)*.04*sin(x*3.+m.x*3.);
    float g=h(gl_FragCoord.xy+fract(t*7.)*100.);
    float d=uv.y-b+(g-.5)*.075;
    float dark=1.-smoothstep(-.07,.09,d);
    float b2=b-.24+.06*sin(x*2.7-t*.3+2.);
    float lift=1.-smoothstep(-.25,.12,uv.y-b2+(g-.5)*.12);
    float col=mix(.05,.42,lift);
    col=mix(.962,col,dark);
    col+=(g-.5)*.06*dark;
    gl_FragColor=vec4(vec3(col),1.);
  }`;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const uR=gl.getUniformLocation(pr,'r'),uT=gl.getUniformLocation(pr,'t'),uM=gl.getUniformLocation(pr,'m');
  let mx=.5,my=.5,tmx=.5,tmy=.5;
  addEventListener('mousemove',e=>{tmx=e.clientX/innerWidth;tmy=e.clientY/innerHeight});
  function size(){const d=Math.min(devicePixelRatio,1.5);c.width=c.clientWidth*d;c.height=c.clientHeight*d;gl.viewport(0,0,c.width,c.height)}
  addEventListener('resize',size);size();
  const t0=performance.now();
  (function draw(){
    if(scrollY<innerHeight*1.2){
      mx+=(tmx-mx)*.04;my+=(tmy-my)*.04;
      gl.uniform2f(uR,c.width,c.height);gl.uniform1f(uT,(performance.now()-t0)/1000);gl.uniform2f(uM,mx,my);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }
    requestAnimationFrame(draw);
  })();
})();

/* ---------- Preloader ---------- */
let revealed=false;
function reveal(){
  if(revealed)return;revealed=true;
  const l=document.getElementById('loader'); if(!l){document.body.classList.add('ready');return}
  l.classList.add('out');
  document.body.classList.remove('loading');
  setTimeout(()=>document.body.classList.add('ready'),250);
  setTimeout(()=>l.remove(),1300);
}
/* Pages without a loading screen start straight away; pages that still have one keep the delay */
if(document.getElementById('loader')){
  window.addEventListener('load',()=>setTimeout(reveal,1400));
  setTimeout(reveal,4000);
}else{
  reveal();
}
