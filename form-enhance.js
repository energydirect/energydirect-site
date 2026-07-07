/* Energy Direct — enroll-form UX. When "Commercial" is selected, the Home type
   (House/Apartment) selector greys out, since dwelling type applies to
   residential accounts only. Included site-wide: <script src="/form-enhance.js" defer></script> */
(function () {
  function cleanLabel(text) {
    return (text || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  function trackCta(ctaType, ctaLabel) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'cta_click', {
      cta_type: ctaType,
      cta_label: cleanLabel(ctaLabel),
      page_path: window.location.pathname,
      page_title: document.title,
      transport_type: 'beacon'
    });
  }

  function wire(ct) {
    var form = ct.closest('form'); if (!form) return;
    var dw = form.querySelector('select[name="dwellingtype"]'); if (!dw) return;
    function sync() {
      var commercial = ct.value === 'Commercial';
      dw.disabled = commercial;
      dw.style.opacity = commercial ? '0.45' : '';
      dw.style.cursor = commercial ? 'not-allowed' : '';
      dw.title = commercial ? 'Home type applies to residential accounts only' : '';
    }
    ct.addEventListener('change', sync);
    sync();
  }
  function init() {
    var nodes = document.querySelectorAll('select[name="customertype"]');
    for (var i = 0; i < nodes.length; i++) wire(nodes[i]);

    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form || !form.matches || !form.matches('form.zipform')) return;
      trackCta('zip_submit', form.getAttribute('action') || 'zip form');
    }, true);

    document.addEventListener('click', function (e) {
      var fab = e.target.closest && e.target.closest('#ed-fab');
      if (fab) {
        var panel = document.querySelector('#ed-panel');
        if (panel && panel.classList.contains('open')) trackCta('chat_open', 'Energy Direct chat');
        return;
      }

      var chatCall = e.target.closest && e.target.closest('.ed-chip.call');
      if (chatCall) {
        trackCta('chat_call_prompt', cleanLabel(chatCall.textContent));
        return;
      }

      var link = e.target.closest && e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      if (href.indexOf('tel:') === 0) {
        trackCta('phone_click', cleanLabel(link.textContent) || 'phone link');
      } else if (/shopping\.ambitenergy\.com|ambitenergy\.com/i.test(href)) {
        trackCta('ambit_outbound', cleanLabel(link.textContent) || href);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
