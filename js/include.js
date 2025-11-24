// Загружаем HEADER
fetch("/components/header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header").innerHTML = html;
  });
// Загружаем FOOTER
fetch("/components/footer.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("footer").innerHTML = html;
  });
