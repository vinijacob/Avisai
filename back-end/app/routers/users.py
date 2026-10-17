from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import AdminUser, DbSession
from app.models import User
from app.schemas import RoleIn, UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserOut])
def list_users(db: DbSession, _: AdminUser) -> list[User]:
    return list(db.scalars(select(User).order_by(User.role, User.name)).all())


@router.patch("/{user_id}/role", response_model=UserOut)
def change_role(user_id: int, data: RoleIn, db: DbSession, admin: AdminUser) -> User:
    if user_id == admin.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Você não pode alterar o seu próprio papel.")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuário não encontrado.")
    user.role = data.role
    db.commit()
    return user
