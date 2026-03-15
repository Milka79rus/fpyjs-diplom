/**
 * Класс PreviewModal
 * Используется как обозреватель загруженный файлов в облако
 */
class PreviewModal extends BaseModal {
  constructor(element) {
    super(element);
    this.content = this.element.querySelector('.scrolling.content');
    this.registerEvents();
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по крестику на всплывающем окне, закрывает его
   * 2. Клик по контроллерам изображения: 
   * Отправляет запрос на удаление изображения, если клик был на кнопке delete
   * Скачивает изображение, если клик был на кнопке download
   */
  registerEvents() {
    // 1. Закрытие по крестику
    const closeIcon = this.element.querySelector('.x.icon');
    closeIcon.addEventListener('click', () => this.close());

    // 2. Обработка кнопок в теле модалки
    this.content.addEventListener('click', (event) => {
      const target = event.target;

      // Кнопка удаления
      const deleteBtn = target.closest('.delete');
      if (deleteBtn) {
        const path = deleteBtn.dataset.path;
        // ТЗ: Иконке i присвоить классы 'icon spinner loading'
        const icon = deleteBtn.querySelector('i');
        icon.className = 'icon spinner loading';
        // ТЗ: Заблокировать кнопку классом disabled
        deleteBtn.classList.add('disabled');

        Yandex.removeFile(path, (err, response) => {
          if (!err) {
            deleteBtn.closest('.image-preview-container').remove();
          }
        });
        return;
      }

      // Кнопка скачивания
      const downloadBtn = target.closest('.download');
      if (downloadBtn) {
        const fileUrl = downloadBtn.dataset.file;
        Yandex.downloadFileByUrl(fileUrl);
      }
    });
  }


  /**
   * Отрисовывает изображения в блоке всплывающего окна
   */
  showImages(data) {
    // 1. Извлекаем список файлов (проверяем все возможные варианты ответа API)
    const items = data._embedded ? data._embedded.items : (data.items || data);

    // 2. Если файлов нет или это не массив — выводим сообщение
    if (!items || !Array.isArray(items) || items.length === 0) {
      this.content.innerHTML = '<div class="ui message">Список файлов пуст или недоступен</div>';
      return;
    }

    // 3. Если всё хорошо, то отрисовываем
    const html = items
      .reverse()
      .map((item) => this.getImageInfo(item))
      .join('');

    this.content.innerHTML = html;
  }

  /**
   * Форматирует дату в формате 2021-12-30T20:40:02+00:00(строка)
   * в формат «30 декабря 2021 г. в 23:40» (учитывая временной пояс)
   * */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    return date.toLocaleString('ru-RU', options).replace(' г.,', ' г. в');
  }

  /**
   * Возвращает разметку из изображения, таблицы с описанием данных изображения и кнопок контроллеров (удаления и скачивания)
   */
  getImageInfo(item) {
    const imageSrc = item.file;
    return `
      <div class="image-preview-container">
        <img src='${imageSrc}' />
        <table class="ui celled table">
          <thead>
            <tr><th>Имя</th><th>Создано</th><th>Размер</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${item.name}</td>
              <td>${this.formatDate(item.created)}</td>
              <td>${(item.size / 1024).toFixed(1)} Кб</td>
            </tr>
          </tbody>
        </table>
        <div class="buttons-wrapper">
          <button class="ui labeled icon red basic button delete" data-path='${item.path}'>
            Удалить
            <i class="trash icon"></i>
          </button>
          <button class="ui labeled icon violet basic button download" data-file='${item.file}'>
            Скачать
            <i class="download icon"></i>
          </button>
        </div>
      </div>
    `;
  }
}
