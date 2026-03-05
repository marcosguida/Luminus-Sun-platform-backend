import cron, { Patterns } from "@elysiajs/cron";
import Elysia from "elysia";
import { energyService } from "@/modules/energy/energy.service";

export const onsEnergyJob = new Elysia({ name: "job:ons-energy" })
    .use(cron({
        name: "onsEnergyJob",
        pattern: Patterns.everyDayAt("15:00"),
        async run() {
            console.log("⚡ [CRON] Iniciando sincronização com a ONS...");
            try {
                await energyService.Mutation.syncONS();
                console.log("✅ [CRON] Dados da ONS salvos com sucesso.");
            } catch (err: any) {
                console.error("❌ [CRON] Erro ao salvar dados da ONS:", err.message);
            }
        },
    }));
