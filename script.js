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
          navLinks.forEach((link) => {
            link.classList.remove("site-nav__link--active");
          });

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

  function setupPreviewStudio(config) {
    const projectCards = document.querySelectorAll(config.cardSelector);
    const previewToggles = document.querySelectorAll(config.toggleSelector);
    const projectSelect = document.getElementById(config.selectId);

    const previewTitle = document.getElementById(config.titleId);
    const previewDescription = document.getElementById(config.descriptionId);
    const previewOpenLink = document.getElementById(config.openLinkId);
    const desktopPreview = document.getElementById(config.desktopIframeId);
    const mobilePreview = document.getElementById(config.mobileIframeId);
    const previewStage = document.getElementById(config.stageId);
    const desktopUrlText = document.getElementById(config.urlTextId);

    function scaleDesktopPreview() {
      const browserFrame = previewStage?.querySelector(".browser-frame");
      const desktopScale = previewStage?.querySelector(".desktop-preview-scale");

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

    function updatePreview(card) {
      if (!card) return;

      const title = card.dataset.previewTitle || "Preview";
      const url = card.dataset.previewUrl || "#";
      const description =
        card.dataset.previewDescription ||
        "Selected project preview and overview.";

      projectCards.forEach((item) => item.classList.remove("is-active"));
      card.classList.add("is-active");

      if (previewTitle) previewTitle.textContent = title;
      if (previewDescription) previewDescription.textContent = description;

      if (previewOpenLink) {
        previewOpenLink.href = url;
        previewOpenLink.setAttribute("aria-label", `Open ${title}`);
      }

      if (desktopUrlText) desktopUrlText.textContent = url;

      if (desktopPreview) {
        desktopPreview.src = url;
        desktopPreview.title = `${title} desktop preview`;
      }

      if (mobilePreview) {
        mobilePreview.src = url;
        mobilePreview.title = `${title} mobile preview`;
      }

      if (projectSelect) {
        projectSelect.value = title;
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

    if (projectSelect) {
      projectSelect.addEventListener("change", () => {
        const selectedTitle = projectSelect.value;

        const matchingCard = Array.from(projectCards).find((card) => {
          return card.dataset.previewTitle === selectedTitle;
        });

        if (matchingCard) {
          updatePreview(matchingCard);
          updatePreviewMode("mobile");
        }
      });
    }

    const firstActiveProject =
      document.querySelector(`${config.cardSelector}.is-active`) ||
      projectCards[0];

    updatePreview(firstActiveProject);
    updatePreviewMode("desktop");

    window.addEventListener("resize", scaleDesktopPreview);
  }

  setupPreviewStudio({
    cardSelector: ".brand-project-card",
    toggleSelector: ".brand-preview-toggle",
    selectId: "brandProjectSelect",
    titleId: "brandPreviewTitle",
    descriptionId: "brandPreviewDescription",
    openLinkId: "brandPreviewOpenLink",
    desktopIframeId: "brandDesktopPreview",
    mobileIframeId: "brandMobilePreview",
    stageId: "brandPreviewStage",
    urlTextId: "brandDesktopUrlText",
  });

  setupPreviewStudio({
    cardSelector: ".web-project-card",
    toggleSelector: ".web-preview-toggle",
    selectId: "webProjectSelect",
    titleId: "webPreviewTitle",
    descriptionId: "webPreviewDescription",
    openLinkId: "webPreviewOpenLink",
    desktopIframeId: "webDesktopPreview",
    mobileIframeId: "webMobilePreview",
    stageId: "webPreviewStage",
    urlTextId: "webDesktopUrlText",
  });
});
