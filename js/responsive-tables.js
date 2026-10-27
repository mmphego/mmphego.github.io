// Preserve native touch scrolling and semantic table markup.
(function () {
  document.querySelectorAll('.blog-post table').forEach(function (table, index) {
    // Do not alter syntax-highlighting, embedded gists, or already wrapped tables.
    if (table.closest('pre, code, .highlight, .gist, .table-scroll, .table-responsive')) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.setAttribute('role', 'region');
    var caption = table.querySelector('caption');
    wrapper.setAttribute('aria-label', caption ? caption.textContent.trim() : 'Article table ' + (index + 1));
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);

    function updateFocus() {
      // Only add a keyboard stop when there is content to scroll into view.
      if (wrapper.scrollWidth > wrapper.clientWidth) {
        wrapper.setAttribute('tabindex', '0');
      } else {
        wrapper.removeAttribute('tabindex');
      }
    }
    updateFocus();
    if (window.ResizeObserver) {
      var observer = new ResizeObserver(updateFocus);
      observer.observe(wrapper);
      observer.observe(table);
    } else {
      window.addEventListener('resize', updateFocus);
    }
  });
})();
