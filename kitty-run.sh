#!/bin/bash

kitty @ launch --type=tab --title "Frontend" --cwd="$(pwd)/frontend" --keep-focus sh -c "sleep 2 && npm run dev"
kitty @ launch --type=tab --title "Backend" --cwd="$(pwd)/backend" --keep-focus sh -c "sleep 1 && uv run fastapi dev"
kitty @ launch --type=tab --title "Infrastructure" --cwd="$(pwd)" --keep-focus docker compose up postgres redis rustfs