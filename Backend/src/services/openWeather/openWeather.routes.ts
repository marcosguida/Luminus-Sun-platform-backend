import Elysia from "elysia";
import { OpenWeatherService } from "./openWeather.service";
import { geocodingService } from "@/services/geocoding/geocoding.service";
import { isAuthorized } from "@/middlewares/isAuthorized";
import { openWeatherByCityQuerySchema, openWeatherCoordsQuerySchema } from "./openWeather.dto";


export const openWeatherRoutes = new Elysia({ name: "externalServices:routes:openweather", prefix: "/openweather" })
    .use(isAuthorized)
    .get("/current", async ({ query }) => {
        const { lat, lon } = query;

        const data = await OpenWeatherService.getCurrentWeather({ lat, lon });
        return data;
    }, {
        // isAuthorized: [UserRoles.ADMIN],
        query: openWeatherCoordsQuerySchema
    })
    .get("/forecast5d", async ({ query }) => {
        const { lat, lon } = query;

        const data = await OpenWeatherService.getForecastThreeHours5Days({ lat, lon });
        return data;
    }, {
        // isAuthorized: [UserRoles.ADMIN],
        query: openWeatherCoordsQuerySchema
    })
    .get("/by-city", async ({ query }) => {
        const { city, state, country } = query;

        const { lat, lon } = await geocodingService.getCoordinatesByCity({ city, state, country });
        const data = await OpenWeatherService.getCurrentWeather({ lat, lon });
        return data;
    }, {
        // isAuthorized: [UserRoles.ADMIN],
        query: openWeatherByCityQuerySchema
    })
