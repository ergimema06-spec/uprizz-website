/* Work page: hero reveal, cursor blobs, category filter and search */
(function(){
  const hero=document.querySelector('.wk-hero');
  if(hero) requestAnimationFrame(()=>setTimeout(()=>hero.classList.add('in'),150));

  /* grainy blobs that trail the cursor over the hero */
  const b1=document.querySelector('.wk-blob.b1'), b2=document.querySelector('.wk-blob.b2');
  if(hero&&b1&&matchMedia('(pointer:fine)').matches){
    let tx=innerWidth*.6,ty=200,x1=tx,y1=ty,x2=tx,y2=ty;
    hero.addEventListener('mousemove',e=>{const r=hero.getBoundingClientRect();tx=e.clientX-r.left;ty=e.clientY-r.top});
    (function loop(){
      x1+=(tx-x1)*.12;y1+=(ty-y1)*.12;x2+=(x1-x2)*.08;y2+=(y1-y2)*.08;
      b1.style.transform=`translate(${x1-75}px,${y1-75}px)`;
      b2.style.transform=`translate(${x2-140}px,${y2+10}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* filter + search */
  const cat=document.getElementById('wkCat'), q=document.getElementById('wkSearch'),
        cards=[...document.querySelectorAll('#wkList .wk-card')], empty=document.getElementById('wkEmpty');
  function apply(){
    const c=cat.value, s=q.value.trim().toLowerCase(); let shown=0;
    cards.forEach(el=>{
      const ok=(!c||el.dataset.tags.split(' ').includes(c))&&(!s||el.dataset.name.includes(s)||el.dataset.tags.includes(s));
      el.classList.toggle('hide',!ok); if(ok){shown++;el.classList.add('in')}
    });
    empty.style.display=shown?'none':'block';
  }
  if(cat){cat.addEventListener('change',apply);q.addEventListener('input',apply)}
})();
