/* =========================================================
   Pedra da Boca Hotel — interações, motion e integrações
   ========================================================= */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var WPP = CFG.whatsapp || "5584986234426";
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Armazenamento seguro ---------- */
  function lerLS(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gravarLS(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lerSS(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function gravarSS(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  /* ---------- UTMs: guarda a origem da visita na sessão ---------- */
  (function () {
    var p = new URLSearchParams(location.search), utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"].forEach(function (k) {
      if (p.get(k)) utm[k] = p.get(k).slice(0, 100);
    });
    if (Object.keys(utm).length) gravarSS("pbh_utm", JSON.stringify(utm));
  })();
  function getUTM() { try { return JSON.parse(lerSS("pbh_utm") || "{}"); } catch (e) { return {}; } }

  /* ---------- Eventos de conversão (dataLayer / gtag / fbq) ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(evento, params) {
    params = Object.assign({}, getUTM(), params || {});
    window.dataLayer.push(Object.assign({ event: evento }, params));
    if (typeof window.gtag === "function") window.gtag("event", evento, params);
    if (typeof window.fbq === "function") {
      if (evento === "generate_lead") window.fbq("track", "Lead");
      else if (/whatsapp|phone/.test(evento)) window.fbq("track", "Contact");
    }
    if (evento === "generate_lead" && typeof window.gtag === "function" && CFG.GOOGLE_ADS_ID && CFG.GOOGLE_ADS_LEAD_LABEL) {
      window.gtag("event", "conversion", { send_to: CFG.GOOGLE_ADS_ID + "/" + CFG.GOOGLE_ADS_LEAD_LABEL });
    }
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-track]");
    if (a) track(a.getAttribute("data-track").indexOf("whatsapp") === 0 ? "whatsapp_click" : a.getAttribute("data-track"), { local: a.getAttribute("data-track") });
  });

  /* ---------- Links de WhatsApp com mensagem padrão ---------- */
  function linkWpp(msg) { return "https://wa.me/" + WPP + "?text=" + encodeURIComponent(msg); }
  $$("[data-wpp]").forEach(function (a) {
    a.href = linkWpp("Olá! Vim pelo site do Pedra da Boca Hotel e gostaria de informações sobre hospedagem.");
  });

  /* ---------- Header, progresso e WhatsApp flutuante ---------- */
  var header = $(".header"), prog = $(".progress"), wf = $(".wpp-float");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (!header.classList.contains("header--interno")) header.classList.toggle("is-solid", y > 60);
    if (prog) prog.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    if (wf) wf.classList.toggle("show", y > innerHeight * 0.6);
    if (!reduz) parallax();
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

  /* ---------- Paralaxe ---------- */
  var parEls = $$("[data-parallax]");
  function parallax() {
    parEls.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var f = parseFloat(el.getAttribute("data-parallax")) || 0.2;
      var off = (r.top + r.height / 2 - innerHeight / 2) * -f;
      el.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
    });
  }
  onScroll();

  /* ---------- Menu mobile ---------- */
  var btnMenu = $(".menu-btn"), nav = $("#menu");
  function fecharMenu() {
    nav.classList.remove("is-open"); btnMenu.setAttribute("aria-expanded", "false");
    btnMenu.setAttribute("aria-label", "Abrir menu"); document.body.classList.remove("menu-open");
  }
  if (btnMenu) {
    btnMenu.addEventListener("click", function () {
      var aberto = nav.classList.toggle("is-open");
      btnMenu.setAttribute("aria-expanded", String(aberto));
      btnMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
      document.body.classList.toggle("menu-open", aberto);
      if (aberto) { var p = $("a", nav); if (p) p.focus(); }
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", fecharMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { fecharMenu(); btnMenu.focus(); } });
  }

  /* ---------- Menu ativo por seção ---------- */
  var links = $$('.nav ul a[href^="#"]');
  if ("IntersectionObserver" in window && links.length) {
    var ioNav = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (l) { l.setAttribute("aria-current", l.getAttribute("href") === "#" + en.target.id ? "true" : "false"); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (l) { var s = $(l.getAttribute("href")); if (s) ioNav.observe(s); });
  }

  /* ---------- Título com entrada palavra a palavra ---------- */
  $$("[data-split]").forEach(function (h) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(" ")); return; }
            var o = document.createElement("span"); o.className = "w";
            var s = document.createElement("span"); s.textContent = w; s.style.animationDelay = (0.15 + i++ * 0.08) + "s";
            o.appendChild(s); frag.appendChild(o);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(h);
    h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
  });

  /* ---------- Revelação na rolagem ---------- */
  var revs = $$(".reveal, .clip, .draw");
  if ("IntersectionObserver" in window && !reduz) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revs.forEach(function (el) { io.observe(el); });
  } else revs.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Datas: mínimo = hoje ---------- */
  function hojeISO(add) { var d = new Date(); d.setDate(d.getDate() + (add || 0)); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function br(iso) { if (!iso) return ""; var p = iso.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  [["#r-in", "#r-out"], ["#f-in", "#f-out"]].forEach(function (par) {
    var a = $(par[0]), b = $(par[1]); if (!a || !b) return;
    a.min = hojeISO(); b.min = hojeISO(1);
    a.addEventListener("change", function () {
      if (!a.value) return;
      var d = new Date(a.value + "T12:00:00"); d.setDate(d.getDate() + 1);
      var min = d.toISOString().slice(0, 10); b.min = min;
      if (!b.value || b.value < min) b.value = min;
    });
  });

  function abrirWpp(msg) {
    var url = linkWpp(msg);
    var w = null;
    try { w = window.open(url, "_blank"); if (w) w.opener = null; } catch (e) {}
    if (!w) location.href = url; // pop-up bloqueado: abre na mesma aba
    return url;
  }

  /* ---------- Consulta rápida ---------- */
  var fr = $("#form-rapido");
  if (fr) fr.addEventListener("submit", function (e) {
    e.preventDefault();
    var ci = $("#r-in").value, co = $("#r-out").value, st = $("#rapido-msg");
    if (!ci || !co || co <= ci) {
      st.textContent = !ci || !co ? "Informe as datas de check-in e check-out." : "A data de check-out deve ser posterior ao check-in.";
      st.style.color = "#b3261e"; (!ci ? $("#r-in") : $("#r-out")).focus(); return;
    }
    st.style.color = ""; st.textContent = "Abrindo o WhatsApp do hotel…";
    abrirWpp("Olá! Gostaria de consultar disponibilidade no Pedra da Boca Hotel.\n\nCheck-in: " + br(ci) + "\nCheck-out: " + br(co) +
      "\nAdultos: " + $("#r-adultos").value + "\nCrianças: " + $("#r-criancas").value);
    track("generate_lead", { form: "consulta_rapida" });
  });

  /* ---------- Formulário de reserva (validação + WhatsApp) ---------- */
  var fm = $("#form-reserva");
  var tel = $("#f-tel");
  if (tel) tel.addEventListener("input", function () {
    var d = tel.value.replace(/\D/g, "").slice(0, 11), o = d;
    if (d.length > 2) o = "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length > 7) o = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(d.length - 4);
    tel.value = o;
  });
  function erro(campo, idErro, msg) {
    var e = $("#" + idErro);
    campo.setAttribute("aria-invalid", msg ? "true" : "false");
    if (e) e.textContent = msg || "";
    return !msg;
  }
  function limpa(s) { return String(s || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim(); }
  if (fm) fm.addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("#f-site").value) return; // honeypot anti-spam
    var nome = $("#f-nome"), email = $("#f-email"), ci = $("#f-in"), co = $("#f-out"), lg = $("#f-lgpd");
    var dig = tel.value.replace(/\D/g, "");
    var ok = [
      erro(nome, "e-nome", limpa(nome.value).length < 3 ? "Informe seu nome completo." : ""),
      erro(tel, "e-tel", dig.length < 10 ? "Informe um WhatsApp válido com DDD." : ""),
      erro(email, "e-email", email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value) ? "Informe um e-mail válido." : ""),
      erro(ci, "e-in", !ci.value ? "Escolha a data de entrada." : (ci.value < hojeISO() ? "A data não pode estar no passado." : "")),
      erro(co, "e-out", !co.value ? "Escolha a data de saída." : (ci.value && co.value <= ci.value ? "O check-out deve ser após o check-in." : "")),
      erro(lg, "e-lgpd", !lg.checked ? "É necessário concordar para enviarmos sua solicitação." : "")
    ];
    if (ok.indexOf(false) > -1) { var inv = $('[aria-invalid="true"]', fm); if (inv) inv.focus(); return; }
    var msg = "Olá! Gostaria de solicitar uma reserva no Pedra da Boca Hotel.\n\n" +
      "Nome: " + limpa(nome.value) + "\nWhatsApp: " + tel.value + (email.value ? "\nE-mail: " + limpa(email.value) : "") +
      "\nCheck-in: " + br(ci.value) + "\nCheck-out: " + br(co.value) +
      "\nAdultos: " + $("#f-adultos").value + "\nCrianças: " + $("#f-criancas").value +
      (limpa($("#f-msg").value) ? "\nMensagem: " + limpa($("#f-msg").value).slice(0, 600) : "");
    var url = abrirWpp(msg);
    var okEl = $("#form-ok");
    okEl.innerHTML = 'Sua solicitação foi aberta no WhatsApp. Para concluir, toque em enviar na conversa. Se a janela não abriu, <a href="' + url + '" target="_blank" rel="noopener">clique aqui</a>.';
    okEl.classList.add("show");
    track("generate_lead", { form: "reserva" });
  });

  /* ---------- Vídeos (arquivo local → fallback Instagram) ---------- */
  $$(".video").forEach(function (box) {
    var btn = $(".video__play", box);
    btn.addEventListener("click", function () {
      var mp4 = box.getAttribute("data-mp4"), insta = box.getAttribute("data-insta");
      track("video_play", { video: box.getAttribute("data-video") });
      var v = document.createElement("video");
      v.controls = true; v.playsInline = true; v.preload = "auto";
      v.setAttribute("aria-label", "Vídeo do Pedra da Boca Hotel");
      var falhou = false;
      function fallback() {
        if (falhou) return; falhou = true;
        if (v.parentNode) v.parentNode.removeChild(v);
        var f = document.createElement("iframe");
        f.src = insta.replace(/\/$/, "") + "/embed/";
        f.title = "Vídeo do Pedra da Boca Hotel no Instagram";
        f.loading = "lazy"; f.allow = "autoplay; encrypted-media; picture-in-picture"; f.allowFullscreen = true;
        box.appendChild(f);
        var aviso = document.createElement("div"); aviso.className = "video__fallback";
        aviso.innerHTML = '<p>Se o vídeo não aparecer, assista diretamente no Instagram.</p><a class="btn btn--amarelo" href="' + insta + '" target="_blank" rel="noopener">Abrir no Instagram</a>';
        aviso.hidden = true; box.appendChild(aviso);
        f.addEventListener("load", function () { aviso.hidden = true; });
        setTimeout(function () { try { if (!f.contentWindow || f.offsetHeight === 0) aviso.hidden = false; } catch (e) {} }, 4000);
      }
      v.addEventListener("error", fallback, true);
      var src = document.createElement("source"); src.src = mp4; src.type = "video/mp4";
      src.addEventListener("error", fallback);
      v.appendChild(src);
      btn.remove(); var img = $("img", box); if (img) img.remove();
      box.appendChild(v);
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }, { once: true });
  });

  /* ---------- Mapa sob demanda ---------- */
  var bm = $("#btn-mapa");
  if (bm) bm.addEventListener("click", function () {
    var f = document.createElement("iframe");
    f.src = "https://www.google.com/maps?q=" + encodeURIComponent(CFG.mapaQuery || "Serra de São Bento - RN") + "&output=embed";
    f.title = "Mapa de localização do Pedra da Boca Hotel"; f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade";
    $("#mapa").innerHTML = ""; $("#mapa").appendChild(f);
    track("map_load");
  });

  /* ---------- Lightbox da galeria ---------- */
  var lb = $("#lightbox"), itens = $$(".galeria button"), atual = 0, origem = null;
  function mostrar(i) {
    atual = (i + itens.length) % itens.length;
    var it = itens[atual], im = $("img", lb);
    im.src = it.getAttribute("data-full"); im.alt = $("img", it).alt;
    $("figcaption", lb).textContent = it.getAttribute("data-legenda") + " · " + (atual + 1) + "/" + itens.length;
  }
  if (lb && itens.length) {
    itens.forEach(function (b, i) {
      b.setAttribute("aria-label", "Ampliar foto: " + b.getAttribute("data-legenda"));
      b.addEventListener("click", function () {
        origem = b; mostrar(i);
        if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
      });
    });
    $(".lb-fechar", lb).addEventListener("click", function () { lb.close(); });
    $(".lb-ant", lb).addEventListener("click", function () { mostrar(atual - 1); });
    $(".lb-prox", lb).addEventListener("click", function () { mostrar(atual + 1); });
    lb.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") mostrar(atual - 1); if (e.key === "ArrowRight") mostrar(atual + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("close", function () { if (origem) origem.focus(); });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1)); x0 = null; });
  }

  /* ---------- Consentimento LGPD + carregamento de tags ---------- */
  var ck = $("#cookie");
  function addScript(src) { var s = document.createElement("script"); s.async = true; s.src = src; document.head.appendChild(s); }
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  // Consent Mode v2 — tudo negado até o visitante decidir
  window.gtag("consent", "default", { ad_storage: "denied", analytics_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", wait_for_update: 500 });
  var carregado = {};
  function aplicarConsentimento(c) {
    window.gtag("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.marketing ? "granted" : "denied",
      ad_user_data: c.marketing ? "granted" : "denied",
      ad_personalization: c.marketing ? "granted" : "denied"
    });
    if ((c.analytics || c.marketing) && CFG.GTM_ID && !carregado.gtm) {
      carregado.gtm = 1;
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      addScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(CFG.GTM_ID));
    }
    if (!CFG.GTM_ID) {
      var gid = (c.analytics && CFG.GA4_ID) || (c.marketing && CFG.GOOGLE_ADS_ID);
      if (gid && !carregado.gtag) { carregado.gtag = 1; addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gid)); window.gtag("js", new Date()); }
      if (c.analytics && CFG.GA4_ID && !carregado.ga4) { carregado.ga4 = 1; window.gtag("config", CFG.GA4_ID, { anonymize_ip: true }); }
      if (c.marketing && CFG.GOOGLE_ADS_ID && !carregado.ads) { carregado.ads = 1; window.gtag("config", CFG.GOOGLE_ADS_ID); }
      if (c.marketing && CFG.META_PIXEL_ID && !carregado.fb) {
        carregado.fb = 1;
        !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
        window.fbq("init", CFG.META_PIXEL_ID); window.fbq("track", "PageView");
      }
    }
  }
  function salvar(c) { c.data = new Date().toISOString(); gravarLS("pbh_consent", JSON.stringify(c)); aplicarConsentimento(c); ck.classList.remove("show"); setTimeout(function () { ck.hidden = true; }, 600); }
  function abrirCookies(prefs) {
    ck.hidden = false; ck.classList.toggle("prefs", !!prefs);
    requestAnimationFrame(function () { ck.classList.add("show"); });
  }
  if (ck) {
    var salvo = null; try { salvo = JSON.parse(lerLS("pbh_consent") || "null"); } catch (e) {}
    if (salvo) aplicarConsentimento(salvo); else setTimeout(function () { abrirCookies(false); }, 1200);
    if (salvo) { $("#ck-analytics").checked = !!salvo.analytics; $("#ck-marketing").checked = !!salvo.marketing; }
    $$("[data-ck]", ck).forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-ck");
        if (t === "aceitar") salvar({ analytics: true, marketing: true });
        else if (t === "recusar") salvar({ analytics: false, marketing: false });
        else if (!ck.classList.contains("prefs")) { ck.classList.add("prefs"); b.textContent = "Salvar preferências"; }
        else salvar({ analytics: $("#ck-analytics").checked, marketing: $("#ck-marketing").checked });
      });
    });
    $$("[data-abrir-cookies]").forEach(function (b) { b.addEventListener("click", function () { abrirCookies(true); var p = $('[data-ck="prefs"]', ck); if (p) p.textContent = "Salvar preferências"; }); });
  }
})();
