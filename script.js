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
  }

  function updatePreviewMode(mode) {
    if (!previewStage) return;

    previewStage.classList.remove("is-desktop", "is-mobile", "is-split");
    previewStage.classList.add(`is-${mode}`);

    previewToggles.forEach((toggle) => {
      toggle.classList.toggle("is-active", toggle.dataset.view === mode);
    });
  }

  projectCards.forEach((card) => {
    card.addEventListener("click", () => {
      updatePreview(card);
    });
  });

  previewToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const mode = toggle.dataset.view || "desktop";
      updatePreviewMode(mode);
    });
  });

  const firstActiveProject =
    document.querySelector(".web-project-card.is-active") || projectCards[0];
  // Scale desktop preview so the embedded site keeps a full desktop viewport
  function scaleDesktopPreview() {
    const desktopFrame = document.querySelector(".preview-frame--desktop");
    if (!desktopFrame) return;

    const frameWidth = desktopFrame.clientWidth;
    const desktopViewportWidth = 1440;
    const scale = frameWidth / desktopViewportWidth;

    desktopFrame.style.setProperty("--desktop-preview-scale", scale);
  }

  scaleDesktopPreview();

  window.addEventListener("resize", scaleDesktopPreview);
  updatePreview(firstActiveProject);
  updatePreviewMode("desktop");
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
