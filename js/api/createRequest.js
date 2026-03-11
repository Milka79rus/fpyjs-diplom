/**
 * Основная функция для совершения запросов.
 * Универсальна для VK (параметры в URL) и Yandex (JSON или заголовки).
 */
const createRequest = (options = {}) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    let { url, data, method = 'GET', callback, headers } = options;
    let requestData = null;

    // 1. Подготовка URL и данных для GET-запроса
    if (method === 'GET' && data) {
        const urlObj = new URL(url);
        Object.entries(data).forEach(([key, value]) => {
            urlObj.searchParams.append(key, value);
        });
        url = urlObj.toString();
    }
    // 2. Подготовка данных для методов записи (POST, PUT, DELETE, PATCH)
    else if (method !== 'GET' && data) {
        requestData = JSON.stringify(data);
    }

    try {
        xhr.open(method, url);

        // 3. Установка кастомных заголовков (например, OAuth токен для Яндекса)
        if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
            });
        }

        // 4. Установка заголовка контента для JSON, если мы отправляем тело запроса
        if (requestData && (!headers || !headers['Content-Type'])) {
            xhr.setRequestHeader('Content-Type', 'application/json');
        }

        // 5. Обработка ответа
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                // Успех: передаем null в ошибку и данные в результат
                callback(null, xhr.response);
            } else {
                // Ошибка сервера: передаем объект ошибки
                callback({
                    status: xhr.status,
                    message: xhr.statusText || 'Ошибка сервера',
                    response: xhr.response
                }, null);
            }
        };

        // 6. Обработка сетевых сбоев
        xhr.onerror = () => {
            callback(new Error('Нет соединения с интернетом'), null);
        };

        // 7. Отправка
        xhr.send(requestData);

    } catch (error) {
        // Ошибка в самом коде (например, невалидный URL)
        callback(error, null);
    }
};
