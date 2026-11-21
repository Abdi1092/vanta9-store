/* ============ STAGE 3: PRODUCT DATA ============
   Every product is one object in this array. Add, edit or delete items
   here and the whole store updates by itself. */
const PRODUCTS = [
  {id:1, name:'Phantom Runner',   type:'Shoes',       gender:'Unisex', price:1290, icon:'👟', hue:260},
  {id:2, name:'Night Shift High', type:'Shoes',       gender:'Men',    price:1590, icon:'👟', hue:220, sale:true},
  {id:3, name:'Ash Slide',        type:'Shoes',       gender:'Women',  price:490,  icon:'🩴', hue:300},
  {id:4, name:'Royalty shoes',   type:'Shoes',       gender:'Kids',   price:790,  icon:'👟', hue:160, img:'images/shoes.jpg'},
  {id:5, name:'Void Hoodie',      type:'Clothing',    gender:'Unisex', price:899,  icon:'🧥', hue:250, img:'images/void-hoodie.jpg.jpg'},
  {id:6, name:'Static Tee',       type:'Clothing',    gender:'Men',    price:349,  icon:'👕', hue:200},
  {id:7, name:'Cargo Pants',      type:'Clothing',    gender:'Men',    price:749,  icon:'👖', hue:30,  sale:true},
  {id:8, name:'Crop Windbreaker', type:'Clothing',    gender:'Women',  price:849,  icon:'🧥', hue:330},
  {id:9, name:'Lowlight Leggings',type:'Clothing',    gender:'Women',  price:499,  icon:'👖', hue:280},
  {id:10,name:'Mini Hoodie',      type:'Clothing',    gender:'Kids',   price:499,  icon:'🧥', hue:190},
  {id:11,name:'A letter Cap',       type:'Accessories', gender:'Unisex', price:249,  icon:'🧢', hue:240, img:'images/a cap.jpg'},
    {id:12,name:'Blackout Tee',     type:'Clothing',    gender:'Men',    price:299,  icon:'👕', hue:270, sale:true, img:'images/t shirts.jpg'},
  {id:13,name:'Crossbody Bag',    type:'Accessories', gender:'Unisex', price:399,  icon:'👜', hue:20, img:'images/crossbody bags.jpg'},
  {id:14,name:'Mesh Socks 3-pack',type:'Accessories', gender:'Unisex', price:149,  icon:'🧦', hue:210, img:'images/mesh socks.jpg'},
  {id:15,name:'Shadow Puffer',    type:'Clothing',    gender:'Women',  price:1990, icon:'🧥', hue:310, img:'images/shadow puffer.jpg'},
  {id:16,name:'Storm Shell',      type:'Clothing',    gender:'Men',    price:1490, icon:'🧥', hue:230, sale:true, img:'images/stormshell.jpg'}
];
const GENDERS = ['All','Men','Women','Kids','Sale'];
const TYPES   = ['All','Shoes','Clothing','Accessories'];

/* ============ HELPERS ============ */
const $ = s => document.querySelector(s);
const kr = n => n.toLocaleString('sv-SE') + ' kr';
const priceOf = p => p.sale ? Math.round(p.price * 0.7) : p.price;   // sale = 30% off
function sizesFor(p){
  if (p.type === 'Accessories') return ['One size'];
  if (p.type === 'Shoes') return p.gender === 'Kids' ? ['28','30','32','34'] : ['38','39','40','41','42','43','44'];
  return p.gender === 'Kids' ? ['110','128','140'] : ['XS','S','M','L','XL'];
}

 function pic(p){
  const photo = p.img
    ? '<img src="'+p.img+'" alt="'+p.name+'" loading="lazy" onerror="this.remove()">'
    : '';
  return '<div class="pic" style="background:linear-gradient(145deg,hsl('+p.hue+' 35% 22%),hsl('+p.hue+' 45% 8%))">'+
         p.icon + photo + (p.sale ? '<span class="tag">Sale −30%</span>' : '') + '</div>';
}
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.style.display = 'block';
  clearTimeout(toast.id); toast.id = setTimeout(() => t.style.display = 'none', 2200);
}

/* ============ STAGE 4: CATEGORIES, FILTERS, SEARCH, SORT ============ */
const state = {gender:'All', type:'All', q:'', sort:'new'};

function visible(){
  let list = PRODUCTS.filter(p => {
    if (state.gender === 'Sale' && !p.sale) return false;
    if (['Men','Women','Kids'].includes(state.gender) && p.gender !== state.gender && p.gender !== 'Unisex') return false;
    if (state.type !== 'All' && p.type !== state.type) return false;
    if (state.q && !p.name.toLowerCase().includes(state.q.toLowerCase())) return false;
    return true;
  });
  if (state.sort === 'low')  list.sort((a,b) => priceOf(a) - priceOf(b));
  if (state.sort === 'high') list.sort((a,b) => priceOf(b) - priceOf(a));
  if (state.sort === 'new')  list.sort((a,b) => b.id - a.id);
  return list;
}

function renderNav(){
  $('#nav').innerHTML = GENDERS.map(g =>
    '<button class="'+(g==='Sale'?'sale ':'')+(state.gender===g?'on':'')+'" data-g="'+g+'">'+(g==='All'?'Shop all':g)+'</button>').join('');
  $('#chips').innerHTML = TYPES.map(t =>
    '<button class="'+(state.type===t?'on':'')+'" data-t="'+t+'">'+t+'</button>').join('');
}
function renderGrid(){
  const list = visible();
  $('#grid').innerHTML = list.length ? list.map(p =>
    '<button class="card" data-id="'+p.id+'">'+pic(p)+
    '<div class="info"><b>'+p.name+'</b><small>'+p.gender+' · '+p.type+'</small><br>'+
    kr(priceOf(p))+(p.sale?'<span class="was">'+kr(p.price)+'</span>':'')+'</div></button>').join('')
    : '<div class="empty">No products match. Clear the search or pick another category.</div>';
}
function refresh(){ renderNav(); renderGrid(); }

$('#nav').onclick  = e => { const g = e.target.dataset.g; if (g){ state.gender = g; refresh(); } };
$('#chips').onclick = e => { const t = e.target.dataset.t; if (t){ state.type = t; refresh(); } };
$('#q').oninput    = e => { state.q = e.target.value; renderGrid(); };
$('#sort').onchange = e => { state.sort = e.target.value; renderGrid(); };
$('#grid').onclick = e => { const c = e.target.closest('.card'); if (c) openProduct(+c.dataset.id); };

/* ============ STAGE 5: PRODUCT PAGE (MODAL) + SIZE PICKER ============ */
let chosenSize = null;
function openProduct(id){
  const p = PRODUCTS.find(x => x.id === id); chosenSize = null;
  $('#modal').innerHTML = pic(p) +
    '<h2 style="font-size:32px;margin-top:14px">'+p.name+'</h2>'+
    '<div>'+kr(priceOf(p))+(p.sale?'<span class="was">'+kr(p.price)+'</span>':'')+'</div>'+
    '<p style="color:var(--mute)">Pick your size</p>'+
    '<div class="sizes">'+sizesFor(p).map(s => '<button data-s="'+s+'">'+s+'</button>').join('')+'</div>'+
    '<button class="pay" id="add">Add to cart</button>';
  $('#modal .sizes').onclick = e => {
    if (!e.target.dataset.s) return;
    chosenSize = e.target.dataset.s;
    document.querySelectorAll('.sizes button').forEach(b => b.classList.toggle('on', b === e.target));
  };
  $('#add').onclick = () => {
    if (!chosenSize) return toast('Pick a size first');
    addToCart(p.id, chosenSize); closeAll(); toast(p.name + ' added to cart');
  };
  $('#veil').classList.add('open'); $('#modal').classList.add('open');
}

/* ============ STAGE 6: CART SAVED IN THE BROWSER ============ */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('vanta9-cart') || '[]'); } catch (e) {}
const saveCart = () => { try { localStorage.setItem('vanta9-cart', JSON.stringify(cart)); } catch (e) {} };

function addToCart(id, size){
  const hit = cart.find(i => i.id === id && i.size === size);
  hit ? hit.qty++ : cart.push({id, size, qty:1});
  saveCart(); renderCart();
}
function changeQty(i, d){
  cart[i].qty += d;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  saveCart(); renderCart();
}
function renderCart(){
  $('#count').textContent = cart.reduce((n, i) => n + i.qty, 0);
  const total = cart.reduce((n, i) => n + priceOf(PRODUCTS.find(p => p.id === i.id)) * i.qty, 0);
  $('#drawer').innerHTML = '<h2 style="font-size:30px;margin-bottom:8px">Your cart</h2>' +
    (cart.length ? cart.map((i, k) => {
      const p = PRODUCTS.find(x => x.id === i.id);
      return '<div class="line"><div class="t"><b>'+p.name+'</b><br><small>Size '+i.size+' · '+kr(priceOf(p))+'</small></div>'+
        '<div class="qty"><button data-k="'+k+'" data-d="-1" aria-label="Remove one">−</button> '+i.qty+
        ' <button data-k="'+k+'" data-d="1" aria-label="Add one">+</button></div></div>';
    }).join('') + '<div class="total"><span>Total</span><b>'+kr(total)+'</b></div><button class="pay" id="checkout">Checkout</button>'
    : '<p style="color:var(--mute)">Your cart is empty. Pick something from the shop.</p>') +
    '<button class="icon" style="margin-top:14px" id="closeCart">Close</button>';
  const co = $('#checkout'); if (co) co.onclick = () => toast('Checkout is Stage 7: we connect Stripe test mode next.');
  $('#closeCart').onclick = closeAll;
}
$('#drawer').onclick = e => { if (e.target.dataset.k) changeQty(+e.target.dataset.k, +e.target.dataset.d); };
$('#openCart').onclick = () => { $('#veil').classList.add('open'); $('#drawer').classList.add('open'); };

function closeAll(){ document.querySelectorAll('.open').forEach(el => el.classList.remove('open')); }
$('#veil').onclick = closeAll;
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

/* ============ START ============ */
refresh(); renderCart();
