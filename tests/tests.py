import json
import time
from contextlib import ExitStack

import pytest
from fastapi.testclient import TestClient

from main import app
from domain.enums import WebSocketMessageTypeEnum


players = []
test_data = {"players": players}


@pytest.fixture(scope="session")
def client():
    with TestClient(app, base_url="http://localhost:8000") as client:
        yield client


@pytest.fixture
def lobby(client: TestClient):
    response = client.post(
        "lobbies/",
        json={"max_players": 5},
        headers={
            "authorization": f"Bearer {test_data['players'][0]['access_token']}"
        },
    )
    yield response.json()
    response = client.post(
        f"lobbies/{response.json()['id']}/leave",
        headers={
            "authorization": f"Bearer {test_data['players'][0]['access_token']}"
        },
    )


def test_login(client: TestClient):
    for i in range(5):
        response = client.post(
            "user/login/",
            data={"username": f"User{i + 1}", "password": f"Userpwd{i + 1}"},
        )
        assert response.status_code == 200

        test_data["players"].append(
            {
                "access_token": response.json()["accessToken"],
                "refresh_token": response.cookies["refreshToken"],
            }
        )


def test_create_lobby(client: TestClient, lobby: dict[str, any]):
    assert lobby is not None


def test_join_lobby(client: TestClient, lobby: dict[str, any]):
    for i in range(1, 5):
        response = client.post(
            f"lobbies/{lobby['id']}/join",
            headers={
                "authorization": f"Bearer {
                    test_data['players'][i]['access_token']
                }"
            },
        )
        assert response.status_code == 200

    with ExitStack() as stack:
        joined_players = []
        for i in range(5):
            headers = {
                "authorization": f"Bearer {
                    test_data['players'][i]['access_token']
                }"
            }
            ws = stack.enter_context(
                client.websocket_connect(
                    f"rooms/{lobby['id']}",
                    headers=headers,
                )
            )
            joined_players.append(ws)
            time.sleep(0.01)
            for j in range(len(joined_players)):
                response = json.loads(joined_players[j].receive_json())
                assert (
                    response["messageType"]
                    == WebSocketMessageTypeEnum.USER_CONNECT
                )
