// admin.js

// Глобальные переменные для хранения данных
let allProducts = [];
let allOrders = [];

document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin panel initialized");

  // Загружаем данные
  loadProducts();
  loadOrders();

  // Инициализация
  initTabs();
  initFilters();
  initAddProductForm();

  // Слушаем обновление данных
  document.addEventListener("productsLoaded", function () {
    loadProducts();
    updateStatistics();
    renderProductsTable();
  });
});

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
    tabPanes.forEach((pane) => pane.classList.remove("active"));
    tabButtons.forEach((button) => button.classList.remove("active"));

    const activePane = document.getElementById(tabId);
    const activeButton = document.querySelector(
      `.admin-tabs .tab-button[data-tab="${tabId.replace("-tab", "")}"]`,
    );

    if (activePane) activePane.classList.add("active");
    if (activeButton) activeButton.classList.add("active");

    if (tabId === "stats-tab") {
      updateStatistics();
    } else if (tabId === "orders-tab") {
      renderOrders();
    } else if (tabId === "products-tab") {
      renderProductsTable();
    } else if (tabId === "add-product-tab") {
      resetAddProductForm();
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
// Загрузка товаров
function loadProducts() {
  allProducts = [];

  if (window.productsData) {
    if (window.productsData.men) {
      allProducts = allProducts.concat(
        window.productsData.men.map((p) => ({ ...p, gender: "men" })),
      );
    }
    if (window.productsData.women) {
      allProducts = allProducts.concat(
        window.productsData.women.map((p) => ({ ...p, gender: "women" })),
      );
    }
  }

  allProducts = allProducts.map((p) => ({
    ...p,
    stock: p.stock || Math.floor(Math.random() * 20) + 5,
  }));

  updateStatistics();
}

// Загрузка заказов
function loadOrders() {
  const savedOrders = localStorage.getItem("adminOrders");

  if (savedOrders) {
    allOrders = JSON.parse(savedOrders);
  } else {
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
    ];
    saveOrders();
  }
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

  // Загружаем заказы из localStorage
  loadOrders();

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
                    <p class="order-product-name">${item.name} (${item.size || "?"}, ${item.quantity} шт.)</p>
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
                    <p><strong>${order.customer}</strong> | ${order.phone} | ${order.email || "Нет email"}</p>
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
}



// Обновление статуса заказа
window.updateOrderStatus = function (orderId, newStatus) {
  const order = allOrders.find((o) => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveOrders();
    renderOrders();
    showNotification(`Статус заказа ${orderId} обновлен`, "success");
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
      debounce(() => renderProductsTable(), 300),
    );
  }

  if (genderFilter) {
    genderFilter.addEventListener("change", renderProductsTable);
  }
}

// Редактирование товара
window.editProduct = function (gender, id) {
  const product = allProducts.find((p) => p.gender === gender && p.id === id);
  if (!product) return;

  window.switchTab("add-product-tab");

  document.getElementById("productGender").value = gender;
  document.getElementById("productCategory").value =
    product.category || "Одежда";
  document.getElementById("productName").value = product.name;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productStock").value = product.stock || 10;
  document.getElementById("productSizes").value = product.size.join(", ");
  document.getElementById("productColors").value = product.colors.join(", ");
  document.getElementById("productSeason").value = (product.season || []).join(
    ", ",
  );
  document.getElementById("productImage").value = product.images[0];
  document.getElementById("productDescription").value =
    product.description || "";

  const submitBtn = document.querySelector(
    '#addProductForm button[type="submit"]',
  );
  submitBtn.textContent = "Обновить товар";
  submitBtn.dataset.editMode = "true";
  submitBtn.dataset.editGender = gender;
  submitBtn.dataset.editId = id;
};

// Удаление товара
window.deleteProduct = function (gender, id) {
  if (
    confirm(
      "Вы уверены, что хотите удалить этот товар? Это действие необратимо.",
    )
  ) {
    const index = allProducts.findIndex(
      (p) => p.gender === gender && p.id === id,
    );
    if (index !== -1) {
      const productName = allProducts[index].name;
      allProducts.splice(index, 1);

      // Обновляем localStorage напрямую
      if (gender === "men" && window.productsData.men) {
        window.productsData.men = window.productsData.men.filter(
          (p) => p.id !== id,
        );
      } else if (gender === "women" && window.productsData.women) {
        window.productsData.women = window.productsData.women.filter(
          (p) => p.id !== id,
        );
      }

      // Сохраняем изменения
      if (typeof saveProductsData === "function") {
        saveProductsData();
      }

      renderProductsTable();
      updateStatistics();

      if (typeof showNotification === "function") {
        showNotification(`Товар "${productName}" удален`, "warning");
      } else {
        alert(`Товар "${productName}" удален`);
      }
      loadProducts();
      renderProductsTable();
      updateStatistics();
    }
  }
};

// ФОРМА ДОБАВЛЕНИЯ ТОВАРА
// Инициализация формы добавления
function initAddProductForm() {
  const form = document.getElementById("addProductForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const isEditMode =
      this.querySelector('button[type="submit"]').dataset.editMode === "true";
    const editGender = this.querySelector('button[type="submit"]').dataset
      .editGender;
    const editId = parseInt(
      this.querySelector('button[type="submit"]').dataset.editId,
    );

    const gender = document.getElementById("productGender").value;
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

    const productData = {
      name,
      price,
      stock,
      size: sizes,
      colors,
      season,
      images: [image],
      category: "Одежда",
      description: description || "Премиальный материал...",
      rating: 4.8,
    };

    if (isEditMode) {
      if (
        window.updateProduct &&
        window.updateProduct(editGender, editId, productData)
      ) {
        showFormMessage(`Товар успешно обновлен!`, "success");
      }
    } else {
      if (window.addProduct) {
        window.addProduct(gender, productData);
        showFormMessage(`Товар "${name}" успешно добавлен!`, "success");
      }
    }

    loadProducts();
    updateStatistics();
    resetAddProductForm();

    setTimeout(() => window.switchTab("products-tab"), 1500);
  });
}

// Сброс формы
window.resetAddProductForm = function () {
  document.getElementById("addProductForm").reset();
  document.getElementById("formMessage").innerHTML = "";

  const submitBtn = document.querySelector(
    '#addProductForm button[type="submit"]',
  );
  submitBtn.textContent = "Сохранить товар";
  delete submitBtn.dataset.editMode;
  delete submitBtn.dataset.editGender;
  delete submitBtn.dataset.editId;
};

function showFormMessage(message, type) {
  alert(message);
  // const messageEl = document.getElementById("formMessage");
  // messageEl.innerHTML = message;
  // messageEl.className = `form-message ${type}`;
  setTimeout(() => {
    // messageEl.innerHTML = "";
    // messageEl.className = "form-message";
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

function showNotification(message, type) {
  alert(message); // Простой вариант, можно заменить на кастомные уведомления
}


// ===== НОВАЯ ВКЛАДКА "ЗАЯВКИ" =====

// Загрузка заявок
function loadContactRequests() {
  const savedRequests = localStorage.getItem('contactRequests');
  if (savedRequests) {
    try {
      return JSON.parse(savedRequests);
    } catch (e) {
      console.error('Ошибка загрузки заявок:', e);
      return [];
    }
  }
  return [];
}

// Отображение заявок
function renderContactRequests() {
  const requestsContainer = document.getElementById('contactRequestsList');
  if (!requestsContainer) return;
  
  const requests = loadContactRequests();
  
  if (requests.length === 0) {
    requestsContainer.innerHTML = '<p class="loading-message">Новых заявок нет</p>';
    return;
  }
  
  // Сортируем по дате (новые сверху)
  requests.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const statusLabels = {
    new: 'Новая',
    in_progress: 'В обработке',
    completed: 'Завершена',
    archived: 'В архиве'
  };
  
  const requestsHtml = requests.map(request => {
    const date = new Date(request.date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <div class="request-item" data-request-id="${request.id}" style="
        background-color: rgba(79, 62, 53, 0.02);
        border: 1px solid rgba(79, 62, 53, 0.1);
        border-radius: 20px;
        padding: 25px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 15px;
          border-bottom: 1px dashed rgba(79, 62, 53, 0.2);
          margin-bottom: 15px;
          flex-wrap: wrap;
        ">
          <span style="
            font-family: Georgia;
            font-size: 18px;
            font-weight: bold;
            color: #4f3e35;
          ">${request.id}</span>
          <span style="
            font-family: Arial;
            font-size: 14px;
            color: #4f3e35;
            opacity: 0.7;
          ">${date}</span>
          <span style="
            padding: 5px 15px;
            border-radius: 20px;
            font-family: Arial;
            font-size: 14px;
            font-weight: bold;
            background-color: ${request.status === 'new' ? 'rgba(33, 150, 243, 0.1)' : 
                              request.status === 'in_progress' ? 'rgba(255, 152, 0, 0.1)' : 
                              request.status === 'completed' ? 'rgba(76, 175, 80, 0.1)' : 
                              'rgba(158, 158, 158, 0.1)'};
            color: ${request.status === 'new' ? '#1976d2' : 
                    request.status === 'in_progress' ? '#f57c00' : 
                    request.status === 'completed' ? '#2e7d32' : 
                    '#616161'};
            border: 1px solid ${request.status === 'new' ? '#1976d2' : 
                                request.status === 'in_progress' ? '#f57c00' : 
                                request.status === 'completed' ? '#2e7d32' : 
                                '#616161'};
            margin-left: auto;
          ">${statusLabels[request.status]}</span>
          <select onchange="updateRequestStatus('${request.id}', this.value)" style="
            padding: 8px 15px;
            border: 2px solid #4f3e35;
            background-color: #dfd8cb;
            font-family: Arial;
            font-size: 14px;
            color: #4f3e35;
            border-radius: 20px;
            cursor: pointer;
            outline: none;
          ">
            <option value="new" ${request.status === 'new' ? 'selected' : ''}>Новая</option>
            <option value="in_progress" ${request.status === 'in_progress' ? 'selected' : ''}>В обработке</option>
            <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>Завершена</option>
            <option value="archived" ${request.status === 'archived' ? 'selected' : ''}>В архиве</option>
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p style="
            font-family: Georgia;
            font-size: 18px;
            color: #4f3e35;
            margin-bottom: 5px;
          "><strong>${request.fullname}</strong></p>
          <p style="
            font-family: Arial;
            font-size: 16px;
            color: #4f3e35;
            opacity: 0.8;
            margin-bottom: 3px;
          ">📞 ${request.phone}</p>
          <p style="
            font-family: Arial;
            font-size: 16px;
            color: #4f3e35;
            opacity: 0.8;
            margin-bottom: 3px;
          ">✉️ ${request.email}</p>
        </div>
        
        <div style="
          background-color: rgba(79, 62, 53, 0.03);
          border-radius: 15px;
          padding: 20px;
          margin-top: 10px;
        ">
          <p style="
            font-family: Georgia;
            font-size: 16px;
            color: #4f3e35;
            line-height: 1.5;
            margin: 0;
          ">${request.message}</p>
        </div>
        
        <div style="
          display: flex;
          justify-content: flex-end;
          margin-top: 15px;
        ">
          <button onclick="deleteRequest('${request.id}')" style="
            padding: 8px 20px;
            background: transparent;
            border: 2px solid #c62828;
            color: #c62828;
            font-family: Georgia;
            font-size: 14px;
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.3s ease;
          " onmouseover="this.style.background='#c62828'; this.style.color='white'" 
             onmouseout="this.style.background='transparent'; this.style.color='#c62828'">
            Удалить
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  requestsContainer.innerHTML = requestsHtml;
}

// Обновление статуса заявки
window.updateRequestStatus = function(requestId, newStatus) {
  const requests = loadContactRequests();
  const requestIndex = requests.findIndex(r => r.id === requestId);
  
  if (requestIndex !== -1) {
    requests[requestIndex].status = newStatus;
    localStorage.setItem('contactRequests', JSON.stringify(requests));
    renderContactRequests();
    showNotification('Статус заявки обновлен', 'success');
  }
};

// Удаление заявки
window.deleteRequest = function(requestId) {
  if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
    const requests = loadContactRequests();
    const filteredRequests = requests.filter(r => r.id !== requestId);
    localStorage.setItem('contactRequests', JSON.stringify(filteredRequests));
    renderContactRequests();
    showNotification('Заявка удалена', 'warning');
  }
};

// Добавляем кнопку для новой вкладки в админ-панель
function addRequestsTab() {
  const tabsContainer = document.querySelector('.admin-tabs');
  if (!tabsContainer) return;
  
  // Проверяем, есть ли уже вкладка
  if (document.querySelector('[data-tab="requests"]')) return;
  
  const requestsTab = document.createElement('button');
  requestsTab.className = 'tab-button';
  requestsTab.setAttribute('data-tab', 'requests');
  requestsTab.textContent = 'Заявки';
  
  // Добавляем счетчик новых заявок
  const requests = loadContactRequests();
  const newRequestsCount = requests.filter(r => r.status === 'new').length;
  
  if (newRequestsCount > 0) {
    const badge = document.createElement('span');
    badge.style.cssText = `
      display: inline-block;
      background-color: #c62828;
      color: white;
      border-radius: 50%;
      padding: 2px 8px;
      font-size: 12px;
      margin-left: 8px;
    `;
    badge.textContent = newRequestsCount;
    requestsTab.appendChild(badge);
  }
  
  tabsContainer.appendChild(requestsTab);
  
  // Добавляем контейнер для заявок
  const contentContainer = document.querySelector('.admin-content');
  const requestsPane = document.createElement('div');
  requestsPane.className = 'tab-pane';
  requestsPane.id = 'requests-tab';
  requestsPane.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
      <h2 style="font-family: Georgia; font-size: 32px; color: #4f3e35;">Заявки с сайта</h2>
      <div class="requests-filter">
        <select id="requestsStatusFilter" class="filter-select" onchange="filterRequests()">
          <option value="all">Все заявки</option>
          <option value="new">Новые</option>
          <option value="in_progress">В обработке</option>
          <option value="completed">Завершенные</option>
          <option value="archived">В архиве</option>
        </select>
      </div>
    </div>
    <div id="contactRequestsList" class="requests-list"></div>
  `;
  
  contentContainer.appendChild(requestsPane);
  
  // Добавляем обработчик для вкладки
  requestsTab.addEventListener('click', function() {
    window.switchTab('requests-tab');
    renderContactRequests();
  });
}

// Фильтрация заявок
window.filterRequests = function() {
  const filter = document.getElementById('requestsStatusFilter')?.value || 'all';
  const requests = loadContactRequests();
  
  let filteredRequests = requests;
  if (filter !== 'all') {
    filteredRequests = requests.filter(r => r.status === filter);
  }
  
  // Временно сохраняем отфильтрованные для отображения
  const requestsContainer = document.getElementById('contactRequestsList');
  if (!requestsContainer) return;
  
  if (filteredRequests.length === 0) {
    requestsContainer.innerHTML = '<p class="loading-message">Заявки не найдены</p>';
    return;
  }
  
  // Переиспользуем функцию отображения с фильтром
  const originalRequests = loadContactRequests();
  localStorage.setItem('filteredRequestsTemp', JSON.stringify(filteredRequests));
  renderContactRequests();
  localStorage.removeItem('filteredRequestsTemp');
};

// Модифицируем функцию renderContactRequests для поддержки фильтрации
const originalRender = renderContactRequests;
renderContactRequests = function() {
  const requestsContainer = document.getElementById('contactRequestsList');
  if (!requestsContainer) return;
  
  const filter = document.getElementById('requestsStatusFilter')?.value || 'all';
  let requests = loadContactRequests();
  
  if (filter !== 'all') {
    requests = requests.filter(r => r.status === filter);
  }
  
  if (requests.length === 0) {
    requestsContainer.innerHTML = '<p class="loading-message">Заявки не найдены</p>';
    return;
  }
  
  requests.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const statusLabels = {
    new: 'Новая',
    in_progress: 'В обработке',
    completed: 'Завершена',
    archived: 'В архиве'
  };
  
  const requestsHtml = requests.map(request => {
    const date = new Date(request.date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    debugger;
    
    return `
      <div class="request-item" data-request-id="${request.id}" style="
        background-color: rgba(79, 62, 53, 0.02);
        border: 1px solid rgba(79, 62, 53, 0.1);
        border-radius: 20px;
        padding: 25px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 15px;
          border-bottom: 1px dashed rgba(79, 62, 53, 0.2);
          margin-bottom: 15px;
          flex-wrap: wrap;
        ">
          <span style="
            font-family: Georgia;
            font-size: 18px;
            font-weight: bold;
            color: #4f3e35;
          ">${request.id}</span>
          <span style="
            font-family: Arial;
            font-size: 14px;
            color: #4f3e35;
            opacity: 0.7;
          ">${date}</span>
          <span style="
            padding: 5px 15px;
            border-radius: 20px;
            font-family: Arial;
            font-size: 14px;
            font-weight: bold;
            background-color: ${request.status === 'new' ? 'rgba(33, 150, 243, 0.1)' : 
                              request.status === 'in_progress' ? 'rgba(255, 152, 0, 0.1)' : 
                              request.status === 'completed' ? 'rgba(76, 175, 80, 0.1)' : 
                              'rgba(158, 158, 158, 0.1)'};
            color: ${request.status === 'new' ? '#1976d2' : 
                    request.status === 'in_progress' ? '#f57c00' : 
                    request.status === 'completed' ? '#2e7d32' : 
                    '#616161'};
            border: 1px solid ${request.status === 'new' ? '#1976d2' : 
                                request.status === 'in_progress' ? '#f57c00' : 
                                request.status === 'completed' ? '#2e7d32' : 
                                '#616161'};
            margin-left: auto;
          ">${statusLabels[request.status]}</span>
          <select onchange="updateRequestStatus('${request.id}', this.value)" style="
            padding: 8px 15px;
            border: 2px solid #4f3e35;
            background-color: #dfd8cb;
            font-family: Arial;
            font-size: 14px;
            color: #4f3e35;
            border-radius: 20px;
            cursor: pointer;
            outline: none;
          ">
            <option value="new" ${request.status === 'new' ? 'selected' : ''}>Новая</option>
            <option value="in_progress" ${request.status === 'in_progress' ? 'selected' : ''}>В обработке</option>
            <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>Завершена</option>
            <option value="archived" ${request.status === 'archived' ? 'selected' : ''}>В архиве</option>
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p style="
            font-family: Georgia;
            font-size: 18px;
            color: #4f3e35;
            margin-bottom: 5px;
          "><strong>${request.fullname}</strong></p>
          <p style="
            font-family: Arial;
            font-size: 16px;
            color: #4f3e35;
            opacity: 0.8;
            margin-bottom: 3px;
          ">📞 ${request.phone}</p>
          <p style="
            font-family: Arial;
            font-size: 16px;
            color: #4f3e35;
            opacity: 0.8;
            margin-bottom: 3px;
          ">✉️ ${request.email}</p>
        </div>
        
        <div style="
          background-color: rgba(79, 62, 53, 0.03);
          border-radius: 15px;
          padding: 20px;
          margin-top: 10px;
        ">
          <p style="
            font-family: Georgia;
            font-size: 16px;
            color: #4f3e35;
            line-height: 1.5;
            margin: 0;
          ">${request.message}</p>
        </div>
        
        <div style="
          display: flex;
          justify-content: flex-end;
          margin-top: 15px;
        ">
          <button onclick="deleteRequest('${request.id}')" style="
            padding: 8px 20px;
            background: transparent;
            border: 2px solid #c62828;
            color: #c62828;
            font-family: Georgia;
            font-size: 14px;
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.3s ease;
          " onmouseover="this.style.background='#c62828'; this.style.color='white'" 
             onmouseout="this.style.background='transparent'; this.style.color='#c62828'">
            Удалить
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  requestsContainer.innerHTML = requestsHtml;
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Добавляем вкладку с заявками
  setTimeout(addRequestsTab, 500);
});