// cart.js

// Структура товара в корзине
class CartItem {
  constructor(product, size, color) {
    this.id = product.id;
    this.gender = product.gender;
    this.name = product.name;
    this.price = product.price;
    this.image = product.images;
    this.size = size;
    this.color = color;
    this.quantity = 1;
  }
}

// Получение корзины из localStorage
function getCart() {
  const cartJson = localStorage.getItem("cart");
  if (!cartJson) return [];

  try {
    const cart = JSON.parse(cartJson);
    return Array.isArray(cart) ? cart : [];
  } catch (e) {
    console.error("Ошибка при парсинге корзины:", e);
    return [];
  }
}

// Сохранение корзины в localStorage
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  return cart;
}

// Поиск товара по полу и ID
function findProductById(gender, id) {
  if (!productsData[gender]) return undefined;
  return productsData[gender].find((product) => product.id === id);
}

// Показать подсказку (для формы)
function showHint(message, type = "info") {
  const hintContainer = document.getElementById("formHint");
  if (!hintContainer) return;

  const icons = {
    success: "✓",
    error: "✗",
    warning: "⚠",
    info: "ℹ",
  };

  hintContainer.innerHTML = `
        <div class="form-hint ${type}">
            <i>${icons[type]}</i>
            <span>${message}</span>
        </div>
    `;

  // Автоматически скрываем через 5 секунд
  setTimeout(() => {
    if (hintContainer.innerHTML.includes(message)) {
      hintContainer.innerHTML = "";
    }
  }, 5000);
}

// Очистить подсказки
function clearHints() {
  const hintContainer = document.getElementById("formHint");
  if (hintContainer) {
    hintContainer.innerHTML = "";
  }
}

// Добавление товара в корзину
window.addToCart = function (gender, id, size, color) {
  const product = findProductById(gender, id);
  if (!product) return;

  const cart = getCart();

  const existingItemIndex = cart.findIndex(
    (item) =>
      item.id === id &&
      item.gender === gender &&
      item.size === size &&
      item.color === color,
  );

  if (existingItemIndex !== -1) {
    // Увеличиваем количество
    cart[existingItemIndex].quantity += 1;
    showNotification(
      `Количество товара "${product.name}" увеличено`,
      "success",
    );
  } else {
    // Добавляем новый товар
    const cartItem = new CartItem(product, size, color);
    cart.push(cartItem);
    showNotification(`Товар "${product.name}" добавлен в корзину`, "success");
  }

  saveCart(cart);

  if (window.location.pathname.includes("cart.html")) {
    displayCart();
  }
};

// Удаление товара из корзины
window.removeFromCart = function (gender, id, size, color) {
  let cart = getCart();
  const removedItem = cart.find(
    (item) =>
      item.id === id &&
      item.gender === gender &&
      item.size === size &&
      item.color === color,
  );

  cart = cart.filter(
    (item) =>
      !(
        item.id === id &&
        item.gender === gender &&
        item.size === size &&
        item.color === color
      ),
  );

  saveCart(cart);

  if (removedItem) {
    showNotification(
      `Товар "${removedItem.name}" удален из корзины`,
      "warning",
    );
  }

  displayCart();
};

// Изменение количества товара
window.updateQuantity = function (gender, id, size, color, change) {
  const cart = getCart();
  const itemIndex = cart.findIndex(
    (item) =>
      item.id === id &&
      item.gender === gender &&
      item.size === size &&
      item.color === color,
  );

  if (itemIndex === -1) return;

  const newQuantity = cart[itemIndex].quantity + change;

  if (newQuantity <= 0) {
    window.removeFromCart(gender, id, size, color);
    return;
  }

  cart[itemIndex].quantity = newQuantity;
  saveCart(cart);

  const quantityElement = document.querySelector(
    `.cart-item[data-gender="${gender}"][data-id="${id}"][data-size="${size}"][data-color="${color}"] .quantity-value`,
  );
  if (quantityElement) {
    quantityElement.textContent = newQuantity;
  }

  updateCheckoutFormTotals();
};

// Очистка корзины
window.clearCart = function () {
  if (confirm("Вы уверены, что хотите очистить корзину?")) {
    saveCart([]);
    displayCart();
    showNotification("Корзина очищена", "warning");
  }
};

// Подсчет итоговой суммы
function calculateTotals() {
  const cart = getCart();
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal;

  return {
    subtotal,
    total,
    itemsCount: cart.reduce((sum, item) => sum + item.quantity, 0),
  };
}

// Форматирование цены
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Обновление цвета товара
window.updateCartItemColor = function (
  gender,
  id,
  oldSize,
  oldColor,
  selectElement,
) {
  const newColor = selectElement.value;

  const cart = getCart();

  const itemIndex = cart.findIndex(
    (item) =>
      item.id === id &&
      item.gender === gender &&
      item.size === oldSize &&
      item.color === oldColor,
  );

  if (itemIndex === -1) return;

  const item = cart[itemIndex];

  const existingItemIndex = cart.findIndex(
    (cartItem, index) =>
      index !== itemIndex &&
      cartItem.id === id &&
      cartItem.gender === gender &&
      cartItem.size === oldSize &&
      cartItem.color === newColor,
  );

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += item.quantity;
    cart.splice(itemIndex, 1);
    showHint("Цвет изменен, количество объединено", "success");
  } else {
    cart[itemIndex].color = newColor;
    showHint("Цвет изменен", "success");
  }

  saveCart(cart);
  displayCart();
};

// Обновление размера товара
window.updateCartItemSize = function (gender, id, color, selectElement) {
  const newSize = selectElement.value;

  const cart = getCart();

  const itemIndex = cart.findIndex(
    (item) => item.id === id && item.gender === gender && item.color === color,
  );

  if (itemIndex === -1) return;

  const item = cart[itemIndex];
  const oldSize = item.size;

  const existingItemIndex = cart.findIndex(
    (cartItem, index) =>
      index !== itemIndex &&
      cartItem.id === id &&
      cartItem.gender === gender &&
      cartItem.size === newSize &&
      cartItem.color === color,
  );

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += item.quantity;
    cart.splice(itemIndex, 1);
    showHint("Размер изменен, количество объединено", "success");
  } else {
    cart[itemIndex].size = newSize;
    showHint("Размер изменен", "success");
  }

  saveCart(cart);
  displayCart();
};

// Создание HTML для товара
function createCartItemHTML(item) {
  const product = findProductById(item.gender, item.id);
  if (!product) return "";

  const colorOptions = product.colors
    .map((color) => {
      const selected = color === item.color ? "selected" : "";
      return `<option value="${color}" ${selected}>${color}</option>`;
    })
    .join("");

  const sizeOptions = product.size
    .map((size) => {
      const selected = size === item.size ? "selected" : "";
      return `<option value="${size}" ${selected}>${size}</option>`;
    })
    .join("");

  const formattedPrice = formatPrice(item.price);

  return `
        <div class="cart-item" data-gender="${item.gender}" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}">
            <div class="cart-item-image-wrapper">
                <img src="${item.image[0]}" alt="${item.name}" class="cart-item-image">
            </div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <div class="cart-item-selectors">
                    <div class="cart-item-selector">
                        <span>Цвет:</span>
                        <select onchange="updateCartItemColor('${item.gender}', ${item.id}, '${item.size}', '${item.color}', this)">
                            ${colorOptions}
                        </select>
                    </div>
                    <div class="cart-item-selector">
                        <span>Размер:</span>
                        <select onchange="updateCartItemSize('${item.gender}', ${item.id}, '${item.color}', this)">
                            ${sizeOptions}
                        </select>
                    </div>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-price">${formattedPrice} ₽</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity('${item.gender}', ${item.id}, '${item.size}', '${item.color}', -1)">−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.gender}', ${item.id}, '${item.size}', '${item.color}', 1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.gender}', ${item.id}, '${item.size}', '${item.color}')">×</button>
            </div>
        </div>
    `;
}

// Валидация поля в реальном времени
function validateField(field) {
  const value = field.value.trim();
  const fieldId = field.id;
  let isValid = false;

  field.classList.remove("error", "valid");

  switch (fieldId) {
    case "fullName":
      isValid = value.length >= 5 && /^[а-яА-Яa-zA-Z\s\-]+$/.test(value);
      if (!value) {
        showHint("Поле ФИО обязательно для заполнения", "error");
      } else if (!isValid) {
        showHint(
          "Введите корректное ФИО (минимум 5 символов, только буквы и пробелы)",
          "error",
        );
      }
      break;

    case "phone":
      const phoneDigits = value.replace(/\D/g, "");
      isValid = phoneDigits.length >= 10 && phoneDigits.length <= 11;
      if (!value) {
        showHint("Поле Телефон обязательно для заполнения", "error");
      } else if (!isValid) {
        showHint("Введите корректный номер телефона (10-11 цифр)", "error");
      }
      break;

    case "address":
      isValid = value.length >= 10;
      if (!value) {
        showHint("Поле Адрес обязательно для заполнения", "error");
      } else if (!isValid) {
        showHint("Введите полный адрес (минимум 10 символов)", "error");
      }
      break;

    default:
      isValid = value.length > 0;
  }

  if (value && isValid) {
    field.classList.add("valid");
    clearHints();
  } else if (value && !isValid) {
    field.classList.add("error");
  }

  updateSubmitButtonState();
  return isValid;
}

// Обновление состояния кнопки отправки
function updateSubmitButtonState() {
  const fullName = document.getElementById("fullName")?.value.trim() || "";
  const phone = document.getElementById("phone")?.value.trim() || "";
  const address = document.getElementById("address")?.value.trim() || "";
  const submitBtn = document.getElementById("submitOrderBtn");

  if (!submitBtn) return;

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length >= 10 && phoneDigits.length <= 11;
  const isNameValid =
    fullName.length >= 5 && /^[а-яА-Яa-zA-Z\s\-]+$/.test(fullName);
  const isAddressValid = address.length >= 10;

  const isFormValid =
    fullName &&
    isNameValid &&
    phone &&
    isPhoneValid &&
    address &&
    isAddressValid;

  submitBtn.disabled = !isFormValid;
}

// Создание формы оформления заказа
function createCheckoutForm() {
  const cartContainer = document.getElementById("cartContainer");
  if (!cartContainer) return;

  const formContainer = document.createElement("div");
  formContainer.id = "checkoutFormContainer";
  formContainer.className = "checkout-form-container";

  const totals = calculateTotals();

  formContainer.innerHTML = `
        <h2>Оформление заказа</h2>
        
        <!-- Контейнер для подсказок -->
        <div id="formHint" class="form-hint-container"></div>
        
        <div class="checkout-form" id="checkoutForm">
            <div class="form-group">
                <label for="fullName">
                    ФИО <span class="required-star">*</span>
                </label>
                <input type="text" id="fullName" placeholder="Иванов Иван Иванович" 
                       oninput="validateField(this)" onblur="validateField(this)">
            </div>
            
            <div class="form-group">
                <label for="phone">
                    Телефон <span class="required-star">*</span>
                </label>
                <input type="tel" id="phone" placeholder="+7 (999) 999-99-99" 
                       oninput="validateField(this)" onblur="validateField(this)">
            </div>
            
            <div class="form-group full-width">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="example@mail.ru">
            </div>
            
            <div class="form-group full-width">
                <label for="address">
                    Адрес доставки <span class="required-star">*</span>
                </label>
                <textarea id="address" placeholder="Город, улица, дом, квартира" 
                          oninput="validateField(this)" onblur="validateField(this)"></textarea>
            </div>
            
            <div class="form-group">
                <label for="deliveryMethod">Способ доставки</label>
                <select id="deliveryMethod" onchange="updateDeliveryPrice(this)">
                    <option value="0" selected>Бесплатная доставка (3-5 дней)</option>
                    <option value="300">Курьером (1-2 дня) - 300 ₽</option>
                    <option value="500">Экспресс доставка (сегодня) - 500 ₽</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="paymentMethod">Способ оплаты</label>
                <select id="paymentMethod">
                    <option value="card">Картой онлайн</option>
                    <option value="cash">Наличными при получении</option>
                    <option value="card_courier">Картой курьеру</option>
                </select>
            </div>
            
            <div class="delivery-summary-row">
                <div class="delivery-info">
                    <span>Стоимость доставки</span>
                    <span class="delivery-price" id="deliveryPriceDisplay">0 ₽</span>
                </div>
                <div class="total-info">
                    <span>Итого к оплате</span>
                    <span class="total-price" id="formTotalPrice">${formatPrice(totals.total)} ₽</span>
                </div>
            </div>
            
            <div class="form-group full-width">
                <label for="comment">Комментарий к заказу</label>
                <textarea id="comment" placeholder="Пожелания по доставке, цвету, размеру..."></textarea>
            </div>
            
            <button class="form-checkout-btn" onclick="submitOrder()" id="submitOrderBtn" disabled>
                Оформить заказ
            </button>
        </div>
    `;

  cartContainer.appendChild(formContainer);
}

// Обновление стоимости доставки
window.updateDeliveryPrice = function (selectElement) {
  const deliveryPrice = parseInt(selectElement.value) || 0;
  const deliveryDisplay = document.getElementById("deliveryPriceDisplay");
  const formTotalPrice = document.getElementById("formTotalPrice");

  const totals = calculateTotals();
  const totalWithDelivery = totals.total + deliveryPrice;

  if (deliveryDisplay) {
    deliveryDisplay.textContent =
      deliveryPrice > 0 ? deliveryPrice + " ₽" : "Бесплатно";
  }

  if (formTotalPrice) {
    formTotalPrice.textContent = formatPrice(totalWithDelivery) + " ₽";
  }
};

// Обновление итогов в форме
function updateCheckoutFormTotals() {
  const deliverySelect = document.getElementById("deliveryMethod");
  if (deliverySelect) {
    updateDeliveryPrice(deliverySelect);
  }
  updateSubmitButtonState();
}

// Отправка заказа
window.submitOrder = function () {
  const fullName = document.getElementById("fullName");
  const phone = document.getElementById("phone");
  const address = document.getElementById("address");

  // Последняя проверка перед отправкой
  if (
    !validateField(fullName) ||
    !validateField(phone) ||
    !validateField(address)
  ) {
    showHint("Пожалуйста, заполните все обязательные поля корректно", "error");
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showHint("Корзина пуста", "error");
    return;
  }

  // Получаем данные формы
  const deliverySelect = document.getElementById("deliveryMethod");
  const deliveryPrice = parseInt(deliverySelect.value) || 0;

  const orderData = {
    fullName: fullName.value.trim(),
    phone: phone.value.trim(),
    email: document.getElementById("email")?.value.trim() || "",
    address: address.value.trim(),
    deliveryMethod: deliverySelect.selectedOptions[0].text,
    deliveryPrice: deliveryPrice,
    paymentMethod: document.getElementById("paymentMethod").selectedOptions[0].text,
    comment: document.getElementById("comment")?.value.trim() || "",
    items: cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      color: item.color,
    })),
    subtotal: calculateTotals().subtotal,
    total: calculateTotals().total + deliveryPrice,
    date: new Date().toLocaleString(),
  };

  // Здесь можно отправить данные на сервер
  console.log("Заказ оформлен:", orderData);

  // Сохраняем заказ в админ-панель
  const saved = saveOrderToAdmin(orderData);
  
  if (saved) {
    // Показываем успешное сообщение
    showNotification(
      `Спасибо за заказ, ${orderData.fullName}! Детали заказа отправлены на ваш телефон`,
      "success"
    );

    // Очищаем корзину
    saveCart([]);

    // Очищаем форму через небольшую задержку
    setTimeout(() => displayCart(), 1000);
  } else {
    showNotification("Ошибка при оформлении заказа", "error");
  }
};

// Отображение корзины
function displayCart() {
  const cartContainer = document.getElementById("cartContainer");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartItems = document.getElementById("cartItems");

  if (!cartContainer || !cartEmpty || !cartItems) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartContainer.style.display = "none";
    cartEmpty.style.display = "block";

    const formContainer = document.getElementById("checkoutFormContainer");
    if (formContainer) {
      formContainer.remove();
    }
  } else {
    cartContainer.style.display = "grid";
    cartEmpty.style.display = "none";

    cartItems.innerHTML = cart.map((item) => createCartItemHTML(item)).join("");

    let formContainer = document.getElementById("checkoutFormContainer");
    if (!formContainer) {
      createCheckoutForm();
    } else {
      formContainer.remove();
      createCheckoutForm();
    }

    updateCheckoutFormTotals();
  }
}

// Инициализация
document.addEventListener("DOMContentLoaded", function () {
  displayCart();

  const bagIcon = document.querySelector(".icon-bag");
  if (bagIcon && !bagIcon.querySelector("a")) {
    const img = bagIcon.querySelector("img");
    if (img) {
      const link = document.createElement("a");
      link.href = "cart.html";
      img.parentNode.insertBefore(link, img);
      link.appendChild(img);
    }
  }
});

// Добавляем маску для телефона
document.addEventListener("input", function (e) {
  if (e.target.id === "phone") {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 0) {
      if (value.length <= 11) {
        let formattedValue = "";
        if (value.length > 0) {
          formattedValue = "+7 ";
          if (value.length > 1) {
            formattedValue += "(" + value.substring(1, 4);
          }
          if (value.length >= 4) {
            formattedValue += ") " + value.substring(4, 7);
          }
          if (value.length >= 7) {
            formattedValue += "-" + value.substring(7, 9);
          }
          if (value.length >= 9) {
            formattedValue += "-" + value.substring(9, 11);
          }
        }
        e.target.value = formattedValue;
      }
    }
  }
});

// Сохранение заказа в localStorage для админ-панели
function saveOrderToAdmin(orderData) {
  try {
    // Получаем существующие заказы
    let existingOrders = [];
    const savedOrders = localStorage.getItem('adminOrders');
    
    if (savedOrders) {
      existingOrders = JSON.parse(savedOrders);
    }
    
    // Генерируем уникальный ID для заказа
    const orderId = 'ORD-' + new Date().getFullYear() + '-' + 
                    String(existingOrders.length + 1).padStart(3, '0');
    
    // Форматируем дату
    const now = new Date();
    const orderDate = now.toISOString();
    
    // Создаем объект заказа в формате админ-панели
    const adminOrder = {
      id: orderId,
      date: orderDate,
      customer: orderData.fullName,
      phone: orderData.phone,
      email: orderData.email || '',
      address: orderData.address,
      items: orderData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color
      })),
      subtotal: orderData.subtotal,
      deliveryPrice: orderData.deliveryPrice,
      total: orderData.total,
      status: 'new', // Новый заказ
      paymentMethod: orderData.paymentMethod
    };
    
    // Добавляем новый заказ в начало массива
    existingOrders.unshift(adminOrder);
    
    // Сохраняем обратно в localStorage
    localStorage.setItem('adminOrders', JSON.stringify(existingOrders));
    
    console.log('Заказ сохранен в админ-панели:', adminOrder);
    return true;
  } catch (error) {
    console.error('Ошибка при сохранении заказа:', error);
    return false;
  }
}