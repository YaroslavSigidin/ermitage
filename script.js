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
  const siblings = Array.from(el.parentElement?.children || []);
  const index = siblings.indexOf(el);
  const delay = Math.min(Math.max(index, 0) * 0.03, 0.3);
  el.style.setProperty('--reveal-delay', `${delay}s`);
});

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

const sectionLinks = Array.from(document.querySelectorAll('.menu-nav a'));
const sections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
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
  const offset = (nav?.offsetHeight || 0) + 12;
  const fromTop = window.scrollY + offset;
  const visibleSections = sections.filter(
    (section) => !section.closest('.menu-group')?.classList.contains('is-hidden')
  );
  const sectionsForCheck = visibleSections.length > 0 ? visibleSections : sections;

  let currentId = sectionsForCheck[0]?.id;
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
  const cards = Array.from(track?.children || []);
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

  const cardStep = () => {
    const card = cards[0];
    if (!card) return 0;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || 0) || 0;
    const step = card.getBoundingClientRect().width + gap;
    return step > 1 ? step : track.clientWidth * 0.8;
  };

  const scrollToIndex = (index) => {
    const step = cardStep();
    track.scrollTo({ left: step * index, behavior: 'smooth' });
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

  btnPrev?.addEventListener('click', () => {
    const step = cardStep();
    track.scrollBy({ left: -step, behavior: 'smooth' });
  });

  btnNext?.addEventListener('click', () => {
    const step = cardStep();
    track.scrollBy({ left: step, behavior: 'smooth' });
  });

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
  // Start from the 3rd cocktail (index 2)
  scrollToIndex(2);
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

  // Safety: keep all groups visible, the toggle should only scroll.
  document.querySelectorAll('.menu-group').forEach((group) => {
    group.classList.remove('is-hidden', 'is-entering');
  });

  const scrollToFilterTarget = (filter) => {
    const selector = filterTargets[filter];
    const target = selector ? document.querySelector(selector) : null;
    if (!target) return;
    const nav = document.querySelector('.menu-nav');
    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    const offset = isMobile ? 14 : (nav?.offsetHeight || 0) + 18;
    const top = Math.max(target.offsetTop - offset, 0);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const applyFilter = (filter) => {
    if (!filter) return;
    buttons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-filter') === filter);
    });
    scrollToFilterTarget(filter);
  };

  const onFilterClick = (button) => {
    const targetFilter = button.getAttribute('data-filter');
    applyFilter(targetFilter);
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => onFilterClick(btn));
  });
}

const normalizeLabel = (value) => {
  const s = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ё/g, 'е');
  return s.replace(/[^a-zа-я0-9]+/gi, ' ').trim();
};

const getMenuItemTitle = (row) => {
  const titleFromBadge = row.querySelector('.item-title .title-text')?.textContent?.trim();
  if (titleFromBadge) return titleFromBadge;

  const textWrap = row.querySelector(':scope > span');
  if (!textWrap) return '';

  const firstTextNode = Array.from(textWrap.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
  );

  return firstTextNode?.textContent?.trim() || '';
};

function initSearch() {
  const menuSearchForm = document.querySelector('.menu-search');
  const searchInput = menuSearchForm?.querySelector('input[name="q"]');
  if (!menuSearchForm || !searchInput) return;

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
    if (rect.width <= 0) return;
    suggestBox.style.position = 'fixed';
    suggestBox.style.left = rect.left + 'px';
    suggestBox.style.top = (rect.bottom + 8) + 'px';
    suggestBox.style.width = Math.max(rect.width, 280) + 'px';
  };

  const scrollToWithOffset = (element) => {
    if (!element || !element.getBoundingClientRect) return;
    const nav = document.querySelector('.menu-nav');
    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    const offset = isMobile ? 14 : (nav?.offsetHeight || 0) + 18;
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
    if (searchIndexCache) return searchIndexCache;
    const rows = document.querySelectorAll('.menu-list li');
    const rowEntries = Array.from(rows).map((row) => {
      const title = getMenuItemTitle(row) || row.querySelector(':scope > span')?.textContent || '';
      const sectionEl = row.closest('.menu-group, .menu-section');
      const section = sectionEl?.querySelector('h3')?.textContent?.trim() || '';
      const details = row.querySelector(':scope > span')?.textContent || '';
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
      label: section.querySelector('h3')?.textContent?.trim() || section.id || '',
      secondary: 'Раздел',
      searchText: `${section.id || ''} ${section.textContent || ''}`,
      element: section
    }));
    searchIndexCache = [...rowEntries, ...sectionEntries];
    return searchIndexCache;
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
    if (!result?.element) return;
    scrollToWithOffset(result.element);
    if (result.type === 'row') highlightFoundRow(result.element);
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
      hideSuggest();
      return;
    }
    if (searchResults.length === 0) {
      suggestBox.innerHTML = '<div class="menu-search-item menu-search-empty">Ничего не найдено</div>';
      positionSuggest();
      suggestBox.classList.add('is-open');
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
    positionSuggest();
    suggestBox.classList.add('is-open');
  };

  const submitSearch = () => {
    const query = normalizeLabel(searchInput?.value || '');
    if (!query) return;
    if (searchResults.length === 0) {
      renderSuggest(query);
    }
    const chosen = searchResults[Math.max(activeResultIndex, 0)] || null;
    if (chosen) {
      navigateToResult(chosen);
      hideSuggest();
    }
  };

  menuSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitSearch();
  });

  searchInput?.addEventListener('input', () => {
    if (suggestCloseTimer) {
      window.clearTimeout(suggestCloseTimer);
      suggestCloseTimer = 0;
    }
    renderSuggest(searchInput.value);
  });

  searchInput?.addEventListener('focus', () => {
    renderSuggest(searchInput.value);
  });

  searchInput?.addEventListener('blur', () => {
    suggestCloseTimer = window.setTimeout(() => hideSuggest(), 200);
  });

  searchInput?.addEventListener('keydown', (event) => {
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch);
} else {
  initSearch();
}

const menuImageItems = [
  {
    src: 'assets/images/европейские сыры.jpg',
    aliases: ['Европейские сыры']
  },
  {
    src: 'assets/images/мясная коллекция.jpg',
    aliases: ['Мясная коллекция']
  },
  {
    src: 'assets/images/рыбная коллекция.jpg',
    aliases: ['Рыбная коллекция']
  },
  {
    src: 'assets/images/ассорти сезонных фруктов.jpg',
    aliases: ['Ассорти сезонных фруктов']
  },
  {
    src: 'assets/images/салат цезарь.jpg',
    aliases: ['Цезарь с курицей']
  },
  {
    src: 'assets/images/салат цезарь с креветкой.jpg',
    aliases: ['Цезарь с креветками']
  },
  {
    src: 'assets/images/салат эрмитаж.jpg',
    aliases: ['Фирменный салат Эрмитаж с говядиной', 'Фирменный салат «Эрмитаж» с говядиной']
  },
  {
    src: 'assets/images/тар тар из лосося салат.jpg',
    aliases: ['Тартар из лосося']
  },
  {
    src: 'assets/images/салат морской.jpg',
    aliases: ['Морской']
  },
  {
    src: 'assets/images/салат креветка рукола.jpg',
    aliases: ['Креветка руккола с томлёной грушей']
  },
  {
    src: 'assets/images/пивной сет.jpg',
    aliases: ['Пивной сет']
  },
  {
    src: 'assets/images/мидии киви.jpg',
    aliases: ['Мидии киви', 'Мидии-киви']
  },
  {
    src: 'assets/images/тигровые креветки фламбе.jpg',
    aliases: ['Тигровые креветки Фламбе', 'Тигровые креветки «Фламбе» с чесноком и розмарином']
  },
  {
    src: 'assets/images/микс баварских колбасок.jpg',
    aliases: ['Микс баварских колбас', 'Микс баварских колбасок']
  },
  {
    src: 'assets/images/борщ.jpg',
    aliases: ['Борщ']
  },
  {
    src: 'assets/images/том ям.jpg',
    aliases: ['Том Ям Кунг', 'Том Ям']
  },
  {
    src: 'assets/images/паста с морепродуктами.jpg',
    aliases: ['С морепродуктами', 'Паста с морепродуктами']
  },
  {
    src: 'assets/images/стейк из семги с овощами.jpg',
    aliases: ['Стейк из сёмги с овощами-гриль', 'Стейк из сёмги с овощами‑гриль']
  },
  {
    src: 'assets/images/филе судака с рисом венера.jpg',
    aliases: ['Филе судака с рисом Венера в кокосовом молоке', 'Филе судака с рисом «Венера» в кокосовом молоке']
  },
  {
    src: 'assets/images/куриное филе гриль.jpg',
    aliases: ['Куриное филе-гриль', 'Куриное филе‑гриль']
  },
  // Коктейли (фото из assets/images/2/)
  { src: 'assets/images/2/1.jpg', aliases: ['Эрмитаж'] },
  { src: 'assets/images/2/2.jpg', aliases: ['Ромовая Баба', 'Ромовая баба'] },
  { src: 'assets/images/2/3.jpg', aliases: ['Слезы бывшего'] },
  { src: 'assets/images/2/4.jpg', aliases: ['Розовая пантера'] },
  { src: 'assets/images/2/MPH_8174-редакт.jpg', aliases: ['Северное сияние'] },
  { src: 'assets/images/2/MPH_8184-редакт.jpg', aliases: ['Клубничный джин тоник', 'Клубничный джин-тоник'] },
  { src: 'assets/images/2/MPH_8200-редакт.jpg', aliases: ['Лимонад клубника базилик'] },
  { src: 'assets/images/2/MPH_8248-редакт.jpg', aliases: ['Российский флаг'] },
  { src: 'assets/images/2/MPH_8249-редакт.jpg', aliases: ['Хиросима'] }
];

const menuImageMap = new Map();
menuImageItems.forEach((item) => {
  item.aliases.forEach((alias) => {
    menuImageMap.set(normalizeLabel(alias), item.src);
  });
});

function resolveImageUrl(path) {
  if (!path) return path;
  if (typeof path === 'string' && path.normalize) {
    path = path.split('/').map(function (s) { return s.normalize('NFC'); }).join('/');
  }
  const base = document.querySelector('base')?.href || (window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/') || window.location.href);
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}

const attachMenuImages = () => {
  const rows = Array.from(document.querySelectorAll('.menu-list li'));
  rows.forEach((row) => {
    const title = getMenuItemTitle(row);
    const imageSrc = menuImageMap.get(normalizeLabel(title));
    if (!imageSrc) return;

    const textWrap = row.querySelector(':scope > span');
    if (!textWrap || textWrap.querySelector('.menu-item-image')) return;

    const imageWrap = document.createElement('div');
    imageWrap.className = 'menu-item-image';

    const image = document.createElement('img');
    image.src = resolveImageUrl(imageSrc);
    image.alt = title;
    image.loading = 'lazy';
    image.decoding = 'async';

    const caption = document.createElement('div');
    caption.className = 'menu-item-caption';
    const captionMain = document.createElement('div');
    captionMain.className = 'menu-item-caption-main';

    const decoratedTitle = textWrap.querySelector(':scope > .item-title');
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

    const price = row.querySelector(':scope > em');
    if (titleNode) captionMain.appendChild(titleNode);

    const notes = Array.from(textWrap.querySelectorAll(':scope > small'));
    if (notes.length > 0) {
      const details = document.createElement('div');
      details.className = 'menu-item-details';
      notes.forEach((note) => {
        details.appendChild(note);
      });
      captionMain.appendChild(details);
    }

    caption.appendChild(captionMain);
    if (price) {
      price.classList.add('menu-item-price');
      caption.appendChild(price);
    }

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
    img.src = resolveImageUrl(imageSrc);
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
    const rows = Array.from(list.querySelectorAll(':scope > li'));
    if (rows.length < 2) return;

    const withImage = rows.filter((row) => row.classList.contains('has-image'));
    const withoutImage = rows.filter((row) => !row.classList.contains('has-image'));

    if (withImage.length === 0 || withoutImage.length === 0) return;

    [...withImage, ...withoutImage].forEach((row) => list.appendChild(row));
  });
};

orderMenuItemsByImage();
