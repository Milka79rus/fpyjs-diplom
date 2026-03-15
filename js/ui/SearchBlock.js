/**
 * Класс SearchBlock
 * Используется для взаимодействием со строкой ввода и поиска изображений
 * */
class SearchBlock {
  constructor(element) {
    // 1.1. Сохраните переданный элемент в свойство объекта класса
    this.element = element;
    // 1.2. Вызовите метод registerEvents для подписки на события
    this.registerEvents();
  }

  /**
   * Выполняет подписку на кнопки "Заменить" и "Добавить"
   * Клик по кнопкам выполняет запрос на получение изображений и отрисовывает их,
   * только клик по кнопке "Заменить" перед отрисовкой очищает все отрисованные ранее изображения
   */
  registerEvents() {
    // Находим поле ввода и кнопки по их классам (из подсказки 1)
    const input = this.element.querySelector('input');
    const replaceButton = this.element.querySelector('.button.replace');
    const addButton = this.element.querySelector('.button.add');

    if (replaceButton) {
      // Обработчик для кнопки "Заменить"
      replaceButton.addEventListener('click', () => {
        const id = input.value.trim();
        // 2.1. Проверка поля ввода (если пустое — ничего не делаем)
        if (id) {
          // 2.2. Выполняем запрос через VK.get (подсказка 2)
          VK.get(id, (err, photos) => {
            if (err) {
              return; // Если есть ошибка, выходим (alert уже сработал в VK.js)
            }
            // 2.3. Удаляем ранее отрисованные изображения (подсказка 3)
            App.imageViewer.clear();
            // Отрисовываем полученные изображения
            App.imageViewer.drawImages(photos);
          });
        }
      });
    }

    if (addButton) {
      // Обработчик для кнопки "Добавить"
      addButton.addEventListener('click', () => {
        const id = input.value.trim();

        // 2.1. Проверка поля ввода
        if (id) {
          // 2.2. Выполняем запрос
          VK.get(id, (err, photos) => {
            if (err) {
              return;
            }
            // 2.3. Для кнопки "Добавить" очистка не нужна, только отрисовка
            App.imageViewer.drawImages(photos);
          });
        }
      });
    }
  }
}   