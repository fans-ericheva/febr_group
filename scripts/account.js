// account.js

document.addEventListener("DOMContentLoaded", function () {
  // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК ---
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPanes = document.querySelectorAll(".tab-pane");

  function switchTab(tabId) {
    tabPanes.forEach((pane) => pane.classList.remove("active"));
    tabButtons.forEach((button) => button.classList.remove("active"));

    const activePane = document.getElementById(tabId);
    const activeButton = document.querySelector(
      `.tab-button[data-tab="${tabId.replace("-tab", "")}"]`,
    );

    if (activePane) activePane.classList.add("active");
    if (activeButton) activeButton.classList.add("active");

    localStorage.setItem("activeAccountTab", tabId);
    
    // ЕДИНСТВЕННОЕ ИЗМЕНЕНИЕ: загружаем заказы при открытии вкладки
    if (tabId === "orders-tab") {
      loadUserOrders();
    }
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabName = this.dataset.tab;
      switchTab(tabName + "-tab");
    });
  });

  const savedTab = localStorage.getItem("activeAccountTab");
  if (savedTab && document.getElementById(savedTab)) {
    switchTab(savedTab);
  } else {
    switchTab("profile-tab");
  }

  // --- ЛОГИКА ФОРМЫ ПРОФИЛЯ ---
  const profileForm = document.getElementById("profileForm");
  const userNameDisplaySpan = document.getElementById("userNameDisplay");

  function loadProfileData() {
    const savedName = localStorage.getItem("profileName");
    const savedLastName = localStorage.getItem("profileLastName");
    const savedEmail = localStorage.getItem("profileEmail");
    const savedPhone = localStorage.getItem("profilePhone");
    const savedAddress = localStorage.getItem("profileAddress");

    if (savedName) document.getElementById("profileName").value = savedName;
    if (savedLastName)
      document.getElementById("profileLastName").value = savedLastName;
    if (savedEmail) document.getElementById("profileEmail").value = savedEmail;
    if (savedPhone) document.getElementById("profilePhone").value = savedPhone;
    if (savedAddress)
      document.getElementById("profileAddress").value = savedAddress;

    const firstName = savedName || "Гость";
    userNameDisplaySpan.textContent = firstName;
  }

  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("profileName").value;
      const lastName = document.getElementById("profileLastName").value;
      const email = document.getElementById("profileEmail").value;
      const phone = document.getElementById("profilePhone").value;
      const address = document.getElementById("profileAddress").value;

      localStorage.setItem("profileName", name);
      localStorage.setItem("profileLastName", lastName);
      localStorage.setItem("profileEmail", email);
      localStorage.setItem("profilePhone", phone);
      localStorage.setItem("profileAddress", address);

      userNameDisplaySpan.textContent = name;

      if (typeof showNotification === "function") {
        showNotification("Данные профиля сохранены", "success");
      } else {
        alert("Данные профиля сохранены");
      }
    });
  }

  loadProfileData();

  // --- ЛОГИКА ФОРМЫ НАСТРОЕК ---
  const settingsForm = document.getElementById("settingsForm");
  if (settingsForm) {
    settingsForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const currentPass = document.getElementById("currentPassword").value;
      const newPass = document.getElementById("newPassword").value;
      const confirmPass = document.getElementById("confirmPassword").value;

      if (!currentPass || !newPass || !confirmPass) {
        if (typeof showNotification === "function") {
          showNotification("Заполните все поля пароля", "error");
        } else {
          alert("Заполните все поля");
        }
        return;
      }

      if (newPass !== confirmPass) {
        if (typeof showNotification === "function") {
          showNotification("Новые пароли не совпадают", "error");
        } else {
          alert("Пароли не совпадают");
        }
        return;
      }

      console.log("Пароль изменен");
      settingsForm.reset();

      if (typeof showNotification === "function") {
        showNotification("Пароль успешно обновлен", "success");
      } else {
        alert("Пароль обновлен");
      }
    });
  }

  // === НОВАЯ ФУНКЦИЯ: ЗАГРУЗКА ЗАКАЗОВ ПОЛЬЗОВАТЕЛЯ ===
  function loadUserOrders() {
    const ordersContainer = document.querySelector(".orders-list");
    if (!ordersContainer) return;
    
    // Получаем данные текущего пользователя
    const userEmail = localStorage.getItem("profileEmail") || "";
    const userName = localStorage.getItem("profileName") || "";
    const userPhone = localStorage.getItem("profilePhone") || "";
    
    // Получаем все заказы из adminOrders
    let allOrders = [];
    try {
      const savedOrders = localStorage.getItem("adminOrders");
      if (savedOrders) {
        allOrders = JSON.parse(savedOrders);
      }
    } catch (e) {
      console.error("Ошибка загрузки заказов:", e);
    }
    
    // Фильтруем заказы пользователя
    const userOrders = allOrders.filter(order => {
      // По email
      if (userEmail && order.email && order.email.toLowerCase() === userEmail.toLowerCase()) {
        return true;
      }
      // По телефону (без форматирования)
      if (userPhone && order.phone) {
        const cleanOrderPhone = order.phone.replace(/\D/g, '');
        const cleanUserPhone = userPhone.replace(/\D/g, '');
        if (cleanOrderPhone === cleanUserPhone) {
          return true;
        }
      }
      // По имени (частичное совпадение)
      if (userName && order.customer && order.customer.toLowerCase().includes(userName.toLowerCase())) {
        return true;
      }
      return false;
    });
    
    // Отображаем заказы
    displayOrders(userOrders);
  }
  
  // === НОВАЯ ФУНКЦИЯ: ОТОБРАЖЕНИЕ ЗАКАЗОВ ===
  function displayOrders(orders) {
    const ordersContainer = document.querySelector(".orders-list");
    if (!ordersContainer) return;
    
    if (orders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="order-item" style="text-align: center; padding: 40px; background: transparent; border: none;">
          <p style="font-family: Georgia; font-size: 20px; color: #4f3e35; opacity: 0.7;">У вас пока нет заказов</p>
        </div>
      `;
      return;
    }
    
    // Сортируем по дате (новые сверху)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const statusLabels = {
      new: "Новый",
      processing: "В обработке",
      delivered: "Доставлен",
      cancelled: "Отменён",
    };
    
    const ordersHtml = orders.map(order => {
      const date = new Date(order.date).toLocaleDateString("ru-RU");
      const statusClass = order.status;
      
      const itemsHtml = order.items.map(item => {
        // Пытаемся найти изображение товара в productsData
        let imageSrc = 'images/placeholder.png';
        if (window.productsData) {
          const menProduct = window.productsData.men?.find(p => p.name === item.name);
          const womenProduct = window.productsData.women?.find(p => p.name === item.name);
          const product = menProduct || womenProduct;
          if (product && product.images && product.images[0]) {
            imageSrc = product.images[0];
          }
        }
        
        return `
          <div class="order-product">
            <img src="${imageSrc}" alt="${item.name}" class="order-product-image" onerror="this.src='images/placeholder.png'">
            <div class="order-product-info">
              <p class="order-product-name">${item.name}</p>
              <p class="order-product-price">${formatPrice(item.price)} ₽ × ${item.quantity} = ${formatPrice(item.price * item.quantity)} ₽</p>
              ${item.size ? `<p style="font-size: 14px; opacity: 0.6;">Размер: ${item.size}</p>` : ''}
            </div>
          </div>
        `;
      }).join('');
      
      return `
        <div class="order-item">
          <div class="order-header">
            <span class="order-number">${order.id}</span>
            <span class="order-date">${date}</span>
            <span class="order-status ${statusClass}">${statusLabels[order.status] || order.status}</span>
          </div>
          <div class="order-products">
            ${itemsHtml}
          </div>
          <div class="order-footer">
            <span class="order-total">Итого: <span class="total-price">${formatPrice(order.total)} ₽</span></span>
            <span style="font-size: 14px; opacity: 0.7;">Оплата: ${order.paymentMethod || 'Не указана'}</span>
          </div>
          <p style="font-size: 14px; opacity: 0.7; margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(79,62,53,0.2);">
            Адрес: ${order.address}
          </p>
        </div>
      `;
    }).join('');
    
    ordersContainer.innerHTML = ordersHtml;
  }
  
  // === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ===
  function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  
  // === СЛУШАЕМ ИЗМЕНЕНИЯ В ЗАКАЗАХ ===
  window.addEventListener('storage', function(e) {
    if (e.key === 'adminOrders' && document.getElementById('orders-tab')?.classList.contains('active')) {
      loadUserOrders();
    }
  });
  
  // Для отладки - можно вызвать в консоли window.refreshOrders()
  window.refreshOrders = loadUserOrders;
});