const injectFragment = (targetId, url, onLoad) => {
  const target = document.getElementById(targetId);
  if (!target) return;

  fetch(url)
    .then(res => res.text())
    .then(html => {
      target.innerHTML = html;
      if (typeof onLoad === "function") onLoad(target);
      window.dispatchEvent(
        new CustomEvent("fragment:loaded", { detail: { id: targetId } })
      );
    });
};

  const setupHeader = container => {
  const header = container.querySelector(".header-fixed");
  if (!header) return;

  const navToggle = header.querySelector("[data-nav-toggle]");
  const searchToggle = header.querySelector("[data-search-toggle]");
  const searchInput = header.querySelector(".search-box input");
  const navLinks = header.querySelectorAll(".bottom-nav a");
  const actionLinks = header.querySelectorAll(".actions a");
  const authOverlay = header.querySelector("[data-auth-overlay]");
  const authOpen = header.querySelector("[data-auth-open]");
  const authClose = header.querySelector("[data-auth-close]");
  const tabs = header.querySelectorAll("[data-auth-tab]");
  const forms = header.querySelectorAll("[data-auth-form]");
  const tabTriggers = header.querySelectorAll("[data-auth-tab-trigger]");
  const setActiveLink = target => {
    navLinks.forEach(link => link.classList.toggle("active", link === target));
  };
  const setActiveAction = target => {
    actionLinks.forEach(link =>
      link.classList.toggle("active", link === target)
    );
  };

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
    link.addEventListener("click", event => {
      setActiveLink(event.currentTarget);
      header.classList.remove("menu-open");
    })
  );
  actionLinks.forEach(link =>
    link.addEventListener("click", event => {
      setActiveAction(event.currentTarget);
    })
  );

  const syncNavWithLocation = () => {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const currentHash = window.location.hash;
    let match =
      Array.from(navLinks).find(link => {
        const url = new URL(link.href, window.location.origin);
        const linkPage = url.pathname.split("/").pop() || "index.html";
        const linkHash = url.hash;
        const samePage = linkPage === currentPage;
        const sameHash =
          !linkHash || !currentHash ? linkHash === currentHash : linkHash === currentHash;
        return samePage && sameHash;
      }) ||
      Array.from(navLinks).find(link => {
        const url = new URL(link.href, window.location.origin);
        const linkPage = url.pathname.split("/").pop() || "index.html";
        return linkPage === currentPage;
      });

    if (!match && navLinks.length) match = navLinks[0];
    if (match) setActiveLink(match);

    const actionMatch = Array.from(actionLinks).find(link => {
      const url = new URL(link.href, window.location.origin);
      const linkPage = url.pathname.split("/").pop() || "index.html";
      return linkPage === currentPage;
    });
    if (actionMatch) setActiveAction(actionMatch);
    else setActiveAction(null);
  };
  syncNavWithLocation();

  const redirectToLibrary = () => {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    if (currentPage !== "library.html") {
      window.location.href = "library.html";
    }
  };
  searchInput?.addEventListener("focus", redirectToLibrary);
  searchInput?.addEventListener("click", redirectToLibrary);

  const openAuth = targetTab => {
    if (!authOverlay) return;
    authOverlay.classList.add("active");
    document.body.classList.add("modal-open");
    setTab(targetTab || "login");
  };

  const closeAuth = () => {
    authOverlay?.classList.remove("active");
    document.body.classList.remove("modal-open");
  };

  const setTab = tabName => {
    tabs.forEach(tab => {
      const active = tab.dataset.authTab === tabName;
      tab.classList.toggle("active", active);
    });
    forms.forEach(form => {
      const active = form.dataset.authForm === tabName;
      form.classList.toggle("active", active);
    });
    const title = authOverlay?.querySelector("#auth-title");
    if (title) title.textContent = tabName === "register" ? "Register" : "Sign In";
  };

  authOpen?.addEventListener("click", () => openAuth("login"));
  authClose?.addEventListener("click", closeAuth);
  authOverlay?.addEventListener("click", e => {
    if (e.target === authOverlay) closeAuth();
  });
  tabs.forEach(tab =>
    tab.addEventListener("click", () => setTab(tab.dataset.authTab))
  );
  tabTriggers.forEach(trigger =>
    trigger.addEventListener("click", e => {
      e.preventDefault();
      setTab(trigger.dataset.authTabTrigger);
    })
  );

  window.addEventListener("hashchange", syncNavWithLocation);
};

injectFragment("header", "/components/header.html", setupHeader);
injectFragment("footer", "/components/footer.html");
