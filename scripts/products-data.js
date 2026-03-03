// products-data.js
let productsData = {
  women: [],
  men: [],
};

// Инициализация данных
function initializeProductsData() {
  // Проверяем, есть ли данные в localStorage
  const savedData = localStorage.getItem("productsData");

  if (savedData) {
    // Загружаем из localStorage
    try {
      productsData = JSON.parse(savedData);
      console.log("Данные загружены из localStorage");
    } catch (e) {
      console.error("Ошибка загрузки из localStorage:", e);
      loadDefaultData();
    }
  } else {
    // Загружаем данные по умолчанию
    loadDefaultData();
  }

  // Добавляем поле gender каждому товару
  if (productsData.men) {
    productsData.men = productsData.men.map((p) => ({ ...p, gender: "men" }));
  }
  if (productsData.women) {
    productsData.women = productsData.women.map((p) => ({
      ...p,
      gender: "women",
    }));
  }

  // Триггерим событие для обновления страниц
  document.dispatchEvent(new Event("productsLoaded"));
}

// Загрузка данных по умолчанию из JSON файла
async function loadDefaultData() {
  try {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error("Ошибка загрузки JSON");

    productsData = await response.json();

    // Сохраняем в localStorage
    saveProductsData();
    console.log("Данные загружены из JSON и сохранены в localStorage");
  } catch (error) {
    console.error("Ошибка загрузки products.json:", error);
    // Если JSON не загрузился, используем встроенные данные
    // productsData = getDefaultData();
    // saveProductsData();
  }
}

// Сохранение данных в localStorage
function saveProductsData() {
  try {
    // Создаем копию без поля gender для сохранения
    const saveData = {
      men: productsData.men
        ? productsData.men.map(({ gender, ...rest }) => rest)
        : [],
      women: productsData.women
        ? productsData.women.map(({ gender, ...rest }) => rest)
        : [],
    };

    localStorage.setItem("productsData", JSON.stringify(saveData));
    console.log("Данные сохранены в localStorage");
    return true;
  } catch (error) {
    console.error("Ошибка сохранения в localStorage:", error);
    return false;
  }
}

// Добавление нового товара
function addProduct(gender, product) {
  if (!productsData[gender]) {
    productsData[gender] = [];
  }

  // Генерируем новый ID
  const maxId = productsData[gender].reduce((max, p) => Math.max(max, p.id), 0);
  product.id = maxId + 1;

  productsData[gender].push(product);
  saveProductsData();

  // Триггерим событие
  document.dispatchEvent(new Event("productsLoaded"));

  return product;
}

// Обновление товара
function updateProduct(gender, id, updatedProduct) {
  if (!productsData[gender]) return false;

  const index = productsData[gender].findIndex((p) => p.id === id);
  if (index === -1) return false;

  productsData[gender][index] = {
    ...productsData[gender][index],
    ...updatedProduct,
    id,
  };
  saveProductsData();

  document.dispatchEvent(new Event("productsLoaded"));
  return true;
}

// Удаление товара
function deleteProduct(gender, id) {
  if (!productsData[gender]) return false;

  const index = productsData[gender].findIndex((p) => p.id === id);
  if (index === -1) return false;

  productsData[gender].splice(index, 1);
  saveProductsData();

  document.dispatchEvent(new Event("productsLoaded"));
  return true;
}

// Инициализация
initializeProductsData();

// Делаем функции глобальными
window.productsData = productsData;
window.addProduct = addProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.saveProductsData = saveProductsData;
