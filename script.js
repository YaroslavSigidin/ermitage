const links = document.querySelectorAll('a[href^="#"]');
links.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const revealSelectors = [
  '.hero-content > *',
  '.hero-slider',
  '.slider-controls',
  '.menu-nav',
  '.menu-section'
];

const revealTargets = document.querySelectorAll(revealSelectors.join(','));
revealTargets.forEach((el) => {
  el.classList.add('reveal');
  const siblings = Array.from((el.parentElement && el.parentElement.children) || []);
  const index = siblings.indexOf(el);
  const delay = Math.min(Math.max(index, 0) * 0.03, 0.3);
  el.style.setProperty('--reveal-delay', `${delay}s`);
});

if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );
  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
}

const sectionLinks = Array.from(document.querySelectorAll('.menu-nav a[href^="#"]'));
const sections = sectionLinks
  .map((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return null;
    return document.querySelector(href);
  })
  .filter(Boolean);
let currentActiveNavId = '';

const setActiveLink = (id) => {
  let activeLink = null;
  sectionLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', isActive);
    if (isActive) activeLink = link;
  });

  if (id !== currentActiveNavId) {
    currentActiveNavId = id;
    if (activeLink && window.matchMedia('(max-width: 720px)').matches) {
      activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }
};

const updateActiveSection = () => {
  const nav = document.querySelector('.menu-nav');
  const offset = ((nav && nav.offsetHeight) || 0) + 12;
  const fromTop = window.scrollY + offset;
  const visibleSections = sections.filter(
    (section) => {
      const parentGroup = section.closest('.menu-group');
      return !(parentGroup && parentGroup.classList.contains('is-hidden'));
    }
  );
  const sectionsForCheck = visibleSections.length > 0 ? visibleSections : sections;

  let currentId = sectionsForCheck[0] ? sectionsForCheck[0].id : '';
  sectionsForCheck.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    if (fromTop >= top && fromTop < bottom) {
      currentId = section.id;
    }
  });

  if (currentId) setActiveLink(currentId);
};

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    updateActiveSection();
    ticking = false;
  });
};

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
window.addEventListener('load', onScroll);
updateActiveSection();

const menuToggleBtn = document.querySelector('.menu-toggle-btn');
const menuNav = document.querySelector('.menu-nav');
if (menuToggleBtn && menuNav) {
  const closeMenu = () => {
    menuNav.classList.remove('is-open');
    menuToggleBtn.classList.remove('is-open');
    menuToggleBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  const toggleMenu = () => {
    const isOpen = menuNav.classList.toggle('is-open');
    menuToggleBtn.classList.toggle('is-open', isOpen);
    menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  };

  const onMenuLinkClick = (event) => {
    const target = event.target.closest('a[href^="#"]');
    if (!target) return;
    closeMenu();
  };

  menuToggleBtn.addEventListener('click', toggleMenu);
  menuNav.addEventListener('click', onMenuLinkClick);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeMenu();
  });
}

const slider = document.querySelector('.hero-slider');
if (slider) {
  const track = slider.querySelector('.slider-track');
  const cards = Array.from((track && track.children) || []);
  const dotsWrap = slider.querySelector('.slider-dots');
  const btnPrev = slider.querySelector('[data-dir="prev"]');
  const btnNext = slider.querySelector('[data-dir="next"]');

  const createDots = () => {
    if (!dotsWrap) return [];
    dotsWrap.innerHTML = '';
    return cards.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot';
      dot.setAttribute('aria-label', `Коктейль ${i + 1}`);
      dot.addEventListener('click', () => scrollToIndex(i));
      dotsWrap.appendChild(dot);
      return dot;
    });
  };

  const dots = createDots();

  const scrollToIndex = (index, behavior = 'smooth') => {
    const safeIndex = Math.max(0, Math.min(index, cards.length - 1));
    const card = cards[safeIndex];
    if (!card) return;
    const centeredLeft = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    const maxLeft = Math.max(track.scrollWidth - track.clientWidth, 0);
    const left = Math.max(0, Math.min(centeredLeft, maxLeft));
    if (!track) return;
    try {
      if (typeof track.scrollTo === 'function') {
        track.scrollTo({ left: left, behavior });
        return;
      }
    } catch (e) {
      // Fallback below for older browsers/webviews.
    }
    track.scrollLeft = left;
  };

  const getActiveIndex = () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  };

  const setActiveDot = () => {
    const active = getActiveIndex();
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
    });
  };

  const applyCurve = () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    const spread = Math.max(track.clientWidth * 0.6, 1);
    cards.forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.min(Math.abs(cardCenter - center) / spread, 1);
      const lift = -18 + dist * 18;
      const scale = 1 - dist * 0.04;
      card.style.setProperty('--curve', `${lift}px`);
      card.style.setProperty('--scale', `${scale}`);
    });
  };

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (!track) return;
      const current = getActiveIndex();
      const prevIndex = (current - 1 + cards.length) % cards.length;
      scrollToIndex(prevIndex);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (!track) return;
      const current = getActiveIndex();
      const nextIndex = (current + 1) % cards.length;
      scrollToIndex(nextIndex);
    });
  }

  let sliderTick = false;
  const onSliderScroll = () => {
    if (sliderTick) return;
    sliderTick = true;
    window.requestAnimationFrame(() => {
      setActiveDot();
      applyCurve();
      sliderTick = false;
    });
  };

  track.addEventListener('scroll', onSliderScroll, { passive: true });
  window.addEventListener('resize', () => {
    setActiveDot();
    applyCurve();
  });
  const getInitialSliderIndex = () => {
    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    if (isMobile) return Math.floor(cards.length / 2);
    return 2;
  };
  const applyInitialSliderPosition = () => {
    const initialIndex = getInitialSliderIndex();
    const safeIndex = Math.max(0, Math.min(initialIndex, cards.length - 1));
    scrollToIndex(safeIndex, 'auto');
    setActiveDot();
    applyCurve();
  };

  applyInitialSliderPosition();
  setTimeout(() => {
    applyInitialSliderPosition();
  }, 180);
  window.addEventListener('load', applyInitialSliderPosition, { once: true });
  setTimeout(() => {
    setActiveDot();
    applyCurve();
  }, 0);
}

const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
  const buttons = Array.from(menuToggle.querySelectorAll('[data-filter]'));
  const filterTargets = {
    food: '#cold-snacks',
    drinks: '#cocktails'
  };

  const scrollToFilterTarget = (filter) => {
    const selector = filterTargets[filter];
    const target = selector ? document.querySelector(selector) : null;
    if (!target) return;
    const nav = document.querySelector('.menu-nav');
    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    const offset = isMobile ? 14 : ((nav && nav.offsetHeight) || 0) + 18;
    const top = Math.max(target.offsetTop - offset, 0);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const applyFilter = (filter, options = {}) => {
    if (!filter) return;
    const shouldScroll = options.scroll !== false;
    buttons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-filter') === filter);
    });
    window.requestAnimationFrame(() => {
      onScroll();
    });
    if (shouldScroll) scrollToFilterTarget(filter);
    window.__menuCurrentFilter = filter;
  };

  const onFilterClick = (button) => {
    const targetFilter = button.getAttribute('data-filter');
    applyFilter(targetFilter);
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => onFilterClick(btn));
  });

  const getFilterForElement = (element) => {
    if (!element) return '';
    const group = element.classList && element.classList.contains('menu-group')
      ? element
      : element.closest('.menu-group');
    if (!group) return '';
    const category = (group.getAttribute('data-category') || '').toLowerCase();
    if (category === 'food') return 'food';
    if (category === 'drinks' || category === 'cocktails') return 'drinks';
    return '';
  };

  const activeButton = buttons.find((btn) => btn.classList.contains('is-active'));
  const initiallyActive = (activeButton && activeButton.getAttribute('data-filter')) || 'food';
  applyFilter(initiallyActive, { scroll: false });
  window.__applyMenuFilter = applyFilter;
  window.__getMenuFilterForElement = getFilterForElement;
  window.__richToggleReady = true;
}

const normalizeLabel = (value) => {
  const s = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ё/g, 'е');
  return s.replace(/[^a-zа-я0-9]+/gi, ' ').trim();
};

const getDirectChild = (parent, selector) => {
  if (!parent) return null;
  return Array.from(parent.children).find((child) => child.matches(selector)) || null;
};

const getDirectChildren = (parent, selector) => {
  if (!parent) return [];
  return Array.from(parent.children).filter((child) => child.matches(selector));
};

const getMenuItemTitle = (row) => {
  const titleEl = row.querySelector('.item-title .title-text');
  const titleFromBadge = titleEl ? titleEl.textContent.trim() : '';
  if (titleFromBadge) return titleFromBadge;

  const textWrap = getDirectChild(row, 'span');
  if (!textWrap) return '';

  const firstTextNode = Array.from(textWrap.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
  );

  return firstTextNode ? firstTextNode.textContent.trim() : '';
};

const ensureResultVisible = (element) => {
  if (!element) return;
  const getFilter = window.__getMenuFilterForElement;
  const applyFilter = window.__applyMenuFilter;
  if (typeof getFilter === 'function' && typeof applyFilter === 'function') {
    const needed = getFilter(element);
    if (needed) {
      applyFilter(needed, { scroll: false });
      return;
    }
  }
  const group = element.classList && element.classList.contains('menu-group')
    ? element
    : element.closest('.menu-group');
  if (group) group.classList.remove('is-hidden');
};

function initSearch() {
  const menuSearchForm = document.querySelector('.menu-search');
  const searchInput = (menuSearchForm ? menuSearchForm.querySelector('input[name="q"]') : null) || document.querySelector('input[name="q"]');
  if (!searchInput) return;
  const form = menuSearchForm || searchInput.closest('form');

  const suggestBox = document.createElement('div');
  suggestBox.className = 'menu-search-suggest';
  suggestBox.setAttribute('role', 'listbox');
  suggestBox.setAttribute('aria-label', 'Результаты поиска');
  document.body.appendChild(suggestBox);

  let searchResults = [];
  let activeResultIndex = -1;
  let suggestCloseTimer = 0;

  const positionSuggest = () => {
    const rect = searchInput.getBoundingClientRect();
    suggestBox.style.position = 'fixed';
    suggestBox.style.visibility = 'visible';
    suggestBox.style.opacity = '1';
    suggestBox.style.display = 'block';
    if (rect.width > 0 && rect.height > 0) {
      suggestBox.style.left = rect.left + 'px';
      suggestBox.style.top = (rect.bottom + 8) + 'px';
      suggestBox.style.width = Math.max(rect.width, 280) + 'px';
      suggestBox.style.transform = '';
    } else {
      suggestBox.style.left = '50%';
      suggestBox.style.top = '120px';
      suggestBox.style.width = '320px';
      suggestBox.style.transform = 'translateX(-50%)';
    }
  };

  const scrollToWithOffset = (element) => {
    if (!element || !element.getBoundingClientRect) return;
    const nav = document.querySelector('.menu-nav');
    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    const offset = isMobile ? 14 : ((nav && nav.offsetHeight) || 0) + 18;
    const rect = element.getBoundingClientRect();
    const top = Math.max(rect.top + window.scrollY - offset, 0);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const highlightFoundRow = (row) => {
    row.classList.add('search-hit');
    window.setTimeout(() => row.classList.remove('search-hit'), 1300);
  };

  let searchIndexCache = null;
  const buildSearchIndex = () => {
    if (searchIndexCache && searchIndexCache.length > 0) return searchIndexCache;
    const rows = document.querySelectorAll('.menu-list li');
    const rowEntries = Array.from(rows).map((row) => {
      const rowMain = getDirectChild(row, 'span');
      const title = getMenuItemTitle(row) || (rowMain ? rowMain.textContent : '') || '';
      const sectionEl = row.closest('.menu-group, .menu-section');
      const sectionTitle = sectionEl ? sectionEl.querySelector('h3') : null;
      const section = sectionTitle ? sectionTitle.textContent.trim() : '';
      const details = rowMain ? rowMain.textContent : '';
      return {
        type: 'row',
        label: String(title).trim(),
        secondary: section,
        searchText: `${title} ${details} ${section}`,
        element: row
      };
    });
    const sectionEls = document.querySelectorAll('.menu-group[id]');
    const sectionEntries = Array.from(sectionEls).map((section) => ({
      type: 'section',
      label: (section.querySelector('h3') ? section.querySelector('h3').textContent.trim() : '') || section.id || '',
      secondary: 'Раздел',
      searchText: `${section.id || ''} ${section.textContent || ''}`,
      element: section
    }));
    const index = [...rowEntries, ...sectionEntries];
    if (index.length > 0) searchIndexCache = index;
    return index;
  };

  const matchSearch = (query) => {
    const q = normalizeLabel(query);
    if (!q) return [];
    const index = buildSearchIndex();
    const matched = index.filter((entry) => {
      const text = normalizeLabel(String(entry.searchText || ''));
      const label = normalizeLabel(String(entry.label || ''));
      return text.includes(q) || label.includes(q);
    });
    matched.sort((a, b) => {
      const aLabel = normalizeLabel(String(a.label || ''));
      const bLabel = normalizeLabel(String(b.label || ''));
      const aStarts = aLabel.startsWith(q) ? 1 : 0;
      const bStarts = bLabel.startsWith(q) ? 1 : 0;
      if (bStarts !== aStarts) return bStarts - aStarts;
      return aLabel.length - bLabel.length;
    });
    return matched.slice(0, 8);
  };

  const hideSuggest = () => {
    suggestBox.classList.remove('is-open');
    suggestBox.innerHTML = '';
    suggestBox.style.display = '';
    searchResults = [];
    activeResultIndex = -1;
  };

  window.addEventListener('scroll', () => { if (suggestBox.classList.contains('is-open')) positionSuggest(); }, { passive: true });
  window.addEventListener('resize', () => { if (suggestBox.classList.contains('is-open')) positionSuggest(); });

  const setActiveSuggest = (index) => {
    activeResultIndex = index;
    const items = Array.from(suggestBox.querySelectorAll('.menu-search-item'));
    items.forEach((item, i) => item.classList.toggle('is-active', i === index));
    const activeItem = items[index];
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  };

  const navigateToResult = (result) => {
    if (!result || !result.element) return;
    ensureResultVisible(result.element);
    scrollToWithOffset(result.element);
    if (result.type === 'row') highlightFoundRow(result.element);
  };

  const openSuggest = () => {
    positionSuggest();
    suggestBox.classList.add('is-open');
  };

  const renderSuggest = (query) => {
    const raw = String(query || '').trim();
    if (!raw) {
      hideSuggest();
      return;
    }
    try {
      searchResults = matchSearch(raw);
    } catch (e) {
      searchResults = [];
    }
    if (searchResults.length === 0) {
      suggestBox.innerHTML = '<div class="menu-search-item menu-search-empty">Ничего не найдено</div>';
      openSuggest();
      return;
    }
    suggestBox.innerHTML = searchResults
      .map(
        (entry, i) =>
          `<button type="button" class="menu-search-item${i === 0 ? ' is-active' : ''}" data-index="${i}">
            <span class="menu-search-item-title">${escapeHtml(entry.label)}</span>
            <span class="menu-search-item-meta">${escapeHtml(entry.secondary || '')}</span>
          </button>`
      )
      .join('');
    activeResultIndex = 0;
    openSuggest();
  };

  const submitSearch = () => {
    const query = normalizeLabel(searchInput ? searchInput.value : '');
    if (!query) return;
    if (searchResults.length === 0) {
      renderSuggest(query);
    }
    const chosen = searchResults[Math.max(activeResultIndex, 0)] || null;
    if (chosen) {
      navigateToResult(chosen);
      hideSuggest();
      return;
    }

    const rows = Array.from(document.querySelectorAll('.menu-list li'));
    const fallbackRow = rows.find((row) => normalizeLabel(row.textContent || '').includes(query));
    if (fallbackRow) {
      ensureResultVisible(fallbackRow);
      navigateToResult({ type: 'row', element: fallbackRow });
      hideSuggest();
    }
  };

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitSearch();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (suggestCloseTimer) {
        window.clearTimeout(suggestCloseTimer);
        suggestCloseTimer = 0;
      }
      renderSuggest(searchInput.value);
    });

    searchInput.addEventListener('focus', () => {
      renderSuggest(searchInput.value);
    });

    searchInput.addEventListener('blur', () => {
      suggestCloseTimer = window.setTimeout(() => hideSuggest(), 200);
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitSearch();
        return;
      }

      if (!suggestBox.classList.contains('is-open') && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        renderSuggest(searchInput.value);
      }

      if (!suggestBox.classList.contains('is-open')) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = Math.min(activeResultIndex + 1, searchResults.length - 1);
        setActiveSuggest(next);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prev = Math.max(activeResultIndex - 1, 0);
        setActiveSuggest(prev);
      } else if (event.key === 'Escape') {
        hideSuggest();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        submitSearch();
      }
    });
  }

  suggestBox.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });

  suggestBox.addEventListener('click', (event) => {
    const btn = event.target.closest('.menu-search-item[data-index]');
    if (!btn) return;
    const index = Number(btn.getAttribute('data-index'));
    if (Number.isNaN(index) || index < 0) return;
    const selected = searchResults[index];
    if (selected && selected.element) {
      setActiveSuggest(index);
      navigateToResult(selected);
      hideSuggest();
    }
  });

  window.__richSearchReady = true;
}

function initSearchFallback() {
  const input = document.querySelector('.menu-search input[name="q"], input[name="q"]');
  if (!input || input.dataset.searchFallbackBound === '1') return;
  input.dataset.searchFallbackBound = '1';

  const form = input.closest('form');
  if (!form) return;

  const scrollToWithOffset = (element) => {
    if (!element || !element.getBoundingClientRect) return;
    const nav = document.querySelector('.menu-nav');
    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    const offset = isMobile ? 14 : ((nav && nav.offsetHeight) || 0) + 18;
    const rect = element.getBoundingClientRect();
    const top = Math.max(rect.top + window.scrollY - offset, 0);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const runFallbackSearch = () => {
    const q = normalizeLabel(input.value || '');
    if (!q) return;

    const rows = Array.from(document.querySelectorAll('.menu-list li'));
    const hitRow = rows.find((row) => normalizeLabel(row.textContent || '').includes(q));
    if (hitRow) {
      ensureResultVisible(hitRow);
      scrollToWithOffset(hitRow);
      hitRow.classList.add('search-hit');
      window.setTimeout(() => hitRow.classList.remove('search-hit'), 1300);
      return;
    }

    const sections = Array.from(document.querySelectorAll('.menu-group[id], .menu-section'));
    const hitSection = sections.find((section) => normalizeLabel(section.textContent || '').includes(q));
    if (hitSection) {
      ensureResultVisible(hitSection);
      scrollToWithOffset(hitSection);
    }
  };

  const execute = () => {
    runFallbackSearch();
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    execute();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    execute();
  });

  input.addEventListener('input', () => {
    const q = normalizeLabel(input.value || '');
    if (q.length < 3) return;
    execute();
  });
}

var searchInitialized = false;
function runInitSearchOnce() {
  if (searchInitialized) return;
  searchInitialized = true;
  try {
    initSearch();
  } catch (e) {
    // Не ломаем страницу: фото и слайдер должны подгрузиться
    initSearchFallback();
  }
  if (!window.__richSearchReady) initSearchFallback();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInitSearchOnce);
}
window.addEventListener('load', runInitSearchOnce);
if (document.readyState !== 'loading') runInitSearchOnce();

const menuImageItems = [
  {
    src: 'assets/images/european-cheeses.jpg',
    aliases: ['Европейские сыры']
  },
  {
    src: 'assets/images/meat-collection.jpg',
    aliases: ['Мясная коллекция']
  },
  {
    src: 'assets/images/fish-collection.jpg',
    aliases: ['Рыбная коллекция']
  },
  {
    src: 'assets/images/seasonal-fruit-platter.jpg',
    aliases: ['Ассорти сезонных фруктов']
  },
  {
    src: 'assets/images/caesar-salad.jpg',
    aliases: ['Цезарь с курицей']
  },
  {
    src: 'assets/images/caesar-salad-shrimp.jpg',
    aliases: ['Цезарь с креветками']
  },
  {
    src: 'assets/images/ermitage-salad.jpg',
    aliases: ['Фирменный салат Эрмитаж с говядиной', 'Фирменный салат «Эрмитаж» с говядиной']
  },
  {
    src: 'assets/images/salmon-tartare-salad.jpg',
    aliases: ['Тартар из лосося']
  },
  {
    src: 'assets/images/seafood-salad.jpg',
    aliases: ['Морской']
  },
  {
    src: 'assets/images/shrimp-arugula-salad.jpg',
    aliases: ['Креветка руккола с томлёной грушей']
  },
  {
    src: 'assets/images/beer-set.jpg',
    aliases: ['Пивной сет']
  },
  {
    src: 'assets/images/kiwi-mussels.jpg',
    aliases: ['Мидии киви', 'Мидии-киви']
  },
  {
    src: 'assets/images/tiger-shrimp-flambe.jpg',
    aliases: ['Тигровые креветки Фламбе', 'Тигровые креветки «Фламбе» с чесноком и розмарином']
  },
  {
    src: 'assets/images/bavarian-sausage-mix.jpg',
    aliases: ['Микс баварских колбас', 'Микс баварских колбасок']
  },
  {
    src: 'assets/images/borscht.jpg',
    aliases: ['Борщ']
  },
  {
    src: 'assets/images/tom-yum.jpg',
    aliases: ['Том Ям Кунг', 'Том Ям']
  },
  {
    src: 'assets/images/seafood-pasta.jpg',
    aliases: ['С морепродуктами', 'Паста с морепродуктами']
  },
  {
    src: 'assets/images/salmon-steak-vegetables.jpg',
    aliases: ['Стейк из сёмги с овощами-гриль', 'Стейк из сёмги с овощами‑гриль']
  },
  {
    src: 'assets/images/pikeperch-fillet-venere-rice.jpg',
    aliases: ['Филе судака с рисом Венера в кокосовом молоке', 'Филе судака с рисом «Венера» в кокосовом молоке']
  },
  {
    src: 'assets/images/grilled-chicken-fillet.jpg',
    aliases: ['Куриное филе-гриль', 'Куриное филе‑гриль']
  },
  // Коктейли (фото из assets/images/2/)
  { src: 'assets/images/2/1.jpg', aliases: ['Эрмитаж', 'Martini Fiero & Tonic', 'Мартини Фиеро и Тоник'] },
  { src: 'assets/images/2/2.jpg', aliases: ['Ромовая Баба', 'Ромовая баба', 'Тропический джин-тоник', 'Тропический джин‑тоник'] },
  { src: 'assets/images/2/3.jpg', aliases: ['Слезы бывшего'] },
  { src: 'assets/images/2/4.jpg', aliases: ['Розовая пантера', 'Гранатовый шприц'] },
  { src: 'assets/images/2/mph-8174-redakt.jpg', aliases: ['Северное сияние'] },
  { src: 'assets/images/2/mph-8184-redakt.jpg', aliases: ['Клубничный джин тоник', 'Клубничный джин-тоник', 'Негрони'] },
  { src: 'assets/images/2/mph-8200-redakt.jpg', aliases: ['Лимонад клубника базилик'] },
  { src: 'assets/images/2/mph-8248-redakt.jpg', aliases: ['Российский флаг'] },
  { src: 'assets/images/2/mph-8249-redakt.jpg', aliases: ['Хиросима'] }
];

const menuImageMap = new Map();
menuImageItems.forEach((item) => {
  item.aliases.forEach((alias) => {
    menuImageMap.set(normalizeLabel(alias), item.src);
  });
});

const resolveDishImageByTitle = (title) => {
  const normalizedTitle = normalizeLabel(title);
  if (!normalizedTitle) return '';

  const exact = menuImageMap.get(normalizedTitle);
  if (exact) return exact;

  const hasWholePhrase = (text, phrase) => {
    const t = String(text || '').trim();
    const p = String(phrase || '').trim();
    if (!t || !p) return false;
    return (` ${t} `).includes(` ${p} `);
  };

  let bestSrc = '';
  let bestScore = 0;
  const titleTokens = normalizedTitle.split(' ').filter(Boolean);

  for (const [alias, src] of menuImageMap.entries()) {
    if (!alias) continue;
    if (hasWholePhrase(normalizedTitle, alias) || hasWholePhrase(alias, normalizedTitle)) {
      const score = alias.length;
      if (score > bestScore) {
        bestScore = score;
        bestSrc = src;
      }
      continue;
    }

    const aliasTokens = alias.split(' ').filter(Boolean);
    let common = 0;
    for (const token of titleTokens) {
      if (token.length < 3) continue;
      if (aliasTokens.includes(token)) common += 1;
    }
    if (common > bestScore && common >= 2) {
      bestScore = common;
      bestSrc = src;
    }
  }

  return bestSrc;
};

function resolveImageUrl(path) {
  if (!path) return path;
  try {
    return encodeURI(String(path));
  } catch (e) {
    return path;
  }
}

function buildImageCandidates(path) {
  const raw = String(path || '').trim();
  if (!raw) return [];

  const idx = raw.lastIndexOf('/');
  const dir = idx >= 0 ? raw.slice(0, idx + 1) : '';
  const file = idx >= 0 ? raw.slice(idx + 1) : raw;

  const variants = [raw];
  variants.push(dir + file.normalize('NFC'));
  variants.push(dir + file.normalize('NFD'));

  return Array.from(new Set(variants));
}

function setImageSrcWithFallback(imageEl, path) {
  const candidates = buildImageCandidates(path).map(resolveImageUrl).filter(Boolean);
  if (candidates.length === 0) return;

  let index = 0;
  const applyNext = () => {
    if (index >= candidates.length) return;
    imageEl.src = candidates[index];
    index += 1;
  };

  imageEl.addEventListener('error', applyNext);
  applyNext();
}

const attachMenuImages = () => {
  const rows = Array.from(document.querySelectorAll('.menu-list li'));
  rows.forEach((row) => {
    const group = row.closest('.menu-group');
    const category = (group && group.getAttribute('data-category') || '').toLowerCase();
    if (category === 'cocktails' || (group && group.id === 'cocktails')) return;

    const title = getMenuItemTitle(row);
    const imageSrc = resolveDishImageByTitle(title);
    if (!imageSrc) return;

    const textWrap = getDirectChild(row, 'span');
    if (!textWrap || textWrap.querySelector('.menu-item-image')) return;

    const imageWrap = document.createElement('div');
    imageWrap.className = 'menu-item-image';

    const image = document.createElement('img');
    setImageSrcWithFallback(image, imageSrc);
    image.alt = title;
    image.loading = 'lazy';
    image.decoding = 'async';

    const caption = document.createElement('div');
    caption.className = 'menu-item-caption';
    const captionMain = document.createElement('div');
    captionMain.className = 'menu-item-caption-main';
    const captionRight = document.createElement('div');
    captionRight.className = 'menu-item-caption-right';

    const decoratedTitle = getDirectChild(textWrap, '.item-title');
    let titleNode = decoratedTitle;
    if (!titleNode) {
      const firstTextNode = Array.from(textWrap.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
      );
      if (firstTextNode) {
        const plainTitle = document.createElement('span');
        plainTitle.className = 'menu-item-name';
        plainTitle.textContent = firstTextNode.textContent.trim();
        textWrap.insertBefore(plainTitle, firstTextNode);
        firstTextNode.textContent = '';
        titleNode = plainTitle;
      }
    }

    const price = getDirectChild(row, 'em');
    if (titleNode) captionMain.appendChild(titleNode);

    const notes = getDirectChildren(textWrap, 'small');
    if (notes.length > 0) {
      const details = document.createElement('div');
      details.className = 'menu-item-details';
      let hasDetails = false;
      notes.forEach((note) => {
        if (note.classList.contains('volume')) {
          note.classList.add('menu-item-volume');
          captionRight.appendChild(note);
          return;
        }
        details.appendChild(note);
        hasDetails = true;
      });
      if (hasDetails) captionMain.appendChild(details);
    }

    caption.appendChild(captionMain);
    if (price) {
      price.classList.add('menu-item-price');
      captionRight.appendChild(price);
    }
    caption.appendChild(captionRight);

    imageWrap.appendChild(image);
    imageWrap.appendChild(caption);
    textWrap.prepend(imageWrap);
    row.classList.add('has-image');
  });
};

attachMenuImages();

const attachCocktailSliderImages = () => {
  const cards = document.querySelectorAll('.hero-slider .cocktail-card');
  cards.forEach((card) => {
    const titleEl = card.querySelector('h2');
    const mediaEl = card.querySelector('.card-media');
    if (!titleEl || !mediaEl) return;
    const title = titleEl.textContent.trim().replace(/\s+/g, ' ');
    const imageSrc = menuImageMap.get(normalizeLabel(title));
    if (!imageSrc) return;
    const img = document.createElement('img');
    setImageSrcWithFallback(img, imageSrc);
    img.alt = title;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.className = 'card-media-img';
    mediaEl.textContent = '';
    mediaEl.appendChild(img);
  });
};
attachCocktailSliderImages();

const orderMenuItemsByImage = () => {
  const lists = Array.from(document.querySelectorAll('.menu-list'));
  lists.forEach((list) => {
    const rows = getDirectChildren(list, 'li');
    if (rows.length < 2) return;

    const withImage = rows.filter((row) => row.classList.contains('has-image'));
    const withoutImage = rows.filter((row) => !row.classList.contains('has-image'));

    if (withImage.length === 0 || withoutImage.length === 0) return;

    [...withImage, ...withoutImage].forEach((row) => list.appendChild(row));
  });
};

orderMenuItemsByImage();
