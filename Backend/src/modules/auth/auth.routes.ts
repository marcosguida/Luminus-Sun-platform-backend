import Elysia from "elysia";
import { authService } from "./auth.service";
import { loginRequestSchema, registerRequestSchema } from "./auth.dto";
import { env } from "@/config/env";

export const authRoutes = new Elysia({ prefix: "/auth" })
    .post("/login", async ({ body, set }) => {
        const { email, password } = body;

        const loginWithToken = await authService.login({ email, password });

        set.cookie = {
            authToken: {
                value: loginWithToken.token,
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 7 * 86400,
            }
        }

        set.status = 200;

        return loginWithToken;
    }, {
        body: loginRequestSchema
    })
    .post("/register", async ({ body, set }) => {
        const { email, phone, password, name, regionId } = body;

        const registerUser = await authService.register({ email, phone, password, name, regionId });

        set.status = 201;

        return registerUser;
    }, {
        body: registerRequestSchema
    })
    .post("/logout", async ({ set, cookie }) => {
        cookie.authToken?.remove();

        set.status = 200;
        return { message: 'Logout realizado com sucesso!' };
    })
    
