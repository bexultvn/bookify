const injectFragment = (targetId, url, onLoad) => {
  const target = document.getElementById(targetId);
  if (!target) return;

  fetch(url)
    .then(res => res.text())
    .then(html => {
      target.innerHTML = html;
      if (typeof onLoad === "function") onLoad(target);
    });
};

const setupHeader = container => {
  const header = container.querySelector(".header-fixed");
  if (!header) return;

  const navToggle = header.querySelector("[data-nav-toggle]");
  const searchToggle = header.querySelector("[data-search-toggle]");
  const searchInput = header.querySelector(".search-box input");
  const navLinks = header.querySelectorAll(".bottom-nav a");

  navToggle?.addEventListener("click", () => {
    header.classList.toggle("menu-open");
  });

  searchToggle?.addEventListener("click", () => {
    header.classList.toggle("search-open");
    if (header.classList.contains("search-open")) {
      searchInput?.focus();
    }
  });

  navLinks.forEach(link =>
    link.addEventListener("click", () => header.classList.remove("menu-open"))
  );
};

injectFragment("header", "/components/header.html", setupHeader);
injectFragment("footer", "/components/footer.html");
