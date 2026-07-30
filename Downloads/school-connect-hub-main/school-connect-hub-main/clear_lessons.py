import re

with open('src/data/lessons.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace full codes with comments
text = text.replace(
    'starterCode: `console.log("Hello!");\\n`,',
    'starterCode: `// Напиши вывод приветствия сюда\\n`,'
)
text = text.replace(
    'starterCode: `let age = 14;\\nconsole.log(\\`Мне ${age} лет\\`);`,',
    'starterCode: `// Создай переменную age и выведи текст\\n`,'
)
text = text.replace(
    'starterCode: `let grade = 5;\\nif (grade >= 5) {\\n  console.log("Отлично");\\n} else {\\n  console.log("Учись лучше");\\n}`,',
    'starterCode: `// Напиши условие if/else\\nlet grade = 5;\\n`,'
)
text = text.replace(
    'starterCode: `for (let i = 1; i <= 10; i++) {\\n  console.log(i);\\n}`,',
    'starterCode: `// Напиши цикл for от 1 до 10\\n`,'
)
text = text.replace(
    'starterCode: `print("Hello, Python!")\\n`,',
    'starterCode: `# Выведи приветствие\\n`,'
)
text = text.replace(
    'starterCode: `age = int(input("Сколько тебе лет? "))\\nprint("Через 10 лет тебе будет", age + 10)`,',
    'starterCode: `# Спроси возраст и выведи результат\\n`,'
)
text = text.replace(
    'starterCode: `grade = 5\\nif grade == 5:\\n    print("отлично")\\nelif grade == 4:\\n    print("хорошо")\\nelse:\\n    print("надо подтянуть")`,',
    'starterCode: `# Напиши условие\\ngrade = 5\\n`,'
)
text = text.replace(
    'starterCode: `for i in range(1, 11):\\n    print(f"7 x {i} = {7*i}")`,',
    'starterCode: `# Напиши цикл for для таблицы умножения\\n`,'
)
text = text.replace(
    'starterCode: `console.log("Сервер запущен");\\n`,',
    'starterCode: `// Выведи сообщение\\n`,'
)

# And clear the starter codes I added for JS/Py/Node
# (Just replacing the ones that give away the answer entirely)
text = text.replace(
    'starterCode: `let games = ["Minecraft", "Roblox", "CS:GO"];\\nconsole.log(games[1]);`,',
    'starterCode: `// Создай массив игр и выведи вторую\\n`,'
)
text = text.replace(
    'starterCode: `player = {"hp": 100, "money": 50}\\nprint("Здоровье:", player["hp"])\\nplayer["money"] += 10\\nprint("Деньги:", player["money"])`,',
    'starterCode: `# Создай словарь player\\n`,'
)
text = text.replace(
    'starterCode: `n = 3\\nwhile n > 0:\\n    print(n)\\n    n -= 1\\nprint("Старт!")`,',
    'starterCode: `# Напиши цикл while\\n`,'
)

with open('src/data/lessons.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
