// admin.js

// Глобальные переменные для хранения данных
let allProducts = [];
let allOrders = [];

document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin panel initialized");

  // Загружаем данные
  loadProducts();
  loadOrders();

  // Инициализация вкладок
  initTabs();

  // Инициализация поиска и фильтров
  initFilters();

  // Инициализация формы добавления товара
  initAddProductForm();
});

// account.js - добавьте этот код

document.addEventListener("DOMContentLoaded", function () {
  // Переключение вкладок
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPanes = document.querySelectorAll(".tab-pane");

  function switchTab(tabId) {
    // Скрываем все панели и убираем активный класс у кнопок
    tabPanes.forEach((pane) => pane.classList.remove("active"));
    tabButtons.forEach((button) => button.classList.remove("active"));

    // Показываем нужную панель
    const activePane = document.getElementById(tabId);
    if (activePane) {
      activePane.classList.add("active");
    }

    // Активируем соответствующую кнопку
    const activeButton = document.querySelector(
      `.tab-button[data-tab="${tabId.replace("-tab", "")}"]`,
    );
    if (activeButton) {
      activeButton.classList.add("active");
    }
  }

  // Добавляем обработчики на кнопки
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabName = this.dataset.tab; // 'profile', 'orders', 'settings'
      switchTab(tabName + "-tab");
    });
  });
});

// Инициализация вкладок
function initTabs() {
  const tabButtons = document.querySelectorAll(".admin-tabs .tab-button");
  const tabPanes = document.querySelectorAll(".tab-pane");

  window.switchTab = function (tabId) {
    // Скрываем все панели и убираем активный класс у кнопок
    tabPanes.forEach((pane) => pane.classList.remove("active"));
    tabButtons.forEach((button) => button.classList.remove("active"));

    // Показываем нужную панель и активируем кнопку
    const activePane = document.getElementById(tabId);
    const activeButton = document.querySelector(
      `.admin-tabs .tab-button[data-tab="${tabId.replace("-tab", "")}"]`,
    );

    if (activePane) activePane.classList.add("active");
    if (activeButton) activeButton.classList.add("active");

    // Обновляем данные при переключении на определенные вкладки
    if (tabId === "stats-tab") {
      updateStatistics();
    } else if (tabId === "orders-tab") {
      renderOrders();
    } else if (tabId === "products-tab") {
      renderProductsTable();
    }
  };

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabName = this.dataset.tab;
      window.switchTab(tabName + "-tab");
    });
  });
}

// Переключение на вкладку добавления товара
window.switchToAddProductTab = function () {
  window.switchTab("add-product-tab");
};

// ЗАГРУЗКА ДАННЫХ
function loadProducts() {
  // Объединяем товары из мужской и женской категорий
  allProducts = [];

  if (typeof productsData !== "undefined") {
    if (productsData.men) {
      allProducts = allProducts.concat(
        productsData.men.map((p) => ({ ...p, gender: "men" })),
      );
    }
    if (productsData.women) {
      allProducts = allProducts.concat(
        productsData.women.map((p) => ({ ...p, gender: "women" })),
      );
    }
  }

  // Добавляем поле stock (количество на складе), если его нет
  allProducts = allProducts.map((p) => ({
    ...p,
    stock: p.stock || Math.floor(Math.random() * 20) + 5, // Случайное количество для демо
  }));

  console.log("Загружено товаров:", allProducts.length);
  updateStatistics();
}

function loadOrders() {
  // Загружаем заказы из localStorage
  const savedOrders = localStorage.getItem("adminOrders");

  if (savedOrders) {
    allOrders = JSON.parse(savedOrders);
  } else {
    // Создаем демо-заказы для примера
    allOrders = [
      {
        id: "ORD-2024-001",
        date: "2024-05-15T10:30:00",
        customer: "Иванов Александр",
        phone: "+7 (999) 123-45-67",
        email: "alex@example.com",
        address: "г. Москва, ул. Тверская, д. 1, кв. 1",
        items: [
          {
            name: "Худи Stratum",
            quantity: 1,
            price: 12000,
            size: "M",
            color: "#66676E",
          },
          {
            name: "Брюки Stratum",
            quantity: 1,
            price: 19000,
            size: "L",
            color: "#C7BBAC",
          },
        ],
        subtotal: 31000,
        deliveryPrice: 0,
        total: 31000,
        status: "delivered",
        paymentMethod: "Картой онлайн",
      },
      {
        id: "ORD-2024-002",
        date: "2024-05-20T14:45:00",
        customer: "Петрова Анна",
        phone: "+7 (999) 765-43-21",
        email: "anna@example.com",
        address: "г. Санкт-Петербург, Невский пр., д. 10, кв. 5",
        items: [
          {
            name: "Платье с драпировкой",
            quantity: 1,
            price: 17000,
            size: "S",
            color: "#C7BBAC",
          },
        ],
        subtotal: 17000,
        deliveryPrice: 300,
        total: 17300,
        status: "processing",
        paymentMethod: "Наличными при получении",
      },
      {
        id: "ORD-2024-003",
        date: "2024-05-22T09:15:00",
        customer: "Смирнов Дмитрий",
        phone: "+7 (999) 111-22-33",
        email: "dmitry@example.com",
        address: "г. Казань, ул. Баумана, д. 15",
        items: [
          {
            name: "Джемпер из шелка и хлопка",
            quantity: 2,
            price: 11000,
            size: "M",
            color: "#827D6D",
          },
          {
            name: "Футболка Shimmer",
            quantity: 1,
            price: 7000,
            size: "L",
            color: "#624134",
          },
        ],
        subtotal: 29000,
        deliveryPrice: 0,
        total: 29000,
        status: "new",
        paymentMethod: "Картой курьеру",
      },
    ];
    saveOrders();
  }

  renderOrders();
}

function saveOrders() {
  localStorage.setItem("adminOrders", JSON.stringify(allOrders));
}

// СТАТИСТИКА
function updateStatistics() {
  // Общая статистика
  document.getElementById("totalProducts").textContent = allProducts.length;

  const menProducts = allProducts.filter((p) => p.gender === "men").length;
  const womenProducts = allProducts.filter((p) => p.gender === "women").length;

  document.getElementById("totalMenProducts").textContent = menProducts;
  document.getElementById("totalWomenProducts").textContent = womenProducts;

  // Общий запас (сумма stock)
  const totalStock = allProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
  document.getElementById("totalStock").textContent = totalStock;

  // Статистика по категориям
  const categoryStats = {};
  allProducts.forEach((p) => {
    const cat = p.category || "Одежда";
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });

  const categoryStatsHtml = Object.entries(categoryStats)
    .map(([cat, count]) => {
      const percent = Math.round((count / allProducts.length) * 100);
      return `
                <div class="stat-bar-item">
                    <span class="stat-bar-label">${cat}</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar-fill" style="width: ${percent}%">${percent}%</div>
                    </div>
                    <span class="stat-bar-count">${count}</span>
                </div>
            `;
    })
    .join("");

  document.getElementById("categoryStats").innerHTML = categoryStatsHtml;

  // Статистика по размерам
  const sizeStats = {};
  allProducts.forEach((p) => {
    if (p.size && Array.isArray(p.size)) {
      p.size.forEach((s) => {
        sizeStats[s] = (sizeStats[s] || 0) + 1;
      });
    }
  });

  const sortedSizes = Object.entries(sizeStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const sizeStatsHtml = sortedSizes
    .map(([size, count]) => {
      const percent = Math.round((count / allProducts.length) * 100);
      return `
                <div class="stat-bar-item">
                    <span class="stat-bar-label">Размер ${size}</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar-fill" style="width: ${percent}%">${percent}%</div>
                    </div>
                    <span class="stat-bar-count">${count}</span>
                </div>
            `;
    })
    .join("");

  document.getElementById("sizeStats").innerHTML = sizeStatsHtml;
}

// ОТОБРАЖЕНИЕ ЗАКАЗОВ
function renderOrders() {
  const ordersList = document.getElementById("adminOrdersList");
  const filter = document.getElementById("orderStatusFilter")?.value || "all";

  if (!ordersList) return;

  let filteredOrders = allOrders;
  if (filter !== "all") {
    filteredOrders = allOrders.filter((o) => o.status === filter);
  }

  if (filteredOrders.length === 0) {
    ordersList.innerHTML = '<p class="loading-message">Заказы не найдены</p>';
    return;
  }

  // Сортируем по дате (новые сверху)
  filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

  const statusLabels = {
    new: "Новый",
    processing: "В обработке",
    delivered: "Доставлен",
    cancelled: "Отменён",
  };

  const ordersHtml = filteredOrders
    .map((order) => {
      const date = new Date(order.date).toLocaleDateString("ru-RU");
      const statusClass = order.status;

      const itemsHtml = order.items
        .map(
          (item) => `
            <div class="order-product">
                <div class="order-product-info">
                    <p class="order-product-name">${item.name} (${item.size}, ${item.quantity} шт.)</p>
                    <p class="order-product-price">${formatPrice(item.price * item.quantity)} ₽</p>
                </div>
            </div>
        `,
        )
        .join("");

      return `
            <div class="order-item" data-order-id="${order.id}">
                <div class="order-header">
                    <span class="order-number">${order.id}</span>
                    <span class="order-date">${date}</span>
                    <span class="order-status ${statusClass}">${statusLabels[order.status]}</span>
                    <select class="order-status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                        <option value="new" ${order.status === "new" ? "selected" : ""}>Новый</option>
                        <option value="processing" ${order.status === "processing" ? "selected" : ""}>В обработке</option>
                        <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Доставлен</option>
                        <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Отменён</option>
                    </select>
                </div>
                <div class="order-customer">
                    <p><strong>${order.customer}</strong> | ${order.phone} | ${order.email}</p>
                    <p>Адрес: ${order.address}</p>
                </div>
                <div class="order-products">
                    ${itemsHtml}
                </div>
                <div class="order-footer">
                    <span class="order-total">Итого: <span class="total-price">${formatPrice(order.total)} ₽</span></span>
                    <span class="payment-method">Оплата: ${order.paymentMethod}</span>
                </div>
            </div>
        `;
    })
    .join("");

  ordersList.innerHTML = ordersHtml;

  // Добавляем обработчик для фильтра
  const filterSelect = document.getElementById("orderStatusFilter");
  if (filterSelect) {
    filterSelect.onchange = renderOrders;
  }
}

// Обновление статуса заказа
window.updateOrderStatus = function (orderId, newStatus) {
  const order = allOrders.find((o) => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveOrders();
    renderOrders();

    if (typeof showNotification === "function") {
      showNotification(`Статус заказа ${orderId} обновлен`, "success");
    }
  }
};

// ОТОБРАЖЕНИЕ ТАБЛИЦЫ ТОВАРОВ
function renderProductsTable() {
  const tbody = document.getElementById("productsTableBody");
  const searchTerm =
    document.getElementById("productSearch")?.value.toLowerCase() || "";
  const genderFilter =
    document.getElementById("productGenderFilter")?.value || "all";

  if (!tbody) return;

  let filteredProducts = [...allProducts];

  // Применяем фильтры
  if (searchTerm) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(searchTerm),
    );
  }

  if (genderFilter !== "all") {
    filteredProducts = filteredProducts.filter(
      (p) => p.gender === genderFilter,
    );
  }

  if (filteredProducts.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" style="text-align: center; padding: 40px;">Товары не найдены</td></tr>';
    return;
  }

  const rowsHtml = filteredProducts
    .map((product) => {
      const sizesHtml = product.size
        .map((s) => `<span class="sizes-badge">${s}</span>`)
        .join("");

      const colorsHtml = product.colors
        .map(
          (color) =>
            `<span class="admin-color-dot" style="background-color: ${color};" title="${color}"></span>`,
        )
        .join("");

      return `
            <tr data-product-id="${product.gender}_${product.id}">
                <td>${product.id}</td>
                <td><img src="${product.images[0]}" alt="${product.name}" class="product-thumb"></td>
                <td><strong>${product.name}</strong></td>
                <td>${product.gender === "men" ? "Мужская" : "Женская"}</td>
                <td>${formatPrice(product.price)} ₽</td>
                <td>${sizesHtml}</td>
                <td><div class="color-dots">${colorsHtml}</div></td>
                <td>${product.stock || 0} шт.</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="editProduct('${product.gender}', ${product.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="updateStock('${product.gender}', ${product.id})" title="Изменить запас">
                            <i class="fas fa-boxes"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteProduct('${product.gender}', ${product.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");

  tbody.innerHTML = rowsHtml;
}

// Инициализация фильтров для товаров
function initFilters() {
  const searchInput = document.getElementById("productSearch");
  const genderFilter = document.getElementById("productGenderFilter");

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce(() => {
        renderProductsTable();
      }, 300),
    );
  }

  if (genderFilter) {
    genderFilter.addEventListener("change", renderProductsTable);
  }
}

// Действия с товарами
window.editProduct = function (gender, id) {
  alert(
    `Редактирование товара: ${gender}_${id}\nЭта функция будет доступна в следующей версии.`,
  );
};

window.updateStock = function (gender, id) {
  const product = allProducts.find((p) => p.gender === gender && p.id === id);
  if (!product) return;

  const newStock = prompt(
    `Введите новое количество на складе для товара "${product.name}" (текущий запас: ${product.stock} шт.):`,
    product.stock,
  );

  if (newStock !== null) {
    const stockNum = parseInt(newStock);
    if (!isNaN(stockNum) && stockNum >= 0) {
      product.stock = stockNum;

      // Обновляем в productsData (для совместимости)
      if (gender === "men" && productsData.men) {
        const idx = productsData.men.findIndex((p) => p.id === id);
        if (idx !== -1) productsData.men[idx].stock = stockNum;
      } else if (gender === "women" && productsData.women) {
        const idx = productsData.women.findIndex((p) => p.id === id);
        if (idx !== -1) productsData.women[idx].stock = stockNum;
      }

      renderProductsTable();
      updateStatistics();

      if (typeof showNotification === "function") {
        showNotification(`Запас товара "${product.name}" обновлен`, "success");
      }
    } else {
      alert("Пожалуйста, введите корректное число");
    }
  }
};

window.deleteProduct = function (gender, id) {
  if (
    confirm(
      "Вы уверены, что хотите удалить этот товар? Это действие необратимо.",
    )
  ) {
    // Удаляем из allProducts
    const index = allProducts.findIndex(
      (p) => p.gender === gender && p.id === id,
    );
    if (index !== -1) {
      const productName = allProducts[index].name;
      allProducts.splice(index, 1);

      // Удаляем из productsData
      if (gender === "men" && productsData.men) {
        productsData.men = productsData.men.filter((p) => p.id !== id);
      } else if (gender === "women" && productsData.women) {
        productsData.women = productsData.women.filter((p) => p.id !== id);
      }

      renderProductsTable();
      updateStatistics();

      if (typeof showNotification === "function") {
        showNotification(`Товар "${productName}" удален`, "warning");
      }
    }
  }
};

// ФОРМА ДОБАВЛЕНИЯ ТОВАРА
function initAddProductForm() {
  const form = document.getElementById("addProductForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Собираем данные из формы
    const gender = document.getElementById("productGender").value;
    const category = document.getElementById("productCategory").value;
    const name = document.getElementById("productName").value;
    const price = parseInt(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value);
    const sizes = document
      .getElementById("productSizes")
      .value.split(",")
      .map((s) => s.trim());
    const colors = document
      .getElementById("productColors")
      .value.split(",")
      .map((c) => c.trim());
    const season = document
      .getElementById("productSeason")
      .value.split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    const image = document.getElementById("productImage").value;
    const description = document.getElementById("productDescription").value;

    // Валидация
    if (
      !gender ||
      !name ||
      !price ||
      !sizes.length ||
      !colors.length ||
      !image
    ) {
      showFormMessage("Пожалуйста, заполните все обязательные поля", "error");
      return;
    }

    // Создаем новый ID (максимальный ID в категории + 1)
    let newId = 1;
    if (gender === "men" && productsData.men && productsData.men.length > 0) {
      newId = Math.max(...productsData.men.map((p) => p.id)) + 1;
    } else if (
      gender === "women" &&
      productsData.women &&
      productsData.women.length > 0
    ) {
      newId = Math.max(...productsData.women.map((p) => p.id)) + 1;
    }

    // Создаем новый товар
    const newProduct = {
      id: newId,
      name: name,
      price: price,
      image: image,
      colors: colors,
      category: category,
      size: sizes,
      season: season.length ? season : ["Весна", "Лето"],
      gender: gender,
      description:
        description ||
        "Премиальный материал и продуманный силуэт для комфортной посадки.",
      rating: 4.8,
      stock: stock,
    };

    // Добавляем в productsData
    if (gender === "men") {
      if (!productsData.men) productsData.men = [];
      productsData.men.push(newProduct);
    } else {
      if (!productsData.women) productsData.women = [];
      productsData.women.push(newProduct);
    }

    // Обновляем allProducts
    allProducts.push({ ...newProduct, gender: gender });

    // Показываем сообщение об успехе
    showFormMessage(`Товар "${name}" успешно добавлен!`, "success");

    // Сбрасываем форму
    form.reset();

    // Обновляем статистику и таблицу товаров
    updateStatistics();

    // Переключаемся на вкладку с товарами через 1.5 секунды
    setTimeout(() => {
      window.switchTab("products-tab");
    }, 1500);
  });
}

window.resetAddProductForm = function () {
  document.getElementById("addProductForm").reset();
  document.getElementById("formMessage").innerHTML = "";
};

function showFormMessage(message, type) {
  const messageEl = document.getElementById("formMessage");
  messageEl.innerHTML = message;
  messageEl.className = `form-message ${type}`;

  // Автоматически скрываем через 5 секунд
  setTimeout(() => {
    messageEl.innerHTML = "";
    messageEl.className = "form-message";
  }, 5000);
}

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function debounce(func, wait) {
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
