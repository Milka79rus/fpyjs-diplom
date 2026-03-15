/**
 * Класс FileUploaderModal
 * Используется как всплывающее окно для загрузки изображений
 */
class FileUploaderModal extends BaseModal {
  constructor(element) {
    // 1.1. Вызываем конструктор родителя
    super(element);

    // Находим блок содержимого
    this.content = this.element.querySelector('.scrolling.content');

    // 1.2. Регистрация событий
    this.registerEvents();
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по крестику на всплывающем окне, закрывает его
   * 2. Клик по кнопке "Закрыть" на всплывающем окне, закрывает его
   * 3. Клик по кнопке "Отправить все файлы" на всплывающем окне, вызывает метод sendAllImages
   * 4. Клик по кнопке загрузке по контроллерам изображения: 
   * убирает ошибку, если клик был по полю вода
   * отправляет одно изображение, если клик был по кнопке отправки
   */
  registerEvents() {
    // 2.1. Закрытие по крестику
    const closeIcon = this.element.querySelector('.x.icon');
    closeIcon.addEventListener('click', () => this.close());

    // 2.2. Закрытие по кнопке "Закрыть"
    const closeBtn = this.element.querySelector('.close.button');
    closeBtn.addEventListener('click', () => this.close());

    // 2.3. Отправить все файлы
    const sendAllBtn = this.element.querySelector('.send-all.button');
    sendAllBtn.addEventListener('click', () => this.sendAllImages());

    // 2.4. Делегирование событий в блоке content
    this.content.addEventListener('click', (event) => {
      const target = event.target;

      // 2.4.1. Если клик по полю ввода (или блоку вокруг него) — убираем ошибку
      if (target.tagName === 'INPUT' || target.closest('.ui.input')) {
        const inputBlock = target.closest('.ui.input');
        if (inputBlock) {
          inputBlock.classList.remove('error');
        }
      }

      // 2.4.2. Если клик по кнопке отправки (или иконке внутри неё)
      const uploadBtn = target.closest('.ui.button');
      if (uploadBtn && !uploadBtn.classList.contains('send-all')) {
        const container = uploadBtn.closest('.image-preview-container');
        this.sendImage(container);
      }
    });
  }

  /**
   * Отображает все полученные изображения в теле всплывающего окна
   */
  showImages(images) {
    // Копируем массив, переворачиваем, генерируем HTML и объединяем
    const html = images
      .slice()
      .reverse()
      .map(path => this.getImageHTML(path))
      .join('');

    this.content.innerHTML = html;
  }

  /**
   * Формирует HTML разметку с изображением, полем ввода для имени файла и кнопкной загрузки
   */
  getImageHTML(item) {
    const src = typeof item === 'string' ? item : item.src;
    // Данные теперь приходят корректно из ImageViewer
    const fileName = item.likes ? `${item.likes}_${item.date}.jpg` : '';
    return `
    <div class="image-preview-container uploader-image-container">
      <div class="image-wrapper">
        <img src='${src}' class="uploader-preview-img" />
      </div>
      
      <div class="ui action input fluid">
        <input type="text" placeholder="Имя файла" value="${fileName}">
        <button class="ui icon button"><i class="upload icon"></i></button>
      </div>

      <div class="ui progress">
        <div class="bar"></div>
      </div>
    </div>
  `;
  }

  /**
   * Отправляет все изображения в облако
   */
  sendAllImages() {
    const containers = Array.from(this.content.querySelectorAll('.image-preview-container'));
    containers.forEach(container => this.sendImage(container));
  }

  /**
   * Валидирует изображение и отправляет его на сервер
   */
  sendImage(imageContainer) {
    const inputBlock = imageContainer.querySelector('.ui.input');
    const inputField = inputBlock.querySelector('input');
    const path = inputField.value.trim();
    const url = imageContainer.querySelector('img').src;

    // Находим элементы прогресс-бара
    const progressBlock = imageContainer.querySelector('.ui.progress');
    const bar = progressBlock.querySelector('.bar');

    if (!path) {
      inputBlock.classList.add('error');
      return;
    }

    // Визуальный старт: блокируем ввод и даем прогресс 10%
    inputBlock.classList.add('disabled');
    progressBlock.classList.remove('success'); // сбрасываем старые статусы
    bar.style.width = '10%';

    Yandex.uploadFile(path, url, (err, response) => {
      if (!err) {
        bar.style.width = '100%';
        progressBlock.classList.add('success');

        setTimeout(() => {
          imageContainer.remove();
          if (this.content.querySelectorAll('.image-preview-container').length === 0) {
            this.close();
          }
        }, 500);
      } else {
        bar.style.width = '0%';
        inputBlock.classList.remove('disabled');
        inputBlock.classList.add('error');
      }
    });
  }
}