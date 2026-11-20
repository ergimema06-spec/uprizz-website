/* Image lookup used by the lists below. Files live in /images. */
const IMGS = {"0NDss4ZK4LfbAR5If8bMXKzBg":"images/client-logo-2.jpg","3YI5ZMJHWykL7CJilFWl7N7Y":"images/tool-2.jpg","4uKZFKAgzKrLp8abxifrfuvOmwI":"images/testimonial-5-mara-silva.jpg","9Ah7ernDCt093a0kQy9yocw4U9g":"images/service-2-art-direction-a.jpg","HzfpuaiVNTJAuOCvFkp72nnBaQ":"images/tool-4.jpg","J4UMK0WsFcWZfZhWtWjArb2Zl10":"images/service-4-content-systems-a.jpg","Mebh1ArfFyG7uTRV6OES4VoQFKc":"images/service-1-brand-identity-a.jpg","NQMInMV5WAnkdNeGjam5dyfpSE0":"images/client-logo-5.jpg","NnkJQmixEc3kfDGn80kjyc0iq4":"images/service-3-motion-film-b.jpg","NzhqG7p5HhhnZRPJpLazVJLfd8":"images/tool-1.jpg","OYVVc5sceAthIw7oZZQ9HAZvq4":"images/service-1-brand-identity-b.jpg","PfC7Q8S9Yu5aBGlDbl9tnU7EF8":"images/service-4-content-systems-b.jpg","QChnPUsDPccua0Pz2jqRbRjBUQ":"images/tool-6.jpg","Ry7pigBil5jVruYMA4iW3nIAw":"images/client-logo-1.jpg","WFnux8W63LzFPOyKQoFeziDYo":"images/testimonial-4-tomas-eriksen.jpg","Y0hljgPS8SwdA7sNxU2dDV0Qc":"images/testimonial-3-aisha-rahman.jpg","aSW506EYKNiNGbpc25JlnRhfsY":"images/tool-3.jpg","bK0oB63QEr9273N12rZEVH8SXkU":"images/service-2-art-direction-b.jpg","eowOPsvYJd4n1QXKQdfMHcZABR0":"images/service-2-art-direction-c.jpg","fZPcsbH8BO0jNBtZkcAG5WM1gY":"images/tool-5.jpg","h7ZYgXS7kmmqYwWstDqmR5Fqs4":"images/client-logo-3.jpg","lOcHUc8Ig2dmZet90b9C7t1BbNE":"images/testimonial-1-lena-park.jpg","lfqdH0JH6KbxPiaviG38htCdfI":"images/client-logo-4.jpg","nhbdXu5xAv3f5wyc1TA7cvduYfY":"images/service-4-content-systems-c.jpg","oRGUNfHF453RwHfaanWKt8LYh4":"images/testimonial-2-daniel-mercer.jpg","z9dKOrXoBbVcwwOyfMAwV0O0":"images/service-3-motion-film-c.jpg","zKLyKFAL5Jv7GaGaE9YVgFPGac":"images/service-1-brand-identity-c.jpg","zn5bWiaTikvNR8c61OTlYDbvQ":"images/service-3-motion-film-a.jpg"};
const IMG = (id) => '/' + IMGS[id.split('.')[0]];

/* ---------- Data (edit the text here) ---------- */
const logos=['Ry7pigBil5jVruYMA4iW3nIAw.svg','0NDss4ZK4LfbAR5If8bMXKzBg.svg','h7ZYgXS7kmmqYwWstDqmR5Fqs4.svg','lfqdH0JH6KbxPiaviG38htCdfI.svg','NQMInMV5WAnkdNeGjam5dyfpSE0.svg'];
/* Testimonials: name, role and company, photo, quote */
const testimonials=[
  ['Lena Park','Founder, Klar Skincare','lOcHUc8Ig2dmZet90b9C7t1BbNE.jpg','They handed us a system, not a PDF. Eight months on, our feed still looks like the brand book and my marketing hire runs it without ever calling them.'],
  ['Daniel Mercer','Brand Director, Meridian','oRGUNfHF453RwHfaanWKt8LYh4.jpg','The same person who drew our wordmark art-directed the shoot. I didn\'t understand why that mattered until I saw how much usually gets lost between those two rooms.'],
  ['Aisha Rahman','CMO, Atlas Ventures','Y0hljgPS8SwdA7sNxU2dDV0Qc.jpg','They presented one direction, not three. I pushed back on that in week one. By week six I understood it — every decision since has been faster because of it.'],
  ['Tomas Eriksen','Head of Marketing, Fold','WFnux8W63LzFPOyKQoFeziDYo.jpg','Three days in their studio replaced what used to take a month across three vendors. The packaging shots from that session are still carrying our feed.'],
  ['Mara Silva','Founder, Basalt Outerwear','4uKZFKAgzKrLp8abxifrfuvOmwI.jpg','The brand film paid for itself at the trade show — buyers kept asking who made it. Calm process, early delivery, zero drama.'],
];
/* Background tones behind each testimonial photo, in order */
const testiTones=['#ed6c47','#d9a066','#b9c3b0','#cf5a2c','#e3b58a'];
const faqs=[
  ['How does the retainer actually work?','You get a monthly block of studio hours and a request queue. We work one request at a time (two on Pro), send progress every 48 hours, and revise until it\'s right. No scoping calls for every task — you brief, we build.'],
  ['What\'s the difference between Standard and Pro?','Hours and speed. Pro carries 70 hours to Standard\'s 45, runs two requests in parallel, gets priority scheduling, and includes a monthly shoot day in-studio.'],
  ['Can I pause my retainer?','Anytime. Unused days roll over, and you resume exactly where you left off. There\'s no minimum term.'],
  ['What if the first month isn\'t working out?','If the first week doesn\'t deliver, the rest of the month is refunded. We\'d rather earn the retainer than hold you to it.'],
  ['Do you work with remote clients?','Yes — most projects run fully remote with weekly review calls. Shoots happen in our studio or on location; product can be shipped to us.'],
  ['What do we receive at handover?','Everything: source files, brand guidelines, edited imagery, editable templates, and a walkthrough call with your team. The goal is that you don\'t need us for daily work.'],
];

/* ---------- Helpers ---------- */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Build lists ---------- */
const lt=$('logoTrack');
if(lt)lt.innerHTML=[...logos,...logos,...logos,...logos].map(l=>`<div class="logo-card"><img src="${IMG(l)}" alt=""></div>`).join('');

if($('faqList'))$('faqList').innerHTML=faqs.map((f,i)=>`
  <div class="q fade"><button type="button" aria-expanded="false" aria-controls="faq-a${i}" id="faq-q${i}"><span>${f[0]}</span><span class="pl" aria-hidden="true"></span></button><div class="a" id="faq-a${i}" role="region" aria-labelledby="faq-q${i}"><div><p>${f[1]}</p></div></div></div>`).join('');
document.querySelectorAll('.q button').forEach(b=>b.onclick=()=>{
  const q=b.parentElement, open=q.classList.contains('open');
  document.querySelectorAll('.q.open').forEach(o=>{o.classList.remove('open');o.querySelector('button').setAttribute('aria-expanded','false')});
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
   Centred slide with neighbours peeking in, arrows, drag/swipe and keyboard. */
(function(){
  const track=$('tTrack'); if(!track)return;
  const view=$('tView'), prev=$('tPrev'), next=$('tNext');
  if($('tAvatars'))$('tAvatars').innerHTML=testimonials.slice(0,4).map(t=>`<img src="${IMG(t[2])}" alt="">`).join('');
  track.innerHTML=testimonials.map((t,i)=>{
    const company=(t[1].split(',').pop()||'').trim();
    return `<div class="t-slide" role="group" aria-roledescription="slide" aria-label="${i+1} of ${testimonials.length}">
      <figure class="t-card">
        <div class="t-txt">${company?`<span class="chip-s">${esc(company)}</span>`:''}<blockquote>“${esc(t[3])}”</blockquote><figcaption class="t-by"><b>${esc(t[0])}</b><span>${esc(t[1])}</span></figcaption></div>
        <div class="t-media" style="background:${testiTones[i%testiTones.length]}"><div class="t-art"><img src="${IMG(t[2])}" alt="${esc(t[0])}" draggable="false"><span class="t-name">${esc(t[0])}</span></div></div>
      </figure></div>`}).join('');
  const slides=[...track.children];
  let idx=Math.min(1,slides.length-1), base=0;
  function layout(){
    const W=view.clientWidth, w=Math.min(872, W<=700?W-40:W*0.62), gap=W<=700?12:24;
    view.style.setProperty('--tw',w+'px'); view.style.setProperty('--tgap',gap+'px');
    return {W,w,gap};
  }
  function go(i,instant){
    idx=Math.max(0,Math.min(slides.length-1,i));
    const {W,w,gap}=layout();
    base=W/2-(idx*(w+gap)+w/2);
    track.classList.toggle('nt',!!instant||reduced);
    track.style.transform=`translate3d(${base}px,0,0)`;
    slides.forEach((s,k)=>{s.classList.toggle('on',k===idx);s.setAttribute('aria-hidden',k===idx?'false':'true')});
    prev.disabled=idx===0; next.disabled=idx===slides.length-1;
  }
  prev.onclick=()=>go(idx-1); next.onclick=()=>go(idx+1);
  slides.forEach((s,k)=>s.addEventListener('click',()=>{if(!moved&&k!==idx)go(k)}));
  view.tabIndex=0;
  view.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){go(idx-1);e.preventDefault()}if(e.key==='ArrowRight'){go(idx+1);e.preventDefault()}});
  /* drag / swipe */
  let down=false, sx=0, sy=0, dx=0, moved=false, horiz=null;
  view.addEventListener('pointerdown',e=>{if(e.button!==0)return;down=true;moved=false;horiz=null;sx=e.clientX;sy=e.clientY;dx=0});
  addEventListener('pointermove',e=>{
    if(!down)return; dx=e.clientX-sx; const dy=e.clientY-sy;
    if(horiz===null&&(Math.abs(dx)>6||Math.abs(dy)>6)){horiz=Math.abs(dx)>Math.abs(dy); if(horiz){view.classList.add('drag');track.classList.add('nt')}}
    if(!horiz)return; moved=true;
    const edge=(idx===0&&dx>0)||(idx===slides.length-1&&dx<0);
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

/* ---------- Ready (starts the hero animation) ---------- */
requestAnimationFrame(()=>document.body.classList.add('ready'));
