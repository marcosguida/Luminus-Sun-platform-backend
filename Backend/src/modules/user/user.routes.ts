import Elysia from "elysia";
import { userService } from "./user.service";
import { createUserRequestSchema, updateUserRequestSchema } from "./user.dto";
import { zodIdParams } from "@/lib/validators/zod.helpers";
import { isAuthorized } from "@/middlewares/isAuthorized";
import { UserRoles } from "./user.model";


export const userRoutes = new Elysia({ name: 'routes:users', prefix: '/users' })
    .use(isAuthorized)
    .get("/", async () => {
        const users = await userService.Query.findUsersWithRegion();
        return users;
    }, {
        // isAuthorized: [UserRoles.ADMIN],        
    })
    .get("/:id", async ({ params }) => {
        const { id } = params;

        const user = await userService.Query.findUserById(id);
        return user;
    }, {
        params: zodIdParams.shape.params,
        // isAuthorized: [UserRoles.ADMIN]
    })
    .post("/", async ({ body }) => {
        const { email, name, password, role, phone, city, state } = body;

        const newUser = await userService.Mutation.createUser({ email, name, password, role, phone, city, state });

        return newUser;
    }, {
        body: createUserRequestSchema,
        // isAuthorized: [UserRoles.ADMIN]
    })
    .put("/:id", async ({ params, body }) => {
        const { id } = params;
        const { email, name, password, isActive, phone, city, state, role } = body;

        const updatedUser = await userService.Mutation.updateUser(id, {
            email,
            name,
            phone,
            city, 
            state,
            role,
            password,
            isActive
        });

        return updatedUser;
    }, {
        params: zodIdParams.shape.params,
        body: updateUserRequestSchema,
        // isAuthorized: [UserRoles.ADMIN]
    })
    .put("/status/:id", async ({ params, body }) => {
        const { id } = params;
        const { isActive } = body;

        const updatedUserStatus = await userService.Mutation.updateUser(id, {
            isActive
        });
        return updatedUserStatus;
    }, {
        params: zodIdParams.shape.params,
        body: updateUserRequestSchema.pick({ isActive: true }),
        // isAuthorized: [UserRoles.ADMIN]
    })
    .delete("/:id", async ({ params }) => {
        const { id } = params;

        const deletedCount = await userService.Mutation.deleteUser(id);
        return deletedCount;
    }, {
        params: zodIdParams.shape.params,
        // isAuthorized: [UserRoles.ADMIN]
    })