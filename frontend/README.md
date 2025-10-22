# Ludowars Battle - Frontend

React + TypeScript фронтенд для 2D мультиплеерной игры-платформера.

## Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск dev сервера

```bash
npm run dev
```

Приложение будет доступно на http://localhost:3000

### Сборка для продакшн

```bash
npm run build
```

### Preview продакшн сборки

```bash
npm run preview
```

## Разработка

### Линтинг

```bash
# Проверка
npm run lint

# Автоисправление
npm run lint:fix
```

### Тестирование

#### Unit тесты (Vitest)

```bash
# Запуск тестов
npm run test

# С coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

#### E2E тесты (Playwright)

```bash
# Установить браузеры (первый раз)
npx playwright install

# Запуск e2e тестов
npm run test:e2e

# В UI mode
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

## Структура проекта

```
frontend/
├── src/
│   ├── components/      # React компоненты
│   │   ├── Button.tsx
│   │   ├── Button.css
│   │   ├── Counter.tsx
│   │   └── Counter.css
│   ├── App.tsx          # Главный компонент
│   ├── App.css
│   ├── main.tsx         # Entry point
│   └── index.css
├── tests/
│   ├── setup.ts         # Test setup
│   ├── unit/            # Unit тесты
│   │   ├── App.test.tsx
│   │   ├── Button.test.tsx
│   │   └── Counter.test.tsx
│   └── e2e/             # E2E тесты
│       └── app.spec.ts
├── public/              # Статические файлы
├── index.html           # HTML template
├── package.json
├── vite.config.ts       # Vite конфигурация
├── vitest.config.ts     # Vitest конфигурация
├── playwright.config.ts # Playwright конфигурация
├── tsconfig.json        # TypeScript конфигурация
├── .eslintrc.json       # ESLint правила
├── .prettierrc          # Prettier настройки
└── .stylelintrc.json    # Stylelint настройки
```

## Технологии

- **React 18** - UI библиотека
- **TypeScript 5** - типизация
- **Vite 5** - сборка и dev server
- **Vitest** - unit тестирование
- **Playwright** - e2e тестирование
- **ESLint + Prettier** - линтинг и форматирование
- **Stylelint** - линтинг CSS

## Требования

- Node.js 20+
- npm 10+

## CI/CD

Проект использует GitHub Actions для автоматического тестирования:

- ✅ Lint проверки
- ✅ Unit тесты
- ✅ Coverage ≥ 80%
- ✅ E2E тесты

Все checks должны пройти для merge в main.

