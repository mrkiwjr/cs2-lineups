.PHONY: dev build start stop lint clean

IMAGE_NAME := cs2-lineups
CONTAINER_NAME := cs2-lineups-app

dev:
	docker compose up --build

build:
	docker build \
		--target runner \
		--build-arg NEXT_PUBLIC_SUPABASE_URL=$$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d= -f2) \
		--build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2) \
		-t $(IMAGE_NAME) .

start:
	docker run --rm -p 3000:3000 \
		--env-file .env.local \
		--name $(CONTAINER_NAME) \
		$(IMAGE_NAME)

stop:
	docker compose down
	-docker stop $(CONTAINER_NAME) 2>/dev/null

lint:
	npm run lint

clean:
	docker compose down -v --rmi local
	-docker rmi $(IMAGE_NAME) 2>/dev/null
