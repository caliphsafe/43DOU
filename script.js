document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // Active nav link highlighting
  // ---------------------------
  const sections = document.querySelectorAll("[data-section]");
  const navLinks = document.querySelectorAll(".site-nav__link");

  const navMap = {};
  navLinks.forEach((link) => {
    const targetId = link.getAttribute("data-nav-target");
    if (targetId) navMap[targetId] = link;
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
    { root: null, threshold: 0.4 }
  );

  sections.forEach((section) => observer.observe(section));

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href")?.replace("#", "");
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ---------------------------
  // Theme (Dark Mode) Toggle
  // ---------------------------
  const root = document.documentElement;
  const toggleBtn = document.getElementById("themeToggle");
  const toggleLabel = toggleBtn?.querySelector(".theme-toggle__label");

  const storageKey = "portfolio-theme"; // "light" | "dark"

  const setTheme = (theme) => {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      toggleBtn?.setAttribute("aria-pressed", "true");
      if (toggleLabel) toggleLabel.textContent = "Light";
    } else {
      root.removeAttribute("data-theme");
      toggleBtn?.setAttribute("aria-pressed", "false");
      if (toggleLabel) toggleLabel.textContent = "Dark";
    }
  };

  const getInitialTheme = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved === "dark" || saved === "light") return saved;

    // Respect OS preference if user hasn't chosen yet
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  };

  // Apply initial theme
  const initialTheme = getInitialTheme();
  setTheme(initialTheme);

  // Toggle click
  toggleBtn?.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    localStorage.setItem(storageKey, nextTheme);
    setTheme(nextTheme);
  });

  // Optional: if OS preference changes and user hasn't saved a choice, update automatically
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  mq?.addEventListener?.("change", (e) => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return; // user chose explicitly, don't override
    setTheme(e.matches ? "dark" : "light");
  });
});
