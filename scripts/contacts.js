// contacts.js

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Собираем данные формы
      const formData = {
        id: "REQ-" + Date.now(),
        fullname: document.getElementById("fullname").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value,
        date: new Date().toISOString(),
        status: "new",
        type: "contact",
      };

      debugger;

      // Сохраняем заявку
      saveContactRequest(formData);

      // Показываем сообщение об успехе
      alert("Форма успешно отправлена! Мы свяжемся с вами в ближайшее время.");

      // Очищаем форму
      this.reset();
    });
  }

  // Функция сохранения заявки
  function saveContactRequest(requestData) {
    try {
      // Получаем существующие заявки
      let existingRequests = [];
      const savedRequests = localStorage.getItem("contactRequests");

      if (savedRequests) {
        existingRequests = JSON.parse(savedRequests);
      }

      // Добавляем новую заявку
      existingRequests.unshift(requestData);

      // Сохраняем обратно
      localStorage.setItem("contactRequests", JSON.stringify(existingRequests));

      console.log("Заявка сохранена:", requestData);
      return true;
    } catch (error) {
      console.error("Ошибка при сохранении заявки:", error);
      return false;
    }
  }
});
