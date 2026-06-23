/* Energy Direct — enroll-form UX. When "Commercial" is selected, the Home type
   (House/Apartment) selector greys out, since dwelling type applies to
   residential accounts only. Included site-wide: <script src="/form-enhance.js" defer></script> */
(function () {
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
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
