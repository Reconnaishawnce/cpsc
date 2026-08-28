/* ============================================================
   CPSC — shared front-end for the Reference Technology section.
   Renders product cards from a data array and drives an in-page
   lightbox modal (datasheet, product link, field notes, and an
   "add a note" mailto). No dependencies.

   Per-page usage:
     CPSC.initProducts({ gridId: 'prod-grid', products: PRODUCTS });

   Each product object:
     {
       cat:        'sensor',            // matches the filter buttons
       maker:      'Optex',
       name:       'FTB-11T',
       type:       'Dual-technology REX sensor',
       image:      '',                  // '' -> generated placeholder
       blurb:      'Short summary...',
       specs:      [ ['Detection','PIR + microwave'], ... ],   // optional
       tags:       ['Dual-tech','REX sensor'],
       datasheet:  '',                  // URL to a PDF/spec sheet
       productUrl: '',                  // manufacturer / product page
       comments:   [ { author, role, date, text }, ... ]       // field notes
     }
   ============================================================ */
window.CPSC = (function () {
  'use strict';

  var CONTACT_EMAIL = 'abels023@umn.edu';

  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function deviceIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="4" width="18" height="14" rx="2"/>' +
      '<path d="M8 21h8M12 18v3"/><circle cx="12" cy="11" r="3"/></svg>';
  }

  function thumb(p, cls) {
    if (p.image) {
      return '<div class="' + cls + '"><img src="' + esc(p.image) + '" alt="' +
        esc(p.maker + ' ' + p.name) + '" loading="lazy"></div>';
    }
    var initial = esc((p.maker || '?').trim().charAt(0).toUpperCase());
    return '<div class="' + cls + ' thumb-ph" aria-hidden="true">' +
      deviceIcon() + '<span class="thumb-ph-initial">' + initial + '</span></div>';
  }

  /* ---- Card ---- */
  function cardHTML(p, i) {
    return '<article class="prod-card" tabindex="0" role="button" ' +
      'aria-label="View details for ' + esc(p.maker + ' ' + p.name) + '" ' +
      'data-prod-cat="' + esc(p.cat) + '" data-idx="' + i + '">' +
        thumb(p, 'prod-thumb') +
        '<div class="prod-body">' +
          '<div class="prod-maker">' + esc(p.maker) + '</div>' +
          '<div class="prod-name">' + esc(p.name) + '</div>' +
          (p.type ? '<div class="prod-type">' + esc(p.type) + '</div>' : '') +
          '<p class="prod-note">' + esc(p.blurb) + '</p>' +
          '<div class="prod-tags">' +
            (p.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') +
          '</div>' +
          '<div class="prod-cta">View details ' +
            '<span aria-hidden="true">→</span></div>' +
        '</div>' +
      '</article>';
  }

  /* ---- Modal ---- */
  var modalRoot = null;
  var lastFocus = null;

  function ensureModal() {
    if (modalRoot) return modalRoot;
    modalRoot = document.createElement('div');
    modalRoot.className = 'modal-backdrop';
    modalRoot.setAttribute('hidden', '');
    modalRoot.innerHTML = '<div class="modal" role="dialog" aria-modal="true" ' +
      'aria-labelledby="modal-title"><button class="modal-close" type="button" ' +
      'aria-label="Close">&times;</button><div class="modal-scroll"></div></div>';
    document.body.appendChild(modalRoot);

    modalRoot.addEventListener('click', function (e) {
      if (e.target === modalRoot) closeModal();
    });
    modalRoot.querySelector('.modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modalRoot.hasAttribute('hidden')) closeModal();
    });
    return modalRoot;
  }

  function linkBtn(label, url, primary) {
    var cls = 'modal-btn' + (primary ? ' modal-btn-primary' : '');
    if (!url) {
      return '<span class="modal-btn modal-btn-disabled" aria-disabled="true">' +
        esc(label) + ' — not yet added</span>';
    }
    return '<a class="' + cls + '" href="' + esc(url) + '" target="_blank" rel="noopener">' +
      esc(label) + ' <span class="ext" aria-hidden="true">↗</span></a>';
  }

  function specsHTML(p) {
    if (!p.specs || !p.specs.length) return '';
    var rows = p.specs.map(function (row) {
      return '<div class="spec-row"><dt>' + esc(row[0]) + '</dt><dd>' + esc(row[1]) + '</dd></div>';
    }).join('');
    return '<dl class="spec-table">' + rows + '</dl>';
  }

  function notesHTML(p) {
    var list;
    if (p.comments && p.comments.length) {
      list = '<ul class="note-list">' + p.comments.map(function (c) {
        var meta = [c.author, c.role, c.date].filter(Boolean).map(esc).join(' &middot; ');
        return '<li class="note"><div class="note-meta">' + meta + '</div>' +
          '<p class="note-text">' + esc(c.text) + '</p></li>';
      }).join('') + '</ul>';
    } else {
      list = '<p class="note-empty">No field notes yet. If you\'ve installed or ' +
        'tested this, be the first to share how it performs.</p>';
    }
    var subject = encodeURIComponent('CPSC-Note on ' + (p.name || ''));
    var mailto = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject;
    var add = '<a class="add-note-btn" href="' + mailto + '">' +
      '<span class="add-note-icon" aria-hidden="true">+</span>' +
      '<span>Add a field note<span class="add-note-sub">Emails ' + CONTACT_EMAIL +
      ' &middot; subject line pre-filled</span></span></a>';
    return '<section class="notes-section"><div class="notes-head">' +
      '<h3>Field notes from implementers</h3>' +
      (p.comments && p.comments.length ? '<span class="notes-count">' +
        p.comments.length + '</span>' : '') +
      '</div>' + list + add + '</section>';
  }

  function openModal(p) {
    ensureModal();
    var scroll = modalRoot.querySelector('.modal-scroll');
    scroll.innerHTML =
      thumb(p, 'modal-thumb') +
      '<div class="modal-head">' +
        '<div class="modal-eyebrow">' + esc(p.maker) + '</div>' +
        '<h2 class="modal-title" id="modal-title">' + esc(p.name) + '</h2>' +
        (p.type ? '<div class="modal-subtitle">' + esc(p.type) + '</div>' : '') +
        '<div class="prod-tags modal-tags">' +
          (p.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') +
        '</div>' +
      '</div>' +
      '<div class="modal-body">' +
        (p.blurb ? '<p class="modal-blurb">' + esc(p.blurb) + '</p>' : '') +
        specsHTML(p) +
        '<div class="modal-actions">' +
          linkBtn('Data sheet', p.datasheet, true) +
          linkBtn('Manufacturer page', p.productUrl, false) +
        '</div>' +
        notesHTML(p) +
      '</div>';

    lastFocus = document.activeElement;
    modalRoot.removeAttribute('hidden');
    document.body.classList.add('no-scroll');
    // force reflow so the transition runs
    void modalRoot.offsetWidth;
    modalRoot.classList.add('open');
    modalRoot.querySelector('.modal-scroll').scrollTop = 0;
    modalRoot.querySelector('.modal-close').focus();
  }

  function closeModal() {
    if (!modalRoot) return;
    modalRoot.classList.remove('open');
    document.body.classList.remove('no-scroll');
    var mr = modalRoot;
    setTimeout(function () { mr.setAttribute('hidden', ''); }, 200);
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  /* ---- Filter (re-wired after render) ---- */
  function wireFilter(grid) {
    var btns = document.querySelectorAll('[data-prod-filter]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.getAttribute('data-prod-filter');
        grid.querySelectorAll('.prod-card').forEach(function (card) {
          card.style.display = (f === 'all' || card.getAttribute('data-prod-cat') === f) ? '' : 'none';
        });
      });
    });
  }

  function initProducts(opts) {
    var grid = document.getElementById(opts.gridId);
    if (!grid) return;
    var products = opts.products || [];
    grid.innerHTML = products.map(cardHTML).join('');

    grid.querySelectorAll('.prod-card').forEach(function (card) {
      var p = products[+card.getAttribute('data-idx')];
      card.addEventListener('click', function () { openModal(p); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(p); }
      });
    });

    wireFilter(grid);
    ensureModal();
  }

  return { initProducts: initProducts, openModal: openModal, CONTACT_EMAIL: CONTACT_EMAIL };
})();
