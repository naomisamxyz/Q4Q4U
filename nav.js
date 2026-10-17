document.currentScript.insertAdjacentHTML('beforebegin', `
  <nav class="nav-copy" aria-hidden="true">
    <a href="join.html" data-text="join">join</a>
    <a href="archive.html" data-text="archive">archive</a>
    <a href="info.html" data-text="info">info</a>
  </nav>
  <nav class="nav-main">
    <a href="join.html" data-text="join">join</a>
    <a href="archive.html" data-text="archive">archive</a>
    <a href="info.html" data-text="info">info</a>
  </nav>
  <nav class="nav-sheen" aria-hidden="true">
    <a href="join.html" data-text="join">join</a>
    <a href="archive.html" data-text="archive">archive</a>
    <a data-text="info">info</a>
  </nav>
`);