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

  const brandDecks = {
    laura: {
      title: "Laura Sanchez",
      description:
        "Artist-first identity system centered on expressive typography and a tulip mark, built to communicate growth and authenticity across print, events, and social.",
      url: "laura-sanchez.html",
      slides: [
        {
          title: "Identity Overview",
          image: "images/laura-sanchez/ls_hero.png",
          text: "A personal identity system built around expressive typography and a tulip mark symbolizing beauty, growth, renewal, and artist-first storytelling.",
          tags: ["Identity", "Artist Brand", "Visual System"],
        },
        {
          title: "Primary Wordmark",
          image: "images/laura-sanchez/logo-onecolor.png",
          text: "A one-color wordmark built for strong reproduction across print, digital, stamps, embroidery, and small-scale use.",
          tags: ["Wordmark", "Logo", "Reproduction"],
        },
        {
          title: "Tulip Logomark",
          image: "images/laura-sanchez/logo-logomark.png",
          text: "The U becomes a tulip, creating a symbolic mark for beauty, growth, and renewal.",
          tags: ["Symbol", "Tulip", "Brand Memory"],
        },
        {
          title: "Stacked Lockup",
          image: "images/laura-sanchez/logo-stacked.png",
          text: "A compact logo structure designed for avatars, stamps, vertical layouts, and small placements.",
          tags: ["Lockup", "Compact", "System"],
        },
        {
          title: "Color Palette",
          image: "images/laura-sanchez/logo-wordmark.png",
          text: "Soft black grounds the identity while gold, airy blue, and floral pink bring warmth and personality.",
          tags: ["Color", "Warmth", "Expression"],
        },
        {
          title: "Book Cover",
          image: "images/laura-sanchez/app-book-cover.png",
          text: "A focused publishing application designed to feel timeless, poetic, and unmistakably Laura.",
          tags: ["Publishing", "Cover", "Application"],
        },
        {
          title: "Social System",
          image: "images/laura-sanchez/social-01.jpg",
          text: "A repeatable social presence built around poetic language, bilingual storytelling, and visual restraint.",
          tags: ["Social", "Storytelling", "Templates"],
        },
      ],
    },

    dlab: {
      title: "Date Like A Brand",
      description:
        "A brand system built around dating, identity, confidence, and storytelling with a clean visual language designed to scale across content and community.",
      url: "dlab.html",
      slides: [
        {
          title: "Brand Foundation",
          image: "images/dlab/dlab_hero.png",
          text: "A book-rooted identity system expanded into a complete visual language for digital, print, and real-world applications.",
          tags: ["Brand System", "Book", "Identity"],
        },
        {
          title: "Book Cover Blueprint",
          image: "images/dlab/app-book-cover.png",
          text: "The book cover became the source of truth for visual tone, hierarchy, icon direction, and brand language.",
          tags: ["Book Cover", "Foundation", "Direction"],
        },
        {
          title: "Primary Icon",
          image: "images/dlab/logo-icon.png",
          text: "The heart-in-cart mark acts as the core identity anchor and drives the supporting visual system.",
          tags: ["Icon", "Heart-In-Cart", "Logo"],
        },
        {
          title: "Logo Lockup",
          image: "images/dlab/logo-lockup-blue.png",
          text: "A clean logo lockup built for digital headers, deck covers, campaign graphics, and consistent recognition.",
          tags: ["Lockup", "Recognition", "System"],
        },
        {
          title: "Icon Story",
          image: "images/dlab/icons/04-hearts-in-cart.png",
          text: "The icon system works as a visual story engine, turning the dating framework into repeatable branded moments.",
          tags: ["Icons", "Storytelling", "Framework"],
        },
        {
          title: "Pattern System",
          image: "images/dlab/pattern/pattern-wallpaper-primary.png",
          text: "The heart wallpaper becomes a connective texture across social, print, event, and branded surfaces.",
          tags: ["Pattern", "Wallpaper", "Applications"],
        },
        {
          title: "Real-World Applications",
          image: "images/dlab/app-billboard.png",
          text: "The identity scales into large-format, print, merch, event, and promotional applications.",
          tags: ["Billboard", "Print", "Brand World"],
        },
      ],
    },
  };

  function setupBrandDeckStudio() {
    const brandCards = document.querySelectorAll(".brand-project-card");
    const brandSelect = document.getElementById("brandProjectSelect");
    const viewToggles = document.querySelectorAll(".brand-view-toggle");

    const titleEl = document.getElementById("brandDeckTitle");
    const descriptionEl = document.getElementById("brandDeckDescription");
    const openLink = document.getElementById("brandCaseOpenLink");
    const shell = document.getElementById("brandDeckShell");

    const slideImage = document.getElementById("brandSlideImage");
    const slideTitle = document.getElementById("brandSlideTitle");
    const slideText = document.getElementById("brandSlideText");
    const slideCount = document.getElementById("brandSlideCount");
    const slideTags = document.getElementById("brandSlideTags");

    const prevButton = document.getElementById("brandPrevSlide");
    const nextButton = document.getElementById("brandNextSlide");

    const fullIframe = document.getElementById("brandFullPreview");
    const fullUrlText = document.getElementById("brandFullUrlText");

    let currentBrand = "laura";
    let currentSlide = 0;

    function preloadBrandImages() {
      Object.values(brandDecks).forEach((brand) => {
        brand.slides.forEach((slide) => {
          const img = new Image();
          img.src = slide.image;
        });
      });
    }

    function scaleBrandFullPreview() {
      const browserFrame = document.querySelector(".brand-full-frame");
      const desktopScale = browserFrame?.querySelector(".desktop-preview-scale");

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

    function renderSlide() {
      const brand = brandDecks[currentBrand];
      const slide = brand.slides[currentSlide];

      if (!brand || !slide) return;

      titleEl.textContent = brand.title;
      descriptionEl.textContent = brand.description;
      openLink.href = brand.url;
      openLink.setAttribute("aria-label", `Open ${brand.title} full case study`);

      slideImage.src = slide.image;
      slideImage.alt = `${brand.title} ${slide.title}`;
      slideTitle.textContent = slide.title;
      slideText.textContent = slide.text;
      slideCount.textContent = `${String(currentSlide + 1).padStart(2, "0")} / ${String(brand.slides.length).padStart(2, "0")}`;

      slideTags.innerHTML = "";
      slide.tags.forEach((tag) => {
        const tagEl = document.createElement("span");
        tagEl.textContent = tag;
        slideTags.appendChild(tagEl);
      });

      if (fullIframe) {
        fullIframe.src = brand.url;
        fullIframe.title = `${brand.title} full case study preview`;
      }

      if (fullUrlText) {
        fullUrlText.textContent = brand.url;
      }

      if (brandSelect) {
        brandSelect.value = currentBrand;
      }

      brandCards.forEach((card) => {
        card.classList.toggle("is-active", card.dataset.brand === currentBrand);
      });

      scaleBrandFullPreview();
    }

    function setBrand(brandKey) {
      if (!brandDecks[brandKey]) return;

      currentBrand = brandKey;
      currentSlide = 0;
      renderSlide();
    }

    function setBrandView(view) {
      if (!shell) return;

      shell.classList.remove("is-deck", "is-full");
      shell.classList.add(view === "full" ? "is-full" : "is-deck");

      viewToggles.forEach((toggle) => {
        toggle.classList.toggle("is-active", toggle.dataset.brandView === view);
      });

      scaleBrandFullPreview();
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
      const brand = brandDecks[currentBrand];
      currentSlide = (currentSlide - 1 + brand.slides.length) % brand.slides.length;
      renderSlide();
    });

    nextButton?.addEventListener("click", () => {
      const brand = brandDecks[currentBrand];
      currentSlide = (currentSlide + 1) % brand.slides.length;
      renderSlide();
    });

    viewToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        setBrandView(toggle.dataset.brandView || "deck");
      });
    });

    preloadBrandImages();
    renderSlide();
    setBrandView("deck");

    window.addEventListener("resize", scaleBrandFullPreview);
  }

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
