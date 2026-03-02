// ДЛЯ ГЛАВНОЙ СТРАНИЦЫ
document.addEventListener("DOMContentLoaded", function () {
  // Слайдер
  const track = document.querySelector(".slider-track");
  const slides = document.querySelectorAll(".review-slide");
  const prevBtn = document.querySelector(".slider-prev");
  const nextBtn = document.querySelector(".slider-next");
  const dots = document.querySelectorAll(".dot");

  let currentIndex = 0;
  const slideCount = slides.length;

  // Функция обновления слайдера
  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Обновляем активную точку
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  // Следующий слайд
  function nextSlide() {
    currentIndex = (currentIndex + 1) % slideCount;
    updateSlider();
  }

  // Предыдущий слайд
  function prevSlide() {
    currentIndex = (currentIndex - 1 + slideCount) % slideCount;
    updateSlider();
  }

  // Обработчики для кнопок
  if (nextBtn) {
    nextBtn.addEventListener("click", nextSlide);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", prevSlide);
  }

  // Обработчики для точек
  dots.forEach((dot, index) => {
    dot.addEventListener("click", function () {
      currentIndex = index;
      updateSlider();
    });
  });

  // Автопрокрутка (опционально)
  let autoplayInterval = setInterval(nextSlide, 5000);

  // Остановка автопрокрутки при наведении
  const sliderContainer = document.querySelector(".slider-container");
  if (sliderContainer) {
    sliderContainer.addEventListener("mouseenter", function () {
      clearInterval(autoplayInterval);
    });

    sliderContainer.addEventListener("mouseleave", function () {
      autoplayInterval = setInterval(nextSlide, 5000);
    });
  }

  // Анимация для иконок в хедере
  const headerIcons = document.querySelectorAll(".header-icons i");
  headerIcons.forEach((icon) => {
    icon.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.1)";
      this.style.transition = "transform 0.2s";
    });

    icon.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
    });
  });

  // Анимация для кнопки "Изучить"
  const heroButton = document.querySelector(".hero-button");
  if (heroButton) {
    heroButton.addEventListener("mouseenter", function () {
      this.style.letterSpacing = "0.05em";
      this.style.transition = "all 0.3s ease";
    });

    heroButton.addEventListener("mouseleave", function () {
      this.style.letterSpacing = "0.02em";
    });
  }

  // Анимация при наведении на слайд
  const reviewSlides = document.querySelectorAll(".review-slide");
  reviewSlides.forEach((slide) => {
    slide.addEventListener("mouseenter", function () {
      const img = this.querySelector(".review-slide-image");
      if (img) {
        img.style.transform = "scale(1.05)";
        img.style.transition = "transform 0.3s ease";
      }
    });

    slide.addEventListener("mouseleave", function () {
      const img = this.querySelector(".review-slide-image");
      if (img) {
        img.style.transform = "scale(1)";
      }
    });
  });

  // Обработка клика по меню
  const menuIcon = document.querySelector(".menu-icon");
  if (menuIcon) {
    menuIcon.addEventListener("click", function () {
      console.log("Меню открыто");
      // Здесь можно добавить открытие бокового меню
    });
  }

  // Адаптив для слайдера
  function handleResize() {
    if (window.innerWidth < 768) {
      // Скрываем стрелки на мобильных
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
    } else {
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
    }
  }

  window.addEventListener("resize", handleResize);
  handleResize(); // Вызываем при загрузке
});
