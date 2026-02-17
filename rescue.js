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

  function bindSearch() {
    if (window.__rescueSearchBound) return;
    var input = document.querySelector('.menu-search input[name="q"], input[name="q"]');
    if (!input) return;
    var form = input.form || input.closest('form');
    if (!form) return;

    window.__rescueSearchBound = true;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch(input);
    });

    input.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      runSearch(input);
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
