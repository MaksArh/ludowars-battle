.PHONY: run stop logs clean build lint

run:
	docker-compose up -d

stop:
	docker-compose down

logs:
	docker-compose logs -f

logs-frontend:
	docker-compose logs -f frontend

logs-nakama:
	docker-compose logs -f nakama

build:
	docker-compose build

rebuild:
	docker-compose build --no-cache

clean:
	docker-compose down -v
	rm -rf frontend/node_modules frontend/dist

lint:
	cd frontend && npm run lint

lint-fix:
	cd frontend && npm run lint:fix

format:
	cd frontend && npm run format

install:
	cd frontend && npm install

dev:
	cd frontend && npm run dev

type-check:
	cd frontend && npm run type-check



