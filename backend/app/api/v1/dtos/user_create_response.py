from pydantic import BaseModel


class UserCreateResponse(BaseModel):
    status: str
    message: str
    access_token: str
    refresh_token: str
