(() => {
  const books = Array.isArray(window.books) ? window.books : [];
  const FAVORITES_KEY = "bookify:favorites";
  const CART_KEY = "bookify:cart";

  const loadArray = key => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn(`Could not read ${key}`, err);
      return [];
    }
  };

  const saveArray = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));

  let favorites = new Set(
    loadArray(FAVORITES_KEY)
      .map(value => Number(value))
      .filter(Boolean)
  );
  let cart = loadArray(CART_KEY)
    .map(item => ({
      id: Number(item.id),
      qty: Math.max(1, Number(item.qty) || 1)
    }))
    .filter(item => !!item.id);

  const formatPrice = price =>
    `$${Number(price || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const resolveImage = path => {
    if (!path) return "../images/book.png";
    if (/^https?:\/\//.test(path)) return path;
    return path.startsWith("../") ? path : `../${path.replace(/^\/?/, "")}`;
  };

  const findBook = id => books.find(book => book.id === Number(id));

  const createCard = (book, options = {}) => {
    const { showFavorite = true, showAdd = true } = options;
    const card = document.createElement("div");
    card.className = "book-card";
    card.dataset.bookId = book.id;

    card.innerHTML = `
      <div class="book-image">
        <img src="${resolveImage(book.image)}" alt="${book.title}">
        ${
          showFavorite
            ? `<i class='bx ${
                favorites.has(book.id) ? "bxs-heart" : "bx-heart"
              }' data-heart="${book.id}"></i>`
            : ""
        }
      </div>
      <h3>${book.title}</h3>
      ${book.author ? `<p class="author">${book.author}</p>` : ""}
      <div class="price">
        <span class="current">${formatPrice(book.price)}</span>
      </div>
      ${
        showAdd
          ? `<button class="btn-add" data-add="${book.id}">Add To Cart</button>`
          : ""
      }
    `;

    return card;
  };

  const renderFeatured = () => {
    const container = document.querySelector("[data-featured-row]");
    if (!container) return;
    container.innerHTML = "";
    const featured = books.slice(0, 4);
    featured.forEach(book => container.appendChild(createCard(book)));
  };

  const filters = {
    genres: new Set(),
    author: "",
    search: ""
  };

  const renderGenreFilters = () => {
    const container = document.querySelector("[data-genre-list]");
    if (!container) return;

    const genreList = Array.from(new Set(books.map(book => book.genre))).sort(
      (a, b) => a.localeCompare(b)
    );
    container.innerHTML = genreList
      .map(
        genre =>
          `<label><input type="checkbox" data-genre-checkbox value="${genre}"> ${genre}</label>`
      )
      .join("");
  };

  const renderAuthorFilter = () => {
    const select = document.querySelector("[data-author-filter]");
    if (!select) return;

    const authors = Array.from(new Set(books.map(book => book.author))).sort(
      (a, b) => a.localeCompare(b)
    );

    authors.forEach(author => {
      const option = document.createElement("option");
      option.value = author;
      option.textContent = author;
      select.appendChild(option);
    });
  };

  const getFilteredBooks = () => {
    const query = filters.search.trim().toLowerCase();
    return books.filter(book => {
      const matchGenre =
        filters.genres.size === 0 || filters.genres.has(book.genre);
      const matchAuthor = !filters.author || filters.author === book.author;
      const matchQuery =
        !query ||
        book.title.toLowerCase().startsWith(query) ||
        (book.author && book.author.toLowerCase().startsWith(query));
      return matchGenre && matchAuthor && matchQuery;
    });
  };

  const renderLibrary = () => {
    const container = document.querySelector("[data-library-grid]");
    if (!container) return;

    const items = getFilteredBooks();
    container.innerHTML = "";

    if (!items.length) {
      container.innerHTML =
        "<p class=\"text-muted\">No books match the selected filters.</p>";
      return;
    }

    items.forEach(book =>
      container.appendChild(createCard(book, { showFavorite: true }))
    );
  };

  const renderFavorites = () => {
    const container = document.querySelector("[data-favorites-grid]");
    if (!container) return;

    const query = filters.search.trim().toLowerCase();
    const favoriteBooks = books.filter(book => {
      if (!favorites.has(book.id)) return false;
      if (!query) return true;
      return (
        book.title.toLowerCase().startsWith(query) ||
        (book.author && book.author.toLowerCase().startsWith(query))
      );
    });
    container.innerHTML = "";

    if (!favoriteBooks.length) {
      container.innerHTML =
        "<p class=\"text-muted\">No favorites yet. Tap the heart on any book to save it.</p>";
      return;
    }

    favoriteBooks.forEach(book =>
      container.appendChild(createCard(book, { showFavorite: true }))
    );
  };

  const saveCart = () => saveArray(CART_KEY, cart);
  const updateCartBadge = () => {
    const count = cart.length;
    document.querySelectorAll("[data-cart-count]").forEach(el => {
      el.textContent = count > 0 ? count : "0";
      el.style.display = count > 0 ? "inline-flex" : "none";
    });
  };
  const saveFavorites = () => saveArray(FAVORITES_KEY, Array.from(favorites));

  const updateHearts = () => {
    document.querySelectorAll("[data-heart]").forEach(icon => {
      const id = Number(icon.dataset.heart);
      icon.classList.toggle("bxs-heart", favorites.has(id));
      icon.classList.toggle("bx-heart", !favorites.has(id));
    });
  };

  const toggleFavorite = id => {
    if (!id) return;
    if (favorites.has(id)) {
      favorites.delete(id);
    } else {
      favorites.add(id);
    }
    saveFavorites();
    updateHearts();
    renderFavorites();
  };

  const addToCart = id => {
    if (!id) return;
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, qty: 1 });
    }
    saveCart();
    renderCart();
    updateCartBadge();
  };

  const setQuantity = (id, qty) => {
    const item = cart.find(entry => entry.id === id);
    if (!item) return;
    const nextQty = Math.max(1, qty);
    item.qty = nextQty;
    saveCart();
    renderCart();
    updateCartBadge();
  };

  const removeFromCart = id => {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
    updateCartBadge();
  };

  const renderCart = () => {
    const container = document.querySelector("[data-cart-items]");
    if (!container) return;

    container.innerHTML = "";
    let subtotal = 0;

    if (!cart.length) {
      container.innerHTML =
        "<p class=\"text-muted\">Your cart is empty. Add a book to get started.</p>";
      updateCartSummary({ subtotal: 0, shipping: 0, tax: 0 });
      return;
    }

    cart.forEach(item => {
      const book = findBook(item.id);
      if (!book) return;
      const lineTotal = Number(book.price) * item.qty;
      subtotal += lineTotal;

      const row = document.createElement("div");
      row.className = "cart-item";
      row.dataset.cartItem = book.id;
      row.innerHTML = `
        <img src="${resolveImage(book.image)}" class="cart-img" alt="${book.title}">

        <div class="cart-info">
          <h3>${book.title}</h3>
          <p>${book.author || ""}</p>
        </div>

        <div class="qty-box">
          <button class="qty-btn" data-qty-action="dec" data-id="${book.id}">-</button>
          <input type="number" min="1" value="${item.qty}" class="qty-input" data-qty-input="${book.id}">
          <button class="qty-btn" data-qty-action="inc" data-id="${book.id}">+</button>
        </div>

        <div class="cart-price">${formatPrice(lineTotal)}</div>

        <button class="remove-btn" data-remove="${book.id}"><i class='bx bx-x'></i></button>
      `;

      container.appendChild(row);
    });

    updateCartSummary({ subtotal, shipping: 0, tax: 0 });
    updateCartBadge();
  };

  const updateCartSummary = ({ subtotal, shipping, tax }) => {
    const total = subtotal + shipping + tax;
    const setValue = (selector, value) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = formatPrice(value);
    };

    setValue("[data-cart-subtotal]", subtotal);
    setValue("[data-cart-shipping]", shipping);
    setValue("[data-cart-tax]", tax);
    setValue("[data-cart-total]", total);
  };

  document.addEventListener("click", event => {
    const heart = event.target.closest("[data-heart]");
    if (heart) {
      toggleFavorite(Number(heart.dataset.heart));
      return;
    }

    const add = event.target.closest("[data-add]");
    if (add) {
      addToCart(Number(add.dataset.add));
      return;
    }

    const remove = event.target.closest("[data-remove]");
    if (remove) {
      removeFromCart(Number(remove.dataset.remove));
      return;
    }

    const qtyBtn = event.target.closest("[data-qty-action]");
    if (qtyBtn) {
      const id = Number(qtyBtn.dataset.id);
      const item = cart.find(entry => entry.id === id);
      if (!item) return;
      const delta = qtyBtn.dataset.qtyAction === "inc" ? 1 : -1;
      const nextQty = Math.max(1, item.qty + delta);
      setQuantity(id, nextQty);
    }
  });

  document.addEventListener("change", event => {
    const qtyInput = event.target.closest("[data-qty-input]");
    if (qtyInput) {
      const id = Number(qtyInput.dataset.qtyInput);
      setQuantity(id, Number(qtyInput.value) || 1);
      return;
    }

    const genreCheckbox = event.target.closest("[data-genre-checkbox]");
    if (genreCheckbox) {
      const { value, checked } = genreCheckbox;
      if (checked) {
        filters.genres.add(value);
      } else {
        filters.genres.delete(value);
      }
      renderLibrary();
      return;
    }

    const authorFilter = event.target.closest("[data-author-filter]");
    if (authorFilter) {
      filters.author = authorFilter.value || "";
      renderLibrary();
    }
  });

  document.addEventListener("input", event => {
    const searchInput = event.target.closest(".search-box input");
    if (searchInput) {
      filters.search = searchInput.value || "";
      renderLibrary();
      renderFavorites();
    }
  });

  const init = () => {
    renderGenreFilters();
    renderAuthorFilter();
    renderFeatured();
    renderLibrary();
    renderFavorites();
    renderCart();
    updateHearts();
    updateCartBadge();
  };

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("fragment:loaded", event => {
    if (event.detail?.id === "header") {
      updateCartBadge();
    }
  });
})();
