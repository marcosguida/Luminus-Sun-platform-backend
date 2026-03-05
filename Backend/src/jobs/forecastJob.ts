import cron, { Patterns } from "@elysiajs/cron";
import Elysia from "elysia";
import { forecastEnergyService } from "../modules/forecast/forecastEnergy.service";
import { BadRequestError } from "@/lib/errors/AppError"

export const forecastEnergyJob = new Elysia({ name: "job:forecast-energy" })
    .use(cron({
        name: "forecastEnergyJob",
        pattern: Patterns.everyMinutes(10),
        async run() {
            try {
                console.log("[CRON] Iniciando geração de previsões energéticas...");
                const result = await forecastEnergyService.Mutation.generateForecastsForAllRegions();
                console.log(`✅ ${result.count} previsões energéticas criadas com sucesso.`);
            } catch (error) {
                throw new BadRequestError("Erro ao gerar previsões energéticas automaticamente.");
            }
        },
    }))
    .get("/stop/forecastEnergyJob", ({
        store: { cron: { forecastEnergyJob } },
    }) => {
        forecastEnergyJob.stop();
        return "Job forecastEnergy parada com sucesso.";
    });
