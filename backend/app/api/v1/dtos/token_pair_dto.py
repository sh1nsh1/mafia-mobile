from pydantic import BaseModel


class TokenPairDTO(BaseModel):
    access_token: str
    refresh_token: str
