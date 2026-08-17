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
    var counters = Array.prototype.slice.call(document.querySelectorAll('[data-hf-downloads]'));

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
      if (!apiUrl || !window.fetch) {
        return;
      }

      window.fetch(apiUrl)
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Unable to load Hugging Face download count');
          }
          return response.json();
        })
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

  function bindPageFeatures() {
    bindThemeToggle();
    bindHuggingFaceDownloadCounts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPageFeatures);
  } else {
    bindPageFeatures();
  }
}());
