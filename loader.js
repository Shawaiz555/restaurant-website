// ===== Professional Loader System =====

const LoaderManager = {
  // Create and show page loader
  showPageLoader: function() {
    // Check if loader already exists
    let loader = document.getElementById('pageLoader');

    if (!loader) {
      // Create loader HTML
      const loaderHTML = `
        <div id="pageLoader" class="page-loader">
          <div class="loader-logo">
            <div class="loader-logo-icon">🍽️</div>
          </div>
          <div class="loader-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <div class="loader-text">Bites</div>
          <div class="loader-subtext">Loading delicious content...</div>
          <div class="loader-progress-bar">
            <div class="loader-progress-fill"></div>
          </div>
          <div class="loader-dots">
            <div class="loader-dot"></div>
            <div class="loader-dot"></div>
            <div class="loader-dot"></div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', loaderHTML);
      document.body.classList.add('loader-active');
    }
  },

  // Hide page loader
  hidePageLoader: function(delay = 500) {
    setTimeout(() => {
      const loader = document.getElementById('pageLoader');
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.remove();
          document.body.classList.remove('loader-active');
        }, 500);
      }
    }, delay);
  },

  // Show loader before navigation
  navigateWithLoader: function(url, delay = 800) {
    this.showPageLoader();
    setTimeout(() => {
      window.location.href = url;
    }, delay);
  },

  // Show overlay loader
  showOverlayLoader: function(message = 'Processing...') {
    let overlay = document.getElementById('overlayLoader');

    if (!overlay) {
      const overlayHTML = `
        <div id="overlayLoader" class="overlay-loader">
          <div class="overlay-loader-content">
            <div class="loader-spinner">
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
            </div>
            <div class="loader-text" style="font-size: 18px;">${message}</div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', overlayHTML);
    }

    setTimeout(() => {
      overlay = document.getElementById('overlayLoader');
      if (overlay) overlay.classList.add('show');
    }, 10);
  },

  // Hide overlay loader
  hideOverlayLoader: function(delay = 300) {
    setTimeout(() => {
      const overlay = document.getElementById('overlayLoader');
      if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
      }
    }, delay);
  },

  // Add loader to button
  addButtonLoader: function(button, originalText) {
    if (!button) return;

    button.disabled = true;
    button.dataset.originalText = originalText || button.textContent;
    button.innerHTML = `
      <span class="btn-loader"></span>
      <span>Loading...</span>
    `;
  },

  // Remove loader from button
  removeButtonLoader: function(button) {
    if (!button) return;

    button.disabled = false;
    const originalText = button.dataset.originalText || 'Submit';
    button.innerHTML = originalText;
    delete button.dataset.originalText;
  },

  // Show mini loader (returns HTML string)
  getMiniLoader: function() {
    return '<span class="mini-loader"></span>';
  },

  // Initialize page load animation
  initPageLoad: function() {
    // Show loader on page load
    this.showPageLoader();

    // Hide loader when page is fully loaded
    window.addEventListener('load', () => {
      this.hidePageLoader(300);
    });

    // Fallback: hide after 3 seconds if load event doesn't fire
    setTimeout(() => {
      this.hidePageLoader(0);
    }, 3000);
  }
};

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize page loader
  LoaderManager.initPageLoad();

  // Add loader to all navigation links
  const navLinks = document.querySelectorAll('a[href$=".html"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Check if it's an external link or has target="_blank"
      if (this.hostname !== window.location.hostname || this.target === '_blank') {
        return;
      }

      // Check if it's a hash link on the same page
      if (this.href.includes('#') && this.href.split('#')[0] === window.location.href.split('#')[0]) {
        return;
      }

      e.preventDefault();
      const url = this.href;
      LoaderManager.navigateWithLoader(url, 400);
    });
  });
});

// Handle browser back/forward button
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    LoaderManager.hidePageLoader(0);
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoaderManager;
}

// Make globally available
window.LoaderManager = LoaderManager;
