(function () {
  async function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    var previous = document.activeElement;
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      if (!document.execCommand('copy')) throw new Error('Copy denied');
    } finally {
      textarea.remove();
      if (previous) previous.focus();
    }
  }
  document.querySelectorAll('.blog-post pre').forEach(function (pre) {
    var code = pre.querySelector('code');
    if (!code && !pre.dataset.source) return;
    // Capture text before Mermaid replaces the code with SVG nodes.
    var source = pre.dataset.source || code.textContent;
    var wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.before(wrapper);
    wrapper.appendChild(pre);
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code-btn';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    var status = document.createElement('span');
    status.className = 'copy-status';
    status.setAttribute('role', 'status');
    wrapper.append(button, status);
    button.addEventListener('click', async function () {
      try {
        await copy(source);
        status.textContent = 'Copied!';
      } catch (error) {
        status.textContent = 'Copy failed. Select the code and copy it manually.';
      }
    });
  });
})();
