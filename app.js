(function () {
  'use strict';
  window.__drawn = true; /* tells the head script that reveals will happen */

  var sheets = [].slice.call(document.querySelectorAll('.sheet'));
  var narrow = window.matchMedia('(max-width: 960px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var SVGNS = 'http://www.w3.org/2000/svg';

  function show() {
    sheets.forEach(function (s) { s.classList.add('is-drawn'); });
  }

  try {
    /* ---------- Zone rulers: letters follow the real row tracks ---------- */
    function el(tag, cls) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      return e;
    }

    function ensureZones(sheet) {
      var out = {};
      ['zt', 'zb', 'zl', 'zr'].forEach(function (c) {
        var z = sheet.querySelector('.zones.' + c);
        if (!z) {
          z = el('div', 'zones ' + c);
          z.setAttribute('aria-hidden', 'true');
          sheet.appendChild(z);
        }
        out[c] = z;
      });
      return out;
    }

    function fill(z, labels) {
      if (z.children.length === labels.length) return;
      z.textContent = '';
      labels.forEach(function (t) {
        var s = document.createElement('span');
        s.textContent = t;
        z.appendChild(s);
      });
    }

    function layoutZones(sheet) {
      if (narrow.matches) return;
      var frame = sheet.querySelector('.frame');
      var z = ensureZones(sheet);
      var rows = getComputedStyle(frame).gridTemplateRows
        .split(' ').map(parseFloat).filter(function (n) { return !isNaN(n); });
      var letters = rows.map(function (_, i) { return LETTERS[i]; });
      var numbers = [1, 2, 3, 4, 5, 6, 7, 8].map(String);
      fill(z.zt, numbers);
      fill(z.zb, numbers);
      fill(z.zl, letters);
      fill(z.zr, letters);
      var tracks = rows.map(function (h) { return h + 'px'; }).join(' ');
      z.zl.style.gridTemplateRows = tracks;
      z.zr.style.gridTemplateRows = tracks;
    }

    sheets.forEach(function (sheet) {
      layoutZones(sheet);
      if ('ResizeObserver' in window) {
        new ResizeObserver(function () { layoutZones(sheet); })
          .observe(sheet.querySelector('.frame'));
      }
    });
    window.addEventListener('resize', function () { sheets.forEach(layoutZones); });

    /* ---------- Draw-on, once per sheet ---------- */
    if (reduce.matches || !('IntersectionObserver' in window)) {
      show();
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-drawn');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      sheets.forEach(function (s) { io.observe(s); });
    }

    /* ---------- Revision clouds ---------- */
    function scallop(w, h, seg) {
      var nx = Math.max(2, Math.round(w / seg));
      var ny = Math.max(2, Math.round(h / seg));
      var sx = w / nx, sy = h / ny, i, r;
      var d = 'M0 0';
      r = (sx * 0.58).toFixed(2);
      for (i = 1; i <= nx; i++) d += ' A' + r + ' ' + r + ' 0 0 1 ' + (i * sx).toFixed(2) + ' 0';
      r = (sy * 0.58).toFixed(2);
      for (i = 1; i <= ny; i++) d += ' A' + r + ' ' + r + ' 0 0 1 ' + w.toFixed(2) + ' ' + (i * sy).toFixed(2);
      r = (sx * 0.58).toFixed(2);
      for (i = 1; i <= nx; i++) d += ' A' + r + ' ' + r + ' 0 0 1 ' + (w - i * sx).toFixed(2) + ' ' + h.toFixed(2);
      r = (sy * 0.58).toFixed(2);
      for (i = 1; i <= ny; i++) d += ' A' + r + ' ' + r + ' 0 0 1 0 ' + (h - i * sy).toFixed(2);
      return d + 'Z';
    }

    function boxOf(node, frame) {
      var rect;
      if (node.matches('h3')) {
        /* the heading text plus its meta line, so the cloud never cuts through either */
        var range = document.createRange();
        range.selectNodeContents(node);
        rect = range.getBoundingClientRect();
        var meta = node.nextElementSibling;
        if (meta && meta.classList.contains('meta')) {
          var r2 = document.createRange();
          r2.selectNodeContents(meta);
          var m = r2.getBoundingClientRect();
          rect = {
            left: Math.min(rect.left, m.left),
            top: Math.min(rect.top, m.top),
            width: Math.max(rect.right, m.right) - Math.min(rect.left, m.left),
            height: Math.max(rect.bottom, m.bottom) - Math.min(rect.top, m.top)
          };
        }
      } else {
        rect = node.getBoundingClientRect();
      }
      var fr = frame.getBoundingClientRect();
      return {
        x: rect.left - fr.left - frame.clientLeft,
        y: rect.top - fr.top - frame.clientTop,
        w: rect.width,
        h: rect.height
      };
    }

    function Cloud(node, opts) {
      this.node = node;
      this.opts = opts || {};
      this.frame = node.closest('.frame');
      this.svg = null;
      this.place();
    }
    Cloud.prototype.place = function () {
      if (!this.frame || narrow.matches && this.opts.hideNarrow) return this.remove();
      var pad = this.opts.pad != null ? this.opts.pad : 9, b = boxOf(this.node, this.frame);
      var it = this.opts.insetTop || 0;
      b.y += it; b.h -= it;
      if (b.w < 4 || b.h < 4) return this.remove();
      var w = b.w + pad * 2, h = b.h + pad * 2;
      if (!this.svg) {
        this.svg = document.createElementNS(SVGNS, 'svg');
        this.svg.setAttribute('class', 'cloud' + (this.opts.animate ? ' draw' : ''));
        this.svg.setAttribute('aria-hidden', 'true');
        this.frame.appendChild(this.svg);
      }
      var s = this.svg;
      s.style.left = (b.x - pad) + 'px';
      s.style.top = (b.y - pad) + 'px';
      s.setAttribute('width', w);
      s.setAttribute('height', h);
      s.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      var seg = this.opts.seg || 22;
      var path = s.querySelector('path.cl');
      if (!path) {
        path = document.createElementNS(SVGNS, 'path');
        path.setAttribute('class', 'cl');
        path.setAttribute('pathLength', '1');
        s.appendChild(path);
      }
      path.setAttribute('d', scallop(w, h, seg));
      if (this.opts.tag && !s.querySelector('.tag-tri')) {
        var g = document.createElementNS(SVGNS, 'g');
        var tri = document.createElementNS(SVGNS, 'polygon');
        tri.setAttribute('class', 'tag-tri');
        var cx = w + 16, cy = h / 2;
        tri.setAttribute('points', cx + ',' + (cy - 12) + ' ' + (cx + 13) + ',' + (cy + 10) + ' ' + (cx - 13) + ',' + (cy + 10));
        var tx = document.createElementNS(SVGNS, 'text');
        tx.setAttribute('class', 'tag-t');
        tx.setAttribute('x', cx);
        tx.setAttribute('y', cy + 6);
        tx.textContent = this.opts.tag;
        g.appendChild(tri);
        g.appendChild(tx);
        s.appendChild(g);
      }
    };
    Cloud.prototype.remove = function () {
      if (this.svg && this.svg.parentNode) this.svg.parentNode.removeChild(this.svg);
      this.svg = null;
    };

    var pending = null;
    var targeted = null;

    function mountPending() {
      var row = document.getElementById('rev-g');
      if (!row) return;
      pending = new Cloud(row, { seg: 14, pad: 2, tag: 'G', insetTop: 4 });
    }

    function target(id) {
      var node = id && document.getElementById(id);
      if (targeted) { targeted.remove(); targeted = null; }
      if (!node || /^sheet-/.test(id) || node.classList.contains('sheet')) return;
      var focus = node.querySelector('h3') || node;
      targeted = new Cloud(focus, { animate: !reduce.matches, seg: 16, pad: 8 });
    }

    function onHash() {
      target(decodeURIComponent(location.hash.slice(1)));
    }
    window.addEventListener('hashchange', onHash);

    /* re-click on the same link: the hash does not change, so re-target */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (id && location.hash.slice(1) === id) target(id);
    });

    var raf = 0;
    function replace() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        if (pending) pending.place();
        if (targeted) targeted.place();
      });
    }
    window.addEventListener('resize', replace);
    window.addEventListener('load', replace);
    if (document.fonts && document.fonts.addEventListener) {
      document.fonts.addEventListener('loadingdone', replace);
    }
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(replace);
      sheets.forEach(function (s) { ro.observe(s.querySelector('.frame')); });
      /* the table rows reflow when the web font replaces the fallback */
      var table = document.querySelector('.revs table');
      if (table) ro.observe(table);
    }

    /* clouds are measured, so wait for the real font metrics first */
    var ready = (document.fonts && document.fonts.ready) || Promise.resolve();
    ready.then(function () {
      mountPending();
      onHash();
      sheets.forEach(layoutZones);
    });

    /* ---------- Sheet and zone references in the revision table ---------- */
    function fillRefs() {
      [].forEach.call(document.querySelectorAll('[data-see]'), function (cell) {
        var t = document.getElementById(cell.getAttribute('data-see'));
        if (!t) return;
        var sheet = t.closest('.sheet');
        var n = sheet ? sheet.id.replace('sheet-', '') : '';
        if (narrow.matches) { cell.textContent = 'Sheet ' + n; return; }
        var cs = getComputedStyle(t);
        var row = parseInt(cs.gridRowStart, 10);
        var col = parseInt(cs.gridColumnStart, 10);
        cell.textContent = (row && col) ? n + ' · ' + LETTERS[row - 1] + col : 'Sheet ' + n;
      });
    }
    fillRefs();
    window.addEventListener('resize', fillRefs);

    /* ---------- Phones: wide drawings pan at true size instead of shrinking ---------- */
    function wrapDrawings() {
      [].forEach.call(document.querySelectorAll('.detail svg.dwg'), function (svg) {
        if (svg.parentNode.classList.contains('dwg-scroll')) return;
        var box = document.createElement('div');
        box.className = 'dwg-scroll';
        var hint = document.createElement('p');
        hint.className = 'pan-hint';
        hint.setAttribute('aria-hidden', 'true');
        hint.textContent = 'Drag the drawing sideways to see all of it.';
        svg.parentNode.insertBefore(box, svg);
        box.appendChild(svg);
        box.parentNode.insertBefore(hint, box.nextSibling);
      });
    }
    wrapDrawings();

    /* only a phone-width drawing scrolls, so only then is it a tab stop */
    var phone = window.matchMedia('(max-width: 600px)');
    function syncPan() {
      [].forEach.call(document.querySelectorAll('.dwg-scroll'), function (box) {
        if (phone.matches) {
          box.tabIndex = 0;
          box.setAttribute('role', 'group');
          box.setAttribute('aria-label', 'Drawing, scrolls sideways');
        } else {
          box.removeAttribute('tabindex');
          box.removeAttribute('role');
          box.removeAttribute('aria-label');
        }
      });
    }
    syncPan();
    if (phone.addEventListener) phone.addEventListener('change', syncPan);
  } catch (err) {
    show();
    if (window.console) console.error(err);
  }
})();
