document.addEventListener('DOMContentLoaded', function () {

   // ===== Mobile Menu Toggle =====
   const menuBtn = document.getElementById('menuBtn');
   const mobileDrawer = document.getElementById('mobileDrawer');
   const overlay = document.getElementById('overlay');
   const drawerLinks = document.querySelectorAll('.drawer-link');

   function toggleMenu() {
      menuBtn.classList.toggle('active');
      mobileDrawer.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = mobileDrawer.classList.contains('active') ? 'hidden' : '';
   }

   menuBtn.addEventListener('click', toggleMenu);
   overlay.addEventListener('click', toggleMenu);

   // Close menu when clicking on drawer links
   drawerLinks.forEach(link => {
      link.addEventListener('click', toggleMenu);
   });

   // Close menu on escape key
   document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('active')) {
         toggleMenu();
      }
   });

   // ===== Swiper Initialization =====

   // Popular Dishes Swiper
   new Swiper('.popularDishesSwiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      loopedSlides: 4, // Ensure enough slides for loop
      centeredSlides: false,
      autoplay: {
         delay: 3000,
         disableOnInteraction: false,
      },
      navigation: {
         nextEl: '.swiper-button-next-custom',
         prevEl: '.swiper-button-prev-custom',
      },
      watchSlidesProgress: true,
      watchSlidesVisibility: true,
      breakpoints: {
         640: {
            slidesPerView: 2,
            spaceBetween: 20,
         },
         1024: {
            slidesPerView: 3,
            spaceBetween: 30,
         },
         1280: {
            slidesPerView: 4,
            spaceBetween: 30,
         },
      },
      on: {
         init: function () {
            console.log('Popular Dishes Swiper initialized');
         },
      },
   });

   // Reviews Swiper
   new Swiper('.reviewsSwiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      loopedSlides: 3,
      centeredSlides: false,
      autoplay: {
         delay: 5000,
         disableOnInteraction: false,
      },
      navigation: {
         nextEl: '.swiper-button-next-reviews',
         prevEl: '.swiper-button-prev-reviews',
      },
      watchSlidesProgress: true,
      watchSlidesVisibility: true,
      breakpoints: {
         768: {
            slidesPerView: 2,
            spaceBetween: 20,
         },
         1024: {
            slidesPerView: 3,
            spaceBetween: 30,
         },
      },
   });

   // Chefs Swiper
   new Swiper('.chefsSwiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      loopedSlides: 4,
      centeredSlides: false,
      autoplay: {
         delay: 4000,
         disableOnInteraction: false,
      },
      navigation: {
         nextEl: '.swiper-button-next-chefs',
         prevEl: '.swiper-button-prev-chefs',
      },
      watchSlidesProgress: true,
      watchSlidesVisibility: true,
      breakpoints: {
         640: {
            slidesPerView: 2,
            spaceBetween: 20,
         },
         1024: {
            slidesPerView: 3,
            spaceBetween: 30,
         },
         1280: {
            slidesPerView: 4,
            spaceBetween: 30,
         },
      },
   });

   // ===== Category Filter =====
   const categoryBtns = document.querySelectorAll('.category-btn');
   const menuItems = document.querySelectorAll('.menu-item');

   categoryBtns.forEach(btn => {
      btn.addEventListener('click', function () {
         // Remove active class AND reset all button styles
         categoryBtns.forEach(b => {
            b.classList.remove('active');
            b.classList.remove('bg-primary', 'text-white');
            b.classList.add('bg-cream');
         });

         // Add active class and styles to clicked button
         this.classList.add('active');
         this.classList.remove('bg-cream');
         this.classList.add('bg-primary', 'text-white');

         // Get selected category
         const category = this.getAttribute('data-category');

         // Filter menu items with animation
         menuItems.forEach((item, index) => {
            item.classList.remove('show');

            setTimeout(() => {
               if (category === 'all' || item.getAttribute('data-category') === category) {
                  item.style.display = 'block';
                  setTimeout(() => {
                     item.classList.add('show');
                  }, 50);
               } else {
                  item.style.display = 'none';
               }
            }, index * 50);
         });
      });
   });

   // Show all menu items initially for the first active category (breakfast)
   setTimeout(() => {
      const activeCategory = document.querySelector('.category-btn.active')?.getAttribute('data-category');
      menuItems.forEach(item => {
         if (activeCategory && item.getAttribute('data-category') === activeCategory) {
            item.classList.add('show');
            item.style.display = 'block';
         } else {
            item.style.display = 'none';
         }
      });
   }, 100);

   // ===== Scroll Animation =====
   const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
   };

   const observer = new IntersectionObserver(function (entries) {
      entries.forEach(entry => {
         if (entry.isIntersecting) {
            entry.target.classList.add('active');
         }
      });
   }, observerOptions);

   // Observe all elements with scroll-animate class
   const animateElements = document.querySelectorAll('.scroll-animate');
   animateElements.forEach(el => observer.observe(el));

   // ===== Smooth Scroll for Navigation Links =====
   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
         const href = this.getAttribute('href');

         // Don't prevent default for just "#" or empty href
         if (href === '#' || href === '') return;

         const target = document.querySelector(href);
         if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar

            window.scrollTo({
               top: offsetTop,
               behavior: 'smooth'
            });
         }
      });
   });

   // ===== Navbar Scroll Effect =====
   const navbar = document.querySelector('nav');
   let lastScroll = 0;

   window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll <= 0) {
         navbar.classList.remove('scroll-up');
         return;
      }

      if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
         // Scroll Down
         navbar.classList.remove('scroll-up');
         navbar.classList.add('scroll-down');
      } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
         // Scroll Up
         navbar.classList.remove('scroll-down');
         navbar.classList.add('scroll-up');
      }

      lastScroll = currentScroll;
   });

   // ===== Add to Cart Functionality =====
   const addToCartButtons = document.querySelectorAll('[class*="Add to Cart"]');
   let cartCount = 0;

   // This is a simple demo - in production, you'd use a proper cart system
   function addToCart(productName, price) {
      cartCount++;

      // Show a simple notification
      showNotification(`Added ${productName} to cart!`);

      // Update cart badge if it exists
      const cartBadge = document.querySelector('.cart-badge');
      if (cartBadge) {
         cartBadge.textContent = cartCount;
      }
   }

   // ===== Notification System =====
   function showNotification(message, type = 'success') {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification ${type} fixed top-24 right-4 bg-primary text-white px-6 py-4 rounded-full shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
      notification.textContent = message;

      document.body.appendChild(notification);

      // Animate in
      setTimeout(() => {
         notification.style.transform = 'translateX(0)';
      }, 100);

      // Animate out and remove
      setTimeout(() => {
         notification.style.transform = 'translateX(120%)';
         setTimeout(() => {
            notification.remove();
         }, 300);
      }, 3000);
   }

   // ===== Form Validation (if you add forms later) =====
   function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
   }

   function validatePhone(phone) {
      const re = /^[\d\s\-\+\(\)]+$/;
      return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
   }

   // ===== Lazy Loading Images =====
   const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
         if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
               img.src = img.dataset.src;
               img.removeAttribute('data-src');
               observer.unobserve(img);
            }
         }
      });
   });

   // Observe all images with data-src attribute
   document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
   });

   // ===== Back to Top Button =====
   // Create back to top button
   const backToTopBtn = document.createElement('button');
   backToTopBtn.innerHTML = '↑';
   backToTopBtn.className = 'back-to-top fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg opacity-0 pointer-events-none transition-all duration-300 hover:bg-primary-dark z-40';
   backToTopBtn.setAttribute('aria-label', 'Back to top');
   document.body.appendChild(backToTopBtn);

   // Show/hide back to top button
   window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
         backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
      } else {
         backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
      }
   });

   // Scroll to top on click
   backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
         top: 0,
         behavior: 'smooth'
      });
   });

   // ===== Reservation Modal (Optional Enhancement) =====
   const reserveButtons = document.querySelectorAll('button:not([id]):not([class*="category"]):not([class*="swiper"])');

   // ===== Performance Optimization =====
   // Debounce function for scroll events
   function debounce(func, wait = 20) {
      let timeout;
      return function executedFunction(...args) {
         const later = () => {
            clearTimeout(timeout);
            func(...args);
         };
         clearTimeout(timeout);
         timeout = setTimeout(later, wait);
      };
   }

   // Throttle function for resize events
   function throttle(func, limit = 100) {
      let inThrottle;
      return function (...args) {
         if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
         }
      };
   }

   // ===== Active Navigation Link =====
   const sections = document.querySelectorAll('section[id]');
   const navLinks = document.querySelectorAll('nav a[href^="#"]');

   function setActiveLink() {
      let currentSection = '';

      sections.forEach(section => {
         const sectionTop = section.offsetTop;
         const sectionHeight = section.clientHeight;

         if (window.pageYOffset >= sectionTop - 100) {
            currentSection = section.getAttribute('id');
         }
      });

      navLinks.forEach(link => {
         link.classList.remove('text-primary');
         const href = link.getAttribute('href').substring(1);
         if (href === currentSection) {
            link.classList.add('text-primary');
         }
      });
   }

   window.addEventListener('scroll', debounce(setActiveLink));

   // ===== Preloader (Optional) =====
   window.addEventListener('load', function () {
      const preloader = document.querySelector('.preloader');
      if (preloader) {
         preloader.style.opacity = '0';
         setTimeout(() => {
            preloader.style.display = 'none';
         }, 300);
      }
   });

   // ===== Handle Window Resize =====
   window.addEventListener('resize', throttle(function () {
      // Close mobile menu on resize to desktop
      if (window.innerWidth >= 1024 && mobileDrawer.classList.contains('active')) {
         toggleMenu();
      }
   }));

   // ===== Accessibility Enhancements =====
   // Trap focus in mobile menu when open
   const focusableElements = mobileDrawer.querySelectorAll('a, button');
   const firstFocusable = focusableElements[0];
   const lastFocusable = focusableElements[focusableElements.length - 1];

   mobileDrawer.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
         if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
               e.preventDefault();
               lastFocusable.focus();
            }
         } else {
            // Tab
            if (document.activeElement === lastFocusable) {
               e.preventDefault();
               firstFocusable.focus();
            }
         }
      }
   });

   // ===== Console Welcome Message =====
   console.log('%c🍕 Welcome to Bites Restaurant! 🍕', 'font-size: 20px; color: #F4A340; font-weight: bold;');
   console.log('%cBuilt with ❤️ using Tailwind CSS, Swiper.js, and Vanilla JavaScript', 'font-size: 12px; color: #4A4A4A;');

   // ===== Analytics (Placeholder for future implementation) =====
   function trackEvent(category, action, label) {
      // This is where you'd integrate Google Analytics, Mixpanel, etc.
      console.log('Event:', { category, action, label });
   }

   // Track button clicks
   document.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', function () {
         const buttonText = this.textContent.trim();
         trackEvent('Button', 'Click', buttonText);
      });
   });

   // ===== Service Worker Registration (for PWA - optional) =====
   if ('serviceWorker' in navigator) {
      // Uncomment when you have a service worker file
      // navigator.serviceWorker.register('/sw.js')
      //     .then(reg => console.log('Service Worker registered', reg))
      //     .catch(err => console.log('Service Worker registration failed', err));
   }

   // ===== Error Handling =====
   window.addEventListener('error', function (e) {
      console.error('An error occurred:', e.error);
      // You could send this to an error tracking service
   });

   // ===== Initialize Everything =====
   console.log('🚀 Restaurant Landing Page Initialized Successfully!');
});

// ===== Utility Functions =====

// Format currency
function formatCurrency(amount) {
   return `₹${amount.toFixed(2)}`;
}

// Get cookie
function getCookie(name) {
   const value = `; ${document.cookie}`;
   const parts = value.split(`; ${name}=`);
   if (parts.length === 2) return parts.pop().split(';').shift();
}

// Set cookie
function setCookie(name, value, days = 7) {
   const expires = new Date(Date.now() + days * 864e5).toUTCString();
   document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

// Local storage helpers
const storage = {
   set: (key, value) => {
      try {
         localStorage.setItem(key, JSON.stringify(value));
         return true;
      } catch (e) {
         console.error('Error saving to localStorage', e);
         return false;
      }
   },
   get: (key) => {
      try {
         const item = localStorage.getItem(key);
         return item ? JSON.parse(item) : null;
      } catch (e) {
         console.error('Error reading from localStorage', e);
         return null;
      }
   },
   remove: (key) => {
      try {
         localStorage.removeItem(key);
         return true;
      } catch (e) {
         console.error('Error removing from localStorage', e);
         return false;
      }
   }
};

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
   module.exports = { storage, formatCurrency, getCookie, setCookie };
}
