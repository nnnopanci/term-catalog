/* ===== 工具 ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ===== 主题 ===== */
const themeBtn = $('#theme-toggle');
function applyTheme(mode) {
  document.documentElement.dataset.theme = mode;
  try { localStorage.setItem('term-theme', mode); } catch (e) {}
}
(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('term-theme'); } catch (e) {}
  applyTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
})();
themeBtn.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

/* ===== 全局状态 ===== */
let activeDomain = DOMAINS[0].id;
let activeCat = 'all';          // 当前领域内的子分类过滤
let favOnly = false;
const favSet = new Set();
try { (JSON.parse(localStorage.getItem('term-favs') || '[]')).forEach((n) => favSet.add(n)); } catch (e) {}

const catalogEl = $('#catalog');
const domainChipsEl = $('#domain-chips');
const catChipsEl = $('#cat-chips');
const headingEl = $('#catalog-heading');
const searchInput = $('#search');
const emptyResult = $('#empty-result');
let cardIndex = [];             // { term, domain, cat, card }

const domainTerms = (d) => d.cats.reduce((n, c) => n + c.terms.length, 0);

/* ===== 渲染：页签（领域横排在筛选栏，子分类竖排在侧栏） ===== */
function buildChips() {
  domainChipsEl.innerHTML = '';
  for (const d of DOMAINS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'cat-chip' + (d.id === activeDomain && !favOnly ? ' on' : '');
    chip.dataset.domain = d.id;
    chip.innerHTML = `${esc(d.zh)}<span class="chip-count">${domainTerms(d)}</span>`;
    chip.addEventListener('click', () => switchDomain(d.id));
    domainChipsEl.appendChild(chip);
  }
  const fav = document.createElement('button');
  fav.type = 'button';
  fav.className = 'cat-chip' + (favOnly ? ' on' : '');
  fav.id = 'fav-chip';
  fav.innerHTML = `收藏<span class="chip-count">${favSet.size}</span>`;
  fav.addEventListener('click', () => { favOnly = !favOnly; buildChips(); render(); });
  domainChipsEl.appendChild(fav);

  const d = DOMAINS.find((x) => x.id === activeDomain);
  catChipsEl.innerHTML = '';
  if (d && !favOnly) {
    for (const c of d.cats) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'cat-chip' + (activeCat === c.name ? ' on' : '');
      chip.textContent = c.name;
      chip.addEventListener('click', () => { activeCat = activeCat === c.name ? 'all' : c.name; buildChips(); render(); });
      catChipsEl.appendChild(chip);
    }
  }
}

function switchDomain(id) {
  if (activeDomain === id && !favOnly) return;
  activeDomain = id;
  activeCat = 'all';
  favOnly = false;
  buildChips();
  render();
  scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===== 渲染：主目录 ===== */
function sceneHtml(termId) {
  return SCENES[termId] || '';
}

function render() {
  catalogEl.innerHTML = '';
  cardIndex = [];
  emptyResult.hidden = true;

  if (favOnly) {
    headingEl.innerHTML = `<h1>我的收藏</h1>`;
    const favs = [];
    for (const d of DOMAINS) for (const c of d.cats) for (const t of c.terms) if (favSet.has(t.id)) favs.push({ t, d, c });
    if (!favs.length) {
      emptyResult.hidden = false;
      emptyResult.querySelector('p').textContent = '还没有收藏，去术语卡片右上角点亮 ★ 吧。';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'grid';
    for (const { t, d, c } of favs) grid.appendChild(makeCard(t, d, c));
    catalogEl.appendChild(grid);
    applyFilter();
    return;
  }

  const d = DOMAINS.find((x) => x.id === activeDomain);
  const title = d.h1 || `${d.zh} VibeCoding 术语`;
  headingEl.innerHTML = `<h1>${esc(title)}</h1>` + (d.lead ? `<p>${esc(d.lead)}</p>` : '');

  for (const c of d.cats) {
    if (activeCat !== 'all' && activeCat !== c.name) continue;
    const section = document.createElement('section');
    section.className = 'cat-section';
    section.id = `cat-${c.name}`;
    section.innerHTML = `<div class="cat-title">${esc(c.name)}<span>${c.terms.length} 个条目</span></div>`;
    const grid = document.createElement('div');
    grid.className = 'grid' + (d.id === 'design' ? ' grid-style' : '');
    for (const t of c.terms) grid.appendChild(makeCard(t, d, c));
    section.appendChild(grid);
    catalogEl.appendChild(section);
  }
  applyFilter();
  observeSections();
  fitScenes();
}

function makeCard(term, domain, cat) {
  const card = document.createElement('article');
  card.className = 'card';
  card.tabIndex = 0;
  card.dataset.id = term.id;
  const faved = favSet.has(term.id);
  card.innerHTML = `
    <div class="card-head">
      <div class="card-title-group"><h3>${esc(term.zh)}${term.en && term.en !== term.zh ? `<span class="en">${esc(term.en)}</span>` : ''}</h3></div>
      <button type="button" class="favorite-button${faved ? ' on' : ''}" aria-label="收藏术语" aria-pressed="${faved}" title="收藏术语">
        <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M23.9986 5L17.8856 17.4776L4 19.4911L14.0589 29.3251L11.6544 43L23.9986 36.4192L36.3454 43L33.9586 29.3251L44 19.4911L30.1913 17.4776L23.9986 5Z"/></svg>
      </button>
    </div>
    <div class="card-tagline card-quote">${esc(term.desc)}</div>
    <div class="card-demo">${sceneHtml(term.id)}</div>`;
  card.addEventListener('click', (e) => {
    if (e.target.closest('.favorite-button')) return;
    openModal(term, domain, cat);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target === card) openModal(term, domain, cat);
  });
  card.querySelector('.favorite-button').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFav(term.id);
  });
  cardIndex.push({ term, domain, cat, card });
  return card;
}

/* ===== 收藏 ===== */
function persistFavs() {
  try { localStorage.setItem('term-favs', JSON.stringify([...favSet])); } catch (e) {}
}
function toggleFav(id) {
  if (favSet.has(id)) favSet.delete(id); else favSet.add(id);
  persistFavs();
  const chip = $('#fav-chip .chip-count');
  if (chip) chip.textContent = favSet.size;
  for (const { term, card } of cardIndex) {
    if (term.id !== id) continue;
    const on = favSet.has(id);
    const btn = card.querySelector('.favorite-button');
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', String(on));
  }
  if (currentEntry && currentEntry.term.id === id) {
    const on = favSet.has(id);
    $('#modal-fav').textContent = on ? '★ 已收藏' : '☆ 收藏';
  }
  if (favOnly) { buildChips(); render(); }
}

/* ===== 搜索（模糊：整句 → 分词 → 字符覆盖率） ===== */
function norm(s) { return s.toLowerCase().trim(); }
function fuzzyHit(hay, raw) {
  const q = norm(raw);
  if (!q) return true;
  if (hay.includes(q)) return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((t) => {
    if (hay.includes(t)) return true;
    if (t.length < 2) return false;
    const chars = [...new Set([...t])];
    const covered = chars.filter((ch) => hay.includes(ch)).length;
    return covered / chars.length >= (t.length <= 6 ? 0.6 : 0.7);
  });
}

function applyFilter() {
  const q = searchInput.value;
  let visible = 0;
  for (const { term, card } of cardIndex) {
    const hitQ = fuzzyHit(norm(`${term.zh} ${term.en} ${term.desc}`), q);
    card.hidden = !hitQ;
    if (hitQ) visible++;
  }
  for (const section of catalogEl.querySelectorAll('.cat-section')) {
    let any = false;
    for (const el of section.querySelectorAll('.group-name, .card')) {
      if (el.classList.contains('group-name')) {
        const next = el.nextElementSibling;
        el.hidden = !(next && !next.hidden);
      } else if (!el.hidden) any = true;
    }
    section.hidden = !any;
  }
  const noResult = visible === 0 && (q || favOnly);
  emptyResult.hidden = !noResult;
  if (noResult && !favOnly) emptyResult.querySelector('p').textContent = '没找到相关术语，换个说法试试？';
}

searchInput.addEventListener('input', applyFilter);

/* ===== 详情弹窗 ===== */
const modalRoot = $('#modal');
let currentEntry = null;
function openModal(term, domain, cat) {
  currentEntry = { term, domain, cat };
  $('#modal-kicker').textContent = `${domain.zh} · ${cat.name}`;
  $('#modal-title').textContent = term.zh;
  $('#modal-en').textContent = term.en || '';
  $('#modal-desc').textContent = term.desc;
  $('#modal-demo').innerHTML = sceneHtml(term.id);
  $('#modal-fav').textContent = favSet.has(term.id) ? '★ 已收藏' : '☆ 收藏';
  modalRoot.hidden = false;
  document.body.style.overflow = 'hidden';
  fitScenes(modalRoot);
}
function closeModal() {
  modalRoot.hidden = true;
  currentEntry = null;
  document.body.style.overflow = '';
}
modalRoot.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
$('#modal-copy').addEventListener('click', () => {
  if (!currentEntry) return;
  const { zh, en } = currentEntry.term;
  const text = en && en !== zh ? `${zh}（${en}）` : zh;
  navigator.clipboard?.writeText(text).then(() => {
    const b = $('#modal-copy');
    b.textContent = '已复制 ✓';
    setTimeout(() => { b.textContent = '复制术语'; }, 1400);
  });
});
$('#modal-fav').addEventListener('click', () => { if (currentEntry) toggleFav(currentEntry.term.id); });

/* ===== 快捷键 ===== */
document.addEventListener('keydown', (e) => {
  if (activeView !== 'terms') return;
  if (e.key === '/' && document.activeElement !== searchInput && !e.target.closest('input,textarea')) {
    e.preventDefault();
    searchInput.focus();
  }
  if (e.key === 'Escape') {
    if (!modalRoot.hidden) closeModal();
    else if (document.activeElement === searchInput) { searchInput.value = ''; applyFilter(); searchInput.blur(); }
  }
});

/* ===== 视图切换：术语 / 知识文章 ===== */
const termsView = $('#terms-view');
const knowledgeView = $('#knowledge-view');
const navViewBtn = $('#nav-view');
let activeView = 'terms';

function buildKnowledge() {
  const box = $('#knowledge-catalog');
  if (box.dataset.done) return;
  box.dataset.done = '1';
  for (const group of ARTICLES) {
    const section = document.createElement('section');
    section.className = 'cat-section';
    section.innerHTML = `<div class="cat-title">${esc(group.cat)}<span>${group.items.length} 篇</span></div>`;
    const grid = document.createElement('div');
    grid.className = 'grid';
    for (const a of group.items) {
      const card = document.createElement('article');
      card.className = 'card k-card';
      card.innerHTML = `
        <div class="card-head">
          <div class="card-title-group"><h3>${esc(a.title)}</h3></div>
        </div>
        <div class="card-tagline">${esc(a.desc)}</div>
        <ul class="k-points">${a.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        <div class="k-foot"><span class="k-src">来源：book.oiloil.org · 免费部分要点整理</span></div>`;
      grid.appendChild(card);
    }
    section.appendChild(grid);
    box.appendChild(section);
  }
}

function switchView(v) {
  if (activeView === v) return;
  activeView = v;
  termsView.hidden = v !== 'terms';
  knowledgeView.hidden = v !== 'knowledge';
  navViewBtn.textContent = v === 'terms' ? '知识文章' : '回到术语';
  navViewBtn.classList.toggle('on', v === 'knowledge');
  if (v === 'knowledge') buildKnowledge();
  scrollTo({ top: 0, behavior: 'smooth' });
}
navViewBtn.addEventListener('click', () => switchView(activeView === 'terms' ? 'knowledge' : 'terms'));

/* ===== 滚动：吸顶筛选栏状态 + 返回顶部 + 分区高亮 ===== */
const backTop = $('#back-top');
const finderEl = $('#finder');
addEventListener('scroll', () => {
  backTop.classList.toggle('show', scrollY > 600);
  finderEl.classList.toggle('is-stuck', scrollY > 8);
}, { passive: true });
backTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

let spy = null;
function observeSections() {
  if (spy) spy.disconnect();
  if (activeCat !== 'all' || favOnly) return;
  spy = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting && en.intersectionRatio > 0) {
        const name = en.target.id.replace('cat-', '');
        catChipsEl.querySelectorAll('.cat-chip').forEach((c) => c.classList.toggle('on', c.textContent.startsWith(name)));
      }
    }
  }, { rootMargin: '-30% 0px -60% 0px' });
  catalogEl.querySelectorAll('.cat-section').forEach((s) => spy.observe(s));
}

/* ===== 场景适配 =====
 * 普通领域：场景为流式布局（height:100% 填满演示区，行高由同行最高卡片决定），
 *           与原站一致不做缩放；超出部分由 overflow:hidden 裁掉（原站行为相同）。
 * 设计风格领域（grid-style）：演示区固定 190px，超出场景
 *           「测真实尺寸 → 固定基准 → 等比缩放居中」变成缩略模型。 */
function fitScenes(scope = document) {
  for (const demo of scope.querySelectorAll('.card-demo, .modal-demo')) {
    const root = demo.firstElementChild;
    if (!root) continue;
    root.classList.remove('scene-fitted');
    root.style.transform = '';
    root.style.width = '';
    root.style.height = '';
    const inGridStyle = !!demo.closest('.grid-style');
    if (!inGridStyle && !demo.matches('.modal-demo')) continue;
    const dh0 = demo.clientHeight, dw0 = demo.clientWidth;
    if (root.scrollHeight <= dh0 + 2 && root.scrollWidth <= dw0 + 2) continue;
    // 流式场景在约束态下量不准：固定尺寸 → 复测 → 再固定，循环收敛
    root.classList.add('scene-fitted');
    let natW = root.scrollWidth, natH = root.scrollHeight;
    for (let i = 0; i < 3; i++) {
      root.style.width = natW + 'px';
      root.style.height = natH + 'px';
      root.classList.add('scene-measuring');
      const w2 = root.scrollWidth, h2 = root.scrollHeight;
      root.classList.remove('scene-measuring');
      if (w2 === natW && h2 === natH) break;
      natW = w2; natH = h2;
    }
    root.style.width = natW + 'px';
    root.style.height = natH + 'px';
    const s = Math.max(Math.min((dh0 - 6) / natH, (dw0 - 6) / natW, 1), 0.15);
    root.style.transform = `translate(-50%, -50%) scale(${s})`;
  }
}
let fitTimer = null;
const queueFit = () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitScenes, 60); };
addEventListener('resize', queueFit);

/* ===== 启动 ===== */
const totalTerms = DOMAINS.reduce((n, d) => n + domainTerms(d), 0);
$('#nav-count').textContent = `${totalTerms} 词`;
buildChips();
render();
fitScenes();
