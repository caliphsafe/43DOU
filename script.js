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
