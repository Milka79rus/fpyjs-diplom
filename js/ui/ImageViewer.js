/**
 * Класс ImageViewer
 * Используется для взаимодействием блоком изображений
 * */
class ImageViewer {
  constructor(element) {
    this.element = element;
    this.previewImage = document.querySelector('.ui.fluid.image');
    this.imagesList = element.querySelector('.images-list .grid .row:first-of-type');

    // Кнопки для управления
    this.selectAllButton = document.querySelector('.select-all');
    this.sendButton = document.querySelector('.send');
    this.showUploadedButton = document.querySelector('.show-uploaded-files');

    this.registerEvents();
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по изображению меняет класс активности у изображения
   * 2. Двойной клик по изображению отображает изображаения в блоке предпросмотра
   * 3. Клик по кнопке выделения всех изображений проверяет у всех ли изображений есть класс активности?
   * Добавляет или удаляет класс активности у всех изображений
   * 4. Клик по кнопке "Посмотреть загруженные файлы" открывает всплывающее окно просмотра загруженных файлов
   * 5. Клик по кнопке "Отправить на диск" открывает всплывающее окно для загрузки файлов
   */
  registerEvents() {
    // Делегирование: клик и двойной клик
    this.imagesList.addEventListener('click', (event) => {
      if (event.target.tagName === 'IMG') {
        event.target.classList.toggle('selected');
        this.checkButtonText();
      }
    });

    this.imagesList.addEventListener('dblclick', (event) => {
      if (event.target.tagName === 'IMG') {
        this.previewImage.src = event.target.src;
      }
    });

    // Кнопка "Выбрать всё" / "Снять выделение"
    this.selectAllButton.addEventListener('click', () => {
      const images = Array.from(this.imagesList.querySelectorAll('img'));
      if (images.length === 0) return;

      // ТЗ: Если ХОТЯ БЫ ОДНО выделено — снимаем у всех
      const hasSelected = images.some(img => img.classList.contains('selected'));

      images.forEach(img => {
        if (hasSelected) {
          img.classList.remove('selected');
        } else {
          img.classList.add('selected');
        }
      });
      this.checkButtonText();
    });

    // Просмотр загруженных файлов 
    this.showUploadedButton.addEventListener('click', () => {
      const modal = App.getModal('filePreviewer');

      if (modal) {
        modal.open();
        modal.element.querySelector('.content').innerHTML = '<i class="asterisk loading icon massive"></i>';

        Yandex.getUploadedFiles((err, response) => {
          if (err) {
            alert('Ошибка при получении файлов: ' + err);
            modal.close();
            return;
          }
          // ИСПРАВЛЕНО: передаем только массив файлов, учитывая структуру Яндекса
          const files = response?._embedded?.items || response?.items || response;
          modal.showImages(files);
        });
      }
    });

    // Отправить на диск
    this.sendButton.addEventListener('click', () => {
      const modal = App.getModal('fileUploader');
      const selected = Array.from(this.imagesList.querySelectorAll('img.selected'));

      const imagesData = selected.map(img => ({
        src: img.src,
        likes: img.dataset.likes,
        date: img.dataset.date
      }));

      modal.open();
      modal.showImages(imagesData);
    });
  }

  /**
   * Очищает отрисованные изображения
   */
  clear() {
    this.imagesList.innerHTML = '';
    this.previewImage.src = 'https://yugcleaning.ru/wp-content/themes/consultix/images/no-image-found-360x250.png';
    this.checkButtonText();
  }

  /**
   * Отрисовывает изображения.
  */
  drawImages(images) {
    if (images.length > 0) {
      this.selectAllButton.classList.remove('disabled');
    } else {
      this.selectAllButton.classList.add('disabled');
    }

    images.forEach(photo => {
      const container = document.createElement('div');
      container.className = 'four wide column ui medium image-wrapper';

      // Используем dataset для хранения лайков и даты 
      container.innerHTML = `
        <img src='${photo.src}' 
             data-likes='${photo.likes}' 
             data-date='${photo.date}' 
             style='cursor: pointer;' />
      `;
      this.imagesList.appendChild(container);
    });
  }

  /**
   * Контроллирует кнопки выделения всех изображений и отправки изображений на диск
   */
  checkButtonText() {
    const images = Array.from(this.imagesList.querySelectorAll('img'));
    const selected = images.filter(img => img.classList.contains('selected'));

    // Текст кнопки Выбрать все
    if (images.length > 0 && images.length === selected.length) {
      this.selectAllButton.textContent = 'Снять выделение';
    } else {
      this.selectAllButton.textContent = 'Выбрать всё';
    }

    // Активность кнопки Отправить
    if (selected.length > 0) {
      this.sendButton.classList.remove('disabled');
    } else {
      this.sendButton.classList.add('disabled');
    }
  }
}