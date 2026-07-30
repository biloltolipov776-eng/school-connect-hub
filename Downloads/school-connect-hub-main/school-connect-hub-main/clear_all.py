import re

with open('src/data/lessons.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Make all starter codes comments depending on language.
# HTML/CSS should have a skeleton.
html_skeleton = """<!DOCTYPE html>
<html>
<body>
  <!-- Пиши код здесь -->
</body>
</html>"""

css_skeleton = """<!DOCTYPE html>
<html>
<head>
<style>
  /* Пиши CSS стили здесь */
</style>
</head>
<body>
  <!-- HTML элементы здесь -->
</body>
</html>"""

def replacer(match):
    lesson_id = match.group(1)
    # the existing starter code is match.group(2)
    if lesson_id.startswith('html-'):
        return f'id: "{lesson_id}",\n        starterCode: `{html_skeleton}`'
    elif lesson_id.startswith('css-'):
        return f'id: "{lesson_id}",\n        starterCode: `{css_skeleton}`'
    elif lesson_id.startswith('js-') or lesson_id.startswith('node-'):
        return f'id: "{lesson_id}",\n        starterCode: `// Напиши код здесь\\n`'
    elif lesson_id.startswith('py-'):
        return f'id: "{lesson_id}",\n        starterCode: `# Напиши код здесь\\n`'
    return match.group(0)

# Regex to match:
# id: "xxx",
# title: ...
# description: ...
# theory: ...
# starterCode: `...`

# A bit simpler: we can just replace starterCode globally if we capture the lesson ID earlier.
# Let's split by "id: "
parts = text.split('id: "')
new_parts = [parts[0]]
for part in parts[1:]:
    lesson_id = part.split('"', 1)[0]
    
    # replace starterCode: `...`
    # We need to find `starterCode: ` and the matching backticks.
    start_idx = part.find('starterCode: `')
    if start_idx != -1:
        end_idx = part.find('`,', start_idx + 14)
        if end_idx != -1:
            code = part[start_idx + 14 : end_idx]
            if lesson_id.startswith('html-'):
                new_code = html_skeleton
            elif lesson_id.startswith('css-'):
                new_code = css_skeleton
            elif lesson_id.startswith('js-') or lesson_id.startswith('node-'):
                new_code = '// Напиши код здесь\\n'
            elif lesson_id.startswith('py-'):
                new_code = '# Напиши код здесь\\n'
            else:
                new_code = code # fallback
            
            part = part[:start_idx] + f'starterCode: `{new_code}`,' + part[end_idx + 2:]
    
    new_parts.append(part)

with open('src/data/lessons.ts', 'w', encoding='utf-8') as f:
    f.write('id: "'.join(new_parts))
print("Fixed starter codes for all lessons")
