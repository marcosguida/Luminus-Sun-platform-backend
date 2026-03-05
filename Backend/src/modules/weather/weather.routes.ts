import Elysia from "elysia";
import { weatherService } from "./weather.service";
import { createWeatherRequestSchema, updateWeatherRequestSchema } from "./weather.dto";
import { zodIdParams } from "@/lib/validators/zod.helpers";
import { isAuthorized } from "@/middlewares/isAuthorized";
import { UserRoles } from "../user/user.model";
import z from "zod";

export const weatherRoutes = new Elysia({ name: "routes:weather", prefix: "/weather" })
    .use(isAuthorized)
    .get(
        "/",
        async () => {
            const weathers = await weatherService.Query.findAllWeather();
            return weathers;
        },
        {
            // isAuthorized: [UserRoles.ADMIN],
        }
    )
    .get(
        "/:id",
        async ({ params }) => {
            const { id } = params;
            const weather = await weatherService.Query.findWeatherById(id);
            return weather;
        },
        {
            params: zodIdParams.shape.params,
            isAuthorized: [UserRoles.ADMIN],
        }
    )
    .get(
        "/region/:id",
        async ({ params }) => {
            const { id } = params;
            const weathers = await weatherService.Query.findWeatherByRegionId(id);
            return weathers;
        },
        {
            params: zodIdParams.shape.params,
            // isAuthorized: [UserRoles.ADMIN, UserRoles.USER],
        }
    )

    .post(
        "/",
        async ({ body }) => {
            const weather = await weatherService.Mutation.createWeather(body);
            return weather;
        },
        {
            body: createWeatherRequestSchema,
            // isAuthorized: [UserRoles.ADMIN],
        }
    )

    .put(
        "/:id",
        async ({ params, body }) => {
            const { id } = params;
            const updatedWeather = await weatherService.Mutation.updateWeather(id, body);
            return updatedWeather;
        },
        {
            params: zodIdParams.shape.params,
            body: updateWeatherRequestSchema,
            // isAuthorized: [UserRoles.ADMIN],
        }
    )

    .delete(
        "/:id",
        async ({ params }) => {
            const { id } = params;
            const deleted = await weatherService.Mutation.deleteWeather(id);
            return deleted;
        },
        {
            params: zodIdParams.shape.params,
            // isAuthorized: [UserRoles.ADMIN],
        }
    )
    .post(
        "/bulk",
        async ({ body }) => {
            const { weathers } = body;
            const response = await weatherService.Mutation.bulkInsert(weathers);
            return response;
        },
        {
            body: z.object({
                weathers: z.array(createWeatherRequestSchema),
            }),
            // isAuthorized: [UserRoles.ADMIN],
        }
    );
