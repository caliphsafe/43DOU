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

      targetEl.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  const brandProjects = {
    laura: {
      title: "Laura Sanchez",
      description:
        "Artist-first identity system centered on expressive typography and a tulip mark, built to communicate growth and authenticity across print, events, and social.",
      base: "laura-sanchez.html?embed=true",
      slides: [
        { id: "overview", label: "01 / Overview" },
        { id: "snapshot", label: "02 / Snapshot" },
        { id: "mark", label: "03 / Logo System" },
        { id: "type", label: "04 / Typography" },
        { id: "color", label: "05 / Color System" },
        { id: "applications", label: "06 / Applications" },
        { id: "closing", label: "07 / Closing" },
      ],
    },

    dlab: {
      title: "Date Like A Brand",
      description:
        "A brand system built around dating, identity, confidence, and storytelling with a clean visual language designed to scale across content and community.",
      base: "dlab.html?embed=true",
      slides: [
        { id: "overview", label: "01 / Overview" },
        { id: "book", label: "02 / Brand Strategy" },
        { id: "mark", label: "03 / Logo System" },
        { id: "icons", label: "04 / Icons" },
        { id: "type", label: "05 / Typography" },
        { id: "color", label: "06 / Color System" },
        { id: "pattern", label: "07 / Pattern System" },
        { id: "applications", label: "08 / Applications" },
        { id: "closing", label: "09 / Closing" },
      ],
    },
  };

  function setupBrandDeckStudio() {
    const brandCards = document.querySelectorAll(".brand-project-card");
    const brandSelect = document.getElementById("brandProjectSelect");

    const titleEl = document.getElementById("brandDeckTitle");
    const descriptionEl = document.getElementById("brandDeckDescription");
    const openLink = document.getElementById("brandCaseOpenLink");

    const frame = document.getElementById("brandCaseFrame");
    const urlText = document.getElementById("brandFullUrlText");
    const slideLabel = document.getElementById("brandDeckSlideLabel");

    const prevButton = document.getElementById("brandPrevSlide");
    const nextButton = document.getElementById("brandNextSlide");

    let currentBrand = "laura";
    let currentSlide = 0;

    function scaleBrandPreview() {
      const browserFrame = document.querySelector(".brand-case-frame");
      const desktopScale = browserFrame?.querySelector(".desktop-preview-scale");

      if (!browserFrame || !desktopScale) return;

      const availableWidth = browserFrame.clientWidth;
      const availableHeight = browserFrame.clientHeight - 40;

      const virtualWidth = 1440;
      const virtualHeight = 1300;

      const scale = Math.min(
        availableWidth / virtualWidth,
        availableHeight / virtualHeight
      );

      desktopScale.style.setProperty("--desktop-scale", scale);
    }

    function scrollBrandControlsIntoView() {
      const controls =
        document.querySelector(".brand-deck-controls") ||
        document.querySelector(".brand-preview-panel");

      if (!controls) return;

      const top =
        controls.getBoundingClientRect().top +
        window.scrollY -
        22;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }

    function scrollIframeToSlide() {
      const project = brandProjects[currentBrand];
      const slide = project.slides[currentSlide];

      if (!frame || !frame.contentWindow) return;

      try {
        const iframeDoc = frame.contentWindow.document;
        const target = iframeDoc.getElementById(slide.id);

        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } catch (error) {
        console.warn("Iframe slide scroll blocked:", error);
      }
    }

    function updateBrandFrame(options = {}) {
      const { scrollParentToControls = false } = options;

      const project = brandProjects[currentBrand];
      const slide = project.slides[currentSlide];

      if (!project || !slide || !frame) return;

      const iframeBaseUrl = project.base;
      const displayUrl = `${project.base}#${slide.id}`;

      if (titleEl) {
        titleEl.textContent = project.title;
      }

      if (descriptionEl) {
        descriptionEl.textContent = project.description;
      }

      if (openLink) {
        openLink.href = project.base.replace("?embed=true", "");

        openLink.setAttribute(
          "aria-label",
          `Open ${project.title} full case study`
        );
      }

      if (urlText) {
        urlText.textContent = displayUrl;
      }

      if (slideLabel) {
        slideLabel.textContent = slide.label;
      }

      if (brandSelect) {
        brandSelect.value = currentBrand;
      }

      brandCards.forEach((card) => {
        card.classList.toggle(
          "is-active",
          card.dataset.brand === currentBrand
        );
      });

      const needsNewPage = frame.dataset.brand !== currentBrand;

      if (needsNewPage) {
        frame.dataset.brand = currentBrand;

       frame.onload = () => {
  scaleBrandPreview();

  /*
    Prevent iframe load from pulling parent page downward
    on initial homepage load.
  */

  if (scrollParentToControls) {
    setTimeout(() => {
      scrollIframeToSlide();
    }, 100);

    setTimeout(() => {
      scrollBrandControlsIntoView();
    }, 120);
  }
};

        /*
          IMPORTANT:
          No #hash in iframe src.
          Hashes were causing parent-page jumping.
        */

        frame.src = iframeBaseUrl;
        frame.title = `${project.title} case study preview`;
      } else {
        scrollIframeToSlide();

        scaleBrandPreview();

        if (scrollParentToControls) {
          setTimeout(() => {
            scrollBrandControlsIntoView();
          }, 80);
        }
      }
    }

    function setBrand(brandKey) {
      if (!brandProjects[brandKey]) return;

      currentBrand = brandKey;
      currentSlide = 0;

      updateBrandFrame({
        scrollParentToControls: true,
      });
    }

    brandCards.forEach((card) => {
      card.addEventListener("click", () => {
        setBrand(card.dataset.brand || "laura");
      });
    });

    if (brandSelect) {
      brandSelect.addEventListener("change", () => {
        setBrand(brandSelect.value);
      });
    }

    prevButton?.addEventListener("click", () => {
      const slides = brandProjects[currentBrand].slides;

      currentSlide =
        (currentSlide - 1 + slides.length) %
        slides.length;

      updateBrandFrame({
        scrollParentToControls: true,
      });
    });

    nextButton?.addEventListener("click", () => {
      const slides = brandProjects[currentBrand].slides;

      currentSlide =
        (currentSlide + 1) %
        slides.length;

      updateBrandFrame({
        scrollParentToControls: true,
      });
    });

    updateBrandFrame({
      scrollParentToControls: false,
    });

    /*
      Force page to remain at top on initial load.
    */

    requestAnimationFrame(() => {
      if (!window.location.hash) {
        window.scrollTo({
          top: 0,
          behavior: "auto",
        });
      }
    });

    window.addEventListener("resize", scaleBrandPreview);
  }

  function setupPreviewStudio(config) {
    const projectCards = document.querySelectorAll(config.cardSelector);
    const previewToggles = document.querySelectorAll(config.toggleSelector);
    const projectSelect = document.getElementById(config.selectId);

    const previewTitle = document.getElementById(config.titleId);
    const previewDescription = document.getElementById(config.descriptionId);
    const previewOpenLink = document.getElementById(config.openLinkId);

    const desktopPreview = document.getElementById(
      config.desktopIframeId
    );

    const mobilePreview = document.getElementById(
      config.mobileIframeId
    );

    const previewStage = document.getElementById(config.stageId);

    const desktopUrlText = document.getElementById(
      config.urlTextId
    );

    function scaleDesktopPreview() {
      const browserFrame =
        previewStage?.querySelector(".browser-frame");

      const desktopScale =
        previewStage?.querySelector(".desktop-preview-scale");

      if (!browserFrame || !desktopScale) return;

      const availableWidth = browserFrame.clientWidth;
      const availableHeight = browserFrame.clientHeight - 40;

      const virtualWidth = 1440;
      const virtualHeight = 900;

      const scale = Math.min(
        availableWidth / virtualWidth,
        availableHeight / virtualHeight
      );

      desktopScale.style.setProperty(
        "--desktop-scale",
        scale
      );
    }

    function updatePreview(card) {
      if (!card) return;

      const title =
        card.dataset.previewTitle || "Preview";

      const url =
        card.dataset.previewUrl || "#";

      const description =
        card.dataset.previewDescription ||
        "Selected project preview and overview.";

      projectCards.forEach((item) => {
        item.classList.remove("is-active");
      });

      card.classList.add("is-active");

      if (previewTitle) {
        previewTitle.textContent = title;
      }

      if (previewDescription) {
        previewDescription.textContent = description;
      }

      if (previewOpenLink) {
        previewOpenLink.href = url;

        previewOpenLink.setAttribute(
          "aria-label",
          `Open ${title}`
        );
      }

      if (desktopUrlText) {
        desktopUrlText.textContent = url;
      }

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

      previewStage.classList.remove(
        "is-desktop",
        "is-mobile"
      );

      previewStage.classList.add(`is-${mode}`);

      previewToggles.forEach((toggle) => {
        toggle.classList.toggle(
          "is-active",
          toggle.dataset.view === mode
        );
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
        const mode =
          toggle.dataset.view || "desktop";

        updatePreviewMode(mode);
      });
    });

    if (projectSelect) {
      projectSelect.addEventListener("change", () => {
        const selectedTitle = projectSelect.value;

        const matchingCard = Array.from(projectCards).find(
          (card) => {
            return (
              card.dataset.previewTitle ===
              selectedTitle
            );
          }
        );

        if (matchingCard) {
          updatePreview(matchingCard);
          updatePreviewMode("mobile");
        }
      });
    }

    const firstActiveProject =
      document.querySelector(
        `${config.cardSelector}.is-active`
      ) || projectCards[0];

    updatePreview(firstActiveProject);
    updatePreviewMode("desktop");

    window.addEventListener(
      "resize",
      scaleDesktopPreview
    );
  }

  setupBrandDeckStudio();

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
