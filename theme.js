(function () {
  var storageKey = 'color-theme';
  var root = document.documentElement;
  var colorPreference = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  function readStoredTheme() {
    try {
      var storedTheme = window.localStorage.getItem(storageKey);
      return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
    } catch (error) {
      return null;
    }
  }

  function writeStoredTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      // The selected theme still applies for this page when storage is unavailable.
    }
  }

  function getSystemTheme() {
    return colorPreference && colorPreference.matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  }

  var storedTheme = readStoredTheme();
  var hasExplicitTheme = Boolean(storedTheme);
  applyTheme(storedTheme || getSystemTheme());

  function bindThemeToggle() {
    var button = document.getElementById('theme-toggle');
    if (!button) {
      return;
    }

    var icon = button.querySelector('.theme-toggle-icon');

    function syncButton() {
      var isDark = root.getAttribute('data-theme') === 'dark';
      button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      button.setAttribute('aria-label', 'Dark mode');
      button.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      if (icon) {
        icon.textContent = isDark ? '\u2600' : '\u263e';
      }
    }

    button.addEventListener('click', function () {
      var nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      hasExplicitTheme = true;
      applyTheme(nextTheme);
      writeStoredTheme(nextTheme);
      syncButton();
    });

    syncButton();

    if (colorPreference) {
      var handleSystemThemeChange = function () {
        if (!hasExplicitTheme) {
          applyTheme(getSystemTheme());
          syncButton();
        }
      };

      if (colorPreference.addEventListener) {
        colorPreference.addEventListener('change', handleSystemThemeChange);
      } else if (colorPreference.addListener) {
        colorPreference.addListener(handleSystemThemeChange);
      }
    }
  }

  function bindHuggingFaceDownloadCounts() {
    var counters = Array.prototype.slice.call(document.querySelectorAll('[data-hf-downloads], [data-hf-collection]'));

    function fetchJson(url) {
      return window.fetch(url).then(function (response) {
        if (!response.ok) {
          throw new Error('Unable to load Hugging Face download count');
        }
        return response.json();
      });
    }

    // A collection's count is the sum of its datasets' monthly downloads.
    function fetchCollectionDownloads(apiUrl) {
      return fetchJson(apiUrl).then(function (collection) {
        var datasets = (collection.items || []).filter(function (item) {
          return item.type === 'dataset';
        });
        return Promise.all(datasets.map(function (item) {
          return fetchJson('https://huggingface.co/api/datasets/' + item.id + '?expand=downloads');
        }));
      }).then(function (repositories) {
        return {
          downloads: repositories.reduce(function (total, repository) {
            return total + (typeof repository.downloads === 'number' ? repository.downloads : 0);
          }, 0)
        };
      });
    }

    function formatDownloadCount(downloads) {
      try {
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(downloads);
      } catch (error) {
        return downloads.toLocaleString('en-US');
      }
    }

    counters.forEach(function (counter) {
      var apiUrl = counter.getAttribute('data-hf-downloads');
      var collectionUrl = counter.getAttribute('data-hf-collection');
      if ((!apiUrl && !collectionUrl) || !window.fetch) {
        return;
      }

      (collectionUrl ? fetchCollectionDownloads(collectionUrl) : fetchJson(apiUrl))
        .then(function (repository) {
          if (typeof repository.downloads !== 'number') {
            return;
          }
          counter.textContent = '\u2193' + formatDownloadCount(repository.downloads) + '/mo';
          counter.setAttribute('title', repository.downloads.toLocaleString('en-US') + ' Hugging Face downloads in the last month');
          counter.setAttribute('aria-label', repository.downloads.toLocaleString('en-US') + ' downloads in the last month');
        })
        .catch(function () {
          // Keep the server-rendered fallback count if the API is unavailable.
        });
    });
  }

  function bindGitHubStarCounts() {
    var counters = Array.prototype.slice.call(document.querySelectorAll('[data-gh-stars]'));

    counters.forEach(function (counter) {
      var apiUrl = counter.getAttribute('data-gh-stars');
      if (!apiUrl || !window.fetch) {
        return;
      }

      window.fetch(apiUrl)
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Unable to load GitHub star count');
          }
          return response.json();
        })
        .then(function (repository) {
          var stars = repository.stargazers_count;
          if (typeof stars !== 'number') {
            return;
          }
          var label = stars.toLocaleString('en-US') + ' GitHub star' + (stars === 1 ? '' : 's');
          counter.textContent = '★' + stars.toLocaleString('en-US');
          counter.setAttribute('title', label);
          counter.setAttribute('aria-label', label);
        })
        .catch(function () {
          // Keep the server-rendered fallback count if the API is unavailable.
        });
    });
  }

  function bindBibtexBlocks() {
    var toggles = Array.prototype.slice.call(document.querySelectorAll('.bibtex-toggle'));

    toggles.forEach(function (toggle) {
      var block = document.getElementById(toggle.getAttribute('aria-controls'));
      if (!block) {
        return;
      }

      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        block.hidden = !block.hidden;
        toggle.setAttribute('aria-expanded', block.hidden ? 'false' : 'true');
      });

      var copyButton = block.querySelector('.bibtex-copy');
      var code = block.querySelector('code');
      if (!copyButton || !code) {
        return;
      }

      copyButton.addEventListener('click', function () {
        if (!navigator.clipboard) {
          return;
        }
        navigator.clipboard.writeText(code.textContent).then(function () {
          copyButton.textContent = 'Copied';
          window.setTimeout(function () {
            copyButton.textContent = 'Copy';
          }, 1500);
        });
      });
    });
  }

  function bindPageFeatures() {
    bindThemeToggle();
    bindHuggingFaceDownloadCounts();
    bindGitHubStarCounts();
    bindBibtexBlocks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPageFeatures);
  } else {
    bindPageFeatures();
  }
}());
