document.addEventListener("DOMContentLoaded", () => {
  const $ = s => [...document.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion:reduce)").matches;
  requestAnimationFrame(() => document.body.classList.add("loaded"));

  
  const dot = $(".cursor-dot")[0];
  if (matchMedia("(pointer:fine)").matches) {
    let x = innerWidth/2, y = innerHeight/2, tx = x, ty = y;
    addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; dot.style.opacity = 1; }, {passive:true});
    (function tick(){ x += (tx-x)*.25; y += (ty-y)*.25; const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1; dot.style.left = (x/z)+"px"; dot.style.top = (y/z)+"px"; requestAnimationFrame(tick); })();
    $("a,button").forEach(el => {
      el.addEventListener("mouseenter", () => { dot.style.transform = "translate(-50%,-50%) scale(2.2)"; dot.style.background = "var(--accent)"; });
      el.addEventListener("mouseleave", () => { dot.style.transform = "translate(-50%,-50%) scale(1)"; dot.style.background = "var(--dot)"; });
    });
  }

  
  const hdr = document.querySelector(".site-header"), mb = document.querySelector(".menu-btn");
  const setMenu = o => { hdr.classList.toggle("menu-open", o); mb.setAttribute("aria-expanded", o); mb.setAttribute("aria-label", o ? "Close menu" : "Open menu"); };
  mb.addEventListener("click", () => setMenu(!hdr.classList.contains("menu-open")));
  $(".nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("resize", () => { if (innerWidth > 850) setMenu(false); });

  const role = document.querySelector(".hero-role span");
  if (role && !calm) {
    const words = ["AI & ML Research Enthusiast", "Backend Developer"];
    role.setAttribute("aria-label", "AI & ML Research Enthusiast and Backend Developer");
    role.innerHTML = '<span class="typed" aria-hidden="true"></span><span class="caret" aria-hidden="true"></span>';
    const out = role.querySelector(".typed"); let w = 0, c = 0, del = false;
    const tick = () => {
      const word = words[w];
      if (!del) { c++; out.textContent = word.slice(0, c); if (c === word.length) { del = true; return setTimeout(tick, 1800); } return setTimeout(tick, 85); }
      c--; out.textContent = word.slice(0, c);
      if (c === 0) { del = false; w = (w+1) % words.length; return setTimeout(tick, 380); }
      setTimeout(tick, 42);
    };
    setTimeout(tick, 1100);
  }

  const targets = $(".statement h2,.statement p,.about-extra,.section-head,.skill-group,.exp-item,.exp-title,.profiles,.research-row,.project-card,.contact h2,.contact-email,.contact-bottom,.plane");
  targets.forEach(e => e.setAttribute("data-r", ""));
  targets.forEach(e => { const i = [...e.parentNode.children].filter(c => c.hasAttribute("data-r")).indexOf(e); e.style.setProperty("--d", (i*.1)+"s"); });
  $(".skill-group").forEach((g, i) => g.style.setProperty("--d", [0, .35, .7, .95][i] + "s"));
  const count = el => { const n = +el.dataset.count; let k = 0; const t = setInterval(() => { el.textContent = ++k; if (k >= n) clearInterval(t); }, 350); };
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in"); io.unobserve(en.target);
    en.target.querySelectorAll("[data-count]").forEach(count);
    setTimeout(() => en.target.style.setProperty("--d", "0s"), 1600);
  }), {threshold:.15});
  targets.forEach(e => io.observe(e));

  
  $(".project-card").forEach(c => {
    c.addEventListener("mousemove", e => { const r = c.getBoundingClientRect();
      c.style.setProperty("--ry", ((e.clientX-r.left)/r.width-.5)*10+"deg");
      c.style.setProperty("--rx", -((e.clientY-r.top)/r.height-.5)*10+"deg"); });
    c.addEventListener("mouseleave", () => { c.style.setProperty("--rx","0deg"); c.style.setProperty("--ry","0deg"); });
  });

  
  const wipe = $(".wipe")[0];
  $('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const t = document.querySelector(a.getAttribute("href")); if (!t || calm) return;
    e.preventDefault(); wipe.className = "wipe in";
    setTimeout(() => { document.body.classList.add("no-stack"); const topY = t.getBoundingClientRect().top+scrollY-document.querySelector(".site-header").getBoundingClientRect().height+1; document.body.classList.remove("no-stack"); scrollTo({top: t.id === "home" ? 0 : topY, behavior:"auto"}); wipe.className = "wipe out"; }, 460);
    setTimeout(() => wipe.className = "wipe", 1100);
  }));
  const stack = ["home","about","skills","research","projects","experience","contact"].map(id => document.getElementById(id)).filter(Boolean);
  if (!calm) {
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v)), ease = v => v*v*(3-2*v);
    const geo = [];
    const measure = () => {
      document.body.classList.add("no-stack");
      stack.forEach((s, i) => { const r = s.getBoundingClientRect(); geo[i] = { top: r.top+scrollY, h: r.height }; });
      document.body.classList.remove("no-stack");
    };
    let queued = false;
    const stackUpdate = () => {
      queued = false;
      const vh = innerHeight, phone = innerWidth < 700;
      const dIn = phone ? .08 : .13, dOut = phone ? .06 : .1;
      stack.forEach((s, i) => {
        if (!geo[i]) return;
        const top = geo[i].top-scrollY, bottom = top+geo[i].h;
        const p = i === 0 ? 1 : ease(clamp((vh*.95-top)/(vh*.75), 0, 1));
        const t = i === stack.length-1 ? 0 : Math.pow(clamp((vh*.6-bottom)/(vh*.6), 0, 1), 1.15);
        if (p === 1 && t === 0) { if (s.style.transform) { s.style.transform = ""; s.style.opacity = ""; s.style.borderRadius = ""; } return; }
        s.style.transformOrigin = p < 1 ? "50% 0%" : "50% 100%";
        s.style.transform = "scale(" + ((1-dIn*(1-p))*(1-dOut*t)) + ")";
        s.style.opacity = (1-.65*(1-p))*(1-.55*t);
        s.style.borderRadius = ((1-p)*32+t*30) + "px";
      });
    };
    const refresh = () => { measure(); stackUpdate(); };
    addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(stackUpdate); } }, {passive:true});
    addEventListener("resize", refresh); addEventListener("load", refresh);
    refresh(); setTimeout(refresh, 800); setTimeout(refresh, 2500);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  }
  const links = $(".nav a");
  const bar = $(".progress")[0];
  const ids = ["home","about","skills","research","projects","experience","contact"].map(i => document.getElementById(i));

  
  const par = $(".hero-visual,.big,.plane");
  addEventListener("scroll", () => {
    bar.style.transform = `scaleX(${scrollY/(document.body.scrollHeight-innerHeight)})`;
  }, {passive:true});

  
  if (location.protocol.startsWith("http")) fetch("/go/profile", {redirect:"manual"}).then(r => {
    if (r.type === "opaqueredirect" || r.status === 302) $("[data-go]").forEach(a => a.href = "/go/"+a.dataset.go);
  }).catch(() => {});

  
  const cv = document.getElementById("bg3d");
  if (!window.THREE || !cv) return;
  const T = THREE, R = new T.WebGLRenderer({canvas:cv, alpha:true, antialias:true});
  R.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 800 ? 1.25 : 1.75));
  const S = new T.Scene(), C = new T.PerspectiveCamera(55, 1, .1, 100); C.position.z = 9;
  const G = 0x5d7567, M = () => new T.MeshBasicMaterial({color:G, wireframe:true, transparent:true, opacity:0});
  const grp = (n, f) => { const g = new T.Group(); for (let i = 0; i < n; i++) g.add(f(i)); return g; };
  const helix = (() => { const p = []; for (let i = 0; i < 420; i++) { const a = i*.16, y = (i/420-.5)*8;
    p.push(Math.cos(a)*2.2, y, Math.sin(a)*2.2, Math.cos(a+Math.PI)*2.2, y, Math.sin(a+Math.PI)*2.2); }
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(p, 3));
    return new T.Points(g, new T.PointsMaterial({color:G, size:.08, transparent:true, opacity:0})); })();
  const shapes = [
    new T.Mesh(new T.IcosahedronGeometry(2.6, 2), M()),
    new T.Mesh(new T.TorusKnotGeometry(1.9, .5, 160, 16), M()),
    new T.Mesh(new T.OctahedronGeometry(2.4, 1), M()),
    helix,
    grp(8, i => { const m = new T.Mesh(new T.BoxGeometry(1.5,1.5,1.5), M()); m.position.set((i%2-.5)*2.6, ((i>>1)%2-.5)*2.6, ((i>>2)-.5)*2.6); return m; }),
    new T.Mesh(new T.DodecahedronGeometry(2.3, 0), M()),
    grp(4, i => { const m = new T.Mesh(new T.TorusGeometry(1+i*.55, .015, 8, 120), M()); m.rotation.x = i*.6; return m; })
  ];
  shapes.forEach(s => S.add(s));
  const sp = []; for (let i = 0, n = innerWidth < 800 ? 350 : 900; i < n; i++) sp.push((Math.random()-.5)*40, (Math.random()-.5)*40, (Math.random()-.5)*30);
  const sg = new T.BufferGeometry(); sg.setAttribute("position", new T.Float32BufferAttribute(sp, 3));
  const stars = new T.Points(sg, new T.PointsMaterial({color:0x718c7b, size:.05, transparent:true, opacity:.4})); S.add(stars);
  const setO = (o, v) => o.traverse(n => { if (n.material) n.material.opacity = v; });
  const X = [3.4, -3.4, 3.4, -3.4, 3.4, -3.4, 3.2], op = [0,0,0,0,0,0,0];
  let mx = 0, my = 0, prev = scrollY;
  addEventListener("mousemove", e => { mx = e.clientX/innerWidth-.5; my = e.clientY/innerHeight-.5; }, {passive:true});
  const size = () => { R.setSize(innerWidth, innerHeight, false); C.aspect = innerWidth/innerHeight; C.updateProjectionMatrix(); };
  addEventListener("resize", size); size();
  const frame = t => {
    let idx = 0, best = 1e9;
    ids.forEach((s, i) => { const r = s.getBoundingClientRect(), d = Math.abs(r.top+r.height/2-innerHeight/2); if (d < best) { best = d; idx = i; } });
    links.forEach(l => l.style.color = l.getAttribute("href") === "#"+ids[idx].id ? "var(--nav-active,var(--accent))" : "");
    const vel = Math.max(-40, Math.min(40, scrollY-prev)); prev = scrollY;
    shapes.forEach((o, i) => {
      op[i] += ((i === idx ? 1 : 0)-op[i])*.06;
      setO(o, op[i]*(i === 3 ? .55 : .24)); o.visible = op[i] > .01;
      o.rotation.y += .004+vel*.0008; o.rotation.x += .0018;
      o.position.x += ((innerWidth < 800 ? 0 : X[i])-o.position.x)*.05;
      o.position.y = Math.sin(t*.0009+i)*.35;
      o.scale.setScalar(.6+op[i]*.4);
    });
    stars.rotation.y = t*.00003+scrollY*.0002; stars.rotation.x = scrollY*.00008;
    C.position.x += (mx*1.2-C.position.x)*.04; C.position.y += (-my*.8-C.position.y)*.04; C.lookAt(0,0,0);
    par.forEach(p => { if (p.matches(".hero-visual")) p.style.translate = `0 ${scrollY*-.08}px`; });
    R.render(S, C);
    if (!calm) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
});
