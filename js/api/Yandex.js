/**
 * Класс Yandex
 * Используется для управления облаком.
 * Имеет свойство HOST
 * */
class Yandex {
  static HOST = 'https://cloud-api.yandex.net/v1/disk';

  /**
   * Метод формирования и сохранения токена для Yandex API
   */
  static getToken() {
    // Пытаемся взять токен из localStorage
    let token = localStorage.getItem('yandex_token');

    // Исправлено: проверяем на существование и на строку 'null'
    if (!token || token === 'null') {
      token = prompt('Введите ваш Yandex OAuth-токен:');
      if (token) {
        localStorage.setItem('yandex_token', token);
      } else {
        return null; // Пользователь нажал "Отмена"
      }
    }
    return token;
  }

  /**
   * Метод загрузки файла в облако
   */
  static uploadFile(path, url, callback) {
    const token = this.getToken();
    if (!token) return;

    // Формируем параметры строки запроса
    const params = new URLSearchParams({ path, url }).toString();

    createRequest({
      method: 'POST',
      // Добавляем параметры прямо в URL через знак вопроса
      url: `${this.HOST}/resources/upload?${params}`,
      headers: {
        Authorization: `OAuth ${token}`
      },
      callback: (err, response) => callback(err, response)
    });
  }

  /**
   * Метод удаления файла из облака
   */
  static removeFile(path, callback) {
    const token = this.getToken();
    if (!token) return;

    createRequest({
      method: 'DELETE',
      // Передаем path в URL
      url: `${this.HOST}/resources?path=${encodeURIComponent(path)}`,
      headers: {
        Authorization: `OAuth ${token}`
      },
      callback: (err, response) => callback(err, response)
    });
  }

  /**
   * Метод получения всех загруженных файлов в облаке
   */
  static getUploadedFiles(callback) {
    const token = this.getToken();
    if (!token) return;

    createRequest({
      method: 'GET',
      url: `${this.HOST}/resources/files`,
      headers: {
        Authorization: `OAuth ${token}`
      },
      callback: (err, response) => callback(err, response)
    });
  }

  /**
   * Метод скачивания файлов
   */
  static downloadFileByUrl(url) {
    // 1. Создаем элемент ссылки
    const link = document.createElement('a');
    // 2. Настраиваем ссылку на полученный путь
    link.href = url;
    // (Опционально) добавляем атрибут download, чтобы браузер скачивал, а не открывал
    link.setAttribute('download', '');
    // 3. Инициируем клик
    link.click();
  }
}
