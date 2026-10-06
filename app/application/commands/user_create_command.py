from dataclasses import dataclass


@dataclass
class UserCreateCommand:
    username: str
    email: str
    password: str
