const POSTS_URL = './data.json';
const ITEMS_PER_PAGE = 6;

let state = {
  posts: [],
  filtered: [],
  currentCategory: 'all',
  query: '',
  currentPage: 1,
  totalPages: 1
};

const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

const formatDate = iso => {
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
};

async function loadPosts(){
  const res = await fetch(POSTS_URL);
  const data = await res.json();
  data.posts.sort((a,b)=> new Date(b.updated) - new Date(a.updated));
  state.posts = data.posts;
  applyFilters();
}

function applyFilters(){
  const cat = state.currentCategory;
  const q = state.query.trim().toLowerCase();

  state.filtered = state.posts.filter(p =>
    (cat === 'all' || p.category === cat) &&
    (q === '' || p.title.toLowerCase().includes(q))
  );

  state.totalPages = Math.max(1, Math.ceil(state.filtered.length / ITEMS_PER_PAGE));
  if(state.currentPage > state.totalPages) state.currentPage = state.totalPages;
  render();
}

function render(){
  renderCards();
  renderPagination();
  updateNavActive();
}



function renderCards(){
  const container = qs('#cards');
  container.innerHTML = '';

  const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
  const visible = state.filtered.slice(start, start + ITEMS_PER_PAGE);

  if(visible.length === 0){
    container.innerHTML = `<div class="empty" style="padding:40px;border-radius:12px;background:rgba(255,255,255,0.6);text-align:center">No results found.</div>`;
    return;
  }

  for(const p of visible){
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="thumb" style="background-image:url('${p.thumbnail}')">
        <div class="badge">${p.category.toUpperCase()}</div>
      </div>
      <h3>${escapeHtml(p.title)}</h3>
      <div class="meta">${formatDate(p.updated)}</div>
      <div class="genres">${p.genres.map(g=>`<div class="genre">${escapeHtml(g)}</div>`).join('')}</div>
      <p class="desc">${escapeHtml(p.description)}</p>
      <div class="actions">
        <button class="btn" data-id="${p.id}" ${p.download_link ? '' : 'disabled'}>Details</button>
      </div>
    `;

    // --- Details Button ---
    const dlBtn = card.querySelector('.btn');
    dlBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering card click
      if(p.link){
        window.location.href = p.link;
      } else {
        alert('No details page. Add "link" in data.json');
      }
    });

    // --- CLICK ENTIRE CARD ---
    card.addEventListener('click', () => {
      if (p.link) {
        window.location.href = p.link;
      }
    });

    container.appendChild(card);
  }
}

function escapeHtml(str){
  return String(str||'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
}

function renderPagination(){
  const pageNumbers = qs('#pageNumbers');
  pageNumbers.innerHTML = '';
  const total = state.totalPages;
  const current = state.currentPage;
  const maxShow = 7;
  let start = Math.max(1, current - Math.floor(maxShow/2));
  let end = Math.min(total, start + maxShow - 1);
  if(end - start + 1 < maxShow){ start = Math.max(1, end - maxShow + 1); }

  for(let i=start;i<=end;i++){
    const btn=document.createElement('button');
    btn.className='page-num'+(i===current?' active':'');
    btn.textContent=i;
    btn.onclick=()=>{ state.currentPage=i; render(); window.scrollTo({top:0,behavior:'smooth'}); };
    pageNumbers.appendChild(btn);
  }
  qs('#prevBtn').disabled=current===1;
  qs('#nextBtn').disabled=current===total;
  qs('#prevBtn').onclick=()=>{ if(state.currentPage>1){ state.currentPage--; render(); window.scrollTo({top:0,behavior:'smooth'}); } };
  qs('#nextBtn').onclick=()=>{ if(state.currentPage<total){ state.currentPage++; render(); window.scrollTo({top:0,behavior:'smooth'}); } };
}

function setupNav() {
  qsa('.category-bar button').forEach(b => {
    b.addEventListener('click', () => {
      state.currentCategory = (b.dataset.category || 'all').toLowerCase().trim();
      state.currentPage = 1;
      applyFilters();
      // 🔹 Smoothly scroll to top when changing category
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function updateNavActive() {
  qsa('.category-bar button').forEach(b =>
    b.classList.toggle('active', (b.dataset.category || '').toLowerCase().trim() === state.currentCategory)
  );
}

function setupSearch() {
  const searchInput = qs('#searchInput');
  const searchBtn = qs('#searchBtn');

  // 🔹 Typing search (live update)
  searchInput.addEventListener('input', () => {
    state.query = searchInput.value.toLowerCase();
    state.currentPage = 1;
    applyFilters();
  });

  // 🔹 Clicking the search button
  searchBtn.addEventListener('click', () => {
    state.query = searchInput.value.toLowerCase();
    state.currentPage = 1;
    applyFilters();
  });
}

function openDetails(post){
  alert(`Title: ${post.title}\nCategory: ${post.category}\nDescription: ${post.description}`);
}

function init(){ setupNav(); setupSearch(); loadPosts(); }
init();

