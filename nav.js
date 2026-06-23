/* Energy Direct — header nav interactions. Desktop dropdowns are CSS hover;
   this wires the mobile hamburger + tap-to-open dropdowns + click-outside close.
   Included site-wide: <script src="/nav.js" defer></script> */
(function () {
  function init() {
    var nav = document.querySelector('.sitenav'); if (!nav) return;
    var burger = nav.querySelector('.nav-burger'), links = nav.querySelector('.nav-links');
    if (burger && links) {
      burger.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    nav.querySelectorAll('.nav-dt').forEach(function (dt) {
      dt.addEventListener('click', function (e) {
        e.preventDefault();
        var dd = dt.closest('.nav-dd'), wasOpen = dd.classList.contains('open');
        nav.querySelectorAll('.nav-dd.open').forEach(function (x) { if (x !== dd) x.classList.remove('open'); });
        dd.classList.toggle('open', !wasOpen);
      });
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        nav.querySelectorAll('.nav-dd.open').forEach(function (x) { x.classList.remove('open'); });
        if (links) links.classList.remove('open');
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
