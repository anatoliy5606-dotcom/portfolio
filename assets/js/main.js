/* ============================================================
   Ermolaev Consulting — interactions
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  'use strict';

  var config = window.SITE_CONFIG || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- contacts ---------- */
  function applyContacts() {
    document.querySelectorAll('[data-contact]').forEach(function (el) {
      var key = el.getAttribute('data-contact');
      var value = config[key];
      if (!value) {
        el.hidden = true;
        return;
      }
      if (key === 'email') {
        el.href = 'mailto:' + value;
        el.removeAttribute('hidden');
      } else if (key === 'telegram') {
        el.href = value;
        el.removeAttribute('hidden');
      } else {
        el.href = value;
      }
      if (/^https?:/.test(el.getAttribute('href') || '')) {
        el.target = '_blank';
        el.rel = 'noopener';
      }
    });
  }

  /* ---------- sticky header ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var menuBtn = document.querySelector('[data-menu-btn]');
  var mobileNav = document.getElementById('mobile-nav');
  function setMenu(open) {
    if (!menuBtn || !mobileNav) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var openLabel = menuBtn.getAttribute('data-label-open') || 'Open menu';
    var closeLabel = menuBtn.getAttribute('data-label-close') || 'Close menu';
    menuBtn.setAttribute('aria-label', open ? closeLabel : openLabel);
    mobileNav.hidden = !open;
    mobileNav.classList.toggle('is-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    var main = document.getElementById('main');
    var footer = document.querySelector('.site-footer');
    [main, footer].forEach(function (el) {
      if (!el) return;
      if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    mobileNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) setMenu(false);
    });
  }

  /* ---------- language link keeps the current anchor ---------- */
  var langLink = document.querySelector('[data-lang-link]');
  if (langLink) {
    var base = langLink.getAttribute('href').split('#')[0];
    langLink.setAttribute('href', base + window.location.hash);
  }

  /* ---------- active nav item ---------- */
  var sectionIds = ['expertise', 'cases', 'experience', 'credentials', 'approach', 'contact'];
  var navLinks = {};
  document.querySelectorAll('.site-nav a').forEach(function (a) {
    navLinks[a.getAttribute('href').slice(1)] = a;
  });
  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(navLinks).forEach(function (id) {
          navLinks[id].removeAttribute('aria-current');
        });
        var link = navLinks[entry.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionIds.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) navObserver.observe(section);
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(
    '.section-head > *, .xcard, .case-card, .job, .cred, .format, .principle, .contact__cell, .profile'
  );
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (el) {
      el.classList.add('reveal');
      var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children) : [];
      var index = siblings.indexOf(el);
      if (index > 0 && index < 4) el.setAttribute('data-delay', String(Math.min(index, 3)));
      revealObserver.observe(el);
    });
  }

  /* ---------- dialogs ---------- */
  var caseDialog = document.getElementById('case-dialog');
  var docDialog = document.getElementById('doc-dialog');

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.documentElement.style.overflow = 'hidden';
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    dialog.close();
    document.documentElement.style.overflow = '';
  }

  [caseDialog, docDialog].forEach(function (dialog) {
    if (!dialog) return;
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.querySelectorAll('[data-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeDialog(dialog); });
    });
  });

  document.querySelectorAll('[data-case]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.case-card');
      var template = card ? card.querySelector('.case-tpl') : null;
      if (!template || !caseDialog) return;
      caseDialog.querySelector('[data-dialog-title]').textContent = btn.getAttribute('data-case-title') || card.querySelector('h3').textContent;
      caseDialog.querySelector('[data-dialog-meta]').textContent = btn.getAttribute('data-case-meta') || '';
      var body = caseDialog.querySelector('[data-dialog-body]');
      body.replaceChildren(template.content.cloneNode(true));
      openDialog(caseDialog);
    });
  });

  document.querySelectorAll('[data-doc]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!docDialog) return;
      var src = btn.getAttribute('data-doc');
      var title = btn.getAttribute('data-doc-title') || '';
      var meta = btn.getAttribute('data-doc-meta') || '';
      docDialog.querySelector('[data-doc-title]').textContent = title;
      docDialog.querySelector('[data-doc-meta]').textContent = meta;
      var body = docDialog.querySelector('[data-doc-body]');
      var img = document.createElement('img');
      img.src = src;
      img.alt = title + ' — скан документа';
      img.width = 1100;
      img.height = 850;
      img.loading = 'lazy';
      var caption = document.createElement('p');
      caption.className = 'doc-caption';
      caption.textContent = document.body.getAttribute('data-doc-caption') || 'Original document';
      body.replaceChildren(img, caption);
      openDialog(docDialog);
    });
  });

  /* restore scroll lock when a dialog closes natively (Esc) */
  document.querySelectorAll('dialog').forEach(function (dialog) {
    dialog.addEventListener('close', function () {
      document.documentElement.style.overflow = '';
    });
  });

  /* ---------- contact CTA default target ---------- */
  applyContacts();
})();
