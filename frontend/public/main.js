(function(){
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  function initNav() {
    const nav = $('.top-nav');
    if (!nav) return;
    // link highlighting (simple)
    const here = location.pathname.includes('about') ? 'about' : 'home';
    $$('a', nav).forEach(a => {
      if (here === 'about' && a.getAttribute('href').includes('about')) a.style.opacity = '1';
      if (here === 'home' && a.getAttribute('href').includes('home')) a.style.opacity = '1';
    });
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function initFloatingLogos(){
    const wrap = $('.floating-logos');
    if (!wrap || !window.MOCK) return;
    const logos = [window.MOCK.assets.htmlLogo, window.MOCK.assets.cssLogo];
    const makeLogo = (src) => {
      const img = new Image();
      img.src = src;
      img.alt = 'tech logo';
      img.style.left = Math.random()*90 + 'vw';
      img.style.top = Math.random()*80 + 10 + 'vh';
      wrap.appendChild(img);
      return img;
    };
    const instances = [];
    for (let i=0;i<6;i++) instances.push(makeLogo(logos[i%2]));
    // drift animation
    function animate(){
      instances.forEach((img, i) => {
        const t = Date.now()/1000 + i;
        const dx = Math.sin(t*0.8 + i)*8;
        const dy = Math.cos(t*0.6 + i)*6;
        img.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx*0.6}deg)`;
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  function initParallaxHome(){
    const scene = $('.parallax-scene');
    if (!scene) return;
    const viewport = $('.scene-viewport', scene);
    const cave = $('.cave-wrap', scene);
    const moon = $('.moon', scene);
    const stars = $('.stars', scene);
    const fog = $('.fog', scene);
    const face = $('.center-face', scene);

    function applyParallax(){
      const rect = scene.getBoundingClientRect();
      const h = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (h - rect.top)/ (scene.offsetHeight - h)));
      // Night to Cave opacity cross-fade near bottom 30%
      const caveStart = 0.7, caveEnd = 0.98;
      let caveOpacity = 0;
      if (progress > caveStart) caveOpacity = (progress - caveStart)/(caveEnd - caveStart);
      caveOpacity = Math.min(1, Math.max(0, caveOpacity));
      cave.style.opacity = caveOpacity;

      // Translate layers subtly
      const tMoon = lerp(0, -40, progress);
      moon.style.transform = `translateZ(120px) translateY(${tMoon}px)`;
      stars.style.transform = `translateZ(-200px) translateY(${progress*-10}px)`;
      fog.style.transform = `translateY(${progress*-30}px)`;
      face.style.transform = `translate(-50%, -50%) translateZ(40px) translateY(${progress*-20}px)`;
    }

    // mouse move parallax tilt
    let mx = 0, my = 0; let tx=0, ty=0;
    window.addEventListener('mousemove', (e)=>{
      mx = (e.clientX/window.innerWidth - 0.5);
      my = (e.clientY/window.innerHeight - 0.5);
    });
    function mouseTilt(){
      tx = lerp(tx, mx, 0.08);
      ty = lerp(ty, my, 0.08);
      viewport.style.transform = `rotateX(${ty*-2.5}deg) rotateY(${tx*2.5}deg)`;
      requestAnimationFrame(mouseTilt);
    }

    function onScroll(){ applyParallax(); }

    mouseTilt();
    applyParallax();
    document.addEventListener('scroll', onScroll, { passive: true });
  }

  function populateAbout(){
    const aboutRoot = $('#about');
    if (!aboutRoot || !window.MOCK) return;
    // Text intro
    const intro = $('#about-intro');
    intro.textContent = window.MOCK.about.intro;
    const facts = $('#about-facts');
    window.MOCK.about.details.forEach(t => {
      const p = document.createElement('p');
      p.textContent = t; facts.appendChild(p);
    });
    const img = $('#full-body-img');
    img.src = window.MOCK.about.fullBodyImg;
    img.alt = 'Full body';
  }

  function populateExperience(){
    const root = $('#experience');
    if (!root || !window.MOCK) return;
    const grid = $('#exp-grid');
    window.MOCK.experiences.forEach(x => {
      const card = document.createElement('div'); card.className = 'exp-card';
      const h3 = document.createElement('h3'); h3.textContent = `${x.title} — ${x.company}`;
      const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = x.period;
      const ul = document.createElement('ul');
      x.bullets.forEach(b => { const li = document.createElement('li'); li.textContent = b; ul.appendChild(li); });
      card.appendChild(h3); card.appendChild(meta); card.appendChild(ul);
      grid.appendChild(card);
    });
  }

  function populateProjects(){
    const root = $('#projects');
    if (!root || !window.MOCK) return;
    const grid = $('#projects-grid');
    window.MOCK.projects.forEach((p, idx) => {
      const card = document.createElement('div'); card.className = 'project-card'; card.dataset.index = idx;
      const title = document.createElement('div'); title.className = 'title'; title.textContent = p.title;
      const desc = document.createElement('div'); desc.className = 'desc'; desc.textContent = p.desc;
      const shine = document.createElement('div'); shine.className = 'shine';
      card.appendChild(shine); card.appendChild(title); card.appendChild(desc);

      const expanded = document.createElement('div'); expanded.className = 'expanded-area';
      const gif = new Image(); gif.className = 'gif'; gif.src = p.gif; gif.alt = p.title + ' demo';
      const links = document.createElement('div'); links.className = 'links';
      const a1 = document.createElement('a'); a1.href = p.github; a1.target = '_blank'; a1.textContent = 'GitHub';
      const a2 = document.createElement('a'); a2.href = p.live; a2.target = '_blank'; a2.textContent = 'Live demo';
      links.appendChild(a1); links.appendChild(a2);
      expanded.appendChild(gif); expanded.appendChild(links);
      card.appendChild(expanded);

      // mousemove tilt
      card.addEventListener('mousemove', (e)=>{
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left)/r.width, py = (e.clientY - r.top)/r.height;
        const rx = (py - 0.5) * -6; const ry = (px - 0.5) * 6;
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        shine.style.left = px*100 + '%'; shine.style.top = py*100 + '%';
      });
      card.addEventListener('mouseleave', ()=>{ card.style.transform = ''; });

      // click to expand
      card.addEventListener('click', ()=>{ card.classList.toggle('expanded'); });

      grid.appendChild(card);
    });
  }

  function centerFace(){
    const img = $('#center-face-img');
    if (!img || !window.MOCK) return;
    img.src = window.MOCK.assets.face; img.alt = window.MOCK.assets.headshotAlt;
  }

  function initPhantoms(){
    const phantomLayer = $('#phantoms');
    if (!phantomLayer) return;
    const COUNT = 6;
    for (let i=0;i<COUNT;i++){
      const d = document.createElement('div'); d.className = 'phantom';
      d.style.top = (10 + Math.random()*50) + 'vh';
      d.style.left = (Math.random()*100) + 'vw';
      phantomLayer.appendChild(d);
    }
    function animate(){
      const nodes = $$('.phantom', phantomLayer);
      const t = Date.now()/1000;
      nodes.forEach((n, idx)=>{
        const speed = 0.6 + (idx%3)*0.2;
        n.style.transform = `translateX(${(t*8 + idx*40)% (window.innerWidth + 200)}px) translateY(${Math.sin((t+idx)*0.8)*6}px)`;
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  function smoothInternalScroll(){
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e)=>{
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (target){ e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initFloatingLogos();
    initParallaxHome();
    centerFace();
    populateAbout();
    populateExperience();
    populateProjects();
    initPhantoms();
    smoothInternalScroll();
  });
})();