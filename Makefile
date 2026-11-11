# Read the production env file so `make build` bakes the same public values that
# the container receives at runtime (NEXT_PUBLIC_* is compiled in, not read at
# startup). The leading dash keeps fresh clones without the file working.
-include .env.production

NEXT_PUBLIC_SITE_URL ?= https://rememoi.com
NEXT_PUBLIC_GA_ID ?=

.PHONY: build

build:
	docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_SITE_URL=$(NEXT_PUBLIC_SITE_URL) \
  --build-arg NEXT_PUBLIC_GA_ID=$(NEXT_PUBLIC_GA_ID) \
  -t rememoi:latest .
