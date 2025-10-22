# Contributing to Ludowars Battle

## Процесс разработки (GitHub Flow)

Мы используем упрощенный GitHub Flow для управления изменениями:

### 1. Создание ветки

```bash
# Обновите main ветку
git checkout main
git pull origin main

# Создайте feature ветку
git checkout -b feature/your-feature-name
# или
git checkout -b fix/bug-description
```

### 2. Разработка

- Делайте небольшие, логические коммиты
- Пишите понятные commit messages
- Следуйте code style проекта
- Добавляйте тесты для новой функциональности

### 3. Коммиты

```bash
git add .
git commit -m "feat: add new feature"
```

**Формат commit messages:**
- `feat:` - новая функциональность
- `fix:` - исправление бага
- `docs:` - изменения в документации
- `style:` - форматирование, отсутствующие точки с запятой и т.д.
- `refactor:` - рефакторинг кода
- `test:` - добавление тестов
- `chore:` - обновление зависимостей, конфигурации и т.д.

### 4. Push изменений

```bash
git push origin feature/your-feature-name
```

### 5. Создание Pull Request

1. Откройте Pull Request на GitHub
2. Заполните шаблон PR
3. Дождитесь прохождения CI checks
4. Запросите review у команды

### 6. Code Review

- Отвечайте на комментарии reviewer'ов
- Вносите необходимые изменения
- Push изменений в ту же ветку

### 7. Merge

После одобрения и прохождения всех checks, ваш PR будет смержен в `main`.

## Правила контрибьюта

### ⛔ Запрещено

1. **Прямые коммиты в `main`**
   - Все изменения должны идти через Pull Requests
   - Branch protection включен

2. **Force push в `main`**
   - Это нарушит историю для всех

3. **Merge без прохождения CI**
   - Все checks должны быть зелёными

### ✅ Обязательно

1. **Линтинг проходит**
   ```bash
   npm run lint
   ```

2. **Все тесты проходят**
   ```bash
   npm run test        # Unit tests
   npm run test:e2e    # E2E tests
   ```

3. **Test coverage ≥ 80%**
   ```bash
   npm run test:coverage
   ```

4. **Code review от минимум 1 человека**

## Code Style

### TypeScript/JavaScript

- Используем ESLint + Prettier
- Запустите `npm run lint:fix` перед коммитом
- Настройки в `.eslintrc.json` и `.prettierrc`

### CSS

- Используем Stylelint
- Настройки в `.stylelintrc.json`
- BEM naming convention для классов

### Именование

- **Компоненты**: `PascalCase` (например, `Button.tsx`)
- **Функции**: `camelCase` (например, `handleClick`)
- **Константы**: `UPPER_SNAKE_CASE` (например, `MAX_PLAYERS`)
- **Файлы**: `kebab-case` или `PascalCase` для компонентов

## Тестирование

### Unit Tests (Vitest)

```bash
# Запуск всех тестов
npm run test

# Watch mode
npm run test:watch

# С coverage
npm run test:coverage
```

Тесты находятся в `tests/unit/`

### E2E Tests (Playwright)

```bash
# Запуск e2e тестов
npm run test:e2e

# В UI mode
npx playwright test --ui

# Конкретный тест
npx playwright test app.spec.ts
```

Тесты находятся в `tests/e2e/`

### Требования к тестам

- Каждая новая функция должна быть покрыта тестами
- Минимальный coverage: 80%
- Тесты должны быть понятными и поддерживаемыми

## CI/CD Pipeline

Наш CI запускается автоматически на каждый Pull Request:

1. **Lint Check** - проверка code style
2. **Unit Tests** - запуск unit тестов
3. **Coverage Check** - проверка покрытия (≥ 80%)
4. **E2E Tests** - запуск e2e тестов

Все checks должны пройти успешно для merge.

## Структура проекта

```
ludowars-battle/
├── frontend/
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── App.tsx      # Главный компонент
│   │   └── main.tsx     # Entry point
│   ├── tests/
│   │   ├── unit/        # Unit тесты
│   │   └── e2e/         # E2E тесты
│   └── package.json
├── backend/             # Nakama конфигурация
├── docs/                # Документация
└── .github/
    ├── workflows/       # CI/CD
    └── ISSUE_TEMPLATE/  # Issue templates
```

## Команда

- **ArseniiKarov** (karov.arsenii@gmail.com) - Frontend UI
- **Danchikitmo** (daniil.andreev.959@gmail.com) - Frontend Game
- **MaksArh** (teamtiras@gmail.com) - Backend & DevOps

## Лицензия

Участвуя в проекте, вы соглашаетесь с тем, что ваш вклад будет лицензирован под той же лицензией, что и проект.



