// Создание нового WebSocket-соединения с сервером
const socket = new WebSocket('ws://217.18.62.180:3000');

// Назначение обработчиков событий для сокета
socket.addEventListener('open', handleSocketOpen);
socket.addEventListener('message', handleSocketMessage);
socket.addEventListener('close', handleSocketClose);

// Функция, вызываемая при установлении соединения с сервером
function handleSocketOpen() {
  console.log('Подключено к серверу');
}

// Функция для обработки входящих сообщений от сервера
function handleSocketMessage(event) {
  const urls = JSON.parse(event.data); // Парсинг JSON-ответа от сервера
  updateUrlsList(urls); // Обновление списка URL-адресов
}

// Функция, вызываемая при закрытии соединения с сервером
function handleSocketClose() {
  console.log('Отключено от сервера');
}

// Функция для получения URL-адресов на основе ключевого слова, введенного пользователем
function getUrls() {
  const keyword = document.getElementById('keywordInput').value; // Получение ключевого слова из текстового поля
  socket.send(keyword); // Отправка ключевого слова на сервер
}

// Функция для обновления списка URL-адресов на странице
function updateUrlsList(urls) {
  const urlsList = document.getElementById('urlsList'); // Получение элемента списка URL
  urlsList.innerHTML = ''; // Очистка списка

  if (urls === "empty") {
    appendNoLinksMessage(urlsList); // Добавление сообщения о том, что ссылки не найдены
  } else {
    urls.forEach(url => appendLinkContainer(urlsList, url)); // Добавление каждого URL в список
  }
}

// Функция для добавления сообщения о том, что ссылки не найдены
function appendNoLinksMessage(urlsList) {
  const messageElement = document.createElement('div');
  messageElement.textContent = 'Ссылки по данному ключевому слову не найдены';
  urlsList.appendChild(messageElement);
  console.log('Ссылки не найдены');
}

// Функция для добавления контейнера с ссылкой
function appendLinkContainer(urlsList, url) {
  const container = createLinkContainer(url); // Создание контейнера с ссылкой
  urlsList.appendChild(container); // Добавление контейнера в список URL
}

// Функция создания контейнера для ссылки
function createLinkContainer(url) {
  const container = document.createElement('div');
  container.style.marginBottom = '10px'; // Установка отступа снизу для контейнера

  const linkContainer = document.createElement('div'); // Контейнер только для ссылки
  const link = createLink(url); // Создание элемента ссылки
  linkContainer.appendChild(link); // Добавление ссылки в контейнер для ссылки

  const controlsContainer = document.createElement('div'); // Контейнер для прогресс-бара и кнопки
  const progressBar = createProgressBar(); // Создание прогресс-бара
  const downloadButton = createDownloadButton(url, progressBar); // Создание кнопки скачивания
  controlsContainer.appendChild(progressBar); // Добавление прогресс-бара в контейнер управления
  controlsContainer.appendChild(downloadButton); // Добавление кнопки в контейнер управления

  // Добавление контейнеров для ссылки и управления в общий контейнер
  container.appendChild(linkContainer);
  container.appendChild(controlsContainer);

  return container; // Возвращение готового контейнера
}


// Функция создания элемента ссылки
function createLink(url) {
  const link = document.createElement('a');
  link.href = '#'; // Предотвращаем переход по ссылке
  link.textContent = url; // Текст ссылки
  // Обработчик клика по ссылке
  link.addEventListener('click', (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение ссылки
    const iframe = document.getElementById('imageIframe'); // Получаем iframe по его ID
    if (iframe) {
      iframe.src = url; // Обновляем источник изображения для iframe
    } else {
      // Если iframe не найден, создаем новый
      const newIframe = document.createElement('iframe');
      newIframe.id = 'imageIframe';
      newIframe.src = url;
      newIframe.style.width = '100%'; // Устанавливаем ширину
      newIframe.style.height = '500px'; // Устанавливаем высоту
      document.body.appendChild(newIframe); // Добавляем iframe в тело документа
    }
  });
  return link;
}

// Функция создания прогресс-бара
function createProgressBar() {
  const progressBar = document.createElement('progress');
  progressBar.value = 0; // Начальное значение прогресса
  progressBar.max = 100; // Максимальное значение прогресса
  return progressBar;
}

// Функция создания кнопки для скачивания содержимого
function createDownloadButton(url, progressBar) {
  const downloadButton = document.createElement('button');
  downloadButton.textContent = 'Скачать';
  // Добавление обработчика клика для начала скачивания
  downloadButton.addEventListener('click', () => downloadContent(url, progressBar));
  return downloadButton;
}

// Функция для начала скачивания
function downloadContent(url, progressBar) {
  startDownload(url, (progress) => {
    progressBar.value = progress; // Обновление значения прогресс-бара
  }, (blob) => {
    saveBlobToFile(blob, extractFilenameFromUrl(url)); // Сохранение файла
    progressBar.value = 100; // Завершение загрузки
  }, (status) => {
    console.error(`Ошибка во время загрузки: ${status}`);
  });
}

// Функция для запуска скачивания
function startDownload(url, onProgress, onComplete, onError) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob'; // Установка типа ответа как 'blob' для скачивания файла

  xhr.onloadstart = () => console.log('Начало загрузки');

  // Обработка события прогресса загрузки
  xhr.onprogress = (event) => {
    if (event.lengthComputable) {
      const progress = (event.loaded / event.total) * 100;
      onProgress(progress); // Вызов функции обратного вызова для обновления прогресса
    }
  };

  // Обработка события окончания загрузки
  xhr.onload = () => {
    if (xhr.status === 200) {
      // Получение размера файла из заголовков ответа
      const fileSize = xhr.getResponseHeader('Content-Length') || xhr.getResponseHeader('content-length');
      if (fileSize) {
        console.log(`Размер файла: ${fileSize} байт`); // Вывод размера файла в консоль
      }
      onComplete(xhr.response); // Вызов функции обратного вызова при успешной загрузке
    } else {
      onError(xhr.status); // Вызов функции обратного вызова при ошибке
    }
  };

  xhr.onerror = () => {
    console.error('Ошибка во время загрузки');
    onError();
  };

  xhr.send(); // Отправка запроса
}

// Функция для сохранения файла на компьютер пользователя
function saveBlobToFile(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob); // Создание URL для скачивания
  link.download = filename || 'downloaded_file'; // Установка имени файла
  link.click(); // Инициирование скачивания
}

// Функция для извлечения имени файла из URL
function extractFilenameFromUrl(url) {
  const urlSegments = url.split('/'); // Разбиение URL на сегменты
  return urlSegments.pop() || 'downloaded_file'; // Возврат последнего сегмента или стандартного имени файла
}
