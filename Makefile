.PHONY: build

build:
	docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_SITE_URL=https://rememoi.com \
  -t rememoi:latest .
