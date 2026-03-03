// scripts/catalog.js

// Состояние фильтров
let activeFilters = {
  category: [],
  size: [],
  color: [],
  season: [],
};

// Состояние пагинации
let paginationState = {
  currentPage: 1,
  itemsPerPage: 8,
  totalItems: 0,
  totalPages: 0,
};

// Все товары текущей категории (без фильтрации)
let allProductsInCategory = [];

// Текущая категория товаров (men или women)
let currentCategory = "men";

function refreshCatalog() {
  if (!window.productsData || !window.productsData[currentCategory]) return;
  
  allProductsInCategory = window.productsData[currentCategory].map(p => ({
    ...p, gender: currentCategory
  }));
  
  updatePaginationState(allProductsInCategory.length);
  const pageProducts = getCurrentPageProducts(allProductsInCategory);
  renderProducts(pageProducts);
  updateProductsCount(allProductsInCategory.length);
  renderColorFilters();
}

// Функция для обновления состояния пагинации
function updatePaginationState(totalItems) {
  paginationState.totalItems = totalItems;
  paginationState.totalPages = Math.ceil(
    totalItems / paginationState.itemsPerPage,
  );

  if (paginationState.currentPage > paginationState.totalPages) {
    paginationState.currentPage = paginationState.totalPages || 1;
  }
}

// Получение товаров для текущей страницы
function getCurrentPageProducts(products) {
  const startIndex =
    (paginationState.currentPage - 1) * paginationState.itemsPerPage;
  const endIndex = startIndex + paginationState.itemsPerPage;
  return products.slice(startIndex, endIndex);
}

// Создание HTML для пагинации
function createPaginationHTML() {
  if (paginationState.totalPages <= 1) return "";

  let html = '<div class="pagination-container">';
  html += '<div class="pagination">';

  // Кнопка "На первую"
  html += `
        <button class="pagination-btn" 
                onclick="goToPage(1)" 
                ${paginationState.currentPage === 1 ? "disabled" : ""}>
            <span class="pagination-arrow">«</span>
        </button>
    `;

  // Кнопка "Предыдущая"
  html += `
        <button class="pagination-btn" 
                onclick="goToPage(${paginationState.currentPage - 1})" 
                ${paginationState.currentPage === 1 ? "disabled" : ""}>
            <span class="pagination-arrow">‹</span>
        </button>
    `;

  // Номера страниц
  const maxVisiblePages = 5;
  let startPage = Math.max(
    1,
    paginationState.currentPage - Math.floor(maxVisiblePages / 2),
  );
  let endPage = Math.min(
    paginationState.totalPages,
    startPage + maxVisiblePages - 1,
  );

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    html += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
    if (startPage > 2) {
      html += `<span class="pagination-dots">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `
            <button class="pagination-btn ${i === paginationState.currentPage ? "active" : ""}" 
                    onclick="goToPage(${i})">
                ${i}
            </button>
        `;
  }

  if (endPage < paginationState.totalPages) {
    if (endPage < paginationState.totalPages - 1) {
      html += `<span class="pagination-dots">...</span>`;
    }
    html += `<button class="pagination-btn" onclick="goToPage(${paginationState.totalPages})">${paginationState.totalPages}</button>`;
  }

  // Кнопка "Следующая"
  html += `
        <button class="pagination-btn" 
                onclick="goToPage(${paginationState.currentPage + 1})" 
                ${paginationState.currentPage === paginationState.totalPages ? "disabled" : ""}>
            <span class="pagination-arrow">›</span>
        </button>
    `;

  // Кнопка "На последнюю"
  html += `
        <button class="pagination-btn" 
                onclick="goToPage(${paginationState.totalPages})" 
                ${paginationState.currentPage === paginationState.totalPages ? "disabled" : ""}>
            <span class="pagination-arrow">»</span>
        </button>
    `;

  html += "</div></div>";
  return html;
}

// Переход на определенную страницу
window.goToPage = function (page) {
  page = Math.max(1, Math.min(page, paginationState.totalPages));
  if (page === paginationState.currentPage) return;

  paginationState.currentPage = page;

  const catalogHeader = document.querySelector(".catalog-header");
  if (catalogHeader) {
    catalogHeader.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  filterProducts();
};

// Изменение количества товаров на странице
window.changeItemsPerPage = function (value) {
  paginationState.itemsPerPage = parseInt(value);
  paginationState.currentPage = 1;
  localStorage.setItem("itemsPerPage", value);
  filterProducts();
};

// Загрузка сохраненных настроек пагинации
function loadPaginationSettings() {
  const savedItemsPerPage = localStorage.getItem("itemsPerPage");
  if (savedItemsPerPage) {
    paginationState.itemsPerPage = parseInt(savedItemsPerPage);
  }
}

// Инициализация кликов по карточкам товаров
function initProductCards() {
  document.addEventListener("click", function (e) {
    const productCard = e.target.closest(".product-item");
    if (!productCard) return;

    // Добавить проверку на кнопку "Добавить в корзину"
    if (
      e.target.closest(".product-favorite") ||
      e.target.closest(".color-dot") ||
      e.target.closest(".product-add-to-cart") // <-- добавить эту строку
    ) {
      return;
    }

    e.preventDefault();

    const gender = productCard.dataset.gender;
    const id = parseInt(productCard.dataset.id);

    if (window.openProductModal) {
      window.openProductModal(gender, id);
    }
  });
}

// Добавление в корзину из карточки каталога
window.addToCartFromCard = function (gender, id, button) {
  // Предотвращаем всплытие события
  if (event) {
    event.stopPropagation();
  }

  const product = productsData[gender].find((p) => p.id === id);
  if (!product) {
    console.error("Товар не найден");
    return;
  }

  const productCard = button.closest(".product-item");
  const selectedColorDot = productCard.querySelector(".color-dot.selected");
  let color;

  if (selectedColorDot) {
    color = selectedColorDot.dataset.color;
  } else {
    color = product.colors[0];
  }

  const size = product.size[0] || "M";

  // Проверяем наличие функции addToCart
  if (typeof window.addToCart === "function") {
    // Вызываем добавление в корзину
    window.addToCart(gender, id, size, color);

    // Анимация кнопки
    button.textContent = "✓ Добавлено!";
    button.style.backgroundColor = "#2C3E50";
    button.style.transition = "all 0.3s ease";

    setTimeout(() => {
      button.textContent = "Добавить в корзину";
      button.style.backgroundColor = "#4F3E35";
    }, 1500);
  }
};

// Обработчик для выбора цвета
document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("color-dot")) {
      const colorDots = e.target
        .closest(".product-colors")
        .querySelectorAll(".color-dot");
      colorDots.forEach((dot) => dot.classList.remove("selected"));
      // e.target.classList.add("selected");
    }
  });
});

// Функция для форматирования цены
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Создание карточки товара
function createProductCard(product) {
  const colorDots = product.colors
    .map(
      (color) =>
        `<span class="color-dot" style="background-color: ${color};" data-color="${color}"></span>`,
    )
    .join("");

  const favoriteKey = `favorite_${product.gender}_${product.id}`;
  const isFavorite = localStorage.getItem(favoriteKey) === "true";
  const activeClass = isFavorite ? "active" : "";

  const formattedPrice = formatPrice(product.price);
  return `
    <div class="product-item" data-id="${product.id}" data-gender="${product.gender}" data-product-name="${product.name}">
        <div class="product-item-image-wrapper">
            <img src="${product.images[0]}" alt="${product.name}" class="product-item-image">
            <button class="product-favorite ${activeClass}" onclick="toggleFavorite('${product.gender}', ${product.id}, this)">
                <img src="images/izbrannoe.png" alt="Избранное" class="favorite-icon">
            </button>
        </div>
        <div class="product-item-info">
            <h3>${product.name}</h3>
            <div class="price-colors-row">
                <p class="product-price">${formattedPrice} ₽</p>
                <div class="product-colors">
                    ${colorDots}
                </div>
            </div>
            <button class="product-add-to-cart" onclick="addToCartFromCard('${product.gender}', ${product.id}, this)">
                Добавить в корзину
            </button>
        </div>
    </div>
  `;
}

// Фильтрация товаров
function filterProducts() {
  let filteredProducts = [...productsData[currentCategory]];

  filteredProducts.forEach((product) => {
    product.gender = currentCategory;
  });

  allProductsInCategory = [...filteredProducts];

  if (activeFilters.category.length > 0) {
    filteredProducts = filteredProducts.filter((product) =>
      activeFilters.category.includes(product.category),
    );
  }

  if (activeFilters.size.length > 0) {
    filteredProducts = filteredProducts.filter((product) =>
      product.size.some((size) => activeFilters.size.includes(size)),
    );
  }

  if (activeFilters.color.length > 0) {
    filteredProducts = filteredProducts.filter((product) =>
      product.colors.some((color) => activeFilters.color.includes(color)),
    );
  }

  if (activeFilters.season.length > 0) {
    filteredProducts = filteredProducts.filter((product) =>
      product.season.some((season) => activeFilters.season.includes(season)),
    );
  }

  updatePaginationState(filteredProducts.length);
  const pageProducts = getCurrentPageProducts(filteredProducts);
  renderProducts(pageProducts);
  updateProductsCount(filteredProducts.length);
}

// Отображение товаров
function renderProducts(products) {
  const catalogGrid = document.querySelector(".catalog-grid");
  if (!catalogGrid) return;

  if (products.length === 0 && paginationState.totalItems === 0) {
    catalogGrid.innerHTML = '<div class="no-products">Товары не найдены</div>';
    return;
  }

  let productsHTML = products
    .map((product) => createProductCard(product))
    .join("");
  const paginationHTML = createPaginationHTML();

  catalogGrid.innerHTML = productsHTML + paginationHTML;
}

// Обновление счетчика товаров
function updateProductsCount(count) {
  const headerRight = document.querySelector(".catalog-header-right h1");
  if (headerRight) {
    const categoryText = currentCategory === "men" ? "Мужчинам" : "Женщинам";
    headerRight.innerHTML = `${categoryText} <span style="font-size: 14px; font-weight: normal; margin-left: 10px;">(${count})</span>`;
  }
}

// Обработка клика по фильтру (для обычных фильтров)
function handleFilterClick(filterType, value, element) {
  // Для цветных фильтров используем другую логику
  if (filterType === "color") {
    // Цветные фильтры обрабатываются отдельно в initColorFilterHandlers
    return;
  }

  element.classList.toggle("active");
  //   element.classList.add("selected");

  if (activeFilters[filterType].includes(value)) {
    activeFilters[filterType] = activeFilters[filterType].filter(
      (v) => v !== value,
    );
  } else {
    activeFilters[filterType].push(value);
  }

  paginationState.currentPage = 1;
  filterProducts();
}

// Сброс всех фильтров
function resetFilters() {
  activeFilters = {
    category: [],
    size: [],
    color: [],
    season: [],
  };

  // Сбрасываем обычные фильтры
  document
    .querySelectorAll(".filter-option:not(.color-filter-option)")
    .forEach((option) => {
      option.classList.remove("active");
      option.classList.remove("selected");
    });

  // Сбрасываем цветные фильтры
  document.querySelectorAll(".color-filter-option").forEach((option) => {
    option.classList.remove("active", "selected");
    const checkMark = option.querySelector(".check-mark");
    if (checkMark) checkMark.remove();
  });

  paginationState.currentPage = 1;
  allProductsInCategory = [...productsData[currentCategory]];
  allProductsInCategory.forEach((product) => {
    product.gender = currentCategory;
  });
  updatePaginationState(allProductsInCategory.length);
  const pageProducts = getCurrentPageProducts(allProductsInCategory);
  renderProducts(pageProducts);
  updateProductsCount(allProductsInCategory.length);
}

// Инициализация секций фильтра
function initFilterSections() {
  document.querySelectorAll(".filter-section-header").forEach((header) => {
    header.addEventListener("click", function () {
      const section = this.closest(".filter-section");
      section.classList.toggle("collapsed");

      const arrow = this.querySelector(".filter-section-arrow");
      if (arrow) {
        arrow.textContent = section.classList.contains("collapsed") ? "⨯" : "=";
      }
    });
  });
}

// Инициализация обработчиков обычных фильтров
function initFilterHandlers() {
  document
    .querySelectorAll(".filter-option:not(.color-filter-option)")
    .forEach((option) => {
      option.removeEventListener("click", option.clickHandler);

      option.clickHandler = function (e) {
        e.stopPropagation();
        const filterType = this.getAttribute("data-filter-type");
        const value = this.getAttribute("data-value");
        if (filterType && value) {
          handleFilterClick(filterType, value, this);
        }
      };

      option.addEventListener("click", option.clickHandler);
    });
}

// Добавление кнопки сброса фильтров
function addResetButton() {
  const filterContent = document.querySelector(".filter-content");
  if (!filterContent) return;

  if (document.querySelector(".reset-filters-btn")) return;

  const resetBtn = document.createElement("button");
  resetBtn.className = "reset-filters-btn";
  resetBtn.textContent = "Сбросить все фильтры";
  resetBtn.addEventListener("click", resetFilters);
  filterContent.appendChild(resetBtn);
}

// Инициализация открытия/закрытия фильтра
function initFilterToggle() {
  const filterToggle = document.getElementById("filterToggle");
  const filterMenu = document.querySelector(".filter-menu");
  const filterOverlay = document.querySelector(".filter-overlay");
  const filterClose = document.querySelector(".filter-close");

  if (filterToggle && filterMenu && filterOverlay) {
    filterToggle.addEventListener("click", () => {
      filterMenu.classList.add("active");
      filterOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    const closeFilter = () => {
      filterMenu.classList.remove("active");
      filterOverlay.classList.remove("active");
      document.body.style.overflow = "";
    };

    filterClose?.addEventListener("click", closeFilter);
    filterOverlay.addEventListener("click", closeFilter);
  }
}

// Добавление CSS-стилей для фильтрации
function addFilterStyles() {
  if (document.getElementById("filter-dynamic-styles")) return;

  const style = document.createElement("style");
  style.id = "filter-dynamic-styles";
  style.textContent = `
        .reset-filters-btn {
            width: 100%;
            padding: 15px;
            margin-top: 20px;
            background: #000;
            color: #fff;
            border: none;
            cursor: pointer;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: opacity 0.3s;
        }
        
        .no-products {
            text-align: center;
            font-size: 28px;
            padding: 40px;
            width: 100%;
            grid-column: 1 / -1;
        }
        
        /* Стили для цветных фильтров */
        .color-filter-options {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        
        .color-filter-option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px !important;
            border: 2px solid transparent !important;
            border-radius: 30px !important;
            transition: all 0.2s ease !important;
            position: relative;
        }
        
        .color-filter-option:hover {
            background-color: rgba(79, 62, 53, 0.1) !important;
            border-color: #4f3e35 !important;
            padding-left: 12px !important;
        }
        
        .color-filter-option.active {
            background-color: rgba(79, 62, 53, 0.15) !important;
            border-color: #4f3e35 !important;
        }
        
        .color-dot-filter {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid #4f3e35;
            transition: transform 0.2s ease;
        }
        
        .color-filter-option:hover .color-dot-filter {
            transform: scale(1.1);
        }
        
        .color-name {
            font-family: "Arial", sans-serif;
            font-size: 16px;
            color: #4f3e35;
            flex: 1;
        }
        
        .check-mark {
            color: #4f3e35;
            font-weight: bold;
            font-size: 18px;
            margin-left: auto;
        }
        
        @media (max-width: 768px) {
            .color-filter-options {
                grid-template-columns: 1fr;
            }
            
            .color-dot-filter {
                width: 20px;
                height: 20px;
            }
            
            .color-name {
                font-size: 14px;
            }
        }
    `;
  document.head.appendChild(style);
}

// Переключение избранного
window.toggleFavorite = function (gender, id, button) {
  const favoriteKey = `favorite_${gender}_${id}`;
  const isFavorite = localStorage.getItem(favoriteKey) === "true";

  localStorage.setItem(favoriteKey, !isFavorite);
  button.classList.toggle("active");

  // Находим название товара
  const productCard = button.closest(".product-item");
  const productName = productCard ? productCard.dataset.productName : "Товар";

  // Показываем уведомление
  showNotification(
    !isFavorite
      ? `"${productName}" добавлен в избранное`
      : `"${productName}" удален из избранного`,
    !isFavorite ? "success" : "warning",
  );
};

// ========== НОВЫЕ ФУНКЦИИ ДЛЯ ЦВЕТНЫХ ФИЛЬТРОВ ==========

// Получение всех уникальных цветов из товаров текущей категории
function getAllColorsFromProducts() {
  if (!productsData[currentCategory]) return [];

  const allColors = [];
  productsData[currentCategory].forEach((product) => {
    product.colors.forEach((color) => {
      if (!allColors.includes(color)) {
        allColors.push(color);
      }
    });
  });
  return allColors;
}

// Функция для отображения цветных фильтров (со всеми цветами)
function renderColorFilters() {
  const colorFilterContainer = document.getElementById("colorFilterOptions");
  if (!colorFilterContainer) return;

  // Словарь для преобразования HEX в названия цветов
  const colorNames = {
    // Черные оттенки
    "#000000": "Черный",
    "#2B2929": "Черный",

    // Белые оттенки
    "#FFFFFF": "Белый",
    "#F0EEE3": "Белый",
    "#ECF1FF": "Белый",

    // Серые оттенки
    "#B5BFBE": "Серый",
    "#C5CBCC": "Серый",
    "#66676E": "Серый",
    "#424142": "Серый",
    "#827D6D": "Серый",

    // Бежевые оттенки
    "#C8AC8E": "Бежевый",
    "#C7BBAC": "Бежевый",
    "#F4DECA": "Бежевый",
    "#B4A98F": "Бежевый",
    "#D1C8B9": "Бежевый",

    // Коричневые оттенки
    "#604837": "Коричневый",
    "#744737": "Коричневый",
    "#624134": "Коричневый",
    "#B48362": "Коричневый",
    "#6A5E4D": "Коричневый",
    "#945431": "Коричневый",
    "#766151": "Коричневый",

    // Синие оттенки
    "#455972": "Синий",
    "#003A57": "Синий",
    "#004F91": "Синий",
    "#41424B": "Синий",
    "#8E91AA": "Синий",

    // Голубые оттенки
    "#6B9EA7": "Голубой",
    "#57ABD6": "Голубой",
    "#A6BCCE": "Голубой",
    "#95BCC4": "Голубой",
    "#7FA2AA": "Голубой",

    // Розовые оттенки
    "#BE7E7C": "Розовый",

    // Красные оттенки
    "#983926": "Красный",
  };

  // Полный список всех цветов (даже если их нет в текущей категории)
  const allColorGroups = {
    Черный: ["#000000", "#2B2929"],
    Белый: ["#FFFFFF", "#F0EEE3", "#ECF1FF"],
    Серый: ["#B5BFBE", "#C5CBCC", "#66676E", "#424142", "#827D6D"],
    Бежевый: ["#C8AC8E", "#C7BBAC", "#F4DECA", "#B4A98F", "#D1C8B9"],
    Коричневый: [
      "#604837",
      "#744737",
      "#624134",
      "#B48362",
      "#6A5E4D",
      "#945431",
      "#766151",
    ],
    Синий: ["#455972", "#003A57", "#004F91", "#41424B", "#8E91AA"],
    Голубой: ["#6B9EA7", "#57ABD6", "#A6BCCE", "#95BCC4", "#7FA2AA"],
    Розовый: ["#BE7E7C"],
    Красный: ["#983926"],
  };

  // Сортируем названия цветов в нужном порядке
  const colorOrder = [
    "Черный",
    "Белый",
    "Серый",
    "Бежевый",
    "Коричневый",
    "Синий",
    "Голубой",
    "Розовый",
    "Красный",
  ];

  colorFilterContainer.innerHTML = "";

  // Создаем элементы для каждой цветовой группы
  colorOrder.forEach((colorName) => {
    const colorHexes = allColorGroups[colorName];
    if (!colorHexes) return;

    // Берем первый HEX для отображения
    const mainColor = colorHexes[0];

    // Проверяем, активен ли этот цвет (если хотя бы один из его оттенков выбран)
    const isActive = activeFilters.color.some((color) =>
      colorHexes.includes(color),
    );

    const optionDiv = document.createElement("div");
    optionDiv.className = `filter-option color-filter-option ${isActive ? "active selected" : ""}`;
    optionDiv.setAttribute("data-filter-type", "color");
    optionDiv.setAttribute("data-value", mainColor);
    optionDiv.setAttribute("title", colorName);

    // Добавляем все HEX-коды этой группы как data-атрибут для фильтрации
    optionDiv.setAttribute("data-color-hexes", colorHexes.join(","));

    // Создаем кружок
    const dotSpan = document.createElement("span");
    dotSpan.className = "color-dot-filter";
    dotSpan.style.backgroundColor = mainColor;

    // Создаем название
    const nameSpan = document.createElement("span");
    nameSpan.className = "color-name";
    nameSpan.textContent = colorName;

    optionDiv.appendChild(dotSpan);
    optionDiv.appendChild(nameSpan);

    if (isActive) {
      const checkMark = document.createElement("span");
      checkMark.className = "check-mark";
      checkMark.textContent = "✓";
      optionDiv.appendChild(checkMark);
    }

    colorFilterContainer.appendChild(optionDiv);
  });

  // Добавляем обработчики для новых цветных фильтров
  initColorFilterHandlers();
}

// Обновленная функция обработчика для цветных фильтров
function initColorFilterHandlers() {
  document.querySelectorAll(".color-filter-option").forEach((option) => {
    option.removeEventListener("click", option.colorClickHandler);

    option.colorClickHandler = function (e) {
      e.stopPropagation();
      const filterType = this.getAttribute("data-filter-type");
      const value = this.getAttribute("data-value");
      const colorHexes = this.getAttribute("data-color-hexes")?.split(",") || [
        value,
      ];

      if (filterType && value) {
        // Переключаем активный класс
        this.classList.toggle("active");
        // this.classList.toggle("selected");

        // Добавляем или убираем галочку
        const checkMark = this.querySelector(".check-mark");
        if (this.classList.contains("active")) {
          if (!checkMark) {
            const mark = document.createElement("span");
            mark.className = "check-mark";
            mark.textContent = "✓";
            this.appendChild(mark);
          }

          // Добавляем все HEX-коды этой группы в активные фильтры
          colorHexes.forEach((hex) => {
            if (!activeFilters[filterType].includes(hex)) {
              activeFilters[filterType].push(hex);
            }
          });
        } else {
          if (checkMark) checkMark.remove();

          // Удаляем все HEX-коды этой группы из активных фильтров
          activeFilters[filterType] = activeFilters[filterType].filter(
            (color) => !colorHexes.includes(color),
          );
        }

        paginationState.currentPage = 1;
        filterProducts();
      }
    };

    option.addEventListener("click", option.colorClickHandler);
  });
}

// ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ КАТАЛОГА
function loadCatalog() {
  console.log("=== НАЧАЛО ЗАГРУЗКИ КАТАЛОГА ===");
  
  const path = window.location.pathname;
  currentCategory = path.includes("catalog-wom.html") ? "women" : "men";
  
  loadPaginationSettings();
  
  if (window.productsData && window.productsData[currentCategory]) {
    refreshCatalog();
  } else {
    // Ждем загрузки данных
    document.addEventListener('productsLoaded', refreshCatalog);
  }
  
  initFilterSections();
  initFilterHandlers();
  addResetButton();
  initFilterToggle();
  initProductCards();
  
  console.log("=== ЗАГРУЗКА КАТАЛОГА ЗАВЕРШЕНА ===");
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM загружен, запускаем каталог");
  addFilterStyles();
  loadCatalog();
});
