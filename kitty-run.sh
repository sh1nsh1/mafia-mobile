#!/bin/bash

kitty @ launch --type=tab --title "Frontend" --cwd="$(pwd)/frontend" --keep-focus --hold sh -c "sleep 2 && npm run dev"
kitty @ launch --type=tab --title "Backend" --cwd="$(pwd)/backend" --keep-focus --hold sh -c "sleep 1 && uv run fastapi dev"
kitty @ launch --type=tab --title "Infrastructure" --cwd="$(pwd)" --keep-focus --hold docker compose up postgres redis rustfs