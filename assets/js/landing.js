/* Code Galaxy — landing page motion.
   Scroll-reveal, count-up stats and navbar shadow. Vanilla JS, no build step.
   Everything degrades gracefully: without JS the .reveal fallback below shows
   all content, and the counters render their final values server-side-ish. */
(function () {
  'use strict';

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- navbar: deepen the shadow once the page scrolls ---- */
  var nav = document.getElementById('lnav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- count-up hero stats ---- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (!target || reduced) { el.textContent = String(target || el.textContent); return; }
    var t0 = null, dur = 1400;
    function tick(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      // ease-out cubic so the last numbers land softly
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---- reveal-on-scroll ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var statEls   = Array.prototype.slice.call(document.querySelectorAll('.l-stat dt[data-count]'));

  if (!('IntersectionObserver' in window)) {
    // Very old browser: show everything, print final numbers.
    revealEls.forEach(function (el) { el.classList.add('in'); });
    statEls.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      if (el.hasAttribute('data-count')) {
        countUp(el);
      } else {
        el.classList.add('in');
      }
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function (el) { io.observe(el); });
  statEls.forEach(function (el) { io.observe(el); });
})();
