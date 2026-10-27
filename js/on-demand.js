(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = function () { script.remove(); reject(new Error('Loading failed')); };
      document.head.appendChild(script);
    });
  }
  var comments = document.querySelector('[data-comments]');
  if (comments) {
    var button = comments.querySelector('button');
    button.addEventListener('click', function () {
      button.disabled = true;
      comments.querySelector('[role="status"]').textContent = 'Loading comments…';
      window.disqus_config = function () {
        this.page.url = comments.dataset.pageUrl;
        // Keep URL-based thread identity used by existing posts.
      };
      loadScript('https://' + comments.dataset.comments + '.disqus.com/embed.js').then(function () {
        button.hidden = true;
        comments.querySelector('[role="status"]').textContent = 'Comments loaded below.';
      }).catch(function () {
        button.disabled = false;
        comments.querySelector('[role="status"]').textContent = 'Comments could not load. You can try again.';
      });
    });
  }
  var newsletter = document.querySelector('.load-newsletter');
  if (newsletter) newsletter.addEventListener('click', function () {
    newsletter.disabled = true;
    var status = document.querySelector('.newsletter-status');
    status.textContent = 'Loading signup…';
    loadScript('https://chimpstatic.com/mcjs-connected/js/users/cd051a800f5fc5c1c350ffee8/509e34cde6f6f6ef4c6410a21.js').then(function () {
      status.textContent = 'Signup integration loaded. If no form appears, your browser or the provider may be blocking it.';
    }).catch(function () {
      newsletter.disabled = false;
      status.textContent = 'Signup could not load. You can try again.';
    });
  });
})();
