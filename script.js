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
