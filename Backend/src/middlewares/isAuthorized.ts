import Elysia from "elysia";
import { UnauthorizedError } from "@/lib/errors/AppError";
import { UserRoles } from "@/modules/user/user.model";
import { decorateUser } from "./decorateUser";

export const isAuthorized = new Elysia({ name: "middleware:isAuthorized" })
    .use(decorateUser)
    .macro({
        isAuthorized: (allowedRoles: UserRoles[]) => ({
            beforeHandle: ({ currentUser }) => {
                if (!currentUser) {
                    throw new UnauthorizedError('Não autorizado: Usuário não autenticado');
                }

                const { role } = currentUser;
                if (!role || !allowedRoles.includes(role as UserRoles)) {
                    throw new UnauthorizedError("Acesso negado: Você não tem permissão para este recurso.");
                }
            }
        })
    })
    .as("global")