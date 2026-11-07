/* Subtl — single-page store. Placeholder content; edit CONFIG + PRODUCTS only. */
const CONFIG = {
  brand: 'Subtl',
  currency: '₹',          // placeholder — change later
  announce: 'Lorem ipsum dolor sit amet — free shipping over 0000',
  tagline: 'Lorem ipsum, quietly made.',   // placeholder tagline
  comingSoon: true,   // true = show the Coming Soon page after the loader. false = open the full store.
  freeShipOver: 3000,
  shipFlat: 99
};

const PRODUCTS = [
  { id:1,  name:'Lorem Ipsum Tee',      cat:'Topwear',    price:1490, was:null, tone:'s1', tag:'New',  colors:['#0a0a0a','#ffffff','#a3a3a3'] },
  { id:2,  name:'Dolor Sit Tee',        cat:'Topwear',    price:1490, was:null, tone:'s2', tag:'',     colors:['#ffffff','#0a0a0a'] },
  { id:3,  name:'Amet Hoodie',          cat:'Topwear',    price:2990, was:null, tone:'s3', tag:'',     colors:['#0a0a0a','#5c5c5c'] },
  { id:4,  name:'Consectetur Crew',     cat:'Topwear',    price:2490, was:3290, tone:'s4', tag:'Sale', colors:['#e8e8e8','#0a0a0a'] },
  { id:5,  name:'Adipiscing Pant',      cat:'Bottomwear', price:1790, was:null, tone:'s2', tag:'',     colors:['#0a0a0a','#5c5c5c','#e8e8e8'] },
  { id:6,  name:'Elit Lounge Pant',     cat:'Bottomwear', price:1790, was:null, tone:'s1', tag:'New',  colors:['#0a0a0a','#a3a3a3'] },
  { id:7,  name:'Sed Do Chino',         cat:'Bottomwear', price:2100, was:2800, tone:'s3', tag:'Sale', colors:['#ffffff','#0a0a0a'] },
  { id:8,  name:'Eiusmod Short',        cat:'Bottomwear', price:1390, was:null, tone:'s4', tag:'',     colors:['#0a0a0a','#e8e8e8'] },
  { id:9,  name:'Tempor Overshirt',     cat:'Outerwear',  price:3490, was:null, tone:'s2', tag:'',     colors:['#0a0a0a','#5c5c5c'] },
  { id:10, name:'Incididunt Jacket',    cat:'Outerwear',  price:4990, was:null, tone:'s3', tag:'New',  colors:['#0a0a0a','#ffffff'] },
  { id:11, name:'Labore Coach Jacket',  cat:'Outerwear',  price:4290, was:5290, tone:'s1', tag:'Sale', colors:['#a3a3a3','#0a0a0a'] },
  { id:12, name:'Magna Zip Hoodie',     cat:'Outerwear',  price:3290, was:null, tone:'s4', tag:'',     colors:['#0a0a0a','#e8e8e8'] }
];

const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const money = n => CONFIG.currency + ' ' + Number(n).toLocaleString('en-IN');
const byId = id => PRODUCTS.find(p => p.id === Number(id));
const calm = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- Cart (kept in memory, mirrored to localStorage when allowed) ---------- */
const Cart = {
  _m: null,
  get(){
    if(this._m) return this._m;
    try { this._m = JSON.parse(localStorage.getItem('subtl_cart')) || []; } catch(e){ this._m = []; }
    return this._m;
  },
  set(v){ this._m = v; try { localStorage.setItem('subtl_cart', JSON.stringify(v)); } catch(e){} updateCount(); },
  add(id, size='M', color=0, qty=1){
    const c = this.get().slice();
    const hit = c.find(i => i.id===id && i.size===size && i.color===color);
    hit ? hit.qty += qty : c.push({id, size, color, qty});
    this.set(c);
  },
  setQty(idx, qty){ const c=this.get().slice(); if(!c[idx])return; qty<=0 ? c.splice(idx,1) : c[idx]={...c[idx],qty}; this.set(c); },
  remove(idx){ const c=this.get().slice(); c.splice(idx,1); this.set(c); },
  clear(){ this.set([]); },
  count(){ return this.get().reduce((a,i)=>a+i.qty,0); },
  subtotal(){ return this.get().reduce((a,i)=>a+byId(i.id).price*i.qty,0); },
  shipping(){ const s=this.subtotal(); return s===0 ? 0 : (s>=CONFIG.freeShipOver ? 0 : CONFIG.shipFlat); }
};
let _last = null;
function updateCount(){
  const n = Cart.count();
  $$('.cart-count').forEach(e => {
    e.textContent = n;
    if(_last !== null && n > _last){ e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); }
  });
  _last = n;
  if(typeof Drawer !== 'undefined' && Drawer.open) Drawer.draw();
}

/* ---------- Toast ---------- */
function toast(msg){
  let t = $('.toast'); if(!t){ t=document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(t._h);
  t._h = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------- Shared chrome (header + footer stay on screen between pages) ---------- */
function chrome(){
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="announce">${CONFIG.announce}</div>
    <header class="site-header"><div class="wrap nav">
      <nav class="nav-links" id="navLinks">
        <a href="#shop">Shop all</a>
        <a href="#shop-topwear">Topwear</a>
        <a href="#shop-bottomwear">Bottomwear</a>
        <a href="#shop-outerwear">Outerwear</a>
        <a href="#shop-sale">Sale</a>
      </nav>
      <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false"><span class="menu-ico"></span><span id="menuTxt">Menu</span></button>
      <a href="#home" class="logo" aria-label="${CONFIG.brand} home">${CONFIG.brand}</a>
      <div class="nav-right">
        <a href="#shop" class="hide-m">Search</a>
        <a href="#cart">Cart<span class="cart-count">0</span></a>
      </div>
    </div></header>`);
  document.body.insertAdjacentHTML('beforeend', `
    <footer class="site-footer"><div class="wrap">
      <div class="foot-grid">
        <div><div class="logo">${CONFIG.brand}</div>
          <p style="color:#9a9a9a;max-width:300px;font-size:14px">Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.</p></div>
        <div><h4>Shop</h4><ul>
          <li><a href="#shop">All products</a></li>
          <li><a href="#shop-topwear">Topwear</a></li>
          <li><a href="#shop-bottomwear">Bottomwear</a></li>
          <li><a href="#shop-outerwear">Outerwear</a></li></ul></div>
        <div><h4>Help</h4><ul>
          <li><a href="#home">Shipping &amp; returns</a></li><li><a href="#home">Size guide</a></li>
          <li><a href="#home">Contact</a></li><li><a href="#home">FAQ</a></li></ul></div>
        <div><h4>Follow</h4><ul>
          <li><a href="#home">Instagram</a></li><li><a href="#home">Pinterest</a></li><li><a href="#home">YouTube</a></li></ul></div>
      </div>
      <div class="foot-bottom"><span>© 2026 ${CONFIG.brand}. Concept project.</span><span>Privacy · Terms</span></div>
    </div></footer>`);
  const nl=$('#navLinks'), mb=$('#menuBtn'), mt=$('#menuTxt');
  const setMenu=o=>{ nl.classList.toggle('open',o); mb.setAttribute('aria-expanded',o); mt.textContent=o?'Close':'Menu'; };
  mb.addEventListener('click', ()=> setMenu(!nl.classList.contains('open')));
  nl.addEventListener('click', e=>{ if(e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') setMenu(false); });
  Curtain.init(); Drawer.init(); captureCards();
  updateCount();
}

/* ---------- Product card ---------- */
function cardHTML(p){
  return `<a class="card" href="#product-${p.id}">
    <div class="card-media">
      ${p.tag?`<span class="badge">${p.tag}</span>`:''}
      <div class="ph r-45 ${p.tone}" data-label="Image ${String(p.id).padStart(2,'0')}"></div>
      <span class="quick">View product</span>
    </div>
    <div class="card-info">
      <div><div class="nm">${p.name}</div><div class="cl">${p.cat} · ${p.colors.length} colours</div></div>
      <div class="price">${p.was?`<s>${money(p.was)}</s>`:''}${money(p.price)}</div>
    </div></a>`;
}

/* ---------- Reveal on scroll ---------- */
function reveal(){
  const els = $$('#app .rv'); if(!('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('in')); return; }
  const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }),{threshold:.12});
  els.forEach(e=>io.observe(e));
}

/* ======================= VIEWS ======================= */
const Views = {};

Views.home = () => ({
  html: `
<section class="hero">
  <div class="hero-copy">
    <span class="label">Collection 01 · Lorem</span>
    <h1>Lorem<br>ipsum<br>dolor.</h1>
    <div class="hero-bottom">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</p>
      <a class="btn" href="#shop">Shop all →</a>
    </div>
  </div>
  <div class="hero-media">
    <div class="ph dark" data-label="Hero image"></div>
    <span class="hero-tag label">New season</span>
  </div>
</section>

<div class="marquee"><div class="marquee-track">
  <span>Lorem ipsum</span><span>—</span><span>Dolor sit amet</span><span>—</span><span>Consectetur</span><span>—</span><span>Adipiscing elit</span><span>—</span>
  <span>Lorem ipsum</span><span>—</span><span>Dolor sit amet</span><span>—</span><span>Consectetur</span><span>—</span><span>Adipiscing elit</span><span>—</span>
</div></div>

<section class="section"><div class="wrap">
  <div class="sec-head rv"><h2>Shop by category</h2><a class="link-u" href="#shop">View all</a></div>
  <div class="cats rv">
    <a class="cat" href="#shop-topwear"><div class="ph r-45 s1"></div><div class="cat-name"><b>Topwear</b><span>→</span></div></a>
    <a class="cat" href="#shop-bottomwear"><div class="ph r-45 s3"></div><div class="cat-name"><b>Bottomwear</b><span>→</span></div></a>
    <a class="cat" href="#shop-outerwear"><div class="ph r-45 s2"></div><div class="cat-name"><b>Outerwear</b><span>→</span></div></a>
  </div>
</div></section>

<section class="section" style="padding-top:0"><div class="wrap">
  <div class="sec-head rv"><div><span class="label muted">Featured</span><h2>New arrivals</h2></div><a class="link-u" href="#shop">Shop all</a></div>
  <div class="grid rv">${PRODUCTS.slice(0,4).map(cardHTML).join('')}</div>
</div></section>

<section class="statement"><div class="wrap section">
  <div class="rv"><span class="label" style="color:#8a8a8a">Our idea</span><h2 style="margin-top:14px">Lorem ipsum, quietly made.</h2></div>
  <div class="rv"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
  <a class="btn light" href="#shop">Explore</a></div>
</div></section>

<section class="section"><div class="wrap">
  <div class="sec-head rv"><h2>Lookbook</h2><span class="label muted">Lorem 01 — 03</span></div>
  <div class="split rv">
    <div class="ph r-tall s2" data-label="Look 01"></div>
    <div class="ph r-tall s3" data-label="Look 02"></div>
    <div class="ph r-tall s1" data-label="Look 03"></div>
  </div>
</div></section>

<section class="section" style="padding-top:0"><div class="wrap">
  <div class="sec-head rv"><div><span class="label muted">Limited</span><h2>On sale</h2></div><a class="link-u" href="#shop-sale">Shop sale</a></div>
  <div class="grid rv">${PRODUCTS.filter(p=>p.was).concat(PRODUCTS.filter(p=>!p.was).slice(0,1)).slice(0,4).map(cardHTML).join('')}</div>
</div></section>

<div class="wrap rv"><div class="perks">
  <div class="perk"><b>Lorem shipping</b><p>Dolor sit amet consectetur.</p></div>
  <div class="perk"><b>Ipsum returns</b><p>Adipiscing elit sed do.</p></div>
  <div class="perk"><b>Dolor quality</b><p>Eiusmod tempor incididunt.</p></div>
  <div class="perk"><b>Amet support</b><p>Ut labore et dolore magna.</p></div>
</div></div>

<section class="section"><div class="wrap">
  <div class="sec-head rv"><h2>Lorem from people</h2><span class="label muted">Reviews</span></div>
  <div class="reviews rv">
    <div class="review"><div class="stars">★★★★★</div><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.</p><span class="label muted">Customer name</span></div>
    <div class="review"><div class="stars">★★★★★</div><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.</p><span class="label muted">Customer name</span></div>
    <div class="review"><div class="stars">★★★★★</div><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.</p><span class="label muted">Customer name</span></div>
  </div>
</div></section>

<section class="news rv">
  <span class="label muted">Newsletter</span>
  <h2>Lorem ipsum dolor.</h2>
  <p class="muted">Sit amet consectetur adipiscing elit.</p>
  <form id="newsForm"><input id="newsEmail" type="email" placeholder="Enter your email" required aria-label="Email"><button type="submit">Subscribe</button></form>
</section>`,
  after(){ $('#newsForm').addEventListener('submit', e=>{ e.preventDefault(); e.target.reset(); toast('Subscribed (demo)'); }); }
});

Views.shop = ({cat}) => {
  const label = cat==='__sale' ? 'Sale' : (cat || 'Shop all');
  const chip = (h,l,c) => `<a class="chip ${cat===c?'on':''}" data-cat="${c}" href="#${h}">${l}</a>`;
  return {
    html: `
<section class="page-title"><div class="wrap">
  <div class="crumbs"><a href="#home">Home</a> / <span id="shopCrumb">${label}</span></div>
  <h1 id="shopTitle">${label}</h1>
</div></section>
<section class="wrap" id="shopRoot" style="padding-top:28px;padding-bottom:clamp(50px,8vw,100px)">
  <div class="toolbar">
    <div class="chips">${chip('shop','All','')}${chip('shop-topwear','Topwear','Topwear')}${chip('shop-bottomwear','Bottomwear','Bottomwear')}${chip('shop-outerwear','Outerwear','Outerwear')}${chip('shop-sale','Sale','__sale')}</div>
    <div style="display:flex;gap:12px;align-items:center">
      <span class="label muted" id="count"></span>
<div class="dd" id="sortDD">
        <button type="button" class="dd-btn" id="sortBtn" aria-haspopup="listbox" aria-expanded="false" aria-controls="sortList">
          <span class="dd-k">Sort</span><span class="dd-v" id="sortLabel">Featured</span><i class="dd-ch"></i>
        </button>
        <ul class="dd-list" id="sortList" role="listbox" aria-label="Sort products">
          <li role="option" tabindex="0" data-v="" aria-selected="true">Featured</li>
          <li role="option" tabindex="0" data-v="lo" aria-selected="false">Price: low to high</li>
          <li role="option" tabindex="0" data-v="hi" aria-selected="false">Price: high to low</li>
          <li role="option" tabindex="0" data-v="az" aria-selected="false">Name: A–Z</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="grid" id="grid"></div>
</section>`,
    after(){
      let cur = cat, still = false, sortVal = '';
      const draw = () => {
        const list = PRODUCTS.filter(p => !cur ? true : cur==='__sale' ? !!p.was : p.cat===cur);
        const s = sortVal;
        if(s==='lo') list.sort((a,b)=>a.price-b.price);
        if(s==='hi') list.sort((a,b)=>b.price-a.price);
        if(s==='az') list.sort((a,b)=>a.name.localeCompare(b.name));
        $('#grid').classList.toggle('still', still);
        $('#grid').innerHTML = list.length ? list.map(cardHTML).join('') : '<div class="empty" style="grid-column:1/-1">Lorem ipsum — nothing here yet.</div>';
        $('#count').textContent = list.length + ' items';
        still = true;   /* every redraw after the first one is instant */
      };
      /* filtering happens in place: no page slide, no card animation */
      _shop = { setCat(c){
        cur = c;
        const label = c==='__sale' ? 'Sale' : (c || 'Shop all');
        $('#shopTitle').textContent = label; $('#shopCrumb').textContent = label;
        $$('#shopRoot .chip, .page-title + section .chip').forEach(x => x.classList.toggle('on', x.dataset.cat===c));
        draw();
      } };
      const dd = $('#sortDD'), btn = $('#sortBtn');
      const setOpen = o => { dd.classList.toggle('open', o); btn.setAttribute('aria-expanded', o); };
      const pick = li => {
        sortVal = li.dataset.v; $('#sortLabel').textContent = li.textContent;
        $$('#sortList li').forEach(x => x.setAttribute('aria-selected', x===li));
        setOpen(false); btn.focus(); draw();
      };
      btn.addEventListener('click', () => setOpen(!dd.classList.contains('open')));
      $('#sortList').addEventListener('click', e => { const li = e.target.closest('li'); if(li) pick(li); });
      $('#sortList').addEventListener('keydown', e => {
        const li = e.target.closest('li'); if(!li) return;
        if(e.key==='Enter' || e.key===' '){ e.preventDefault(); pick(li); }
        if(e.key==='ArrowDown'){ e.preventDefault(); (li.nextElementSibling || li).focus(); }
        if(e.key==='ArrowUp'){ e.preventDefault(); (li.previousElementSibling || li).focus(); }
      });
      draw();
    }
  };
};

Views.product = ({id}) => {
  const p = byId(id);
  return {
    html: `
<div class="wrap">
  <div class="crumbs" style="padding-top:22px"><a href="#home">Home</a> / <a href="#shop-${p.cat.toLowerCase()}">${p.cat}</a> / <span>${p.name}</span></div>
  <section class="pdp">
    <div class="gallery">${['Main','Detail 01','Detail 02'].map((l,i)=>`<div class="ph ${i?'r-45':''} ${p.tone}" data-label="${l}"></div>`).join('')}</div>
    <div class="pdp-info">
      <span class="label muted">${p.cat}</span>
      <h1>${p.name}</h1>
      <div class="pdp-price">${p.was?`<s class="muted" style="margin-right:8px">${money(p.was)}</s>`:''}${money(p.price)}</div>
      <p class="muted">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <div class="opt"><div class="opt-head"><span class="label">Colour</span><span class="label muted" id="colorName">Colour 1</span></div>
        <div class="swatches" id="swatches">${p.colors.map((c,i)=>`<button class="sw ${i?'':'on'}" data-i="${i}" style="background:${c}" aria-label="Colour ${i+1}"></button>`).join('')}</div></div>
      <div class="opt"><div class="opt-head"><span class="label">Size</span><span class="label muted">Size guide</span></div>
        <div class="sizes" id="sizes">${['XS','S','M','L','XL'].map(s=>`<button class="size ${s==='M'?'on':''}">${s}</button>`).join('')}</div></div>
      <div class="buy">
        <div class="qty"><button id="minus" aria-label="Decrease">−</button><span id="qty">1</span><button id="plus" aria-label="Increase">+</button></div>
        <button class="btn" id="add">Add to cart</button>
      </div>
      <a class="btn ghost block" href="#cart" style="margin-top:10px">Go to cart</a>
      <div class="acc">
        <details open><summary>Description</summary><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p></details>
        <details><summary>Fabric &amp; care</summary><p>Lorem ipsum 000% dolor. Sit amet, machine wash cold. Consectetur adipiscing.</p></details>
        <details><summary>Shipping &amp; returns</summary><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.</p></details>
      </div>
    </div>
  </section>
  <div class="sec-head"><h2 style="font-size:clamp(28px,4vw,48px)">You may also like</h2></div>
  <div class="grid" style="padding-bottom:clamp(50px,8vw,100px)">${PRODUCTS.filter(x=>x.id!==p.id && x.cat===p.cat).concat(PRODUCTS.filter(x=>x.id!==p.id && x.cat!==p.cat)).slice(0,4).map(cardHTML).join('')}</div>
</div>`,
    after(){
      let size='M', color=0, qty=1;
      $('#swatches').addEventListener('click', e=>{ const b=e.target.closest('.sw'); if(!b)return; color=+b.dataset.i;
        $$('.sw').forEach(x=>x.classList.toggle('on',x===b)); $('#colorName').textContent='Colour '+(color+1); });
      $('#sizes').addEventListener('click', e=>{ const b=e.target.closest('.size'); if(!b)return; size=b.textContent;
        $$('.size').forEach(x=>x.classList.toggle('on',x===b)); });
      $('#minus').onclick = ()=>{ qty=Math.max(1,qty-1); $('#qty').textContent=qty; };
      $('#plus').onclick  = ()=>{ qty=Math.min(10,qty+1); $('#qty').textContent=qty; };
      $('#add').onclick   = ()=>{ const b=$('#add'); Cart.add(p.id,size,color,qty); setTimeout(()=>Drawer.show(), 380);
        b.textContent='Added ✓'; b.classList.remove('done-flash'); void b.offsetWidth; b.classList.add('done-flash');
        clearTimeout(b._t); b._t=setTimeout(()=>{ b.textContent='Add to cart'; },1600); };
    }
  };
};

Views.cart = () => ({
  html: `
<section class="page-title"><div class="wrap">
  <div class="crumbs"><a href="#home">Home</a> / Cart</div>
  <h1>Cart</h1>
</div></section>
<div class="wrap"><div class="cart-layout">
  <div id="items"></div>
  <aside class="summary" id="summary">
    <h3>Order summary</h3>
    <div class="row"><span>Subtotal</span><span id="sub"></span></div>
    <div class="row"><span>Shipping</span><span id="ship"></span></div>
    <div class="row total"><span>Total</span><span id="tot"></span></div>
    <a class="btn block" href="#checkout">Checkout</a>
    <p class="note" id="shipNote"></p>
  </aside>
</div></div>`,
  after(){
    const draw = () => {
      const c = Cart.get();
      if(!c.length){
        $('#items').innerHTML = '<div class="empty"><p style="margin-bottom:20px">Your cart is empty.</p><a class="btn" href="#shop">Continue shopping</a></div>';
        $('#summary').style.display='none'; return;
      }
      $('#summary').style.display='';
      $('#items').innerHTML = c.map((i,idx)=>{ const p=byId(i.id); return `
        <div class="line-item">
          <a href="#product-${p.id}" class="ph ${p.tone}"></a>
          <div>
            <a class="li-name" href="#product-${p.id}">${p.name}</a>
            <div class="li-meta">Size ${i.size} · Colour ${i.color+1}</div>
            <div class="li-actions">
              <div class="qty"><button data-a="m" data-i="${idx}" aria-label="Decrease">−</button><span>${i.qty}</span><button data-a="p" data-i="${idx}" aria-label="Increase">+</button></div>
              <button class="rm" data-a="r" data-i="${idx}">Remove</button>
            </div>
          </div>
          <div>${money(p.price*i.qty)}</div>
        </div>`; }).join('');
      const sub=Cart.subtotal(), sh=Cart.shipping();
      $('#sub').textContent=money(sub); $('#ship').textContent = sh===0 ? 'Free' : money(sh); $('#tot').textContent=money(sub+sh);
      $('#shipNote').textContent = sh===0 ? 'Lorem ipsum — you qualify for free shipping.' : `Add ${money(CONFIG.freeShipOver-sub)} more for free shipping.`;
    };
    $('#items').addEventListener('click', e=>{
      const b=e.target.closest('button[data-a]'); if(!b) return;
      const idx=+b.dataset.i, it=Cart.get()[idx];
      if(b.dataset.a==='p') Cart.setQty(idx,it.qty+1);
      if(b.dataset.a==='m') Cart.setQty(idx,it.qty-1);
      if(b.dataset.a==='r') Cart.remove(idx);
      draw();
    });
    draw();
  }
});

Views.checkout = () => {
  const c = Cart.get();
  if(!c.length) return { html: `<section class="page-title"><div class="wrap"><div class="crumbs"><a href="#home">Home</a> / Checkout</div><h1>Checkout</h1></div></section>
    <div class="wrap"><div class="empty"><p style="margin-bottom:20px">Your cart is empty.</p><a class="btn" href="#shop">Continue shopping</a></div></div>` };
  const sub=Cart.subtotal(), sh=Cart.shipping();
  return {
    html: `
<section class="page-title"><div class="wrap">
  <div class="crumbs"><a href="#home">Home</a> / <a href="#cart">Cart</a> / Checkout</div>
  <h1>Checkout</h1>
</div></section>
<div class="wrap"><div class="cart-layout">
  <form id="form" novalidate>
    <div class="form-sec"><h3>Contact</h3>
      <div class="f"><input type="email" name="email" placeholder="Email" required><input type="tel" name="phone" placeholder="Phone" required></div></div>
    <div class="form-sec"><h3>Shipping address</h3>
      <div class="f">
        <div class="f two"><input name="fn" placeholder="First name" required><input name="ln" placeholder="Last name" required></div>
        <input name="addr" placeholder="Address" required>
        <input name="apt" placeholder="Apartment, suite (optional)">
        <div class="f two"><input name="city" placeholder="City" required><input name="pin" placeholder="PIN / ZIP" required></div>
        <select name="country" aria-label="Country"><option>India</option><option>Lorem</option><option>Ipsum</option></select>
      </div></div>
    <div class="form-sec"><h3>Payment</h3>
      <label class="pay"><input type="radio" name="pay" checked> <span>Card — lorem ipsum</span></label>
      <label class="pay"><input type="radio" name="pay"> <span>UPI / wallet — dolor sit</span></label>
      <label class="pay"><input type="radio" name="pay"> <span>Cash on delivery — amet</span></label>
      <p class="note">Demo only. No payment is processed.</p></div>
    <button class="btn block" type="submit">Place order</button>
  </form>
  <aside class="summary">
    <h3>Your order</h3>
    ${c.map(i=>{ const p=byId(i.id); return `<div class="mini"><div class="ph ${p.tone}"></div><div>${p.name}<div class="muted" style="font-size:12px">Size ${i.size} · Qty ${i.qty}</div></div><div>${money(p.price*i.qty)}</div></div>`; }).join('')}
    <div class="row" style="border-top:1px solid var(--line);margin-top:10px"><span>Subtotal</span><span>${money(sub)}</span></div>
    <div class="row"><span>Shipping</span><span>${sh?money(sh):'Free'}</span></div>
    <div class="row total"><span>Total</span><span>${money(sub+sh)}</span></div>
  </aside>
</div></div>`,
    after(){
      $('#form').addEventListener('submit', e=>{
        e.preventDefault();
        const req = $$('#form [required]');
        req.forEach(i=>i.style.borderColor='');
        const bad = req.filter(i=>!i.value.trim());
        if(bad.length){ bad.forEach(i=>i.style.borderColor='#0a0a0a'); bad[0].focus(); toast('Please fill the required fields'); return; }
        const n = 'SB' + Math.floor(100000 + Math.random()*900000);
        Cart.clear();
        swap({ html: `<div class="wrap"><div class="done"><span class="label muted">Order ${n}</span><h1>Thank you.</h1><p class="muted" style="margin-bottom:28px">Lorem ipsum dolor sit amet — this is a concept demo.</p><a class="btn" href="#home">Back to home</a></div></div>` }, 'Order placed');
      });
    }
  };
};

/* ======================= ROUTER + TRANSITIONS ======================= */
const CATS = { topwear:'Topwear', bottomwear:'Bottomwear', outerwear:'Outerwear' };
function parse(){
  const h = location.hash.slice(1).toLowerCase();
  if(!h || h==='home') return { v:'home' };
  if(h==='cart') return { v:'cart' };
  if(h==='checkout') return { v:'checkout' };
  if(h==='shop') return { v:'shop', cat:'' };
  if(h==='shop-sale') return { v:'shop', cat:'__sale' };
  if(h.startsWith('shop-') && CATS[h.slice(5)]) return { v:'shop', cat:CATS[h.slice(5)] };
  if(h.startsWith('product-')){ const id=parseInt(h.slice(8),10); if(byId(id)) return { v:'product', id }; }
  return { v:'home' };
}

function labelFor(r){
  if(r.v==='home') return 'Home';
  if(r.v==='shop') return r.cat==='__sale' ? 'Sale' : (r.cat || 'Shop all');
  if(r.v==='product') return byId(r.id).name;
  return r.v==='cart' ? 'Cart' : 'Checkout';
}

function toTop(){
  const root = document.documentElement, prev = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto'; window.scrollTo(0,0); root.style.scrollBehavior = prev;
}

function mount(view, hold){
  const app = $('#app');
  app.innerHTML = view.html;
  view.after && view.after();
  toTop();
  reveal();
  if(!hold) app.classList.remove('fadeout');
}

/* ----- Curtain wipe: black panel rises, page swaps underneath, panel lifts away ----- */
const Curtain = {
  el:null, state:'idle', p:Promise.resolve(),
  init(){
    this.el = document.createElement('div'); this.el.className = 'curtain'; this.el.setAttribute('aria-hidden','true');
    this.el.innerHTML = '<span class="curtain-l"></span>'; document.body.appendChild(this.el);
  },
  label(t){ $('.curtain-l', this.el).textContent = t || ''; },
  async cover(t){
    this.label(t);
    if(this.state==='out') await this.p;
    if(this.state==='idle'){
      this.state = 'in'; this.el.className = 'curtain in';
      this.p = sleep(650).then(()=>{ this.state = 'covered'; });
    }
    await this.p;
  },
  reveal(){
    if(this.state!=='covered') return Promise.resolve();
    this.state = 'out'; this.el.className = 'curtain out';
    this.p = sleep(750).then(()=>{ this.el.className = 'curtain'; this.state = 'idle'; });
    return this.p;
  }
};

let _tok = 0, _first = true, _shop = null, _ex = null;
async function swap(view, label){
  const my = ++_tok;
  if(_first || calm()){ _first = false; mount(view); return; }
  await Curtain.cover(label);
  if(my !== _tok) return;          /* a newer navigation took over */
  mount(view);
  await sleep(120);
  if(my !== _tok) return;
  Curtain.reveal();
}

/* ----- Image expand: the tapped product image grows into the product page ----- */
function captureCards(){
  document.addEventListener('click', e => {
    const card = e.target.closest('.card'); if(!card) return;
    const m = $('.card-media .ph', card); if(!m) return;
    const r = m.getBoundingClientRect();
    _ex = { left:r.left, top:r.top, width:r.width, height:r.height, cls:m.className, t:performance.now() };
  }, true);
}
async function expand(view, ex){
  const my = ++_tok, app = $('#app');
  const clone = document.createElement('div');
  clone.className = ex.cls + ' xfer'; clone.dataset.label = '';
  Object.assign(clone.style, { left:ex.left+'px', top:ex.top+'px', width:ex.width+'px', height:ex.height+'px' });
  document.body.appendChild(clone);
  app.classList.add('fadeout');
  await sleep(300);
  if(my !== _tok){ clone.remove(); return; }
  mount(view, true);                                   /* new page is in place but still hidden */
  const tgt = $('.gallery .ph');
  if(!tgt){ clone.remove(); app.classList.remove('fadeout'); return; }
  void document.body.offsetHeight;
  const t = tgt.getBoundingClientRect();
  clone.dataset.label = 'Main';
  void clone.offsetWidth;
  clone.classList.add('go');
  Object.assign(clone.style, { left:t.left+'px', top:t.top+'px', width:t.width+'px', height:t.height+'px' });
  await sleep(880);
  if(my !== _tok){ clone.remove(); return; }
  app.classList.remove('fadeout');
  await sleep(380);
  clone.remove();
}

function go(){
  const r = parse();
  if(Drawer.open) Drawer.hide(true);
  if(r.v==='shop' && _shop && $('#shopRoot')){ _tok++; _ex = null; _shop.setCat(r.cat); return; }  /* filter in place */
  _shop = null;
  const ex = _ex; _ex = null;
  const view = Views[r.v](r);
  if(r.v==='product' && ex && performance.now()-ex.t < 1500 && !_first && !calm()) return expand(view, ex);
  swap(view, labelFor(r));
}

/* ----- Cart drawer: header Cart opens a side panel instead of a new page ----- */
const Drawer = {
  open:false, last:null,
  init(){
    document.body.insertAdjacentHTML('beforeend', `
      <div class="scrim" id="scrim"></div>
      <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Cart" aria-hidden="true">
        <div class="drawer-head"><h3>Cart <span id="drCount"></span></h3><button class="drawer-x" id="drClose" aria-label="Close cart"><i></i></button></div>
        <div class="drawer-body" id="drBody"></div>
        <div class="drawer-foot" id="drFoot"></div>
      </aside>`);
    $('#scrim').addEventListener('click', () => this.hide());
    $('#drClose').addEventListener('click', () => this.hide());
    $('#drBody').addEventListener('click', e => {
      const b = e.target.closest('button[data-a]');
      if(b){
        const idx = +b.dataset.i, it = Cart.get()[idx];
        if(b.dataset.a==='p') Cart.setQty(idx, it.qty+1);
        if(b.dataset.a==='m') Cart.setQty(idx, it.qty-1);
        if(b.dataset.a==='r') Cart.remove(idx);
        return;
      }
      if(e.target.closest('a')) this.hide(true);
    });
    $('#drFoot').addEventListener('click', e => { if(e.target.closest('a')) this.hide(true); });
    document.addEventListener('keydown', e => {
      if(!this.open) return;
      if(e.key==='Escape'){ this.hide(); return; }
      if(e.key!=='Tab') return;
      const f = $$('#drawer a[href], #drawer button').filter(x => x.offsetParent !== null);
      if(!f.length) return;
      const first = f[0], last = f[f.length-1];
      if(!$('#drawer').contains(document.activeElement)){ e.preventDefault(); first.focus(); }
      else if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    });
    document.addEventListener('click', e => {
      const a = e.target.closest('.nav-right a[href="#cart"]'); if(!a) return;
      const v = parse().v; if(v==='cart') return;          /* already on the cart page */
      e.preventDefault(); this.show();
    });
  },
  draw(){
    const c = Cart.get();
    $('#drCount').textContent = c.length ? '(' + Cart.count() + ')' : '';
    if(!c.length){
      $('#drBody').innerHTML = '<div class="empty" style="padding:60px 0"><p style="margin-bottom:20px">Your cart is empty.</p><a class="btn" href="#shop">Continue shopping</a></div>';
      $('#drFoot').innerHTML = ''; $('#drFoot').style.display = 'none'; return;
    }
    $('#drFoot').style.display = '';
    $('#drBody').innerHTML = c.map((i,idx) => { const p = byId(i.id); return `
      <div class="dr-item">
        <a href="#product-${p.id}" class="ph ${p.tone}" aria-label="${p.name}"></a>
        <div>
          <a class="li-name" href="#product-${p.id}">${p.name}</a>
          <div class="li-meta">Size ${i.size} · Colour ${i.color+1}</div>
          <div class="li-actions">
            <div class="qty"><button data-a="m" data-i="${idx}" aria-label="Decrease">−</button><span>${i.qty}</span><button data-a="p" data-i="${idx}" aria-label="Increase">+</button></div>
            <button class="rm" data-a="r" data-i="${idx}">Remove</button>
          </div>
        </div>
        <div>${money(p.price*i.qty)}</div>
      </div>`; }).join('');
    const sub = Cart.subtotal(), sh = Cart.shipping();
    $('#drFoot').innerHTML = `
      <div class="row"><span>Subtotal</span><span>${money(sub)}</span></div>
      <div class="row"><span>Shipping</span><span>${sh===0 ? 'Free' : money(sh)}</span></div>
      <div class="row total"><span>Total</span><span>${money(sub+sh)}</span></div>
      <a class="btn block" href="#checkout">Checkout</a>
      <a class="btn ghost block" href="#cart">View cart</a>`;
  },
  show(){
    if(this.open) return;
    this.last = document.activeElement; this.open = true; this.draw();
    $('#scrim').classList.add('on'); $('#drawer').classList.add('on'); $('#drawer').setAttribute('aria-hidden','false');
    document.documentElement.classList.add('locked');
    setTimeout(() => $('#drClose').focus({preventScroll:true}), 60);
  },
  hide(noFocus){
    if(!this.open) return;
    this.open = false;
    $('#scrim').classList.remove('on'); $('#drawer').classList.remove('on'); $('#drawer').setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('locked');
    if(!noFocus && this.last && this.last.focus) this.last.focus({preventScroll:true});
  }
};

/* ---------- Click ripple ---------- */
/* ---------- Intro: wordmark + tagline loader on first open ---------- */
function intro(){
  const el = document.createElement('div');
  el.className = 'intro'; el.setAttribute('aria-hidden','true');
  el.innerHTML = `
    <div class="intro-mid">
      <div class="intro-word">${[...CONFIG.brand].map((ch,i)=>`<span class="intro-l"><i style="animation-delay:${.25+i*.09}s">${ch}</i></span>`).join('')}</div>
      <p class="intro-tag">${CONFIG.tagline}</p>
    </div>
    <div class="intro-foot">
      <span class="intro-count" id="introCount">000</span>
      <span class="intro-line"><b></b></span>
      <span class="intro-year">Concept store · 2026</span>
    </div>`;
  document.body.prepend(el);
  if(calm()){ el.remove(); return; }
  document.documentElement.classList.add('introing');
  const DUR = 2300, t0 = performance.now(), num = $('#introCount');
  const tick = now => {
    const p = Math.min(1, (now - t0) / DUR);
    const eased = 1 - Math.pow(1 - p, 3);
    num.textContent = String(Math.round(eased * 100)).padStart(3,'0');
    if(p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  setTimeout(() => {
    el.classList.add('lift');
    const app = $('#app'); app.classList.add('landing');
    document.documentElement.classList.remove('introing');
    setTimeout(() => app.classList.remove('landing'), 2600);
    setTimeout(() => el.remove(), 1200);
  }, DUR + 450);
}

function dropdowns(){
  document.addEventListener('click', e => { $$('.dd.open').forEach(d => { if(!d.contains(e.target)){ d.classList.remove('open'); const b=$('.dd-btn',d); b && b.setAttribute('aria-expanded','false'); } }); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') $$('.dd.open').forEach(d => { d.classList.remove('open'); const b=$('.dd-btn',d); if(b){ b.setAttribute('aria-expanded','false'); b.focus(); } }); });
}
function ripples(){
  document.addEventListener('click', e => {
    const b = e.target.closest('.btn, .chip, .size');
    if(!b || calm()) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
    const s = document.createElement('span'); s.className = 'rip';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d/2}px;top:${e.clientY - r.top - d/2}px`;
    if(getComputedStyle(b).position === 'static') b.style.position = 'relative';
    b.style.overflow = 'hidden'; b.appendChild(s); setTimeout(()=>s.remove(), 700);
  });
}

/* ---------- Coming soon page (shown instead of the store while CONFIG.comingSoon is true) ---------- */
function comingSoon(){
  const marq = Array.from({length:8}, () => '<span>Coming soon</span><span>—</span><span>Lorem ipsum</span><span>—</span>').join('');
  $('#app').innerHTML = `
  <section class="cs">
    <header class="cs-bar"><div class="wrap cs-top">
      <div class="logo">${CONFIG.brand}</div>
      <span class="label">Opening soon</span>
    </div></header>

    <div class="wrap cs-main">
      <span class="label muted cs-fade">Collection 01 · Lorem</span>
      <h1 class="cs-h"><span class="cs-line"><span>Coming</span></span><span class="cs-line"><span>soon.</span></span></h1>
      <div class="cs-row cs-fade">
        <p class="cs-copy">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <form class="cs-form" id="csForm" novalidate>
          <label class="label" for="csEmail">Get notified at launch</label>
          <div class="cs-field"><input id="csEmail" type="email" placeholder="Enter your email" autocomplete="email" required><button type="submit">Notify me</button></div>
          <p class="cs-msg" id="csMsg" role="status" aria-live="polite"></p>
        </form>
      </div>
    </div>

    <div class="marquee" aria-hidden="true"><div class="marquee-track">${marq}</div></div>
    <footer class="wrap cs-foot"><span>© 2026 ${CONFIG.brand}. Concept project.</span><span>Instagram · Pinterest · YouTube</span></footer>
  </section>`;
  $('#csForm').addEventListener('submit', e => {
    e.preventDefault();
    const i = $('#csEmail'), m = $('#csMsg');
    if(!/^\S+@\S+\.\S+$/.test(i.value.trim())){ m.className = 'cs-msg err'; m.textContent = 'Enter a valid email address.'; i.focus(); return; }
    i.value = ''; m.className = 'cs-msg ok'; m.textContent = 'You are on the list. This is a demo, so nothing is stored.';
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  ripples();
  if(CONFIG.comingSoon){ comingSoon(); intro(); return; }
  chrome(); dropdowns(); intro();
  window.addEventListener('hashchange', go);
  go();
});
