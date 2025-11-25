const injectFragment = (targetId, url) => {
  const target = document.getElementById(targetId);
  if (!target) return;

  fetch(url)
    .then(res => res.text())
    .then(html => { target.innerHTML = html; });
};

injectFragment("header", "/components/header.html");
injectFragment("footer", "/components/footer.html");
