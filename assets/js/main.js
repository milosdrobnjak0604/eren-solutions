(function () {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref && /^[a-z0-9-]{3,30}$/.test(ref)) {
    localStorage.setItem('eren_ref', ref);
  }
  document.addEventListener('DOMContentLoaded', function () {
    const storedRef = localStorage.getItem('eren_ref');
    if (storedRef) {
      document.querySelectorAll('form').forEach(function (form) {
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'Preporucio';
        hidden.value = storedRef;
        form.appendChild(hidden);
      });
    }
  });
})();

(function () {
  'use strict';
  var header = document.getElementById('header');
  var nav = document.getElementById('site-nav');
  var toggle = document.getElementById('navToggle');
  var mq = window.matchMedia('(min-width: 768px)');
  function setScrolled() {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }
  function openNav() {
    if (!nav || !toggle) return;
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  }
  function onToggleClick() {
    if (!toggle || !nav) return;
    if (nav.classList.contains('is-open')) closeNav();
    else openNav();
  }
  function onResize() {
    if (mq.matches) closeNav();
  }
  if (toggle && nav) {
    toggle.addEventListener('click', onToggleClick);
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (mq.matches) return;
        closeNav();
      });
    });
  }
  window.addEventListener('scroll', setScrolled, { passive: true });
  window.addEventListener('resize', onResize);
  setScrolled();
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) e.target.classList.add('is-visible');
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  if (form && statusEl) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      statusEl.textContent = '';
      statusEl.classList.remove('is-success', 'is-error');
      var fd = new FormData(form);
      var action = form.getAttribute('action');
      fetch(action, {
        method: 'POST',
        body: fd,
        headers: { Accept: 'application/json' },
      })
        .then(function (r) {
          if (r.ok) {
            statusEl.textContent = 'Hvala! Poruka je poslata. Javićemo vam se uskoro.';
            statusEl.classList.add('is-success');
            form.reset();
          } else {
            r.json()
              .then(function (d) {
                statusEl.textContent = (d && d.error) || 'Greška pri slanju. Pokušajte ponovo.';
              })
              .catch(function () {
                statusEl.textContent = 'Greška pri slanju. Pokušajte ponovo.';
              });
            statusEl.classList.add('is-error');
          }
        })
        .catch(function () {
          statusEl.textContent = 'Mrežna greška. Pokušajte kasnije.';
          statusEl.classList.add('is-error');
        });
    });
  }
})();

(function () {
  'use strict';
  var REF_FULL_BASE = 'https://eren-solutions.rs/?ref=';
  var ERR_MSG = 'Koristite samo slova, brojeve i crtice (bez razmaka i srpskih slova).';
  function applyLowerAndHyphens(el) {
    var s = el.value;
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') out += '-';
      else out += c.toLowerCase();
    }
    if (out !== s) el.value = out;
  }
  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('referralSlugInput');
    var previewSlug = document.getElementById('referralPreviewSlug');
    var errEl = document.getElementById('referralValidationMsg');
    var btn = document.getElementById('referralGenerateBtn');
    var result = document.getElementById('referralResult');
    var linkBox = document.getElementById('referralResultLink');
    var copyBtn = document.getElementById('referralCopyBtn');
    if (!input || !previewSlug || !errEl || !btn || !result || !linkBox || !copyBtn) return;
    var lastValidSlug = '';
    function updateUI() {
      applyLowerAndHyphens(input);
      var n = input.value;
      var hasInvalid = /[^a-z0-9-]/.test(n);
      var display = n.replace(/[^a-z0-9-]/g, '');
      if (n.length === 0) {
        previewSlug.textContent = '';
        previewSlug.classList.add('referral-preview__slug--placeholder');
        errEl.textContent = '';
        btn.disabled = true;
        lastValidSlug = '';
        return;
      }
      previewSlug.textContent = hasInvalid ? display : n;
      previewSlug.classList.toggle('referral-preview__slug--placeholder', false);
      if (hasInvalid) {
        errEl.textContent = ERR_MSG;
        btn.disabled = true;
        lastValidSlug = '';
        previewSlug.classList.toggle('referral-preview__slug--placeholder', display.length === 0);
        return;
      }
      errEl.textContent = '';
      if (n.length >= 3 && n.length <= 30 && /^[a-z0-9-]+$/.test(n)) {
        lastValidSlug = n;
        btn.disabled = false;
      } else {
        lastValidSlug = '';
        btn.disabled = true;
      }
    }
    input.addEventListener('input', updateUI);
    updateUI();
    btn.addEventListener('click', function () {
      if (btn.disabled || !lastValidSlug) return;
      var url = REF_FULL_BASE + lastValidSlug;
      linkBox.textContent = url;
      result.hidden = false;
      result.style.animation = 'none';
      void result.offsetWidth;
      result.style.animation = '';
      copyBtn.textContent = 'Kopiraj link';
      copyBtn.disabled = false;
    });
    copyBtn.addEventListener('click', function () {
      var text = linkBox.textContent || '';
      if (!text) return;
      function done() {
        copyBtn.textContent = 'Kopirano! ✓';
        window.setTimeout(function () {
          copyBtn.textContent = 'Kopiraj link';
        }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text, done);
        });
      } else {
        fallbackCopy(text, done);
      }
    });
    function fallbackCopy(text, cb) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (e) {}
      document.body.removeChild(ta);
      if (cb) cb();
    }
  });
})();
