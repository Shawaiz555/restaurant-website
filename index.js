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

      // Hide back-to-top button when mobile menu is open
      const backToTopBtn = document.querySelector('.back-to-top');
      if (backToTopBtn) {
         if (mobileDrawer.classList.contains('active')) {
            backToTopBtn.style.display = 'none';
         } else {
            backToTopBtn.style.display = 'flex';
         }
      }
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

   // ===== Dynamic Product Loading =====
   function renderProductCard(product) {
      const stars = Array(5).fill(0).map((_, i) =>
         `<span class="${i < product.rating ? 'text-primary' : 'text-gray-300'}">⭐</span>`
      ).join('');

      return `
         <div class="swiper-slide">
            <div class="bg-white rounded-3xl p-6 hover:shadow-xl transition-all duration-300 group">
               <div class="mb-4 overflow-hidden rounded-2xl">
                  <img
                     src="${product.image}"
                     alt="${product.name}"
                     class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
               </div>
               <h3 class="font-display text-xl mb-2 text-center">${product.name}</h3>
               <div class="flex justify-center gap-1 mb-2">
                  ${stars}
               </div>
               <p class="text-dark-gray text-sm text-center mb-4 line-clamp-2">
                  ${product.description}
               </p>
               <div class="flex items-center justify-between">
                  <span class="font-display text-2xl text-dark" data-price="${product.basePrice}">₹${product.basePrice.toFixed(2)}</span>
                  <button
                     class="bg-cream hover:bg-primary hover:text-white px-6 py-2 rounded-full border-primary border-2 font-medium transition-all"
                     data-product-id="${product.id}"
                  >
                     Add to Cart
                  </button>
               </div>
            </div>
         </div>
      `;
   }

   // Render menu grid item (without swiper-slide wrapper)
   function renderMenuGridItem(product) {
      const stars = Array(5).fill(0).map((_, i) =>
         `<span class="${i < product.rating ? 'text-primary' : 'text-gray-300'}">⭐</span>`
      ).join('');

      const categorySlug = product.category.toLowerCase().replace(/\s+/g, '-');

      return `
         <div class="bg-white rounded-3xl p-6 hover:shadow-xl transition-all duration-300 group menu-item" data-category="${categorySlug}">
            <div class="mb-4 overflow-hidden rounded-2xl">
               <img
                  src="${product.image}"
                  alt="${product.name}"
                  class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
               />
            </div>
            <h3 class="font-display text-xl mb-2 text-center">${product.name}</h3>
            <div class="flex justify-center gap-1 mb-2">
               ${stars}
            </div>
            <p class="text-dark-gray text-sm text-center mb-4 line-clamp-2">
               ${product.description}
            </p>
            <div class="flex items-center justify-between">
               <span class="font-display text-2xl text-dark" data-price="${product.basePrice}">₹${product.basePrice.toFixed(2)}</span>
               <button
                  class="bg-cream hover:bg-primary hover:text-white px-6 py-2 rounded-full border-primary border-2 font-medium transition-all text-sm"
                  data-product-id="${product.id}"
               >
                  Add to Cart
               </button>
            </div>
         </div>
      `;
   }

   // Load products dynamically
   function loadProducts() {
      if (typeof getAllProducts !== 'function' || typeof getProductsByCategory !== 'function') {
         console.warn('Product functions not available yet');
         return;
      }

      // Load Popular Dishes (swiper)
      const popularDishes = getProductsByCategory('Popular Dishes');
      const popularContainer = document.querySelector('.popularDishesSwiper .swiper-wrapper');
      if (popularContainer && popularDishes.length > 0) {
         popularContainer.innerHTML = popularDishes.map(product => renderProductCard(product)).join('');
      }

      // Load Menu Grid items (all categories)
      const menuGridContainer = document.querySelector('#menu .grid');
      if (menuGridContainer) {
         const allMenuCategories = ['Breakfast', 'Noodles', 'Salads', 'Japanese', 'Drinks', 'Lunch'];
         const allMenuItems = [];

         allMenuCategories.forEach(category => {
            const categoryItems = getProductsByCategory(category);
            allMenuItems.push(...categoryItems);
         });

         if (allMenuItems.length > 0) {
            menuGridContainer.innerHTML = allMenuItems.map(product => renderMenuGridItem(product)).join('');
         }
      }
   }

   // Call loadProducts after DOM is ready
   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadProducts);
   } else {
      loadProducts();
   }

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
      allowTouchMove: true, // Allow touch/drag
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
         click: function (_swiper, event) {
            // Handle click on swiper slide
            const slide = event.target.closest('.swiper-slide');
            if (slide && !event.target.closest('button')) {
               const productName = slide.querySelector('h3')?.textContent.trim();
               if (productName) {
                  const productId = productName.toLowerCase().replace(/\s+/g, '-');
                  console.log('Swiper click - Product:', productName, 'ID:', productId);
                  if (typeof getProductById === 'function' && getProductById(productId)) {
                     console.log('Navigating to product page...');
                     window.location.href = `pages/product.html?id=${productId}`;
                  }
               }
            }
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

   // ===== Shopping Cart Functionality =====
   let cart = storage.get('cart') || [];
   const TAX_RATE = 0.18; // 18% GST

   // Cart elements
   const cartBtn = document.getElementById('cartBtn');
   const cartDrawer = document.getElementById('cartDrawer');
   const closeCartBtn = document.getElementById('closeCartBtn');
   const cartBadge = document.getElementById('cartBadge');
   const cartItemCount = document.getElementById('cartItemCount');
   const cartItems = document.getElementById('cartItems');
   const cartItemsContainer = document.getElementById('cartItemsContainer');
   const emptyCartMessage = document.getElementById('emptyCartMessage');
   const cartFooter = document.getElementById('cartFooter');
   const cartSubtotal = document.getElementById('cartSubtotal');
   const cartTax = document.getElementById('cartTax');
   const cartTotal = document.getElementById('cartTotal');
   const placeOrderBtn = document.getElementById('placeOrderBtn');

   // Toggle cart drawer
   function toggleCart() {
      cartDrawer.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = cartDrawer.classList.contains('active') ? 'hidden' : '';

      // Hide back-to-top button when cart is open
      const backToTopBtn = document.querySelector('.back-to-top');
      if (backToTopBtn) {
         if (cartDrawer.classList.contains('active')) {
            backToTopBtn.style.display = 'none';
         } else {
            backToTopBtn.style.display = 'flex';
         }
      }
   }

   cartBtn.addEventListener('click', toggleCart);
   closeCartBtn.addEventListener('click', toggleCart);

   // Close cart when clicking overlay (only if mobile menu is not active)
   overlay.addEventListener('click', function () {
      if (cartDrawer.classList.contains('active')) {
         toggleCart();
      }
   });

   // Close cart on escape key
   document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && cartDrawer.classList.contains('active')) {
         toggleCart();
      }
   });

   // Add item to cart
   function addToCart(product) {
      const existingItem = cart.find(item => item.id === product.id);

      if (existingItem) {
         existingItem.quantity += 1;
      } else {
         cart.push({
            ...product,
            quantity: 1
         });
      }

      storage.set('cart', cart);
      updateCart();
      showNotification(`Added ${product.name} to cart!`);
   }

   // Remove item from cart
   function removeFromCart(productId) {
      cart = cart.filter(item => item.id !== productId);
      storage.set('cart', cart);
      updateCart();
      showNotification('Item removed from cart', 'info');
   }

   // Update item quantity
   function updateQuantity(productId, change) {
      const item = cart.find(item => item.id === productId);

      if (item) {
         item.quantity += change;

         if (item.quantity <= 0) {
            removeFromCart(productId);
         } else {
            storage.set('cart', cart);
            updateCart();
         }
      }
   }

   // Calculate cart totals
   function calculateTotals() {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * TAX_RATE;
      const total = subtotal + tax;

      return { subtotal, tax, total };
   }

   // Update cart UI
   function updateCart() {
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

      // Update badge
      if (itemCount > 0) {
         cartBadge.textContent = itemCount;
         cartBadge.classList.remove('hidden');
      } else {
         cartBadge.classList.add('hidden');
      }

      // Update item count
      cartItemCount.textContent = `(${itemCount})`;

      // Update cart items display
      if (cart.length === 0) {
         emptyCartMessage.classList.remove('hidden');
         cartItems.classList.add('hidden');
         cartFooter.classList.add('hidden');
      } else {
         emptyCartMessage.classList.add('hidden');
         cartItems.classList.remove('hidden');
         cartFooter.classList.remove('hidden');

         // Render cart items
         cartItems.innerHTML = cart.map(item => `
            <div class="cart-item bg-cream-light rounded-2xl p-4 flex gap-4">
               <img src="${item.image}" alt="${item.name}" class="cart-item-image">
               <div class="flex-1">
                  <h4 class="font-display text-lg text-dark mb-1">${item.name}</h4>
                  <p class="text-primary font-medium mb-3">₹${item.price.toFixed(2)}</p>

                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-3">
                     <button onclick="updateQuantity('${item.id}', -1)" class="quantity-btn">
                        <span class="text-lg font-bold">−</span>
                     </button>
                     <span class="font-medium text-dark w-8 text-center">${item.quantity}</span>
                     <button onclick="updateQuantity('${item.id}', 1)" class="quantity-btn">
                        <span class="text-lg font-bold">+</span>
                     </button>
                     <button onclick="removeFromCart('${item.id}')" class="ml-auto remove-item-btn text-xl" title="Remove item">
                        🗑️
                     </button>
                  </div>
               </div>
               <div class="text-right">
                  <p class="font-display text-lg text-dark">₹${(item.price * item.quantity).toFixed(2)}</p>
               </div>
            </div>
         `).join('');
      }

      // Update totals
      const { subtotal, tax, total } = calculateTotals();
      cartSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
      cartTax.textContent = `₹${tax.toFixed(2)}`;
      cartTotal.textContent = `₹${total.toFixed(2)}`;
   }

   // Place order
   placeOrderBtn.addEventListener('click', function () {
      if (cart.length === 0) return;

      const { total } = calculateTotals();
      showNotification(`Order placed successfully! Total: ₹${total.toFixed(2)}`, 'success');

      // Clear cart
      cart = [];
      storage.set('cart', cart);
      updateCart();

      // Close drawer after a short delay
      setTimeout(() => {
         if (cartDrawer.classList.contains('active')) {
            toggleCart();
         }
      }, 1500);
   });

   // Make functions globally available for onclick handlers
   window.updateQuantity = updateQuantity;
   window.removeFromCart = removeFromCart;

   // Add to cart button and product card click handler
   document.addEventListener('click', function (e) {
      // Only handle clicks on homepage, not on product page
      if (window.location.pathname.includes('product.html')) {
         return;
      }

      console.log('Click detected:', e.target);

      const addToCartBtn = e.target.closest('button');

      // Handle Add to Cart button click
      if (addToCartBtn && addToCartBtn.textContent.trim() === 'Add to Cart') {
         e.stopPropagation(); // Prevent card click
         e.preventDefault();

         console.log('Add to cart button clicked');

         // Check if button has data-product-id (from dynamically loaded products)
         const productId = addToCartBtn.getAttribute('data-product-id');

         if (productId && typeof getProductById === 'function') {
            // Use product data from products-data.js
            const productData = getProductById(productId);
            if (productData) {
               const product = {
                  id: productData.id,
                  name: productData.name,
                  price: productData.basePrice,
                  image: productData.image
               };
               addToCart(product);
               return;
            }
         }

         // Fallback: Find the product details from the parent card (for statically loaded products)
         const productCard = addToCartBtn.closest('.swiper-slide, .menu-item');

         if (productCard) {
            const productName = productCard.querySelector('h3')?.textContent.trim();
            const imageUrl = productCard.querySelector('img')?.src;

            // Find the price span with data-price attribute or text content
            const priceElement = addToCartBtn.parentElement?.querySelector('[data-price]');
            let price;

            if (priceElement && priceElement.hasAttribute('data-price')) {
               price = parseFloat(priceElement.getAttribute('data-price'));
            } else {
               const priceSpan = addToCartBtn.parentElement?.querySelector('.font-display');
               const priceText = priceSpan?.textContent.trim();
               price = parseFloat(priceText?.replace('₹', '').replace(',', '') || '0');
            }

            // Create unique ID from name
            const fallbackProductId = productName?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36);

            if (productName && price && imageUrl) {
               const product = {
                  id: fallbackProductId,
                  name: productName,
                  price: price,
                  image: imageUrl
               };

               addToCart(product);
            } else {
               console.log('Missing product data:', { productName, price, imageUrl });
            }
         }
         return;
      }

      // Handle product card click (navigate to product page)
      const productCard = e.target.closest('.swiper-slide, .menu-item');

      console.log('Product card found:', productCard);

      if (productCard && !e.target.closest('button')) {
         const productName = productCard.querySelector('h3')?.textContent.trim();

         console.log('Product name:', productName);

         if (productName) {
            // Create product ID from name
            const productId = productName.toLowerCase().replace(/\s+/g, '-');

            console.log('Card clicked:', productName, 'ID:', productId);

            // Check if product exists in database
            if (typeof getProductById === 'function' && getProductById(productId)) {
               console.log('Product found in database, navigating...');
               window.location.href = `pages/product.html?id=${productId}`;
            } else {
               console.log('Product not found in database. Product ID:', productId);
               if (typeof window.productsData !== 'undefined') {
                  console.log('Available products:', Object.keys(window.productsData));
               }
            }
         }
      }
   });

   // Initialize cart on page load
   updateCart();

   // ===== PRODUCT DETAIL PAGE LOGIC =====
   // Check if we're on the product page
   if (window.location.pathname.includes('product.html')) {
      // Get product ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');

      if (!productId || !getProductById(productId)) {
         window.location.href = '../index.html';
         return;
      }

      const product = getProductById(productId);
      let selectedSize = product.sizes[0];

      // ===== Populate Product Details =====
      function populateProductDetails() {
         document.getElementById('pageTitle').textContent = `${product.name} - Bites`;
         document.getElementById('productImage').src = product.image;
         document.getElementById('productImage').alt = product.name;
         document.getElementById('productCategory').textContent = product.category;
         document.getElementById('productName').textContent = product.name;
         document.getElementById('productDescription').textContent = product.description;

         // Update rating
         const ratingContainer = document.getElementById('productRating');
         ratingContainer.innerHTML = '';
         for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.textContent = '⭐';
            star.className = i < product.rating ? 'text-primary' : 'text-gray-300';
            ratingContainer.appendChild(star);
         }

         // Update ingredients
         const ingredientsContainer = document.getElementById('productIngredients');
         ingredientsContainer.innerHTML = product.ingredients.map(ingredient => `
            <span class="bg-cream px-4 py-2 rounded-full text-dark-gray text-sm border-2 border-primary hover:bg-primary hover:text-white hover:font-bold hover:cursor-pointer transition-all">${ingredient}</span>
         `).join('');

         // Update nutrition info
         if (product.nutritionInfo) {
            document.getElementById('nutritionCalories').textContent = product.nutritionInfo.calories;
            document.getElementById('nutritionProtein').textContent = product.nutritionInfo.protein;
            document.getElementById('nutritionCarbs').textContent = product.nutritionInfo.carbs;
            document.getElementById('nutritionFat').textContent = product.nutritionInfo.fat;
         }

         // Update size options
         const sizeOptionsContainer = document.getElementById('sizeOptions');
         sizeOptionsContainer.innerHTML = product.sizes.map((size, index) => `
            <label class="size-option flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${index === 0 ? 'border-primary bg-cream' : 'border-gray-200 hover:border-primary'}">
               <input type="radio" name="size" value="${index}" class="hidden size-radio" ${index === 0 ? 'checked' : ''}>
               <div class="flex-1">
                  <p class="font-display text-lg text-dark">${size.name}</p>
                  <p class="text-dark-gray text-sm">${size.description}</p>
               </div>
               <p class="font-display text-xl text-primary">₹${size.price.toFixed(2)}</p>
            </label>
         `).join('');

         updatePrice();

         // Add size change listeners
         document.querySelectorAll('.size-radio').forEach((radio, index) => {
            radio.addEventListener('change', function () {
               selectedSize = product.sizes[index];
               updatePrice();
               updateSizeSelection();
            });
         });
      }

      function updateSizeSelection() {
         document.querySelectorAll('.size-option').forEach((option) => {
            const radio = option.querySelector('.size-radio');
            if (radio.checked) {
               option.classList.add('border-primary', 'bg-cream');
               option.classList.remove('border-gray-200');
            } else {
               option.classList.remove('border-primary', 'bg-cream');
               option.classList.add('border-gray-200');
            }
         });
      }

      function updatePrice() {
         const priceText = `₹${selectedSize.price.toFixed(2)}`;
         document.getElementById('productPrice').textContent = priceText;
         document.getElementById('mobilePriceDisplay').textContent = priceText;
      }

      // Add to cart functionality for product page
      function handleAddToCartOnProductPage() {
         const cartProduct = {
            id: product.id,
            name: product.name,
            price: selectedSize.price,
            image: product.image,
            size: selectedSize.name
         };
         addToCart(cartProduct);
      }

      document.getElementById('addToCartBtn')?.addEventListener('click', handleAddToCartOnProductPage);
      document.getElementById('mobileAddToCartBtn')?.addEventListener('click', handleAddToCartOnProductPage);

      // ===== Related Products =====
      function loadRelatedProducts() {
         const relatedProducts = getProductsByCategory(product.category)
            .filter(p => p.id !== product.id)
            .slice(0, 6);

         const container = document.getElementById('relatedProductsContainer');
         container.innerHTML = relatedProducts.map(relatedProduct => `
            <div class="swiper-slide">
               <div class="bg-white rounded-3xl p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer" onclick="window.location.href='product.html?id=${relatedProduct.id}'">
                  <div class="mb-4 overflow-hidden rounded-2xl">
                     <img
                        src="${relatedProduct.image}"
                        alt="${relatedProduct.name}"
                        class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                     />
                  </div>
                  <h3 class="font-display text-xl mb-2 text-center">${relatedProduct.name}</h3>
                  <div class="flex justify-center gap-1 mb-2">
                     ${Array(5).fill(0).map((_, i) => `
                        <span class="${i < relatedProduct.rating ? 'text-primary' : 'text-gray-300'}">⭐</span>
                     `).join('')}
                  </div>
                  <div class="text-center">
                     <span class="font-display text-2xl text-dark">₹${relatedProduct.basePrice.toFixed(2)}</span>
                  </div>
               </div>
            </div>
         `).join('');

         // Initialize Swiper for related products
         const relatedSwiper = new Swiper('.relatedProductsSwiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: relatedProducts.length >= 4,
            loopedSlides: relatedProducts.length,
            centeredSlides: false,
            navigation: {
               nextEl: '.swiper-button-next-related',
               prevEl: '.swiper-button-prev-related',
            },
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

         // Hide navigation buttons if not enough slides
         const hideNavigationIfNeeded = () => {
            const prevBtn = document.querySelector('.swiper-button-prev-related');
            const nextBtn = document.querySelector('.swiper-button-next-related');

            if (relatedProducts.length <= 1) {
               prevBtn.style.display = 'none';
               nextBtn.style.display = 'none';
            } else if (relatedProducts.length <= 2 && window.innerWidth >= 640) {
               prevBtn.style.display = 'none';
               nextBtn.style.display = 'none';
            } else if (relatedProducts.length <= 3 && window.innerWidth >= 1024) {
               prevBtn.style.display = 'none';
               nextBtn.style.display = 'none';
            } else if (relatedProducts.length <= 4 && window.innerWidth >= 1280) {
               prevBtn.style.display = 'none';
               nextBtn.style.display = 'none';
            } else {
               prevBtn.style.display = 'flex';
               nextBtn.style.display = 'flex';
            }
         };

         hideNavigationIfNeeded();
         window.addEventListener('resize', hideNavigationIfNeeded);
      }

      // Initialize product page
      populateProductDetails();
      loadRelatedProducts();
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
   backToTopBtn.className = 'back-to-top fixed w-12 h-12 sm:w-14 sm:h-14 bg-primary text-white rounded-full shadow-lg opacity-0 pointer-events-none transition-all duration-300 hover:bg-primary-dark hover:scale-110 z-50';
   backToTopBtn.setAttribute('aria-label', 'Back to top');
   document.body.appendChild(backToTopBtn);

   // Adjust position based on page
   if (window.location.pathname.includes('product.html')) {
      // Product page - position above mobile bottom bar
      backToTopBtn.style.bottom = '6.5rem';
      backToTopBtn.style.right = '1rem';
   } else {
      // Homepage - position at bottom right corner
      backToTopBtn.style.bottom = '1.5rem';
      backToTopBtn.style.right = '1rem';
   }

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
