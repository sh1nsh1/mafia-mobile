# from infrastructure.database.models.user import UserModel

class User:
    '''
    User is a representation of a real-life user in the app.
    '''
    user_id: str
    username: str
    nickname: str
    email: str
    phone_number: str
    signup_date: str
    #todo payer_account   

    # def to_model(self):
    #     return UserModel(self)