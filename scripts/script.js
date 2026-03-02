// script.js

// Бургер меню
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const burgerMenu = document.querySelector(".burger-menu");
  const burgerOverlay = document.querySelector(".burger-overlay");
  const burgerClose = document.querySelector(".burger-close");
  const firstSection = document.querySelector(".burger-section:first-child");
  const sectionHeader = document.querySelector(
    ".burger-section:first-child .section-header",
  );
  const sectionContent = document.querySelector(
    ".burger-section:first-child .section-content",
  );

  // Открытие меню
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      burgerMenu.classList.add("active");
      burgerOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  // Закрытие меню
  function closeMenu() {
    burgerMenu.classList.remove("active");
    burgerOverlay.classList.remove("active");
    document.body.style.overflow = "";

    // Закрываем подразделы и убираем активный класс с секции
    if (sectionContent && sectionContent.classList.contains("active")) {
      sectionContent.classList.remove("active");
      if (firstSection) {
        firstSection.classList.remove("active");
      }
    }
  }

  if (burgerClose) {
    burgerClose.addEventListener("click", closeMenu);
  }

  if (burgerOverlay) {
    burgerOverlay.addEventListener("click", closeMenu);
  }

  // Открытие подразделов для первого раздела
  if (sectionHeader && sectionContent && firstSection) {
    sectionHeader.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Открываем/закрываем
      sectionContent.classList.toggle("active");
      firstSection.classList.toggle("active"); // Для показа крестика
    });
  }

  // Обработка кликов для секций-ссылок
  const linkSections = document.querySelectorAll(
    ".burger-section:not(:first-child) .section-header",
  );
  linkSections.forEach((header) => {
    header.addEventListener("click", function (e) {
      const sectionName = this.querySelector("span").textContent.toLowerCase();
      console.log("Переход на страницу:", sectionName);
      // Раскомментируйте для реального перехода
      // window.location.href = sectionName + '.html';
    });
  });
});

// ДЛЯ КАТАЛОГА - ФИЛЬТР БУРГЕР
document.addEventListener("DOMContentLoaded", function () {
  const filterToggle = document.getElementById("filterToggle");
  const filterMenu = document.querySelector(".filter-menu");
  const filterOverlay = document.querySelector(".filter-overlay");
  const filterClose = document.querySelector(".filter-close");

  // Открытие фильтра
  if (filterToggle) {
    filterToggle.addEventListener("click", function () {
      filterMenu.classList.add("active");
      filterOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  // Закрытие фильтра
  function closeFilter() {
    filterMenu.classList.remove("active");
    filterOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (filterClose) {
    filterClose.addEventListener("click", closeFilter);
  }

  if (filterOverlay) {
    filterOverlay.addEventListener("click", closeFilter);
  }

  // Открытие/закрытие секций фильтра
  const filterSections = document.querySelectorAll(".filter-section");

  filterSections.forEach((section) => {
    const header = section.querySelector(".filter-section-header");
    const content = section.querySelector(".filter-section-content");
    const arrow = header.querySelector(".filter-section-arrow");

    if (header && content && arrow) {
      header.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Открываем/закрываем текущую секцию
        content.classList.toggle("active");

        // Меняем стрелку
        if (content.classList.contains("active")) {
          arrow.textContent = "×";
        } else {
          arrow.textContent = "=";
        }
      });
    }
  });

  // Выбор опций фильтра
  const filterOptions = document.querySelectorAll(".filter-option");

  filterOptions.forEach((option) => {
    option.addEventListener("click", function () {
      this.classList.toggle("selected");
    });
  });
});

// Обработка избранного в карточках товаров (устаревшая версия, оставлена для совместимости)
document.addEventListener("DOMContentLoaded", function () {
  const favoriteButtons = document.querySelectorAll(".product-favorite");

  favoriteButtons.forEach((button) => {
    const productCard = button.closest(".product-item");
    if (!productCard) return;

    const productName =
      productCard.querySelector("h3")?.textContent ||
      productCard.querySelector(".product-desc")?.previousElementSibling
        ?.textContent;

    if (productName) {
      // Проверяем, есть ли сохраненное состояние в localStorage
      const isFavorite =
        localStorage.getItem("favorite_" + productName) === "true";

      if (isFavorite) {
        button.classList.add("active");
      }
    }

    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Добавляем класс для анимации увеличения
      this.classList.add("pulse");

      // Убираем класс анимации через 200ms
      setTimeout(() => {
        this.classList.remove("pulse");
      }, 200);

      // Переключаем активное состояние
      this.classList.toggle("active");

      // Сохраняем состояние в localStorage
      if (productName) {
        localStorage.setItem(
          "favorite_" + productName,
          this.classList.contains("active"),
        );
      }
    });
  });
});

// Глобальная функция для переключения избранного
window.toggleFavorite = function (gender, productId, button) {
  // Создаем уникальный ключ
  const favoriteKey = `favorite_${gender}_${productId}`;

  // Получаем текущее состояние
  const isFavorite = localStorage.getItem(favoriteKey) === "true";

  // Переключаем состояние
  localStorage.setItem(favoriteKey, !isFavorite);

  // Обновляем класс кнопки
  button.classList.toggle("active");

  // Добавляем анимацию
  button.classList.add("pulse");
  setTimeout(() => {
    button.classList.remove("pulse");
  }, 200);

  console.log(
    `Товар ${gender}_${productId} теперь ${!isFavorite ? "в" : "не в"} избранном`,
  );

  // Если мы на странице избранного, обновляем её
  if (window.location.pathname.includes("favorites.html")) {
    // Перезагружаем страницу избранного
    location.reload();
  }
};

function showNotification(message, type = "info") {
  // Создаем элемент уведомления
  const notification = document.createElement("div");
  notification.className = `cart-notification ${type}`;
  notification.textContent = message;

  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${type === "success" ? "#4F3E35" : "#2C3E50"};
        color: #DFD8CB;
        padding: 15px 25px;
        border-radius: 30px;
        font-family: 'Georgia', serif;
        font-size: 16px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        border-left: 4px solid ${type === "success" ? "#81c784" : "#ef5350"};
    `;

  document.body.appendChild(notification);

  // Добавляем анимацию появления
  const style = document.createElement("style");
  style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
  document.head.appendChild(style);

  // Удаляем через 3 секунды
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}