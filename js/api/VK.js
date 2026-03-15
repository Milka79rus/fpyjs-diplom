/**
 * Класс VK
 * Управляет изображениями из VK. С помощью VK API.
 * С помощью этого класса будет выполняться загрузка изображений из vk.
 * Имеет свойства ACCESS_TOKEN и lastCallback
 * */
class VK {
  static ACCESS_TOKEN = localStorage.getItem('vk_access_token') || '';
  static lastCallback = () => { };

  /**
   * Метод для получения/проверки токена
   */
  static getToken() {
    if (!this.ACCESS_TOKEN || this.ACCESS_TOKEN === 'null') {
      const token = prompt('Введите ваш VK ACCESS_TOKEN:');
      if (token) {
        this.ACCESS_TOKEN = token;
        localStorage.setItem('vk_access_token', token);
      }
    }
    return this.ACCESS_TOKEN;
  }

  /**
   * Получает изображения профиля
   */
  static get(id = '', callback) {
    // 1. Сохраняем колбек в свойство lastCallback
    this.lastCallback = callback;
    const token = this.getToken();

    if (!token) {
      alert('Токен не введен!');
      return;
    }

    // 2. Создаем тег script для JSONP
    const script = document.createElement('script');
    script.classList.add('vk-jsonp-script');

    // 3. Настраиваем тег на запрос получения фото (album_id=profile)
    // Указываем callback=VK.processData, как просит инструкция
    script.src = `https://api.vk.com/method/photos.get?owner_id=${id}&album_id=profile&extended=1&photo_sizes=1&access_token=${token}&v=5.131&callback=VK.processData`;

    // 4. Добавляем созданный скрипт в тело документа
    document.body.appendChild(script);
  }

  /**
   * Обработчик ответа от сервера
   */
  static processData(result) {
    // 1. Чтобы документ не засорялся, находим и удаляем тег script
    const script = document.querySelector('.vk-jsonp-script');
    if (script) {
      script.remove();
    }

    // 2. В случае ошибки выводим alert и завершаем выполнение
    if (result.error) {
      const errorMsg = `Ошибка VK: ${result.error.error_msg}`;
      alert(errorMsg);
      // Вызываем колбек по стандарту (err, response)
      this.lastCallback(new Error(errorMsg), null);
      this.lastCallback = () => { };
      return;
    }

    // 3. Находим самые крупные изображения
    const images = result.response.items.map(item => {
      // Сравниваем размеры по площади
      const largest = item.sizes.reduce((prev, curr) => {
        return (curr.width * curr.height > prev.width * prev.height) ? curr : prev;
      });

      return {
        src: largest.url,
        likes: item.likes.count,
        date: item.date
      };
    });

    // Передаем изображения в сохраненный колбек
    this.lastCallback(null, images);

    // 4. Обновляем свойство lastCallback на функцию "пустышку"
    this.lastCallback = () => { };
  }
}