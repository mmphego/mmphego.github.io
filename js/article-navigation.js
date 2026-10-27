(function () {
  var contents = document.getElementById('article-contents');
  if (!contents) return;
  var desktop = window.matchMedia('(min-width: 1200px)');
  function update() { contents.open = desktop.matches; }
  update();
  desktop.addEventListener('change', update);
  if (!window.IntersectionObserver) return;
  var links = Array.from(contents.querySelectorAll('a'));
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (link) {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-90px 0px -60% 0px' });
  document.querySelectorAll('.blog-post h2[id], .blog-post h3[id]').forEach(function (h) { observer.observe(h); });
})();
