/* Wayra Huasi — JS vanilla. Sin dependencias, sin build. */
(function () {
  "use strict";

  var WA_NUMERO = "5493814432460";

  /* --- Enlaces de WhatsApp: arma la URL a partir de data-mensaje --- */
  function initWhatsapp() {
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      var mensaje = el.getAttribute("data-mensaje") || "Hola Wayra Huasi, quiero hacer una consulta.";
      el.setAttribute("href", "https://wa.me/" + WA_NUMERO + "?text=" + encodeURIComponent(mensaje));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });
  }

  /* --- Header: pasa a sólido al scrollear (variante transparente) --- */
  function initHeader() {
    var header = document.getElementById("header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Menú móvil --- */
  function initMenu() {
    var menu = document.getElementById("menu-movil");
    var abrir = document.getElementById("abrir-menu");
    var cerrar = document.getElementById("cerrar-menu");
    if (!menu || !abrir || !cerrar) return;
    var toggle = function (abierto) {
      menu.classList.toggle("abierto", abierto);
      abrir.setAttribute("aria-expanded", String(abierto));
      document.body.style.overflow = abierto ? "hidden" : "";
    };
    abrir.addEventListener("click", function () {
      toggle(true);
    });
    cerrar.addEventListener("click", function () {
      toggle(false);
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") toggle(false);
    });
  }

  /* --- Botón flotante de WhatsApp: aparece tras cierto scroll --- */
  function initBotonFlotante() {
    var btn = document.querySelector("[data-wa-flotante]");
    if (!btn) return;
    var onScroll = function () {
      btn.classList.toggle("visible", window.scrollY > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Galería con visor (lightbox), agrupada por data-galeria --- */
  function initGalerias() {
    var grupos = {};
    document.querySelectorAll("[data-foto]").forEach(function (boton) {
      var grupo = boton.closest("[data-galeria]");
      var nombre = grupo ? grupo.getAttribute("data-galeria") : "global";
      grupos[nombre] = grupos[nombre] || [];
      grupos[nombre].push(boton);
    });
    if (Object.keys(grupos).length === 0) return;

    var visor = document.querySelector("[data-visor]");
    if (!visor) return;
    var img = visor.querySelector("[data-visor-img]");
    var cap = visor.querySelector("[data-visor-cap]");
    var num = visor.querySelector("[data-visor-num]");
    var actualGrupo = [];
    var actualIndice = 0;

    function mostrar(i) {
      actualIndice = (i + actualGrupo.length) % actualGrupo.length;
      var b = actualGrupo[actualIndice];
      img.src = b.getAttribute("data-full");
      img.alt = b.getAttribute("data-alt") || "";
      cap.textContent = b.getAttribute("data-alt") || "";
      num.textContent = actualIndice + 1 + " / " + actualGrupo.length;
    }
    function abrir(grupo, i) {
      actualGrupo = grupo;
      mostrar(i);
      visor.classList.add("abierto");
      document.body.style.overflow = "hidden";
    }
    function cerrar() {
      visor.classList.remove("abierto");
      document.body.style.overflow = "";
    }

    Object.keys(grupos).forEach(function (nombre) {
      grupos[nombre].forEach(function (boton, i) {
        boton.addEventListener("click", function () {
          abrir(grupos[nombre], i);
        });
      });
    });

    visor.querySelector("[data-visor-cerrar]").addEventListener("click", cerrar);
    visor.querySelector("[data-visor-prev]").addEventListener("click", function () {
      mostrar(actualIndice - 1);
    });
    visor.querySelector("[data-visor-next]").addEventListener("click", function () {
      mostrar(actualIndice + 1);
    });
    visor.addEventListener("click", function (e) {
      if (e.target === visor) cerrar();
    });
    document.addEventListener("keydown", function (e) {
      if (!visor.classList.contains("abierto")) return;
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowLeft") mostrar(actualIndice - 1);
      if (e.key === "ArrowRight") mostrar(actualIndice + 1);
    });

    // Swipe táctil (mobile): deslizar para pasar de foto
    var inicioX = null;
    visor.addEventListener(
      "touchstart",
      function (e) {
        inicioX = e.touches[0].clientX;
      },
      { passive: true },
    );
    visor.addEventListener(
      "touchend",
      function (e) {
        if (inicioX === null) return;
        var delta = e.changedTouches[0].clientX - inicioX;
        if (Math.abs(delta) > 40) {
          mostrar(actualIndice + (delta < 0 ? 1 : -1));
        }
        inicioX = null;
      },
      { passive: true },
    );
  }

  /* --- Revelado suave de secciones al entrar en viewport --- */
  function initRevelado() {
    var elementos = document.querySelectorAll("[data-reveal]");
    if (elementos.length === 0) return;
    if (!("IntersectionObserver" in window)) {
      elementos.forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visible");
            io.unobserve(entrada.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    elementos.forEach(function (el) {
      io.observe(el);
    });
  }

  /* --- Sub-navegación de alojamientos: resalta la ficha visible --- */
  function initSubnavAlojamientos() {
    var enlaces = document.querySelectorAll(".subnav-alojamientos a");
    var fichas = document.querySelectorAll(".alojamiento");
    if (!enlaces.length || !fichas.length || !("IntersectionObserver" in window)) return;
    var mapa = {};
    enlaces.forEach(function (a) {
      mapa[a.getAttribute("href").slice(1)] = a;
    });
    var io = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          var enlace = mapa[entrada.target.id];
          if (!enlace) return;
          enlaces.forEach(function (a) {
            a.classList.remove("activa");
          });
          enlace.classList.add("activa");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    fichas.forEach(function (f) {
      io.observe(f);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initWhatsapp();
    initHeader();
    initMenu();
    initBotonFlotante();
    initGalerias();
    initRevelado();
    initSubnavAlojamientos();
  });
})();
