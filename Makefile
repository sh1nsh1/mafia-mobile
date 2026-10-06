.PHONY: dev lint fmt typecheck

all: typecheck lint fmt

dev:
	uv run fastapi dev

lint:
	ruff check .

fmt:
	ruff format .

typecheck:
	ty check