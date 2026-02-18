(function () {
  'use strict';

  function normalize(text) {
    var s = String(text || '').toLowerCase().replace(/ё/g, 'е');
    return s.replace(/[^a-zа-я0-9]+/gi, ' ').replace(/\s+/g, ' ').trim();
  }

  var imagePairs = [
    ['европейские сыры', 'assets/images/европейские сыры.jpg'],
    ['мясная коллекция', 'assets/images/мясная коллекция.jpg'],
    ['рыбная коллекция', 'assets/images/рыбная коллекция.jpg'],
    ['ассорти сезонных фруктов', 'assets/images/ассорти сезонных фруктов.jpg'],
    ['цезарь с курицей', 'assets/images/салат цезарь.jpg'],
    ['цезарь с креветками', 'assets/images/салат цезарь с креветкой.jpg'],
    ['фирменный салат эрмитаж с говядиной', 'assets/images/салат эрмитаж.jpg'],
    ['тартар из лосося', 'assets/images/тар тар из лосося салат.jpg'],
    ['морской', 'assets/images/салат морской.jpg'],
    ['креветка руккола с томленой грушей', 'assets/images/салат креветка рукола.jpg'],
    ['пивной сет', 'assets/images/пивной сет.jpg'],
    ['мидии киви', 'assets/images/мидии киви.jpg'],
    ['мидии киви запеченные в сырно сливочном соусе', 'assets/images/мидии киви.jpg'],
    ['тигровые креветки фламбе', 'assets/images/тигровые креветки фламбе.jpg'],
    ['микс баварских колбас', 'assets/images/микс баварских колбасок.jpg'],
    ['борщ', 'assets/images/борщ.jpg'],
    ['том ям', 'assets/images/том ям.jpg'],
    ['том ям кунг', 'assets/images/том ям.jpg'],
    ['паста с морепродуктами', 'assets/images/паста с морепродуктами.jpg'],
    ['с морепродуктами', 'assets/images/паста с морепродуктами.jpg'],
    ['стейк из семги с овощами гриль', 'assets/images/стейк из семги с овощами.jpg'],
    ['стейк из семги с овощами', 'assets/images/стейк из семги с овощами.jpg'],
    ['филе судака с рисом венера', 'assets/images/филе судака с рисом венера.jpg'],
    ['куриное филе гриль', 'assets/images/куриное филе гриль.jpg']
  ];

  function findImage(title) {
    var t = normalize(title);
    if (!t) return '';
    var bestSrc = '';
    var bestLen = 0;
    for (var i = 0; i < imagePairs.length; i += 1) {
      var alias = normalize(imagePairs[i][0]);
      if (!alias) continue;
      if (t.indexOf(alias) !== -1 || alias.indexOf(t) !== -1) {
        if (alias.length > bestLen) {
          bestLen = alias.length;
          bestSrc = imagePairs[i][1];
        }
      }
    }
    return bestSrc;
  }

  function getDirectChild(el, tagName) {
    if (!el || !el.children) return null;
    var want = String(tagName || '').toUpperCase();
    for (var i = 0; i < el.children.length; i += 1) {
      if (el.children[i].tagName === want) return el.children[i];
    }
    return null;
  }

  function closestEl(el, selector) {
    var node = el;
    while (node && node.nodeType === 1) {
      if (node.matches && node.matches(selector)) return node;
      node = node.parentElement;
    }
    return null;
  }

  function getTitle(row) {
    var titleNode = row.querySelector('.item-title .title-text');
    if (titleNode && titleNode.textContent) return titleNode.textContent.trim();

    var span = getDirectChild(row, 'span');
    if (!span) return '';
    for (var i = 0; i < span.childNodes.length; i += 1) {
      var node = span.childNodes[i];
      if (node.nodeType === 3 && String(node.textContent || '').trim()) {
        return String(node.textContent).trim();
      }
    }
    return '';
  }

  function attachDishImages() {
    var rows = document.querySelectorAll('.menu-list li');
    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      var span = getDirectChild(row, 'span');
      if (!span) continue;
      if (span.querySelector('.menu-item-image')) continue;

      var title = getTitle(row);
      var src = findImage(title);
      if (!src) continue;

      var wrap = document.createElement('div');
      wrap.className = 'menu-item-image';

      var img = document.createElement('img');
      img.src = src;
      img.alt = title;
      img.loading = 'lazy';
      img.decoding = 'async';
      wrap.appendChild(img);

      var caption = document.createElement('div');
      caption.className = 'menu-item-caption';
      var left = document.createElement('div');
      left.className = 'menu-item-caption-main';
      var right = document.createElement('div');
      right.className = 'menu-item-caption-right';

      var titleBlock = getDirectChild(span, 'SPAN');
      if (titleBlock && titleBlock.classList && titleBlock.classList.contains('item-title')) {
        left.appendChild(titleBlock);
      } else if (title) {
        var fallbackTitle = document.createElement('span');
        fallbackTitle.className = 'menu-item-name';
        fallbackTitle.textContent = title;
        left.appendChild(fallbackTitle);
      }

      var notes = span.querySelectorAll('small');
      var details = document.createElement('div');
      details.className = 'menu-item-details';
      var hasDetails = false;
      for (var n = 0; n < notes.length; n += 1) {
        var note = notes[n];
        if (note.classList && note.classList.contains('volume')) {
          note.classList.add('menu-item-volume');
          right.appendChild(note);
        } else {
          details.appendChild(note);
          hasDetails = true;
        }
      }
      if (hasDetails) left.appendChild(details);

      var price = getDirectChild(row, 'EM');
      if (price) {
        price.classList.add('menu-item-price');
        right.appendChild(price);
      }

      caption.appendChild(left);
      caption.appendChild(right);
      wrap.appendChild(caption);
      span.insertBefore(wrap, span.firstChild);
      row.classList.add('has-image');
    }
  }

  function scrollToElement(el) {
    if (!el || !el.getBoundingClientRect) return;
    var nav = document.querySelector('.menu-nav');
    var navH = (nav && nav.offsetHeight) ? nav.offsetHeight : 0;
    var top = Math.max(el.getBoundingClientRect().top + window.pageYOffset - navH - 18, 0);
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function markHit(el) {
    if (!el || !el.classList) return;
    el.classList.add('search-hit');
    window.setTimeout(function () {
      el.classList.remove('search-hit');
    }, 1300);
  }

  function runSearch(input) {
    var q = normalize(input && input.value);
    if (!q) return;

    var rows = document.querySelectorAll('.menu-list li');
    for (var i = 0; i < rows.length; i += 1) {
      var rowText = normalize(rows[i].textContent || '');
      if (rowText.indexOf(q) !== -1) {
        scrollToElement(rows[i]);
        markHit(rows[i]);
        return;
      }
    }

    var sections = document.querySelectorAll('.menu-group[id], .menu-section');
    for (var j = 0; j < sections.length; j += 1) {
      var secText = normalize(sections[j].textContent || '');
      if (secText.indexOf(q) !== -1) {
        scrollToElement(sections[j]);
        return;
      }
    }
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = String(text || '');
    return div.innerHTML;
  }

  function getSearchIndex() {
    var index = [];
    var rows = document.querySelectorAll('.menu-list li');
    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      var title = getTitle(row) || String(row.textContent || '').trim();
      var sectionWrap = closestEl(row, '.menu-group, .menu-section');
      var h = sectionWrap ? sectionWrap.querySelector('h3') : null;
      var section = h ? String(h.textContent || '').trim() : 'Блюдо';
      index.push({
        type: 'row',
        label: title,
        meta: section,
        text: normalize(title + ' ' + row.textContent + ' ' + section),
        element: row
      });
    }

    var sections = document.querySelectorAll('.menu-group[id], .menu-section');
    for (var j = 0; j < sections.length; j += 1) {
      var s = sections[j];
      var hs = s.querySelector('h3');
      var label = hs ? String(hs.textContent || '').trim() : (s.id || 'Раздел');
      index.push({
        type: 'section',
        label: label,
        meta: 'Раздел',
        text: normalize((s.id || '') + ' ' + label + ' ' + (s.textContent || '')),
        element: s
      });
    }
    return index;
  }

  function findMatches(query, limit) {
    var q = normalize(query);
    if (!q) return [];
    var list = getSearchIndex();
    var matches = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (item.text.indexOf(q) !== -1 || normalize(item.label).indexOf(q) !== -1) {
        matches.push(item);
      }
    }
    matches.sort(function (a, b) {
      var an = normalize(a.label);
      var bn = normalize(b.label);
      var as = an.indexOf(q) === 0 ? 1 : 0;
      var bs = bn.indexOf(q) === 0 ? 1 : 0;
      if (as !== bs) return bs - as;
      return an.length - bn.length;
    });
    return matches.slice(0, limit || 8);
  }

  function bindSearch() {
    if (window.__rescueSearchBound) return;
    if (window.__richSearchReady) return;
    var input = document.querySelector('.menu-search input[name="q"], input[name="q"]');
    if (!input) return;
    var form = input.form || closestEl(input, 'form');
    if (!form) return;

    window.__rescueSearchBound = true;
    var activeIndex = -1;
    var matches = [];
    var closeTimer = 0;
    var suggest = document.createElement('div');
    suggest.className = 'menu-search-suggest';
    suggest.setAttribute('role', 'listbox');
    suggest.setAttribute('aria-label', 'Подсказки поиска');
    document.body.appendChild(suggest);

    function setActive(index) {
      activeIndex = index;
      var items = suggest.querySelectorAll('.menu-search-item[data-index]');
      for (var i = 0; i < items.length; i += 1) {
        if (i === index) items[i].classList.add('is-active');
        else items[i].classList.remove('is-active');
      }
    }

    function positionSuggest() {
      var rect = input.getBoundingClientRect();
      suggest.style.position = 'fixed';
      suggest.style.left = rect.left + 'px';
      suggest.style.top = (rect.bottom + 8) + 'px';
      suggest.style.width = Math.max(rect.width, 280) + 'px';
    }

    function closeSuggest() {
      suggest.classList.remove('is-open');
      suggest.innerHTML = '';
      matches = [];
      activeIndex = -1;
    }

    function choose(item) {
      if (!item || !item.element) return;
      input.value = item.label || input.value;
      scrollToElement(item.element);
      if (item.type === 'row') markHit(item.element);
      closeSuggest();
    }

    function renderSuggest(value) {
      var q = String(value || '').trim();
      if (!q) {
        closeSuggest();
        return;
      }

      matches = findMatches(q, 8);
      if (matches.length === 0) {
        suggest.innerHTML = '<div class="menu-search-item menu-search-empty">Ничего не найдено</div>';
        positionSuggest();
        suggest.classList.add('is-open');
        activeIndex = -1;
        return;
      }

      var html = '';
      for (var i = 0; i < matches.length; i += 1) {
        html += '<button type="button" class="menu-search-item' + (i === 0 ? ' is-active' : '') + '" data-index="' + i + '">';
        html += '<span class="menu-search-item-title">' + escapeHtml(matches[i].label) + '</span>';
        html += '<span class="menu-search-item-meta">' + escapeHtml(matches[i].meta || '') + '</span>';
        html += '</button>';
      }
      suggest.innerHTML = html;
      activeIndex = 0;
      positionSuggest();
      suggest.classList.add('is-open');
    }

    function submitWithSuggest() {
      if (matches.length > 0) {
        var idx = activeIndex >= 0 ? activeIndex : 0;
        choose(matches[idx]);
        return;
      }
      runSearch(input);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      submitWithSuggest();
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!suggest.classList.contains('is-open')) renderSuggest(input.value);
        if (matches.length > 0) setActive(Math.min(activeIndex + 1, matches.length - 1));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!suggest.classList.contains('is-open')) renderSuggest(input.value);
        if (matches.length > 0) setActive(Math.max(activeIndex - 1, 0));
        return;
      }
      if (event.key === 'Escape') {
        closeSuggest();
        return;
      }
      if (event.key !== 'Enter') return;
      event.preventDefault();
      submitWithSuggest();
    });

    input.addEventListener('input', function () {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = 0;
      }
      renderSuggest(input.value);
    });

    input.addEventListener('focus', function () {
      renderSuggest(input.value);
    });

    input.addEventListener('blur', function () {
      closeTimer = window.setTimeout(function () {
        closeSuggest();
      }, 180);
    });

    window.addEventListener('resize', function () {
      if (suggest.classList.contains('is-open')) positionSuggest();
    });

    window.addEventListener('scroll', function () {
      if (suggest.classList.contains('is-open')) positionSuggest();
    }, { passive: true });

    suggest.addEventListener('mousedown', function (event) {
      event.preventDefault();
    });

    suggest.addEventListener('click', function (event) {
      var btn = closestEl(event.target, '.menu-search-item[data-index]');
      if (!btn) return;
      var idx = Number(btn.getAttribute('data-index'));
      if (isNaN(idx) || idx < 0 || idx >= matches.length) return;
      setActive(idx);
      choose(matches[idx]);
    });
  }

  function boot() {
    attachDishImages();
    bindSearch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('load', boot);
})();
