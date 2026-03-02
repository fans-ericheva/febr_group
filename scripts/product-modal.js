// product-modal.js

// Функция для форматирования цены
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Добавляем стили для анимации
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Функция переключения избранного
function toggleFavoriteModal(gender, id, button) {
  const key = `favorite_${gender}_${id}`;
  const isFavorite = localStorage.getItem(key) === "true";

  localStorage.setItem(key, !isFavorite);

  // Находим название товара
  let productName = "Товар";
  if (gender === "men" && productsData.men) {
    const p = productsData.men.find((p) => p.id === id);
    if (p) productName = p.name;
  } else if (gender === "women" && productsData.women) {
    const p = productsData.women.find((p) => p.id === id);
    if (p) productName = p.name;
  }

  showNotification(
    !isFavorite
      ? `"${productName}" добавлен в избранное`
      : `"${productName}" удален из избранного`,
    !isFavorite ? "success" : "warning",
  );

  return !isFavorite;
}

// Функция для создания звезд рейтинга
function createRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let starsHtml = '';
  
  // Добавляем полные звезды
  for (let i = 0; i < fullStars; i++) {
    starsHtml += '<span class="rating-star full">★</span>';
  }
  
  // Добавляем половину звезды если нужно
  if (hasHalfStar) {
    starsHtml += '<span class="rating-star half">★</span>';
  }
  
  // Добавляем пустые звезды
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += '<span class="rating-star empty">☆</span>';
  }
  
  return starsHtml;
}

// Создание модального окна
function createModal() {
  // Удаляем старые если есть
  const oldModal = document.querySelector(".product-modal");
  const oldOverlay = document.querySelector(".modal-overlay");
  if (oldModal) oldModal.remove();
  if (oldOverlay) oldOverlay.remove();

  // Создаем overlay
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9998;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
    `;
  document.body.appendChild(overlay);

  // Создаем модальное окно
  const modal = document.createElement("div");
  modal.className = "product-modal";
  modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        width: 90%;
        max-width: 1200px;
        max-height: 90vh;
        background: #dfd8cb;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        border-radius: 30px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        border: 2px solid #4f3e35;
    `;

  modal.innerHTML = `
        <div class="modal-close" style="
            position: absolute;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(223, 216, 203, 0.9);
            border: 2px solid #4f3e35;
            color: #4f3e35;
            font-size: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            transition: all 0.2s ease;
        ">×</div>
        <div class="modal-content" style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            padding: 40px;
            max-height: 90vh;
            overflow-y: auto;
        ">
            <div class="modal-gallery">
                <div class="modal-main-image" style="
                    width: 100%;
                    aspect-ratio: 3/4;
                    border-radius: 20px;
                    overflow: hidden;
                    background-color: rgba(79, 62, 53, 0.05);
                ">
                    <img src="" alt="" id="modalMainImage" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <!-- Контейнер для миниатюр -->
                <div class="modal-thumbnails" id="modalThumbnails" style="
                    display: flex;
                    gap: 15px;
                    margin-top: 20px;
                    overflow-x: auto;
                    padding-bottom: 10px;
                "></div>
            </div>
            <div class="modal-info">
                <div class="modal-category" id="modalCategory" style="font-family: Arial; font-size: 16px; color: #4f3e35; opacity: 0.6; margin-bottom: 10px;"></div>
                <h2 class="modal-title" id="modalTitle" style="font-family: Georgia; font-size: 36px; font-weight: normal; color: #4f3e35; margin-bottom: 10px;"></h2>
                <div class="modal-price" id="modalPrice" style="font-family: Georgia; font-size: 32px; font-weight: bold; color: #4f3e35; margin-bottom: 15px;"></div>
                
                <!-- ===== НОВЫЙ БЛОК С РЕЙТИНГОМ ===== -->
                <div class="modal-rating" id="modalRating" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                    padding: 10px 0;
                    border-top: 1px dashed rgba(79, 62, 53, 0.2);
                    border-bottom: 1px dashed rgba(79, 62, 53, 0.2);
                "></div>
                
                <div class="modal-description" id="modalDescription" style="font-family: Arial; font-size: 18px; line-height: 1.6; color: #4f3e35; opacity: 0.8; margin-bottom: 20px;"></div>
                
                <div class="modal-selectors">
                    <div class="modal-selector-group" style="margin-bottom: 20px;">
                        <div class="modal-selector-label" style="font-family: Georgia; font-size: 18px; color: #4f3e35; margin-bottom: 10px;">Цвет</div>
                        <div class="modal-colors" id="modalColors" style="display: flex; gap: 15px; flex-wrap: wrap;"></div>
                    </div>
                    
                    <div class="modal-selector-group" style="margin-bottom: 20px;">
                        <div class="modal-selector-label" style="font-family: Georgia; font-size: 18px; color: #4f3e35; margin-bottom: 10px;">Размер</div>
                        <div class="modal-sizes" id="modalSizes" style="display: flex; gap: 12px; flex-wrap: wrap;"></div>
                    </div>
                </div>
                
                <div class="modal-actions" style="display: flex; gap: 15px; margin-top: 30px;">
                    <button class="modal-add-to-cart" id="modalAddToCart" style="
                        flex: 2;
                        padding: 18px;
                        background-color: #4f3e35;
                        color: #dfd8cb;
                        border: none;
                        font-family: Georgia;
                        font-size: 20px;
                        cursor: pointer;
                        border-radius: 40px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        transition: all 0.3s ease;
                    ">Добавить в корзину</button>
                    <button class="modal-add-to-favorite" id="modalAddToFavorite" style="
                        flex: 1;
                        padding: 18px;
                        background-color: transparent;
                        color: #4f3e35;
                        border: 2px solid #4f3e35;
                        font-family: Georgia;
                        font-size: 20px;
                        cursor: pointer;
                        border-radius: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        transition: all 0.3s ease;
                    ">
                        <img src="images/izbrannoe.png" alt="Избранное" style="width: 24px; height: 24px;">
                    </button>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  return { modal, overlay };
}

// Открытие модального окна
window.openProductModal = function (gender, id) {
  console.log("Открытие модального окна:", gender, id);

  // Находим товар
  let product = null;
  if (gender === "men" && productsData.men) {
    product = productsData.men.find((p) => p.id === id);
  } else if (gender === "women" && productsData.women) {
    product = productsData.women.find((p) => p.id === id);
  }

  if (!product) {
    console.error("Товар не найден");
    return;
  }

  // Создаем модальное окно
  const { modal, overlay } = createModal();

  // ===== СОБИРАЕМ ДАННЫЕ ПО ЦВЕТАМ И ИЗОБРАЖЕНИЯМ =====
  // Находим все товары с таким же названием (разные цвета)
  const similarProducts = productsData[gender].filter(
    (p) => p.name === product.name,
  );
  
  // Создаем структуру: для каждого цвета свой массив изображений
  const colorImagesMap = new Map();
  
  similarProducts.forEach((p) => {
    p.colors.forEach((color, colorIndex) => {
      if (!colorImagesMap.has(color)) {
        // Если цвета еще нет в карте, добавляем все изображения этого товара
        colorImagesMap.set(color, p.images);
      }
    });
  });
  
  // Если нет похожих товаров, используем текущий
  if (colorImagesMap.size === 0) {
    product.colors.forEach((color) => {
      colorImagesMap.set(color, product.images);
    });
  }
  
  // Получаем массив цветов и соответствующих им изображений
  const colors = Array.from(colorImagesMap.keys());
  const colorImages = colors.map(color => colorImagesMap.get(color));

  // Заполняем основные данные
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalPrice").textContent =
    formatPrice(product.price) + " ₽";
  document.getElementById("modalCategory").textContent = product.category;
  document.getElementById("modalDescription").textContent =
    product.description || "Элегантная модель из новой коллекции.";
  
  // ===== ДОБАВЛЯЕМ РЕЙТИНГ =====
  const ratingContainer = document.getElementById("modalRating");
  const rating = product.rating || 4.8; // Значение по умолчанию, если рейтинга нет
  
  ratingContainer.innerHTML = `
    <div class="rating-stars" style="
        display: flex;
        gap: 4px;
        font-size: 24px;
        color: #4f3e35;
    ">${createRatingStars(rating)}</div>
    <div class="rating-value" style="
        font-family: Arial;
        font-size: 18px;
        color: #4f3e35;
        opacity: 0.8;
    ">${rating.toFixed(1)} / 5.0</div>
    <div class="rating-reviews" style="
        font-family: Arial;
        font-size: 16px;
        color: #4f3e35;
        opacity: 0.6;
        margin-left: auto;
    ">• 12 отзывов</div>
  `;
  
  // Устанавливаем первое изображение первого цвета
  const firstColorImages = colorImages[0] || product.images;
  document.getElementById("modalMainImage").src = firstColorImages[0];

  // ===== СОЗДАНИЕ МИНИАТЮР ДЛЯ ТЕКУЩЕГО ЦВЕТА =====
  function renderThumbnailsForColor(colorIndex) {
    const thumbnailsContainer = document.getElementById("modalThumbnails");
    thumbnailsContainer.innerHTML = "";
    
    const currentColorImages = colorImages[colorIndex] || [];
    
    currentColorImages.forEach((imgSrc, imgIndex) => {
      const thumbnail = document.createElement("div");
      thumbnail.className = `modal-thumbnail ${imgIndex === 0 ? "active" : ""}`;
      thumbnail.style.cssText = `
          width: 80px;
          height: 80px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          opacity: ${imgIndex === 0 ? "1" : "0.6"};
          transition: all 0.2s ease;
          border: ${imgIndex === 0 ? "3px solid #4f3e35" : "2px solid transparent"};
          flex-shrink: 0;
      `;
      
      thumbnail.innerHTML = `<img src="${imgSrc}" alt="Миниатюра ${imgIndex + 1}" style="width: 100%; height: 100%; object-fit: cover;">`;
      
      // Добавляем обработчик клика на миниатюру
      thumbnail.onclick = function() {
        document.getElementById("modalMainImage").src = imgSrc;
        
        document.querySelectorAll(".modal-thumbnail").forEach((thumb, i) => {
          if (i === imgIndex) {
            thumb.style.opacity = "1";
            thumb.style.border = "3px solid #4f3e35";
            thumb.classList.add("active");
          } else {
            thumb.style.opacity = "0.6";
            thumb.style.border = "2px solid transparent";
            thumb.classList.remove("active");
          }
        });
      };
      
      thumbnailsContainer.appendChild(thumbnail);
    });
  }

  // Отрисовываем миниатюры для первого цвета
  renderThumbnailsForColor(0);

  // ===== СОЗДАНИЕ ЦВЕТОВ =====
  const colorsContainer = document.getElementById("modalColors");
  colorsContainer.innerHTML = "";
  
  colors.forEach((color, colorIndex) => {
    const dot = document.createElement("div");
    dot.className = "modal-color-option" + (colorIndex === 0 ? " selected" : "");
    dot.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;
            background-color: ${color};
            ${colorIndex === 0 ? "border-color: #4f3e35; box-shadow: 0 0 0 2px #dfd8cb, 0 0 0 4px #4f3e35;" : ""}
        `;
    dot.dataset.color = color;
    dot.dataset.colorIndex = colorIndex;

    dot.onmouseover = function () {
      this.style.transform = "scale(1.1)";
    };
    dot.onmouseout = function () {
      this.style.transform = "scale(1)";
    };
    
    dot.onclick = function () {
      const selectedColorIndex = parseInt(this.dataset.colorIndex);
      
      // Снимаем выделение со всех цветов
      document.querySelectorAll(".modal-color-option").forEach((d, idx) => {
        d.style.borderColor = "transparent";
        d.style.boxShadow = "none";
        d.classList.remove("selected");
      });
      
      // Выделяем выбранный цвет
      this.style.borderColor = "#4f3e35";
      this.style.boxShadow = "0 0 0 2px #dfd8cb, 0 0 0 4px #4f3e35";
      this.classList.add("selected");
      
      // Меняем главное изображение на первое изображение выбранного цвета
      const newColorImages = colorImages[selectedColorIndex];
      if (newColorImages && newColorImages.length > 0) {
        document.getElementById("modalMainImage").src = newColorImages[0];
      }
      
      // Перерисовываем миниатюры для выбранного цвета
      renderThumbnailsForColor(selectedColorIndex);
    };

    colorsContainer.appendChild(dot);
  });

  // ===== СОЗДАНИЕ РАЗМЕРОВ =====
  const sizesContainer = document.getElementById("modalSizes");
  sizesContainer.innerHTML = "";
  
  product.size.forEach((size, index) => {
    const sizeEl = document.createElement("div");
    sizeEl.className = "modal-size-option" + (index === 0 ? " selected" : "");
    sizeEl.textContent = size;
    sizeEl.style.cssText = `
            min-width: 50px;
            height: 50px;
            border: 2px solid #4f3e35;
            background: ${index === 0 ? "#4f3e35" : "transparent"};
            color: ${index === 0 ? "#dfd8cb" : "#4f3e35"};
            font-family: Georgia;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 10px;
            padding: 0 15px;
            transition: all 0.2s ease;
        `;

    sizeEl.onmouseover = function () {
      if (!this.classList.contains("selected")) {
        this.style.backgroundColor = "rgba(79, 62, 53, 0.1)";
      }
    };
    sizeEl.onmouseout = function () {
      if (!this.classList.contains("selected")) {
        this.style.backgroundColor = "transparent";
      }
    };
    sizeEl.onclick = function () {
      document.querySelectorAll(".modal-size-option").forEach((s) => {
        s.classList.remove("selected");
        s.style.backgroundColor = "transparent";
        s.style.color = "#4f3e35";
      });
      this.classList.add("selected");
      this.style.backgroundColor = "#4f3e35";
      this.style.color = "#dfd8cb";
    };

    sizesContainer.appendChild(sizeEl);
  });

  // ===== ПРОВЕРКА ИЗБРАННОГО =====
  const favKey = `favorite_${gender}_${id}`;
  const isFavorite = localStorage.getItem(favKey) === "true";
  const favBtn = document.getElementById("modalAddToFavorite");
  if (isFavorite) {
    favBtn.style.backgroundColor = "#4f3e35";
    favBtn.style.color = "#dfd8cb";
    favBtn.querySelector("img").style.filter = "brightness(0) invert(1)";
  }

  // ===== ОБРАБОТЧИК ДОБАВЛЕНИЯ В КОРЗИНУ =====
  document.getElementById("modalAddToCart").onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();

    const selectedColor =
      document.querySelector(".modal-color-option.selected")?.dataset.color ||
      product.colors[0];
    const selectedSize =
      document.querySelector(".modal-size-option.selected")?.textContent ||
      product.size[0];

    window.addToCart(gender, id, selectedSize, selectedColor);
    this.textContent = "✓ Добавлено!";
    this.style.backgroundColor = "#2C3E50";
    setTimeout(() => {
      this.textContent = "Добавить в корзину";
      this.style.backgroundColor = "#4f3e35";
    }, 1500);
  };

  // ===== ОБРАБОТЧИК ИЗБРАННОГО =====
  document.getElementById("modalAddToFavorite").onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();

    const isNowFavorite = toggleFavoriteModal(gender, id, this);

    if (isNowFavorite) {
      this.style.backgroundColor = "#4f3e35";
      this.style.color = "#dfd8cb";
      this.querySelector("img").style.filter = "brightness(0) invert(1)";
    } else {
      this.style.backgroundColor = "transparent";
      this.style.color = "#4f3e35";
      this.querySelector("img").style.filter = "none";
    }

    this.classList.add("pulse");
    setTimeout(() => this.classList.remove("pulse"), 200);
  };

  // ===== ФУНКЦИЯ ЗАКРЫТИЯ =====
  const closeModal = () => {
    modal.style.opacity = "0";
    modal.style.visibility = "hidden";
    overlay.style.opacity = "0";
    overlay.style.visibility = "hidden";
    document.body.style.overflow = "";

    setTimeout(() => {
      if (modal.parentNode) modal.remove();
      if (overlay.parentNode) overlay.remove();
    }, 300);
  };

  // Обработчики закрытия
  modal.querySelector(".modal-close").onclick = closeModal;
  overlay.onclick = closeModal;

  // Закрытие по Escape
  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);

  // Показываем модальное окно
  setTimeout(() => {
    modal.style.opacity = "1";
    modal.style.visibility = "visible";
    modal.style.transform = "translate(-50%, -50%) scale(1)";
    overlay.style.opacity = "1";
    overlay.style.visibility = "visible";
  }, 10);

  document.body.style.overflow = "hidden";
};