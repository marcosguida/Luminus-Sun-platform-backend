import cron, { Patterns } from "@elysiajs/cron";
import Elysia from "elysia";
import { mapCurrentWeatherToModel, mapForecastWeatherToModel } from "@/services/openWeather/openWeather.mapper";
import { weatherRepository } from "@/modules/weather/weather.repository";
import { OpenWeatherService } from "@/services/openWeather/openWeather.service";
import { userRepository } from "@/modules/user/user.repository";

export const weatherJob = new Elysia({ name: "job:weather" })
    .use(
        cron({
            name: "weatherJob",
            pattern: Patterns.everyMinutes(10),
            async run() {
                console.log("🌤️ [CRON] Iniciando atualização climática para regiões associadas a usuários...");

                try {
                    const usersWithRegions = await userRepository.Query.findUsersWithRegion();

                    if (usersWithRegions.length === 0) {
                        console.log("⚠️ Nenhum usuário com região associada encontrado.");
                        return;
                    }

                    const processedRegions = new Set<string>();

                    for (const user of usersWithRegions) {
                        const region = user.regionId;
                        if (!region || !region.latitude || !region.longitude) continue;

                        if (processedRegions.has(region._id.toString())) continue;
                        processedRegions.add(region._id.toString());

                        try {
                            const weatherData = await OpenWeatherService.getForecastHourly5Days({
                                lat: region.latitude,
                                lon: region.longitude,
                            });

                            const mappedWeather = await mapForecastWeatherToModel(weatherData, region._id.toString());

                            await weatherRepository.Mutation.bulkUpsert(mappedWeather);

                            console.log(
                                `✅ Clima atualizado para ${region.name} (${region.uf}) [${user.email}]`
                            );
                            console.log(`- Próximas previsões: ${mappedWeather.length} registros inseridos/atualizados.`);
                        } catch (err: any) {
                            console.error(
                                `⚠️ Erro ao buscar clima para ${region.name}:`,
                                err?.message ?? err
                            );
                        }
                    }

                    console.log("✅ [CRON] Atualização climática concluída com sucesso.");
                } catch (error: any) {
                    console.error("[CRON] Erro geral no job de clima:", error.message);
                }
            },
        })
    )
    .get("/stop/weatherJob", ({
        store: {
            cron: { weatherJob },
        },
    }) => {
        weatherJob.stop();
        return "🛑 weatherJob parado com sucesso";
    });