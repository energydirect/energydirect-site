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


// --- Begin flyout injection (55+ deposit-waived) ---
(function injectFlyout() {
  function createStyle(css) {
    var s = document.createElement('style');
    s.type = 'text/css';
    s.appendChild(document.createTextNode(css));
    return s;
  }

  var css = '\n  /* 55+ Fly-Out Modal Styles (injected) */\n  .flyout-overlay {\n    position: fixed;\n    inset: 0;\n    background: rgba(15, 23, 42, 0.7);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    z-index: 9999;\n    opacity: 0;\n    visibility: hidden;\n    transition: opacity 0.3s ease, visibility 0.3s ease;\n    padding: 1rem;\n  }\n  .flyout-modal {\n    position: relative;\n    max-width: 520px;\n    width: 100%;\n    background: #fff;\n    border-radius: 16px;\n    overflow: hidden;\n    box-shadow: 0 20px 40px rgba(0,0,0,0.35);\n    transform: translateY(80px) scale(0.92);\n    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);\n  }\n  .flyout-modal img { width:100%; height:auto; display:block; }\n  .flyout-close {\n    position: absolute;\n    top: 10px;\n    right: 12px;\n    background: rgba(15, 23, 42, 0.8);\n    color: #fff;\n    border: none;\n    font-size: 24px;\n    line-height: 1;\n    width: 34px;\n    height: 34px;\n    border-radius: 50%;\n    cursor: pointer;\n    z-index: 10;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    transition: background 0.2s ease, transform 0.1s ease;\n  }\n  .flyout-close:hover { background: #f57c00; transform: scale(1.05); }\n  .flyout-overlay.active { opacity:1; visibility:visible; }\n  .flyout-overlay.active .flyout-modal { transform: translateY(0) scale(1); }\n  ';

  function mount() {
    if (document.getElementById('flyout-overlay')) return; // already present
    document.head.appendChild(createStyle(css));

    var overlay = document.createElement('div');
    overlay.id = 'flyout-overlay';
    overlay.className = 'flyout-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    var modal = document.createElement('div');
    modal.className = 'flyout-modal';

    var closeBtn = document.createElement('button');
    closeBtn.id = 'flyout-close';
    closeBtn.className = 'flyout-close';
    closeBtn.setAttribute('aria-label', 'Close deposit waived offer');
    closeBtn.innerHTML = '&times;';

    // Update the href and image path if your pages are in subfolders.
    var link = document.createElement('a');
    link.href = 'https://energydirect.myambit.com/rates-and-plans/';
    link.target = '_blank';
    link.rel = 'noopener';

    var img = document.createElement('img');
    img.src = '/images/55-plus-deposit-waived.jpg';
    img.alt = '55 Plus Electricity Deposit Waived Offer';

    link.appendChild(img);
    modal.appendChild(closeBtn);
    modal.appendChild(link);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Behavior (same as current implementation)
    function show() {
      if (!sessionStorage.getItem('flyoutDismissed')) {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
      }
    }
    function dismiss() {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      sessionStorage.setItem('flyoutDismissed', 'true');
    }

    closeBtn.addEventListener('click', dismiss);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) dismiss(); });

    // Delay before showing
    setTimeout(show, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
// --- End flyout injection ---
