from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm

from presentation.api.v1.dependencies.dependencies import get_current_user
from presentation.api.v1.dtos.requests.current_user_dto import CurrentUserDTO


FormDataDep = Annotated[OAuth2PasswordRequestForm, Depends()]
CurrentUserDep = Annotated[CurrentUserDTO, Depends(get_current_user)]
CurrentUserWsDep = Annotated[CurrentUserDTO, Depends(get_current_user)]
