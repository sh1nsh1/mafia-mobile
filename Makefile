.PHONY: dev lint fmt typecheck fix

all: typecheck lint fmt

dev:
	uv run fastapi dev

lint:
	ruff check .

fmt:
	ruff format .

typecheck:
	ty check

fix:
	uv run ruff check --fix .
	uv run ruff format .