# Bookify — Project Guide

## What it is
- Static frontend bookstore with home showcase, catalog filters/search, favorites, and cart.
- Stack: HTML, CSS, vanilla JS; icons via Boxicons CDN.
- View entry: `pages/index.html` (serve from project root so `/js` and `/components` resolve).

## Folders and key files
- `pages/`
  - `index.html` — Home (hero CTA, feature highlights, featured books, subscribe, reviews) with injected header/footer.
  - `library.html` — Catalog (genre checkboxes `data-genre-list`, author select `data-author-filter`, grid `data-library-grid`), search comes from header input.
  - `favorites.html` — Favorites grid (`data-favorites-grid`) using same cards/search, data from `localStorage`.
  - `cart.html` — Cart list (`data-cart-items`) with qty controls/remove and summary fields (`data-cart-*`).
  - Styles: `variables.css` (tokens), `base.css` (global reset/top padding), `home.css`, `library.css`, `cart.css`.
- `components/`
  - Markup: `header.html` (fixed nav, search, actions, auth modal), `footer.html` (links, locations, socials).
  - Styles: `header.css`, `footer.css`, `buttons.css` (primary/add-to-cart), `cards.css` (book card with heart), `auth.css` (auth modal).
- `js/`
  - `books.js` — `window.books` array `{ id, title, author, price, genre, image }`.
  - `catalog.js` — Renders featured/library/favorites/cart; filters (genre Set, author, startsWith search); actions for heart/add/remove/qty; persists favorites/cart (`bookify:favorites`, `bookify:cart`); formats prices; normalizes image paths; updates cart badge after header loads.
  - `include.js` — Injects `components/header.html`/`footer.html` into `#header`/`#footer`, fires `fragment:loaded`, wires header: mobile menu/search toggles, active link highlighting, search focus redirect to `library.html`, auth modal open/close/tab switch.
- `images/` — Book and avatar assets.

## Breakpoints used
- `max-width: 1200px` — Tighten padding/layout (hero, cart, library, header search width).
- `max-width: 992px` — Smaller top padding; hero stacks; filters stack; cart/footer adapt; header tweaks.
- `max-width: 768px` — Mobile nav/search toggles; smaller cards/grids; cart grid reflow.
- `max-width: 576px` — Further padding/text reductions; stacked footer/auth layout.
- `max-width: 420px` — Smallest sizing tweaks (logo, cards, grids, auth margins, icons).

## Behavior and state
- Favorites and cart persist via `localStorage`; cart badge updates on `fragment:loaded`.
- Header search drives catalog/favorites filtering and redirects focus to `library.html` if needed.
- Prices formatted with `toLocaleString("en-US", { minimumFractionDigits: 2 })`.
- Images can be local or remote; `resolveImage` normalizes relative paths.

## Run locally
- From project root: `python3 -m http.server 8000` then open `http://localhost:8000/pages/index.html`.
- Opening via `file://` can break `/js/...` and `/components/...` paths.

