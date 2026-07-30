export type LessonLang = "html" | "css" | "javascript" | "python" | "node";

export interface Lesson {
  id: string;
  title: string;
  description: string;
  theory: string; // markdown-ish plain text
  starterCode: string;
  expected?: string;
  hint?: string;
}

export interface Course {
  id: string;
  title: string;
  emoji: string;
  language: LessonLang;
  color: string; // tailwind class
  description: string;
  lessons: Lesson[];
}

export const COURSES: Course[] = [
  {
    id: "html",
    title: "HTML",
    emoji: "🌐",
    language: "html",
    color: "from-orange-500/30 to-red-500/30",
    description: "Структура веб-страниц",
    lessons: [
      {
        id: "html-1",
        title: "Урок 1. Первая страница",
        description: "Базовая структура HTML-документа",
        theory: `HTML — язык разметки. Любая страница начинается с <!DOCTYPE html>.\n\nОсновные теги:\n• <html> — корень документа\n• <head> — служебная информация\n• <body> — видимое содержимое\n• <h1>…<h6> — заголовки\n• <p> — параграф\n\nЗадание: добавь заголовок <h1> и параграф <p> со своим именем в body.`,
        starterCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Пиши код здесь -->
</body>
</html>`,
        hint: "<h1>Привет!</h1><p>Меня зовут Билол</p>",
      },
      {
        id: "html-2",
        title: "Урок 2. Ссылки и картинки",
        description: "Теги <a> и <img>",
        theory: `<a href="URL">текст</a> — гиперссылка.\n<img src="URL" alt="описание"> — картинка.\n\nВАЖНО: Если ты хочешь сделать ссылку на другой сайт, обязательно пиши полный адрес, начиная с https://.\nНапример: <a href="https://youtube.com">YouTube</a>.\nЕсли написать просто href="youtube", браузер будет искать такую страницу на нашем сайте!\n\nЗадание: добавь правильную ссылку на google.com и любую картинку.`,
        starterCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Пиши код здесь -->
</body>
</html>`,
      },
      {
        id: "html-3",
        title: "Урок 3. Списки",
        description: "<ul>, <ol>, <li>",
        theory: `<ul> — маркированный список\n<ol> — нумерованный\n<li> — элемент списка\n\nЗадание: создай список из 3 любимых блюд.`,
        starterCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Пиши код здесь -->
</body>
</html>`,
      },
      {
        id: "html-4",
        title: "Урок 4. Формы",
        description: "input, button, form",
        theory: `<form> содержит элементы ввода.\n<input type="text"> — текстовое поле\n<button>Кнопка</button>\n\nЗадание: сделай форму с полем «Имя» и кнопкой «Отправить».`,
        starterCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Пиши код здесь -->
</body>
</html>`,
      },
      {
        id: "html-5",
        title: "Урок 5. Таблицы",
        description: "<table>, <tr>, <td>",
        theory: `Таблица состоит из строк <tr> и ячеек <td>.\n<th> — заголовок столбца.\n\nЗадание: создай таблицу 2×2 с оценками.`,
        starterCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Пиши код здесь -->
</body>
</html>`,
      },
      {
        id: "html-6",
        title: "Урок 6. Семантика (Основы)",
        description: "Теги <header>, <main>, <footer>",
        theory: `Семантические теги помогают поисковикам и браузерам лучше понимать твой сайт.\n<header> — шапка сайта\n<main> — главное содержимое\n<footer> — подвал\n\nЗадание: оберни заголовок в <header>, а текст в <main>.`,
        starterCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Пиши код здесь -->
</body>
</html>`,
      },
      {
        id: "html-7",
        title: "Урок 7. Аудио",
        description: "Тег <audio>",
        theory: `<audio controls> добавляет аудиоплеер.\nВнутри пишем <source src="URL" type="audio/mpeg">.\n\nЗадание: добавь аудиоплеер с любым рабочим URL или оставь заглушку.`,
        starterCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Пиши код здесь -->
</body>
</html>`,
      },
      {
        id: "html-8",
        title: "Урок 8. Видео",
        description: "Тег <video>",
        theory: `<video controls width="300"> — добавляет видеоплеер.\n\nЗадание: добавь видео на страницу.`,
        starterCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Пиши код здесь -->
</body>
</html>`,
      },
      {
        id: "html-9",
        title: "Урок 9. Встраивание (iframes)",
        description: "Тег <iframe>",
        theory: `<iframe> позволяет встроить другой сайт в твою страницу.\n\nЗадание: встрой Википедию или карту Google.`,
        starterCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Пиши код здесь -->
</body>
</html>`,
      },
      {
        id: "html-10",
        title: "Урок 10. Атрибуты форм",
        description: "required, placeholder",
        theory: `placeholder="Текст" — подсказка в поле ввода.\nrequired — делает поле обязательным для заполнения.\n\nЗадание: добавь полю ввода подсказку "Введите email" и сделай его обязательным.`,
        starterCode: `<!DOCTYPE html>
<html>
<body>
  <!-- Пиши код здесь -->
</body>
</html>`,
      },
    ],
  },
  {
    id: "css",
    title: "CSS",
    emoji: "🎨",
    language: "html",
    color: "from-blue-500/30 to-cyan-500/30",
    description: "Стили и оформление",
    lessons: [
      {
        id: "css-1",
        title: "Урок 1. Цвет и фон",
        description: "color, background-color",
        theory: `CSS-стили задаются внутри <style>.\nbody { background: lightblue; color: navy; }\n\nЗадание: сделай фон страницы желтым, текст — фиолетовым.`,
        starterCode: `<!DOCTYPE html>
<html>
<head>
<style>
  /* Пиши CSS стили здесь */
</style>
</head>
<body>
  <!-- HTML элементы здесь -->
</body>
</html>`,
      },
      {
        id: "css-2",
        title: "Урок 2. Шрифты",
        description: "font-family, font-size",
        theory: `font-family: Arial; — шрифт\nfont-size: 24px; — размер\nfont-weight: bold; — жирность\n\nЗадание: измени все h1 на 48px, жирный, Arial.`,
        starterCode: `<!DOCTYPE html>
<html>
<head>
<style>
  /* Пиши CSS стили здесь */
</style>
</head>
<body>
  <!-- HTML элементы здесь -->
</body>
</html>`,
      },
      {
        id: "css-3",
        title: "Урок 3. Flexbox",
        description: "Расположение элементов",
        theory: `display: flex; превращает блок в flex-контейнер.\njustify-content: center; — выравнивание по горизонтали\nalign-items: center; — по вертикали\n\nЗадание: расположи 3 квадрата по центру.`,
        starterCode: `<!DOCTYPE html>
<html>
<head>
<style>
  /* Пиши CSS стили здесь */
</style>
</head>
<body>
  <!-- HTML элементы здесь -->
</body>
</html>`,
      },
      {
        id: "css-4",
        title: "Урок 4. Кнопки с hover",
        description: "Псевдо-класс :hover",
        theory: `button:hover { background: red; } — стиль при наведении.\ntransition: 0.3s; — плавная анимация.\n\nЗадание: сделай кнопку, которая меняет цвет при наведении.`,
        starterCode: `<!DOCTYPE html>
<html>
<head>
<style>
  /* Пиши CSS стили здесь */
</style>
</head>
<body>
  <!-- HTML элементы здесь -->
</body>
</html>`,
      },
      {
        id: "css-5",
        title: "Урок 5. Отступы (Margin и Padding)",
        description: "Внутренние и внешние отступы",
        theory: `padding — это отступ ВНУТРИ элемента (от границы до текста).\nmargin — это отступ СНАРУЖИ (расстояние между элементами).\n\nЗадание: сделай красной кнопке внутренний отступ 20px, а внешний 50px.`,
        starterCode: `<!DOCTYPE html>
<html>
<head>
<style>
  /* Пиши CSS стили здесь */
</style>
</head>
<body>
  <!-- HTML элементы здесь -->
</body>
</html>`,
      },
      {
        id: "css-6",
        title: "Урок 6. Границы (Border)",
        description: "border, border-radius",
        theory: `border: 2px solid black; — рамка толщиной 2px.\nborder-radius: 10px; — закругляет углы. Если 50% — получится круг!\n\nЗадание: сделай аватарку круглой.`,
        starterCode: `<!DOCTYPE html>
<html>
<head>
<style>
  /* Пиши CSS стили здесь */
</style>
</head>
<body>
  <!-- HTML элементы здесь -->
</body>
</html>`,
      },
      {
        id: "css-7",
        title: "Урок 7. Тени (Box Shadow)",
        description: "box-shadow",
        theory: `box-shadow: X Y размытие цвет;\nПример: box-shadow: 5px 5px 15px rgba(0,0,0,0.3);\n\nЗадание: добавь красивую тень для карточки.`,
        starterCode: `<!DOCTYPE html>
<html>
<head>
<style>
  /* Пиши CSS стили здесь */
</style>
</head>
<body>
  <!-- HTML элементы здесь -->
</body>
</html>`,
      },
      {
        id: "css-8",
        title: "Урок 8. Позиционирование",
        description: "position: absolute / relative",
        theory: `position: relative; — точка отсчета.\nposition: absolute; — позволяет двигать элемент через top, left, right, bottom внутри relative-родителя.\n\nЗадание: помести красный кружок в правый верхний угол серого квадрата.`,
        starterCode: `<!DOCTYPE html>
<html>
<head>
<style>
  /* Пиши CSS стили здесь */
</style>
</head>
<body>
  <!-- HTML элементы здесь -->
</body>
</html>`,
      },
      {
        id: "css-9",
        title: "Урок 9. Плавные переходы",
        description: "transition",
        theory: `transition указывает, какие свойства должны меняться плавно.\nНапример, transition: transform 0.3s ease;\n\nЗадание: сделай так, чтобы квадрат при наведении плавно увеличивался (transform: scale(1.2)).`,
        starterCode: `<!DOCTYPE html>
<html>
<head>
<style>
  /* Пиши CSS стили здесь */
</style>
</head>
<body>
  <!-- HTML элементы здесь -->
</body>
</html>`,
      },
    ],
  },
  {
    id: "js",
    title: "JavaScript",
    emoji: "⚡",
    language: "javascript",
    color: "from-yellow-400/30 to-amber-500/30",
    description: "Интерактивность в браузере",
    lessons: [
      {
        id: "js-1",
        title: "Урок 1. console.log",
        description: "Первый вывод",
        theory: `console.log() выводит сообщение в консоль браузера.\n\nЗадание: выведи "Привет, мир!" и сумму 5 + 7.`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "js-2",
        title: "Урок 2. Переменные",
        description: "let, const",
        theory: `let имя = значение; — переменная\nconst — константа\n\nЗадание: создай переменную age = 14 и выведи "Мне 14 лет".`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "js-3",
        title: "Урок 3. Условия if",
        description: "if / else",
        theory: `if (условие) { ... } else { ... }\n\nЗадание: если оценка >= 5, выведи "Отлично", иначе "Учись лучше".`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "js-4",
        title: "Урок 4. Циклы",
        description: "for / while",
        theory: `for (let i = 0; i < 5; i++) { ... }\n\nЗадание: выведи числа от 1 до 10.`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "js-5",
        title: "Урок 5. Функции",
        description: "function / arrow",
        theory: `function sum(a, b) { return a + b; }\nconst sum = (a, b) => a + b;\n\nЗадание: напиши функцию greet(name), которая возвращает "Привет, {name}!".`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "js-6",
        title: "Урок 6. Массивы",
        description: "Сохраняем список данных",
        theory: `Массив (Array) — это список элементов.\nlet fruits = ["яблоко", "банан", "апельсин"];\nconsole.log(fruits[0]); // яблоко\n\nЗадание: создай массив из 3 твоих любимых игр и выведи вторую игру.`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "js-7",
        title: "Урок 7. Методы массивов",
        description: "push, pop, length",
        theory: `fruits.push("манго") — добавляет в конец.\nfruits.length — узнает длину массива.\n\nЗадание: добавь новый элемент в массив и выведи его длину.`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "js-8",
        title: "Урок 8. Объекты",
        description: "Ключ и значение",
        theory: `Объект хранит данные в виде свойств:\nlet player = { name: "Alex", score: 100 };\nconsole.log(player.name);\n\nЗадание: создай объект user с ключами username и level. Выведи их.`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "js-9",
        title: "Урок 9. Взаимодействие с HTML (DOM)",
        description: "document.getElementById",
        theory: `JS может менять HTML-страницу!\nlet el = document.getElementById("title");\nel.innerHTML = "Новый текст!";\n\n(Этот урок для консоли, поэтому тут мы работаем только с текстом)`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "js-10",
        title: "Урок 10. Таймеры",
        description: "setTimeout",
        theory: `setTimeout(функция, миллисекунды) вызывает код с задержкой.\n1000 мс = 1 секунда.\n\nЗадание: сделай так, чтобы сообщение "Бум!" вывелось через 2 секунды.`,
        starterCode: `// Напиши код здесь\n`,
      },
    ],
  },
  {
    id: "python",
    title: "Python",
    emoji: "🐍",
    language: "python",
    color: "from-green-500/30 to-emerald-500/30",
    description: "Универсальный язык программирования",
    lessons: [
      {
        id: "py-1",
        title: "Урок 1. print",
        description: "Первая программа",
        theory: `print() выводит текст.\n\nЗадание: выведи "Hello, Python!" и своё имя.`,
        starterCode: `# Напиши код здесь\n`,
      },
      {
        id: "py-2",
        title: "Урок 2. Переменные и input",
        description: "Ввод данных",
        theory: `Функция input() останавливает программу и ждет, пока пользователь что-то напишет, а затем возвращает это как строку.\nПример: name = input("Имя: ")\n\nВажно: если ты ждешь число (например, возраст), то строку нужно перевести в число с помощью int()!\nПример: age = int(input("Сколько тебе лет? "))\n\nЗадание: спроси у пользователя возраст (число) и выведи "Через 10 лет тебе будет N".`,
        starterCode: `# Напиши код здесь\n`,
      },
      {
        id: "py-3",
        title: "Урок 3. Условия",
        description: "if / elif / else",
        theory: `if x > 0:\n    print("плюс")\nelif x == 0:\n    print("ноль")\nelse:\n    print("минус")\n\nЗадание: напиши программу, которая по оценке (2–5) пишет словами.`,
        starterCode: `# Напиши код здесь\n`,
      },
      {
        id: "py-4",
        title: "Урок 4. Циклы",
        description: "for / range",
        theory: `for i in range(1, 11):\n    print(i)\n\nЗадание: выведи таблицу умножения на 7.`,
        starterCode: `# Напиши код здесь\n`,
      },
      {
        id: "py-5",
        title: "Урок 5. Функции",
        description: "def",
        theory: `def greet(name):\n    return f"Привет, {name}!"\n\nЗадание: напиши функцию, которая возвращает площадь прямоугольника.`,
        starterCode: `# Напиши код здесь\n`,
      },
      {
        id: "py-6",
        title: "Урок 6. Списки",
        description: "list",
        theory: `numbers = [1, 2, 3]\nnumbers.append(4)\nfor n in numbers:\n    print(n)\n\nЗадание: создай список из 5 любимых фильмов и выведи каждый с номером.`,
        starterCode: `# Напиши код здесь\n`,
      },
      {
        id: "py-7",
        title: "Урок 7. Словари (dict)",
        description: "Ключ и значение",
        theory: `Словарь в Python (как объект в JS) хранит пары: ключ - значение.\nuser = {"name": "Ivan", "age": 20}\nprint(user["name"])\n\nЗадание: создай словарь player с ключами hp и money.`,
        starterCode: `# Напиши код здесь\n`,
      },
      {
        id: "py-8",
        title: "Урок 8. Цикл While",
        description: "while True",
        theory: `Цикл while работает, пока условие истинно.\nx = 5\nwhile x > 0:\n    print(x)\n    x -= 1\n\nЗадание: напиши цикл, который выводит числа от 3 до 1, а потом "Старт!".`,
        starterCode: `# Напиши код здесь\n`,
      },
      {
        id: "py-9",
        title: "Урок 9. Методы строк",
        description: "upper, lower, replace",
        theory: `Строки можно легко менять:\ntext = "Привет"\nprint(text.upper()) # ПРИВЕТ\nprint(text.replace("и", "е")) # Превет\n\nЗадание: переведи весь текст в верхний регистр.`,
        starterCode: `# Напиши код здесь\n`,
      },
      {
        id: "py-10",
        title: "Урок 10. Модули (import)",
        description: "import random",
        theory: `В Python есть много готового кода. Модуль random помогает генерировать случайные числа.\nimport random\nprint(random.randint(1, 10))\n\nЗадание: брось кубик (случайное число от 1 до 6).`,
        starterCode: `# Напиши код здесь\n`,
      },
      {
        id: "py-11",
        title: "Урок 11. Обработка ошибок (try / except)",
        description: "Ловим ошибки",
        theory: `Если ввести букву вместо числа при int(input()), программа упадет. Чтобы этого избежать, используют try / except.\ntry:\n    # опасный код\nexcept ValueError:\n    # если ошибка\n\nЗадание: попробуй запустить этот код и введи букву.`,
        starterCode: `# Напиши код здесь\n`,
      },
    ],
  },
  {
    id: "node",
    title: "JS Backend (Node)",
    emoji: "🛠️",
    language: "node",
    color: "from-emerald-500/30 to-teal-500/30",
    description: "Серверный JavaScript",
    lessons: [
      {
        id: "node-1",
        title: "Урок 1. Что такое Node.js",
        description: "Запуск JS вне браузера",
        theory: `Node.js позволяет запускать JS на сервере.\nкоманда:  node app.js\n\nЗадание: напиши скрипт, выводящий "Сервер запущен".`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "node-2",
        title: "Урок 2. HTTP-сервер",
        description: "http модуль",
        theory: `import http from 'http';\nconst server = http.createServer((req, res) => {\n  res.end('Hello!');\n});\nserver.listen(3000);\n\nЗадание: сделай сервер, который отвечает "Привет, ученик!".`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "node-3",
        title: "Урок 3. JSON API",
        description: "Express + JSON",
        theory: `Express — фреймворк для API.\nimport express from 'express';\nconst app = express();\napp.get('/api', (req,res) => res.json({ok:true}));\napp.listen(3000);\n\nЗадание: добавь маршрут /api/student, возвращающий ФИО и класс.`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "node-4",
        title: "Урок 4. Обработка форм",
        description: "POST + body",
        theory: `app.use(express.json());\napp.post('/login', (req,res) => { ... });\n\nЗадание: сделай POST /login, который принимает {name} и отвечает приветствием.`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "node-5",
        title: "Урок 5. Динамические параметры",
        description: "req.params",
        theory: `Если в пути Express указать двоеточие, это будет параметр.\napp.get('/users/:id', (req, res) => {\n  res.json({ userId: req.params.id });\n});\n\nЗадание: создай маршрут /book/:title.`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "node-6",
        title: "Урок 6. Query-параметры",
        description: "req.query",
        theory: `Параметры в URL после вопроса: /search?q=apple\nДоступны через req.query.q\n\nЗадание: сделай поиск, который возвращает { result: req.query.q }.`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "node-7",
        title: "Урок 7. Middleware (Промежуточное ПО)",
        description: "app.use(logger)",
        theory: `Middleware — это функция, которая срабатывает ДО твоего ответа.\nНапример, можно логировать все запросы!\n\nЗадание: добавь middleware, который пишет в консоль каждый запрос.`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "node-8",
        title: "Урок 8. Статусы ошибок HTTP",
        description: "res.status(404)",
        theory: `Сервер должен возвращать правильные статусы:\n200 — OK\n404 — Не найдено\n500 — Ошибка сервера\n\nЗадание: верни статус 404 и JSON { error: "Not Found" }.`,
        starterCode: `// Напиши код здесь\n`,
      },
      {
        id: "node-9",
        title: "Урок 9. Простая база данных в памяти",
        description: "Массивы как БД",
        theory: `Пока мы не подключили настоящую БД (например, PostgreSQL), можно хранить данные в массиве.\nОни будут жить, пока сервер включен.\n\nЗадание: сделай массив users и добавляй туда пользователей через POST.`,
        starterCode: `// Напиши код здесь\n`,
      },
    ],
  },
];

export function findCourse(id?: string) {
  return getCoursesWithCustom().find((c) => c.id === id);
}

export function findLesson(courseId?: string, lessonId?: string) {
  const c = findCourse(courseId);
  return { course: c, lesson: c?.lessons.find((l) => l.id === lessonId) };
}

// ─── Custom lessons from admin panel ─────────────────────────────────────────

const LANG_TO_COURSE: Record<string, string> = {
  html: "html",
  css: "css",
  javascript: "javascript",
  python: "python",
  node: "node",
};

export function getCoursesWithCustom(): Course[] {
  try {
    const raw = localStorage.getItem("admin_custom_lessons");
    if (!raw) return COURSES;
    const custom: any[] = JSON.parse(raw);
    if (!custom.length) return COURSES;

    // Deep clone COURSES to avoid mutating the original
    const merged: Course[] = COURSES.map(c => ({ ...c, lessons: [...c.lessons] }));

    for (const cl of custom) {
      const courseId = LANG_TO_COURSE[cl.courseId] || cl.courseId;
      const target = merged.find(c => c.id === courseId);
      if (target) {
        target.lessons.push({
          id: cl.id,
          title: cl.title,
          description: cl.description || "",
          theory: cl.theory || "",
          starterCode: cl.starterCode || "// Напиши код здесь\n",
          hint: cl.hint || undefined,
        });
      }
    }
    return merged;
  } catch {
    return COURSES;
  }
}
