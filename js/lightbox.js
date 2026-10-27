(function () {
  var dialog = document.createElement('dialog');
  dialog.className = 'media-dialog';
  dialog.setAttribute('aria-label', 'Image viewer');
  var close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close image';
  var img = document.createElement('img');
  var caption = document.createElement('p');
  var original = document.createElement('a');
  original.textContent = 'Open full-resolution image';
  original.target = '_blank';
  original.rel = 'noopener';
  var previous = document.createElement('button');
  previous.type = 'button';
  previous.textContent = 'Previous image';
  var next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next image';
  var controls = document.createElement('div');
  controls.className = 'media-controls';
  controls.append(previous, close, next);
  dialog.append(controls, img, caption, original);
  document.body.appendChild(dialog);
  var entries = [];
  var current = 0;
  var opener;
  function show(index) {
    current = (index + entries.length) % entries.length;
    var entry = entries[current];
    img.src = entry.src;
    img.alt = entry.alt;
    caption.textContent = entry.alt;
    original.href = entry.src;
    previous.hidden = next.hidden = entries.length < 2;
  }
  document.querySelectorAll('.blog-post img').forEach(function (image) {
    var src = image.dataset.fullSrc || image.src;
    if (!/\.(png|jpe?g|gif|webp|avif)(?:[?#]|$)/i.test(src)) return;
    var link = image.closest('a');
    if (link && (link.classList.contains('no-lightbox') || !/\.(png|jpe?g|gif|webp|avif)(?:[?#]|$)/i.test(link.href))) return;
    if (!link) { link = document.createElement('a'); link.href = src; image.before(link); link.appendChild(image); }
    var index = entries.length;
    entries.push({ src: link.href, alt: image.alt || 'Article illustration' });
    link.addEventListener('click', function (event) {
      if (!dialog.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      show(index);
      dialog.showModal();
      document.documentElement.classList.add('media-dialog-open');
      close.focus();
    });
  });
  close.addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('media-dialog-open');
    img.removeAttribute('src');
    if (opener) opener.focus();
  });
  dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
  previous.addEventListener('click', function () { show(current - 1); });
  next.addEventListener('click', function () { show(current + 1); });
  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
    if (event.key === 'Tab') {
      var focusable = Array.from(dialog.querySelectorAll('button, a')).filter(function (el) { return !el.hidden; });
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
