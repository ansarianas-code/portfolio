/* =====================================================================
   ANSARI ANAS — PORTFOLIO SCRIPT
   1. Loading screen
   2. Navigation (scroll state, mobile menu, active link, smooth scroll)
   3. Scroll progress + back to top
   4. Hero role rotator + mouse-follow glow
   5. Lens system (skills tabs, project filter, accent colour)
   6. Scroll reveal (IntersectionObserver)
   7. Project modal
   8. Contact form validation
   9. Custom cursor
   ===================================================================== */
(function(){
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- 1. LOADING SCREEN ---------------- */
  function initLoader(){
    var loader = document.getElementById("loader");
    var fill = document.getElementById("loaderFill");
    var pct = document.getElementById("loaderPct");
    if(!loader) return;

    var value = 0;
    var target = 100;
    var steps = [0, 25, 50, 75, 100];
    var stepIndex = 0;

    function tick(){
      if(stepIndex >= steps.length){
        setTimeout(function(){
          loader.classList.add("is-hidden");
          document.body.style.overflow = "";
        }, 200);
        return;
      }
      value = steps[stepIndex];
      fill.style.width = value + "%";
      pct.textContent = value + "%";
      stepIndex++;
      setTimeout(tick, prefersReducedMotion ? 40 : 160);
    }

    document.body.style.overflow = "hidden";
    setTimeout(tick, 120);

    // safety: never let the loader trap the page
    window.addEventListener("load", function(){
      setTimeout(function(){
        loader.classList.add("is-hidden");
        document.body.style.overflow = "";
      }, 1400);
    });
  }

  /* ---------------- 2. NAVIGATION ---------------- */
  function initNav(){
    var nav = document.getElementById("siteNav");
    var burger = document.getElementById("navBurger");
    var links = document.getElementById("navLinks");
    var navLinkEls = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
    var sections = navLinkEls
      .map(function(a){ return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);

    function onScroll(){
      nav.classList.toggle("is-scrolled", window.scrollY > 40);

      var pos = window.scrollY + window.innerHeight * 0.3;
      var currentId = sections.length ? sections[0].id : null;
      sections.forEach(function(sec){
        if(pos >= sec.offsetTop) currentId = sec.id;
      });
      navLinkEls.forEach(function(a){
        a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
      });
    }
    window.addEventListener("scroll", onScroll, { passive:true });
    onScroll();

    function closeMenu(){
      burger.classList.remove("is-open");
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    burger.addEventListener("click", function(){
      var willOpen = !links.classList.contains("is-open");
      burger.classList.toggle("is-open", willOpen);
      links.classList.toggle("is-open", willOpen);
      burger.setAttribute("aria-expanded", String(willOpen));
      document.body.style.overflow = willOpen ? "hidden" : "";
    });

    navLinkEls.forEach(function(a){ a.addEventListener("click", closeMenu); });

    window.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeMenu();
    });
  }

  /* ---------------- 3. SCROLL PROGRESS + BACK TO TOP ---------------- */
  function initScrollProgress(){
    var bar = document.getElementById("scrollProgress");
    var backToTop = document.getElementById("backToTop");

    function update(){
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
      bar.setAttribute("aria-valuenow", String(Math.round(pct)));
      backToTop.classList.toggle("is-shown", scrollTop > 600);
    }
    window.addEventListener("scroll", update, { passive:true });
    update();

    backToTop.addEventListener("click", function(){
      window.scrollTo({ top:0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------- 4. HERO ROLE ROTATOR + GLOW ---------------- */
  function initHero(){
    var rotator = document.getElementById("roleRotator");
    var roles = ["Data Analyst", "Frontend Developer", "Data Entry Specialist"];
    var roleIndex = 0;

    function setRole(i){
      rotator.textContent = roles[i];
    }
    setRole(0);

    if(!prefersReducedMotion){
      setInterval(function(){
        roleIndex = (roleIndex + 1) % roles.length;
        rotator.style.opacity = "0";
        setTimeout(function(){
          setRole(roleIndex);
          rotator.style.opacity = "1";
        }, 220);
      }, 2600);
    }

    var glow = document.getElementById("heroGlow");
    var hero = document.getElementById("hero");
    if(glow && hero && !prefersReducedMotion && window.matchMedia("(hover:hover)").matches){
      hero.addEventListener("mousemove", function(e){
        var rect = hero.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        glow.style.setProperty("--x", x + "%");
        glow.style.setProperty("--y", y + "%");
      });
    }
  }

  /* ---------------- 5. LENS SYSTEM ---------------- */
  function initLensSystem(){
    var html = document.documentElement;
    var lensButtons = Array.prototype.slice.call(document.querySelectorAll("[data-lens]"))
      .filter(function(el){ return el.tagName === "BUTTON"; });
    var skillTabs = Array.prototype.slice.call(document.querySelectorAll(".lens-tab[data-lens]"));
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-lens-panel]"));

    function setLens(lens){
      html.setAttribute("data-lens", lens);

      lensButtons.forEach(function(btn){
        var isMatch = btn.getAttribute("data-lens") === lens;
        btn.classList.toggle("active", isMatch);
        if(btn.classList.contains("lens-tab")) btn.setAttribute("aria-selected", String(isMatch));
      });

      panels.forEach(function(panel){
        panel.classList.toggle("active", panel.getAttribute("data-lens-panel") === lens);
      });
    }

    lensButtons.forEach(function(btn){
      btn.addEventListener("click", function(){
        setLens(btn.getAttribute("data-lens"));
        var skillsSection = document.getElementById("skills");
        if(btn.classList.contains("lens-chip") && skillsSection){
          skillsSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block:"start" });
        }
      });
    });

    setLens("data");

    /* project filter (separate, defaults to Data Analyst to match initial lens) */
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-project-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".project-card"));

    function applyFilter(filter){
      filterButtons.forEach(function(btn){
        var isMatch = btn.getAttribute("data-project-filter") === filter;
        btn.classList.toggle("active", isMatch);
        btn.setAttribute("aria-selected", String(isMatch));
      });
      cards.forEach(function(card){
        var show = filter === "all" || card.getAttribute("data-lens-tag") === filter;
        card.classList.toggle("is-shown", show);
      });
    }

    filterButtons.forEach(function(btn){
      btn.addEventListener("click", function(){
        applyFilter(btn.getAttribute("data-project-filter"));
      });
    });

    applyFilter("data");
  }

  /* ---------------- 6. SCROLL REVEAL ---------------- */
  function initReveal(){
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if(prefersReducedMotion || !("IntersectionObserver" in window)){
      items.forEach(function(el){ el.classList.add("is-visible"); });
      return;
    }

    items.forEach(function(el, i){ el.style.setProperty("--i", i % 8); });

    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold:0.15, rootMargin:"0px 0px -60px 0px" });

    items.forEach(function(el){ observer.observe(el); });

    /* re-observe items inside panels/cards that become visible later (filtering) */
    var mo = new MutationObserver(function(){
      items.forEach(function(el){
        if(!el.classList.contains("is-visible")) observer.observe(el);
      });
    });
    mo.observe(document.body, { attributes:true, subtree:true, attributeFilter:["class"] });
  }

  /* ---------------- 7. PROJECT MODAL ---------------- */
  function initModal(){
    var overlay = document.getElementById("modalOverlay");
    var closeBtn = document.getElementById("modalClose");
    var titleEl = document.getElementById("modalTitle");
    var descEl = document.getElementById("modalDesc");
    var toolsEl = document.getElementById("modalTools");
    var tagEl = document.getElementById("modalTag");
    var linkEl = document.getElementById("modalLink");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".project-card"));
    var lastFocused = null;

    var tagLabels = { data:"Data Analyst", frontend:"Frontend Developer", entry:"Data Entry" };

    function openModal(card){
      lastFocused = document.activeElement;
      var lens = card.getAttribute("data-lens-tag");
      tagEl.textContent = tagLabels[lens] || "";
      titleEl.textContent = card.getAttribute("data-title");
      descEl.textContent = card.getAttribute("data-desc");

      var tools = (card.getAttribute("data-tools") || "").split(",").map(function(t){ return t.trim(); }).filter(Boolean);
      toolsEl.innerHTML = "";
      tools.forEach(function(t){
        var span = document.createElement("span");
        span.textContent = t;
        toolsEl.appendChild(span);
      });

      var link = card.getAttribute("data-link");
      if(link){
        linkEl.href = link;
        linkEl.classList.add("is-shown");
      } else {
        linkEl.removeAttribute("href");
        linkEl.classList.remove("is-shown");
      }

      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeModal(){
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if(lastFocused) lastFocused.focus();
    }

    cards.forEach(function(card){
      card.addEventListener("click", function(){ openModal(card); });
      card.addEventListener("keydown", function(e){
        if(e.key === "Enter" || e.key === " "){
          e.preventDefault();
          openModal(card);
        }
      });
    });

    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function(e){
      if(e.target === overlay) closeModal();
    });
    window.addEventListener("keydown", function(e){
      if(e.key === "Escape" && overlay.classList.contains("is-open")) closeModal();
    });
  }

  /* ---------------- 8. CONTACT FORM ---------------- */
  function initContactForm(){
    var form = document.getElementById("contactForm");
    if(!form) return;
    var success = document.getElementById("formSuccess");

    var fields = [
      { input: document.getElementById("cf-name"), error: document.getElementById("cf-name-error"), validate: function(v){ return v.trim().length >= 2 ? "" : "Please enter your name."; } },
      { input: document.getElementById("cf-email"), error: document.getElementById("cf-email-error"), validate: function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email."; } },
      { input: document.getElementById("cf-message"), error: document.getElementById("cf-message-error"), validate: function(v){ return v.trim().length >= 10 ? "" : "Message should be at least 10 characters."; } }
    ];

    fields.forEach(function(f){
      f.input.addEventListener("blur", function(){ validateField(f); });
      f.input.addEventListener("input", function(){
        if(f.input.closest(".form-field").classList.contains("has-error")) validateField(f);
      });
    });

    function validateField(f){
      var message = f.validate(f.input.value);
      var wrapper = f.input.closest(".form-field");
      wrapper.classList.toggle("has-error", Boolean(message));
      f.error.textContent = message;
      return !message;
    }

    form.addEventListener("submit", function(e){
      e.preventDefault();
      success.classList.remove("is-shown");

      var allValid = fields.map(validateField).every(Boolean);
      if(!allValid) return;

      var submitBtn = form.querySelector(".form-submit");
      submitBtn.classList.add("is-loading");

      /* This form has no backend connected — it only validates on the client.
         Replace this timeout with a real request (e.g. fetch() to Formspree,
         EmailJS, or your own serverless endpoint) to actually send messages. */
      setTimeout(function(){
        submitBtn.classList.remove("is-loading");
        success.classList.add("is-shown");
        form.reset();
        fields.forEach(function(f){
          f.input.closest(".form-field").classList.remove("has-error");
          f.error.textContent = "";
        });
      }, 900);
    });
  }

  /* ---------------- 9. CUSTOM CURSOR ---------------- */
  function initCursor(){
    if(!window.matchMedia("(hover:hover)").matches) return;
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    if(!dot || !ring) return;

    var ringX = 0, ringY = 0, targetX = 0, targetY = 0;

    window.addEventListener("mousemove", function(e){
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
      targetX = e.clientX;
      targetY = e.clientY;
    });

    function raf(){
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.querySelectorAll("[data-cursor-hover]").forEach(function(el){
      el.addEventListener("mouseenter", function(){ ring.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function(){ ring.classList.remove("is-hover"); });
    });
  }

  /* ---------------- INIT ---------------- */
  document.addEventListener("DOMContentLoaded", function(){
    initLoader();
    initNav();
    initScrollProgress();
    initHero();
    initLensSystem();
    initReveal();
    initModal();
    initContactForm();
    initCursor();
  });
})();
