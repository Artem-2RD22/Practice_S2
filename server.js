const fs = require('fs').promises;
const ws = require('ws');

// Ключевые слова и соответствующие URL-адреса изображений
const keywords = {
  'природа': [
    'https://www.shutterstock.com/image-photo/mountains-during-sunset-beautiful-natural-260nw-407021107.jpg',
    'https://www.shutterstock.com/image-photo/high-mountain-morning-time-beautiful-260nw-1384588922.jpg',
    'https://www.shutterstock.com/image-photo/beautiful-colorful-summer-spring-natural-260nw-1766001593.jpg'
  ],
  'город': [
    'https://www.shutterstock.com/image-photo/new-york-usa-skyline-260nw-762344239.jpg',
    'https://www.shutterstock.com/image-photo/birds-eye-view-shanghai-dusk-260nw-129310280.jpg',
    'https://www.shutterstock.com/image-photo/night-metropolitan-bangkok-city-downtown-260nw-2157460537.jpg'
  ],
  'горы': [
    'https://www.shutterstock.com/image-photo/aerial-view-airplane-blue-snow-260nw-1952778829.jpg',
    'https://www.shutterstock.com/image-photo/beautiful-sunrise-over-mountain-range-260nw-525429034.jpg',
    'https://www.shutterstock.com/image-photo/beautiful-mountain-landscape-dolomites-june-260nw-1461123680.jpg'
  ],
  'еда': [
    'https://www.shutterstock.com/image-photo/healthy-food-clean-eating-selection-260nw-722718097.jpg',
    'https://www.shutterstock.com/image-photo/healthy-food-selection-on-gray-260nw-1660784320.jpg',
    'https://www.shutterstock.com/image-photo/assortment-korean-traditional-dishes-asian-260nw-2080645336.jpg'
  ]
  // Можно добавить другие ключевые слова с соответствующими URL
};

const configPath = 'config.txt'; // Путь к файлу конфигурации
const defaultMaxConcurrentThreads = 1; // Значение по умолчанию для максимального количества потоков
let maxConcurrentThreads = defaultMaxConcurrentThreads; // Переменная для отслеживания максимального количества потоков

// Асинхронная функция для чтения конфигурации
async function readConfig() {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        maxConcurrentThreads = Number(data);
        console.log('MAX_CONCURRENT_THREADS установлено в', maxConcurrentThreads);
    } catch (err) {
        console.error('Не удалось прочитать config.txt:', err);
        maxConcurrentThreads = defaultMaxConcurrentThreads;
    }
}

// Создание нового WebSocket-сервера
const server = new ws.Server({ port: 3000 });

server.on('connection', socket => {
    console.log('Клиент подключен');
    let threadCount = 0; // Счетчик активных потоков

    socket.on('message', message => {
        console.log(`Получено сообщение: ${message}`);
        handleClientMessage(socket, message, threadCount);
    });

    socket.on('close', () => {
        console.log('Клиент отключен');
    });
});

// Асинхронная функция для обработки сообщений от клиента
async function handleClientMessage(socket, message, threadCount) {
    if (threadCount < maxConcurrentThreads) {
        threadCount++;
        const urls = keywords[message] || 'empty';
        socket.send(JSON.stringify(urls));
        console.log('Поток начал работу');
    } else {
        console.log('Достигнуто максимальное количество одновременных потоков');
    }
}

// Анонимная самовызывающаяся функция для старта сервера
(async () => {
    await readConfig();
    console.log("Сервер запущен на порту 3000");
})();
