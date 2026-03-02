// account.js

document.addEventListener("DOMContentLoaded", function () {
  // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК ---
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPanes = document.querySelectorAll(".tab-pane");

  function switchTab(tabId) {
    // Скрываем все панели и убираем активный класс у кнопок
    tabPanes.forEach((pane) => pane.classList.remove("active"));
    tabButtons.forEach((button) => button.classList.remove("active"));

    // Показываем нужную панель и активируем соответствующую кнопку
    const activePane = document.getElementById(tabId);
    const activeButton = document.querySelector(
      `.tab-button[data-tab="${tabId.replace("-tab", "")}"]`,
    );

    if (activePane) activePane.classList.add("active");
    if (activeButton) activeButton.classList.add("active");

    // Сохраняем активную вкладку в localStorage (чтобы при обновлении страницы она не сбрасывалась)
    localStorage.setItem("activeAccountTab", tabId);
  }

  // Добавляем обработчики событий на кнопки вкладок
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabName = this.dataset.tab; // profile, orders, settings
      switchTab(tabName + "-tab");
    });
  });

  // При загрузке страницы проверяем, была ли сохранена активная вкладка
  const savedTab = localStorage.getItem("activeAccountTab");
  if (savedTab) {
    // Проверяем, существует ли элемент с таким ID
    if (document.getElementById(savedTab)) {
      switchTab(savedTab);
    } else {
      // Если нет (например, очистили localStorage), открываем вкладку профиля
      switchTab("profile-tab");
    }
  } else {
    // По умолчанию открываем вкладку профиля
    switchTab("profile-tab");
  }

  // --- ЛОГИКА ФОРМЫ ПРОФИЛЯ (для демонстрации) ---
  const profileForm = document.getElementById("profileForm");
  const userNameDisplaySpan = document.getElementById("userNameDisplay");

  // Загружаем сохраненные данные профиля при старте
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

    // Обновляем приветствие
    const firstName = savedName || "Александр"; // Значение по умолчанию
    userNameDisplaySpan.textContent = firstName;
  }

  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Отключаем перезагрузку страницы

      const name = document.getElementById("profileName").value;
      const lastName = document.getElementById("profileLastName").value;
      const email = document.getElementById("profileEmail").value;
      const phone = document.getElementById("profilePhone").value;
      const address = document.getElementById("profileAddress").value;

      // Сохраняем данные в localStorage (имитация "бэкенда")
      localStorage.setItem("profileName", name);
      localStorage.setItem("profileLastName", lastName);
      localStorage.setItem("profileEmail", email);
      localStorage.setItem("profilePhone", phone);
      localStorage.setItem("profileAddress", address);

      // Обновляем приветствие
      userNameDisplaySpan.textContent = name;

      // Показываем уведомление об успехе (используем функцию из script.js)
      if (typeof showNotification === "function") {
        showNotification("Данные профиля сохранены", "success");
      } else {
        alert("Данные профиля сохранены (уведомления не работают)");
      }
    });
  }

  // Загружаем данные профиля при старте
  loadProfileData();

  // --- ЛОГИКА ФОРМЫ НАСТРОЕК (для демонстрации) ---
  const settingsForm = document.getElementById("settingsForm");
  if (settingsForm) {
    settingsForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const currentPass = document.getElementById("currentPassword").value;
      const newPass = document.getElementById("newPassword").value;
      const confirmPass = document.getElementById("confirmPassword").value;

      // Простейшая валидация
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

      // Здесь должен быть запрос к серверу для смены пароля
      console.log("Пароль изменен");

      // Очищаем поля
      settingsForm.reset();

      if (typeof showNotification === "function") {
        showNotification("Пароль успешно обновлен", "success");
      } else {
        alert("Пароль обновлен");
      }
    });
  }
});
