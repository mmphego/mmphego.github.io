(function () {
  var form = document.getElementById('article-search');
  if (!form) return;
  var input = document.getElementById('search-query');
  var status = document.getElementById('search-status');
  var list = document.getElementById('search-results');
  var indexPromise;
  var generation = 0;
  function normalize(value) { return value.toLocaleLowerCase().normalize('NFKC'); }
  function search(query) {
    var current = ++generation;
    list.replaceChildren();
    query = query.trim().slice(0, 200);
    if (!query) { status.textContent = 'Enter a topic, command, or phrase.'; return; }
    status.textContent = 'Searching…';
    if (!indexPromise) indexPromise = fetch(new URL('search.json', form.action)).then(function (response) {
      if (!response.ok) throw new Error('Search unavailable');
      return response.json();
    }).catch(function (error) { indexPromise = null; throw error; });
    indexPromise.then(function (posts) {
      if (current !== generation) return;
      var terms = normalize(query).split(/\s+/);
      var results = posts.map(function (post) {
        var title = normalize(post.title);
        var tags = normalize((post.tags || []).join(' '));
        var content = normalize(post.content);
        var score = 0;
        var matched = terms.every(function (term) {
          var found = title.includes(term) || tags.includes(term) || content.includes(term);
          score += (title.includes(term) ? 10 : 0) + (tags.includes(term) ? 5 : 0) + (content.includes(term) ? 1 : 0);
          return found;
        });
        return { post: post, score: matched ? score : 0 };
      }).filter(function (r) { return r.score > 0; }).sort(function (a, b) { return b.score - a.score; });
      status.textContent = results.length + ' matching article' + (results.length === 1 ? '' : 's') + (results.length > 50 ? ' (showing first 50)' : '');
      results.slice(0, 50).forEach(function (result) {
        var post = result.post;
        var item = document.createElement('li');
        var link = document.createElement('a');
        link.href = post.url;
        link.textContent = post.title;
        var snippet = document.createElement('p');
        snippet.className = 'search-result-snippet';
        var position = normalize(post.content).indexOf(terms[0]);
        var start = Math.max(0, position - 60);
        snippet.textContent = (start ? '…' : '') + post.content.slice(start, start + 230) + '…';
        item.append(link, snippet);
        list.appendChild(item);
      });
    }).catch(function () {
      if (current === generation) status.textContent = 'Search could not load. Try again or browse the topic index.';
    });
  }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var url = new URL(window.location.href);
    url.searchParams.set('q', input.value.trim());
    history.pushState(null, '', url);
    search(input.value);
  });
  function restore() { input.value = new URLSearchParams(location.search).get('q') || ''; search(input.value); }
  window.addEventListener('popstate', restore);
  restore();
})();
