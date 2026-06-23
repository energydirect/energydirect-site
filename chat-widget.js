/* Energy Direct — self-contained chat widget.
   Free, no backend, no third-party account, no LLM. Answers ONLY site-specific
   questions (Texas electricity / Ambit / Energy Direct) from a curated knowledge
   base; typed input is keyword-matched, off-topic questions are deflected (never
   answered), and every reply steers the visitor to enter their ZIP and enroll.
   Included site-wide via: <script src="/chat-widget.js" defer></script> */
(function () {
  var PHONE = "(361) 582-9724", TEL = "+13615829724", TEL_HREF = "tel:+13615829724";

  // Curated, SITE-SCOPED knowledge base. k = trigger keywords/phrases, a = answer.
  // The bot only knows these topics; anything else hits the deflecting fallback.
  var KB = [
    { k: ["switch", "switching", "change provider", "change my provider", "sign up", "enroll", "get started", "make the move", "move to ambit"],
      a: "Switching is easy: enter your ZIP at the top to see the Ambit plans at your address, pick one, and enroll online in minutes. Ambit handles the switch with your utility and your power is never interrupted.", zip: true },
    { k: ["tdu", "utility", "poles", "wires", "who delivers", "delivery charge", "deliver my power", "distribution"],
      a: "Your TDU (Transmission and Distribution Utility) owns the poles, wires, and meters and restores outages, no matter which plan you pick. Your Ambit plan only sets your price, term, and rewards." },
    { k: ["lights go out", "lights out", "interrupt", "power off", "go dark", "outage when i switch", "lose power"],
      a: "No, your lights won't go out. Switching only changes who bills you for energy; your local utility keeps delivering power with zero interruption." },
    { k: ["save", "saving", "cheap", "cheaper", "lower my bill", "lower bill", "how much", "rate", "rates", "price", "cost", "expensive"],
      a: "It depends on your address and usage. Enter your ZIP to see your real rate, and ask about Ambit's Free Energy and reward plans that help earn back what you spend.", zip: true },
    { k: ["solar", "buyback", "buy back", "panels", "net meter", "sell power"],
      a: "Yes, Ambit has solar buyback plans that credit you for the excess power your panels send to the grid. Check the calculator on our Solar Plans page, then enter your ZIP to enroll." },
    { k: ["residential", "commercial", "business", "my business", "small business"],
      a: "Both. Use the Residential / Commercial selector in the rate form, then enter your ZIP to see the plans for your account type.", zip: true },
    { k: ["deposit", "no deposit", "no-deposit", "credit check", "down payment"],
      a: "Many customers qualify to start service with no deposit. Enter your ZIP to check your options, or call us to confirm.", zip: true },
    { k: ["fixed", "variable", "rate type", "lock my rate", "lock in", "fixed rate"],
      a: "Ambit offers fixed-rate plans that lock your energy rate for the term, plus other options. Enter your ZIP to compare the plans at your address.", zip: true },
    { k: ["free energy", "rewards", "refer", "referral", "free month", "points"],
      a: "Ambit's Free Energy program is a referral reward: refer enough active customers and you can earn a month of free energy charges. Enter your ZIP to start on a plan." },
    { k: ["cancel", "cancellation", "early termination", "etf", "termination fee", "switch from my current", "break my contract", "buyout"],
      a: "Some plans have an early termination fee, but Ambit currently offers up to a $250 cancellation-fee reimbursement when you switch (a current promotion, conditions apply). Enter your ZIP or call us for details." },
    { k: ["payment", "pay my bill", "autopay", "auto pay", "ways to pay", "pay online"],
      a: "Ambit offers flexible ways to pay, including online and autopay. See our Payment Options page, then enter your ZIP to choose your plan." },
    { k: ["move", "moving", "new address", "new home", "new place", "transfer service", "start service"],
      a: "Setting up service at a new Texas address is quick. Enter your ZIP for your new address to see plans and start service for your move-in date.", zip: true },
    { k: ["efl", "electricity facts label", "facts label", "plan terms", "fine print"],
      a: "The Electricity Facts Label (EFL) summarizes a plan's rate, fees, and term. You'll see the EFL for each plan after you enter your ZIP." },
    { k: ["prepaid", "postpaid", "pay as you go", "pay-as-you-go"],
      a: "Ambit plans are postpaid, so you're billed for what you use. Enter your ZIP to see the plan options at your address." },
    { k: ["green", "renewable", "100%", "clean energy", "wind", "eco"],
      a: "Ambit offers green, renewable electricity plans in Texas. Enter your ZIP to see the renewable options at your address.", zip: true },
    { k: ["minimum usage", "minimum fee", "usage fee", "use too little"],
      a: "Some plans add a minimum-usage fee in low-usage months. The EFL shows it for each plan, so enter your ZIP to compare and avoid surprises." },
    { k: ["contract", "expire", "expiring", "end of term", "renew", "term ends", "my term"],
      a: "When your contract ends you can switch without penalty. Enter your ZIP to see current Ambit plans and lock a new rate.", zip: true },
    { k: ["who are you", "energy direct", "consultant", "local", "who is ambit", "what is ambit"],
      a: "Energy Direct is a local independent Ambit Energy consultant helping Texans compare plans and switch. Enter your ZIP to see your options, or call us to talk." },
    { k: ["zip", "enter my zip", "see plans", "see my plans", "my address", "my rate"],
      a: "Great — enter your ZIP at the top of the page to see the Ambit plans at your address and enroll online in minutes.", zip: true }
  ];

  var STARTERS = ["How do I switch?", "Do I need a deposit?", "What is a TDU?", "How much can I save?", "Solar buyback?"];

  var FALLBACK = "I can help with questions about switching, plans, rates, deposits, solar, rewards, and your Ambit options. " +
    "For anything specific to your address, enter your ZIP at the top of the page, or call/text us at <a href=\"" + TEL_HREF + "\">" + PHONE + "</a>.";

  function match(text) {
    var t = (" " + text.toLowerCase() + " ").replace(/[^a-z0-9% ]+/g, " ");
    var best = null, bestScore = 0;
    KB.forEach(function (item) {
      var score = 0;
      item.k.forEach(function (kw, idx) {
        // each topic's PRIMARY (first) keyword dominates so the real intent wins
        if (t.indexOf(kw) > -1) score += (idx === 0 ? 3 : 1) + (kw.indexOf(" ") > -1 ? 1 : 0);
      });
      if (score > bestScore) { bestScore = score; best = item; }
    });
    return bestScore >= 1 ? best : null;
  }

  // generic coverage answer (only when no specific city/TDU/topic is named)
  var AREA = { k: ["service area", "areas you serve", "area", "serve", "coverage", "cities", "city", "near me"],
    a: "Energy Direct serves cities across Texas. Enter your ZIP to confirm coverage and see the plans at your address." };
  function matchArea(text) {
    var t = (" " + text.toLowerCase() + " ").replace(/[^a-z0-9% ]+/g, " ");
    var sc = 0;
    AREA.k.forEach(function (kw, idx) { if (t.indexOf(kw) > -1) sc += (idx === 0 ? 3 : 1) + (kw.indexOf(" ") > -1 ? 1 : 0); });
    return sc >= 1 ? AREA : null;
  }

  // ---- full-site content index (every page's FAQ Q&As, intros, and city data) ----
  var STOP = {the:1,a:1,an:1,is:1,are:1,of:1,to:1,in:1,on:1,for:1,my:1,me:1,i:1,do:1,does:1,
    can:1,what:1,how:1,where:1,when:1,why:1,who:1,you:1,your:1,it:1,that:1,this:1,and:1,or:1,
    with:1,at:1,be:1,we:1,us:1,our:1,about:1,get:1,if:1,from:1,have:1,need:1,there:1,was:1};
  function toks(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9% ]+/g, " ").split(/\s+/)
      .filter(function (w) { return w.length > 2 && !STOP[w]; });
  }
  var IDX = null, idxLoading = false;
  function loadIndex() {
    if (IDX || idxLoading) return; idxLoading = true;
    fetch("/chat-index.json").then(function (r) { return r.json(); }).then(function (d) {
      IDX = d.map(function (e) { return { u: e.u, t: e.t, a: e.a, q: toks(e.q + " " + e.t), w: toks(e.a) }; });
    }).catch(function () { IDX = []; });
  }
  function searchIndex(query) {
    if (!IDX || !IDX.length) return null;
    var qs = toks(query); if (!qs.length) return null;
    var best = null, bs = 0;
    IDX.forEach(function (e) {
      var sc = 0;
      qs.forEach(function (w) { if (e.q.indexOf(w) > -1) sc += 3; else if (e.w.indexOf(w) > -1) sc += 1; });
      if (sc > bs) { bs = sc; best = e; }
    });
    return bs >= 3 ? best : null;   // need a real match, not one stray common word
  }

  // ---- the Texas cities this site covers (name, TDU, slug, region) ----
  var CITY={"abilene":["Abilene","AEP Texas North","abilene","West Central Texas"],"alvin":["Alvin","Texas-New Mexico Power","alvin","the Greater Houston area"],"angleton":["Angleton","Texas-New Mexico Power","angleton","the Greater Houston area"],"arlington":["Arlington","Oncor","arlington","the Dallas-Fort Worth metroplex"],"baytown":["Baytown","CenterPoint Energy","baytown","the Greater Houston area"],"carrollton":["Carrollton","Oncor","carrollton","the Dallas-Fort Worth metroplex"],"conroe":["Conroe","CenterPoint Energy","conroe","the Greater Houston area"],"corpus christi":["Corpus Christi","AEP Texas Central","corpus","the Texas Gulf Coast (the Coastal Bend)"],"dallas":["Dallas","Oncor","dallas","the Dallas-Fort Worth metroplex"],"dickinson":["Dickinson","CenterPoint Energy","dickinson","the Texas Gulf Coast"],"edinburg":["Edinburg","AEP Texas Central","edinburg","South Texas / the Rio Grande Valley"],"fort worth":["Fort Worth","Oncor","fort-worth","the Dallas-Fort Worth metroplex"],"friendswood":["Friendswood","CenterPoint Energy","friendswood","the Greater Houston area"],"frisco":["Frisco","Oncor","frisco","the Dallas-Fort Worth metroplex"],"galveston":["Galveston","Texas-New Mexico Power","galveston","the Texas Gulf Coast"],"garland":["Garland","Oncor","garland","the Dallas-Fort Worth metroplex"],"grand prairie":["Grand Prairie","Oncor","grand-prairie","the Dallas-Fort Worth metroplex"],"harlingen":["Harlingen","AEP Texas Central","harlingen","South Texas / the Rio Grande Valley"],"houston":["Houston","CenterPoint Energy","houston","the Greater Houston area"],"katy":["Katy","CenterPoint Energy","katy","the Greater Houston area"],"laredo":["Laredo","AEP Texas Central","laredo","South Texas / the Rio Grande Valley"],"league city":["League City","CenterPoint Energy","league-city","the Greater Houston area"],"lewisville":["Lewisville","Oncor","lewisville","the Dallas-Fort Worth metroplex"],"lubbock":["Lubbock","LP&L","lubbock","the South Plains of West Texas"],"mansfield":["Mansfield","Oncor","mansfield","the Dallas-Fort Worth metroplex"],"mcallen":["McAllen","AEP Texas Central","mcallen","South Texas / the Rio Grande Valley"],"mckinney":["McKinney","Oncor","mckinney","the Dallas-Fort Worth metroplex"],"mesquite":["Mesquite","Oncor","mesquite","the Dallas-Fort Worth metroplex"],"midland":["Midland","Oncor","midland","West Texas (the Permian Basin)"],"odessa":["Odessa","Oncor","odessa","West Texas (the Permian Basin)"],"pasadena":["Pasadena","CenterPoint Energy","pasadena","the Greater Houston area"],"pearland":["Pearland","CenterPoint Energy","pearland","the Greater Houston area"],"plano":["Plano","Oncor","plano","the Dallas-Fort Worth metroplex"],"richardson":["Richardson","Oncor","richardson","the Dallas-Fort Worth metroplex"],"san angelo":["San Angelo","AEP Texas North","san-angelo","West Central Texas"],"sugar land":["Sugar Land","CenterPoint Energy","sugar-land","the Greater Houston area"],"texas city":["Texas City","Texas-New Mexico Power","texas-city","the Texas Gulf Coast"],"the woodlands":["The Woodlands","CenterPoint Energy","the-woodlands","the Greater Houston area"],"tyler":["Tyler","Oncor","tyler","East Texas"],"victoria":["Victoria","AEP Texas Central","victoria","South Texas (the Crossroads)"],"waco":["Waco","Oncor","waco","Central Texas"],"wichita falls":["Wichita Falls","Oncor","wichita-falls","North Texas"]};
  var CITY_NAMES = Object.keys(CITY).sort(function (a, b) { return b.length - a.length; });
  function detectCity(query) {
    var q = " " + query.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ") + " ";
    for (var i = 0; i < CITY_NAMES.length; i++) {
      var n = CITY_NAMES[i];
      if (q.indexOf(" " + n + " ") > -1) {
        var c = CITY[n];
        return { a: c[0] + " is in " + c[3] + ". Energy Direct serves " + c[0] + "; your local utility (TDU) there is " + c[1] + ". Enter your ZIP to see Ambit plans at your " + c[0] + " address.", u: "/" + c[2] + "/", t: c[0] };
      }
    }
    return null;
  }

  // ---- which TDU (delivery utility) covers which of our cities ----
  var TDU={"oncor":["Oncor","Arlington, Carrollton, Dallas, Fort Worth, Frisco, Garland, Grand Prairie, Lewisville, Mansfield, McKinney, Mesquite, Midland, Odessa, Plano, Richardson, Tyler, Waco, Wichita Falls"],"centerpoint":["CenterPoint Energy","Baytown, Conroe, Dickinson, Friendswood, Houston, Katy, League City, Pasadena, Pearland, Sugar Land, The Woodlands"],"center point":["CenterPoint Energy","Baytown, Conroe, Dickinson, Friendswood, Houston, Katy, League City, Pasadena, Pearland, Sugar Land, The Woodlands"],"center-point":["CenterPoint Energy","Baytown, Conroe, Dickinson, Friendswood, Houston, Katy, League City, Pasadena, Pearland, Sugar Land, The Woodlands"],"aep texas central":["AEP Texas Central","Corpus Christi, Edinburg, Harlingen, Laredo, McAllen, Victoria"],"aep central":["AEP Texas Central","Corpus Christi, Edinburg, Harlingen, Laredo, McAllen, Victoria"],"aep texas north":["AEP Texas North","Abilene, San Angelo"],"aep north":["AEP Texas North","Abilene, San Angelo"],"aep":["AEP Texas","Abilene, Corpus Christi, Edinburg, Harlingen, Laredo, McAllen, San Angelo, Victoria"],"aep texas":["AEP Texas","Abilene, Corpus Christi, Edinburg, Harlingen, Laredo, McAllen, San Angelo, Victoria"],"tnmp":["Texas-New Mexico Power (TNMP)","Alvin, Angleton, Galveston, Texas City"],"texas-new mexico power":["Texas-New Mexico Power (TNMP)","Alvin, Angleton, Galveston, Texas City"],"texas new mexico power":["Texas-New Mexico Power (TNMP)","Alvin, Angleton, Galveston, Texas City"],"texas new mexico":["Texas-New Mexico Power (TNMP)","Alvin, Angleton, Galveston, Texas City"],"lp&l":["LP&L","Lubbock"],"lpl":["LP&L","Lubbock"],"lp l":["LP&L","Lubbock"],"lubbock power":["LP&L","Lubbock"]};
  var TDU_KEYS = Object.keys(TDU).sort(function (a, b) { return b.length - a.length; });
  function detectTDU(query) {
    var q = " " + query.toLowerCase().replace(/[^a-z0-9& ]+/g, " ").replace(/\s+/g, " ") + " ";
    for (var i = 0; i < TDU_KEYS.length; i++) {
      var k = TDU_KEYS[i];
      if (q.indexOf(" " + k + " ") > -1) {
        var d = TDU[k];
        return { a: d[0] + " delivers electricity in these Texas cities Energy Direct serves: " + d[1] + ". Enter your ZIP to confirm your area and see your Ambit plans.", u: "/service-areas/", t: "Service Areas" };
      }
    }
    return null;
  }

  function goZip() {
    var zf = document.querySelector('.zipform input[type=text], .zipform input, input[name="zipcode"], input[name="zip"]');
    if (zf) { zf.scrollIntoView({ behavior: "smooth", block: "center" }); try { zf.focus({ preventScroll: true }); } catch (e) { zf.focus(); } return true; }
    return false;
  }

  var css = [
    '#ed-fab{position:fixed;right:18px;bottom:18px;z-index:9998;width:60px;height:60px;border-radius:50%;',
    'background:linear-gradient(135deg,#f57c00,#d96b00);box-shadow:0 8px 22px rgba(124,45,18,.4);border:0;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;line-height:1;}',
    '#ed-fab:hover{filter:brightness(1.06);}',
    '#ed-panel{position:fixed;right:18px;bottom:88px;z-index:9999;width:350px;max-width:calc(100vw - 24px);',
    'height:500px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;overflow:hidden;display:none;',
    'flex-direction:column;box-shadow:0 18px 50px rgba(15,23,42,.32);font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;}',
    '#ed-panel.open{display:flex;}',
    '#ed-head{background:linear-gradient(135deg,#f57c00,#d96b00);color:#fff;padding:.85rem 1rem;display:flex;',
    'justify-content:space-between;align-items:center;}',
    '#ed-head b{font-size:1.05rem;} #ed-head small{display:block;opacity:.9;font-size:.78rem;font-weight:400;}',
    '#ed-x{background:none;border:0;color:#fff;font-size:1.4rem;cursor:pointer;line-height:1;}',
    '#ed-body{flex:1;overflow-y:auto;padding:1rem;background:#f7f8fa;}',
    '.ed-msg{max-width:86%;padding:.6rem .8rem;border-radius:12px;margin:.35rem 0;font-size:.92rem;line-height:1.45;}',
    '.ed-bot{background:#fff;border:1px solid #e5e7eb;color:#1e293b;border-bottom-left-radius:3px;}',
    '.ed-me{background:#f57c00;color:#fff;margin-left:auto;border-bottom-right-radius:3px;}',
    '.ed-cta{display:inline-block;margin:.15rem 0 .2rem;font-weight:800;color:#c2410c;cursor:pointer;text-decoration:underline;}',
    '#ed-chips{padding:.5rem .6rem;border-top:1px solid #e5e7eb;background:#fff;display:flex;flex-wrap:wrap;gap:.4rem;}',
    '.ed-chip{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;border-radius:999px;padding:.35rem .7rem;',
    'font-size:.82rem;cursor:pointer;}',
    '.ed-chip:hover{background:#fed7aa;}',
    '.ed-chip.call{background:#16a34a;color:#fff;border-color:#16a34a;font-weight:700;}',
    '#ed-input{display:flex;gap:.4rem;padding:.55rem;border-top:1px solid #e5e7eb;background:#fff;}',
    '#ed-q{flex:1;min-width:0;border:1px solid #e5e7eb;border-radius:10px;padding:.55rem .7rem;font-size:.9rem;outline:none;}',
    '#ed-q:focus{border-color:#f57c00;}',
    '#ed-send{border:0;border-radius:10px;background:#f57c00;color:#fff;font-weight:800;padding:.55rem .9rem;cursor:pointer;}',
    '#ed-send:hover{background:#d96b00;}',
    '.ed-msg a{color:inherit;font-weight:700;}'
  ].join('');

  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

  function init() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var fab = el('<button id="ed-fab" aria-label="Open chat"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.6 9.6 0 0 1-3.8-.7L3 21l1.9-4.1A8.4 8.4 0 1 1 21 11.5z"/></svg></button>');
    var panel = el(
      '<div id="ed-panel" role="dialog" aria-label="Energy Direct chat">' +
        '<div id="ed-head"><div><b>Energy Direct</b><small>Ask about plans, switching &amp; your rate.</small></div>' +
        '<button id="ed-x" aria-label="Close chat">&times;</button></div>' +
        '<div id="ed-body"></div>' +
        '<div id="ed-chips"></div>' +
        '<div id="ed-input"><input id="ed-q" type="text" autocomplete="off" placeholder="Type your question..." aria-label="Type your question"><button id="ed-send">Send</button></div>' +
      '</div>');
    document.body.appendChild(fab); document.body.appendChild(panel);

    var body = panel.querySelector('#ed-body'), chips = panel.querySelector('#ed-chips');
    var input = panel.querySelector('#ed-q'), send = panel.querySelector('#ed-send');

    function add(text, who) {
      var m = el('<div class="ed-msg ' + (who === 'me' ? 'ed-me' : 'ed-bot') + '"></div>');
      m.innerHTML = text; body.appendChild(m); body.scrollTop = body.scrollHeight;
      return m;
    }
    // every bot answer ends by steering to ZIP / enrollment
    function steer() {
      var m = add('Ready to see your plans? <span class="ed-cta">Enter your ZIP &rarr;</span>', 'bot');
      var cta = m.querySelector('.ed-cta');
      cta.onclick = function () { if (!goZip()) location.href = '/'; };
    }
    function botAnswer(text) {
      add(text, 'bot');
      setTimeout(steer, 220);
    }
    function ask(q) {
      add(q, 'me');
      var hit = match(q);                       // 1) a specific topic intent (switch, solar, deposit, move...) wins
      if (hit) { setTimeout(function () { botAnswer(hit.a); }, 220); return; }
      var c = detectCity(q);                    // 2) a Texas city the site covers
      if (c) { setTimeout(function () { botAnswer(c.a + ' <a href="' + c.u + '">Read more &rarr;</a>'); }, 220); return; }
      var dt = detectTDU(q);                    // 3) a delivery utility (Oncor, CenterPoint, AEP, TNMP, LP&L)
      if (dt) { setTimeout(function () { botAnswer(dt.a + ' <a href="' + dt.u + '">Read more &rarr;</a>'); }, 220); return; }
      var ar = matchArea(q);                    // 4) generic "what areas do you serve"
      if (ar) { setTimeout(function () { botAnswer(ar.a); }, 220); return; }
      var s = searchIndex(q);                   // 5) anything else on the site
      if (s) { setTimeout(function () { botAnswer(s.a + ' <a href="' + s.u + '">Read more &rarr;</a>'); }, 220); return; }
      setTimeout(function () { botAnswer(FALLBACK); }, 220);   // 6) off-site -> deflect
    }

    function renderChips() {
      chips.innerHTML = '';
      STARTERS.forEach(function (q) {
        var c = el('<button class="ed-chip"></button>'); c.textContent = q;
        c.onclick = function () { ask(q); };
        chips.appendChild(c);
      });
      var call = el('<button class="ed-chip call">Call or text us</button>');
      call.onclick = function () {
        add('I would like to talk to someone.', 'me');
        setTimeout(function () { add('Call or text us at <a href="' + TEL_HREF + '">' + PHONE + '</a> &mdash; happy to help you compare and enroll.', 'bot'); }, 220);
      };
      chips.appendChild(call);
    }

    function submit() {
      var v = (input.value || '').trim();
      if (!v) return;
      input.value = '';
      ask(v);
    }
    send.onclick = submit;
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });

    add('Hi! Ask me anything about switching, plans, rates, deposits, or solar &mdash; or tap a question below. You can also call/text <a href="' + TEL_HREF + '">' + PHONE + '</a>.', 'bot');
    renderChips();

    function open() { loadIndex(); panel.classList.add('open'); setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) {} }, 60); }
    function close() { panel.classList.remove('open'); }
    fab.onclick = function () { panel.classList.contains('open') ? close() : open(); };
    panel.querySelector('#ed-x').onclick = close;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
