// favorites.js

// Функция для форматирования цены
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Получение избранных товаров из localStorage
function getFavorites() {
  const favorites = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("favorite_")) {
      const isFavorite = localStorage.getItem(key) === "true";
      if (isFavorite) {
        // Парсим ключ: favorite_gender_id
        const parts = key.split("_");
        if (parts.length === 3) {
          const gender = parts[1];
          const id = parseInt(parts[2]);
          favorites.push({ gender, id });
        }
      }
    }
  }
  return favorites;
}

// Получение полных данных товара по полу и ID
function findProductById(gender, id) {
  if (!productsData[gender]) return undefined;
  return productsData[gender].find((product) => product.id === id);
}

// Создание HTML карточки для избранного
function createFavoriteCard(product) {
  const colorDots = product.colors
    .map(
      (color) =>
        `<span class="favorite-color-dot" style="background-color: ${color};"></span>`,
    )
    .join("");

  const formattedPrice = formatPrice(product.price);

  return `
        <div class="favorite-item" data-gender="${product.gender}" data-id="${product.id}">
            <div class="favorite-item-image-wrapper">
                <img src="${product.images[0]}" alt="${product.name}" class="favorite-item-image">
                <button class="favorite-remove" onclick="removeFromFavorites('${product.gender}', ${product.id})">×</button>
            </div>
            <div class="favorite-item-info">
                <h3>${product.name}</h3>
                <div class="favorite-price-colors-row">
                    <p class="favorite-price">${formattedPrice} ₽</p>
                    <div class="favorite-colors">
                        ${colorDots}
                    </div>
                </div>
                <button class="favorite-add-to-cart" onclick="addToCartFav('${product.gender}', ${product.id})">
                    Добавить в корзину
                </button>
            </div>
        </div>
    `;
}

// Отображение избранных товаров
function displayFavorites() {
  const favoritesGrid = document.getElementById("favoritesGrid");
  const favoritesEmpty = document.getElementById("favoritesEmpty");

  if (!favoritesGrid) return;

  const favoriteItems = getFavorites();

  if (favoriteItems.length === 0) {
    // Показываем пустое состояние
    favoritesGrid.style.display = "none";
    if (favoritesEmpty) {
      favoritesEmpty.style.display = "block";
    }
    return;
  }

  // Скрываем пустое состояние, показываем сетку
  favoritesGrid.style.display = "grid";
  if (favoritesEmpty) {
    favoritesEmpty.style.display = "none";
  }

  // Находим полные данные для каждого избранного товара
  const favoriteProducts = favoriteItems
    .map((item) => findProductById(item.gender, item.id))
    .filter((product) => product !== undefined);

  // Отображаем товары
  favoritesGrid.innerHTML = favoriteProducts
    .map((product) => createFavoriteCard(product))
    .join("");
}

// Удаление из избранного
window.removeFromFavorites = function (gender, id) {
  const favoriteKey = `favorite_${gender}_${id}`;
  localStorage.setItem(favoriteKey, "false");

  // Находим название товара для уведомления
  const product = findProductById(gender, id);
  const productName = product ? product.name : "Товар";

  // Анимация удаления
  const productCard = document.querySelector(
    `.favorite-item[data-gender="${gender}"][data-id="${id}"]`,
  );
  if (productCard) {
    productCard.style.opacity = "0";
    productCard.style.transform = "scale(0.8)";
    productCard.style.transition = "all 0.3s ease";

    setTimeout(() => {
      displayFavorites(); // Перерисовываем после анимации
    }, 300);
  } else {
    displayFavorites();
  }

  // Обновляем состояние кнопки в каталоге (если страница каталога открыта)
  updateCatalogFavoriteButtons(gender, id);

  // Показываем уведомление
  showNotification(`"${productName}" удален из избранного`, "warning");
};

// Обновление кнопок избранного в каталоге
function updateCatalogFavoriteButtons(gender, id) {
  const catalogButtons = document.querySelectorAll(".product-favorite");
  catalogButtons.forEach((button) => {
    const productCard = button.closest(".product-item");
    if (productCard) {
      const cardGender = productCard.dataset.gender;
      const cardId = parseInt(productCard.dataset.id);
      if (cardGender === gender && cardId === id) {
        button.classList.remove("active");
      }
    }
  });
}

// Добавление в корзину из избранного
window.addToCartFav = function (gender, id) {
  const product = findProductById(gender, id);
  if (product) {
    // Для избранного используем первый цвет и первый размер
    const defaultSize = product.size[0] || "M";
    const defaultColor = product.colors[0];

    // Вызываем глобальную функцию addToCart из cart.js
    if (window.addToCart) {
      window.addToCart(gender, id, defaultSize, defaultColor);

      // Анимация кнопки
      const buttons = document.querySelectorAll(
        `.favorite-item[data-gender="${gender}"][data-id="${id}"] .favorite-add-to-cart`,
      );
      buttons.forEach((button) => {
        button.textContent = "Добавлено!";
        button.style.backgroundColor = "#2C3E50";
        setTimeout(() => {
          button.textContent = "Добавить в корзину";
          button.style.backgroundColor = "#4F3E35";
        }, 1000);
      });
    }
  }
};

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  displayFavorites();

  // Добавляем ссылку на страницу избранного в иконку
  const favoriteIcon = document.querySelector(".icon-favorite");
  if (favoriteIcon && !favoriteIcon.querySelector("a")) {
    const img = favoriteIcon.querySelector("img");
    if (img) {
      const link = document.createElement("a");
      link.href = "favorites.html";
      img.parentNode.insertBefore(link, img);
      link.appendChild(img);
    }
  }

  // Слушаем изменения localStorage для синхронизации между вкладками
  window.addEventListener("storage", function (e) {
    if (e.key && e.key.startsWith("favorite_")) {
      if (window.location.pathname.includes("favorites.html")) {
        displayFavorites();
      }
    }
  });
});
