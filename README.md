# Ludowars Battle

[![CI](https://github.com/MaksArh/ludowars-battle/actions/workflows/ci.yml/badge.svg)](https://github.com/MaksArh/ludowars-battle/actions/workflows/ci.yml)

2D мультиплеерная игра-платформер с элементами шутера.

## 🎮 О проекте

**Ludowars Battle** - динамичный 2D платформер-шутер для веб-браузеров. Быстрые 5-минутные матчи, где побеждает самый ловкий и меткий.

### Ключевые особенности

- 🚀 Играйте прямо в браузере
- ⚡ Быстрые матчи (5-7 минут)
- 🎯 Skill-based геймплей
- 🛒 Магазин снаряжения
- 🏆 Глобальная таблица лидеров

## 📚 Документация

Полная документация проекта находится в папке [`docs/`](./docs/):

- [Архитектура](./docs/architecture.md)
- [Потоки данных](./docs/data-flow.md)
- [Frontend data flow](./docs/frontend-data-flow.md)
- [User Flow](./docs/user-flow.md)
- [Game Design](./docs/game-design.md)
- [Презентация](./docs/presentation.md)
- [Sprint Plan](./docs/sprint-plan.md)

## 🚀 Быстрый старт

### Требования

- Node.js 20+
- npm 10+
- Docker (для backend)

### Установка

```bash
# Клонировать репозиторий
git clone git@github.com:MaksArh/ludowars-battle.git
cd ludowars-battle

# Установить зависимости frontend
cd frontend
npm install

# Запустить dev сервер
npm run dev
```

Приложение будет доступно на http://localhost:3000

## 🏗️ Структура проекта

```
ludowars-battle/
├── frontend/           # React + TypeScript приложение
│   ├── src/           # Исходный код
│   ├── tests/         # Тесты (unit + e2e)
│   └── package.json
├── backend/           # Nakama конфигурация (в разработке)
├── docs/              # Документация проекта
├── .github/
│   ├── workflows/     # CI/CD (GitHub Actions)
│   └── ISSUE_TEMPLATE/
└── CONTRIBUTING.md    # Гайд для контрибьюторов
```

## 🧪 Тестирование

### Unit тесты

```bash
cd frontend
npm run test              # Запуск тестов
npm run test:coverage     # С отчетом о покрытии
```

### E2E тесты

```bash
cd frontend
npm run test:e2e          # Запуск e2e тестов
```

## 🔧 Разработка

### Линтинг

```bash
cd frontend
npm run lint              # Проверка
npm run lint:fix          # Автоисправление
```

### Code Style

- **ESLint** - проверка JavaScript/TypeScript
- **Prettier** - форматирование кода
- **Stylelint** - проверка CSS

## 📋 CI/CD

Проект использует GitHub Actions для автоматического тестирования и деплоя.

### Требования для merge в main:

- ✅ **Lint проверки** проходят (G3.7, G3.8)
- ✅ **Unit тесты** проходят (G3.1, G3.4)
- ✅ **Test coverage** ≥ 80% (G3.3, G3.5)
- ✅ **E2E тесты** проходят (G3.2, G3.6)
- ✅ **Code review** от минимум 1 человека (G3.0)

### Branch Protection (G3.0)

В репозитории настроены следующие правила:

- ❌ Нельзя коммитить напрямую в `main`
- ✅ Требуется Pull Request
- ✅ Требуется прохождение всех CI checks
- ✅ Требуется code review
- ❌ Нельзя force push

## 🤝 Contributing

Мы приветствуем вклад от сообщества! Пожалуйста, прочитайте [CONTRIBUTING.md](./CONTRIBUTING.md) перед тем как создавать Pull Request.

### Процесс контрибьюта:

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'feat: add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 👥 Команда

- **Arsenii Karov** ([@ArseniiKarov](https://github.com/ArseniiKarov)) - Frontend UI
- **Daniil Andreev** ([@Danchikitmo](https://github.com/Danchikitmo)) - Frontend Game
- **Maks Arh** ([@MaksArh](https://github.com/MaksArh)) - Backend & DevOps

## 🛠️ Технологии

### Frontend
- React 18 + TypeScript 5
- Vite 5
- Vitest (testing)
- Playwright (e2e)
- ESLint + Prettier

### Backend (в разработке)
- Nakama (Go)
- PostgreSQL

### DevOps
- Docker + Docker Compose
- GitHub Actions
- Sentry (error tracking)
- Yandex Metrika (analytics)

## 📝 Лицензия

MIT License - см. [LICENSE](./LICENSE)

## 📞 Контакты

- GitHub: https://github.com/MaksArh/ludowars-battle
- Email: teamtiras@gmail.com

---

**Dodge First, Shoot Second!** 🎮🚀

