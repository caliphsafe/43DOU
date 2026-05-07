// Highlight nav links based on current section in view
document.addEventListener("DOMContentLoaded", () => { 
  const sections = document.querySelectorAll("[data-section]");
  const navLinks = document.querySelectorAll(".site-nav__link");

  const navMap = {};
  navLinks.forEach((link) => {
    const targetId = link.getAttribute("data-nav-target");
    if (targetId) {
      navMap[targetId] = link;
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        if (entry.isIntersecting && navMap[id]) {
          navLinks.forEach((link) =>
            link.classList.remove("site-nav__link--active")
          );

          navMap[id].classList.add("site-nav__link--active");
        }
      });
    },
    {
      root: null,
      threshold: 0.35,
    }
  );

  sections.forEach((section) => observer.observe(section));

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href")?.replace("#", "");
      if (!targetId) return;

      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      e.preventDefault();
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Web Development Preview Studio
  const projectCards = document.querySelectorAll(".web-project-card");
  const previewToggles = document.querySelectorAll(".preview-toggle");
  const webProjectSelect = document.getElementById("webProjectSelect");

  const previewTitle = document.getElementById("previewTitle");
  const previewDescription = document.getElementById("previewDescription");
  const previewOpenLink = document.getElementById("previewOpenLink");
  const desktopPreview = document.getElementById("desktopPreview");
  const mobilePreview = document.getElementById("mobilePreview");
  const previewStage = document.getElementById("previewStage");
  const desktopUrlText = document.getElementById("desktopUrlText");

  function updatePreview(card) {
    if (!card) return;

    const title = card.dataset.siteTitle || "Website Preview";
    const url = card.dataset.siteUrl || "#";
    const description =
      card.dataset.siteDescription ||
      "Selected website preview and project overview.";

    projectCards.forEach((item) => item.classList.remove("is-active"));
    card.classList.add("is-active");

    if (previewTitle) previewTitle.textContent = title;
    if (previewDescription) previewDescription.textContent = description;

    if (previewOpenLink) {
      previewOpenLink.href = url;
      previewOpenLink.textContent = "Open Full Website";
      previewOpenLink.setAttribute("aria-label", `Open ${title} full website`);
    }

    if (desktopUrlText) desktopUrlText.textContent = url;

    if (desktopPreview) {
      desktopPreview.src = url;
      desktopPreview.title = `${title} desktop website preview`;
    }

    if (mobilePreview) {
      mobilePreview.src = url;
      mobilePreview.title = `${title} mobile website preview`;
    }

    scaleDesktopPreview();
  }

  function updatePreviewMode(mode) {
    if (!previewStage) return;

    previewStage.classList.remove("is-desktop", "is-mobile");
    previewStage.classList.add(`is-${mode}`);

    previewToggles.forEach((toggle) => {
      toggle.classList.toggle("is-active", toggle.dataset.view === mode);
    });

    scaleDesktopPreview();
  }

  function scaleDesktopPreview() {
    const browserFrame = document.querySelector(".browser-frame");
    const desktopScale = document.querySelector(".desktop-preview-scale");

    if (!browserFrame || !desktopScale) return;

    const availableWidth = browserFrame.clientWidth;
    const availableHeight = browserFrame.clientHeight - 40;

    const virtualWidth = 1440;
    const virtualHeight = 900;

    const scaleX = availableWidth / virtualWidth;
    const scaleY = availableHeight / virtualHeight;

    const scale = Math.min(scaleX, scaleY);

    desktopScale.style.setProperty("--desktop-scale", scale);
  }

    projectCards.forEach((card) => {
    card.addEventListener("click", () => {
      updatePreview(card);

      if (webProjectSelect) {
        webProjectSelect.value = card.dataset.siteTitle || "";
      }
    });
  });

  if (webProjectSelect) {
    webProjectSelect.addEventListener("change", () => {
      const selectedTitle = webProjectSelect.value;

      const matchingCard = Array.from(projectCards).find((card) => {
        return card.dataset.siteTitle === selectedTitle;
      });

      if (matchingCard) {
        updatePreview(matchingCard);
        updatePreviewMode("mobile");
      }
    });
  }

  previewToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const mode = toggle.dataset.view || "desktop";
      updatePreviewMode(mode);
    });
  });
  // Preload all project websites in hidden iframes
  function preloadProjectSites() {
    if (!projectCards.length) return;

    const preloadWrap = document.createElement("div");
    preloadWrap.setAttribute("aria-hidden", "true");
    preloadWrap.style.position = "absolute";
    preloadWrap.style.width = "1px";
    preloadWrap.style.height = "1px";
    preloadWrap.style.overflow = "hidden";
    preloadWrap.style.opacity = "0";
    preloadWrap.style.pointerEvents = "none";
    preloadWrap.style.left = "-9999px";
    preloadWrap.style.top = "-9999px";

    const loadedUrls = new Set();

    projectCards.forEach((card) => {
      const url = card.dataset.siteUrl;
      if (!url || loadedUrls.has(url)) return;

      loadedUrls.add(url);

      const iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.title = `Preloaded preview for ${card.dataset.siteTitle || url}`;
      iframe.loading = "eager";
      iframe.tabIndex = -1;

      preloadWrap.appendChild(iframe);
    });

    document.body.appendChild(preloadWrap);
  }

  preloadProjectSites();
  const firstActiveProject =
    document.querySelector(".web-project-card.is-active") || projectCards[0];

  updatePreview(firstActiveProject);

  if (webProjectSelect && firstActiveProject) {
    webProjectSelect.value = firstActiveProject.dataset.siteTitle || "";
  }

  updatePreviewMode("desktop");

  window.addEventListener("resize", scaleDesktopPreview);
});

// Simple Lightbox for Case Study Applications
(function () {
  const lb = document.getElementById("lightbox");
  if (!lb) return;

  const lbImg = lb.querySelector(".lightbox__img");
  const lbCap = lb.querySelector(".lightbox__caption");
  const lbClose = lb.querySelector(".lightbox__close");

  function openLightbox(imgEl) {
    const src = imgEl.getAttribute("src");
    const alt = imgEl.getAttribute("alt") || "";

    lbImg.setAttribute("src", src);
    lbImg.setAttribute("alt", alt);
    lbCap.textContent = alt;

    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    lbImg.removeAttribute("src");
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-lightbox]");
    if (!trigger) return;

    const img = trigger.querySelector("img");
    if (img) openLightbox(img);
  });

  lbClose?.addEventListener("click", closeLightbox);

  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
})();
