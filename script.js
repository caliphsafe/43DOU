// Highlight nav links based on current section in view
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("[data-section]");
  const navLinks = document.querySelectorAll(".site-nav__link");

  // Map section IDs to nav links
  const navMap = {};
  navLinks.forEach((link) => {
    const targetId = link.getAttribute("data-nav-target");
    if (targetId) {
      navMap[targetId] = link;
    }
  });

  // IntersectionObserver to detect which section is visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        if (entry.isIntersecting && navMap[id]) {
          // Clear all
          navLinks.forEach((link) =>
            link.classList.remove("site-nav__link--active")
          );
          // Activate current
          navMap[id].classList.add("site-nav__link--active");
        }
      });
    },
    {
      root: null,
      threshold: 0.4, // Section is considered active when 40% in view
    }
  );

  sections.forEach((section) => observer.observe(section));

  // Optional: smooth scrolling on nav clicks (CSS handles behavior
  // but this prevents weird jumps on some browsers)
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
});

// Simple Lightbox for Laura Sanchez Applications
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

