// import { fetchRealTimeGeneration, fetchProgramacaoDiaria } from "../ons/ons.service";
// import { getAllStations } from "../inmet/inmetStation.service";
// import { getWeatherByCoords } from "../openWeather/openWeather.service";
// import { getMunicipioCoords } from "../geocoding/geocoding.service";
// import { getMunicipiosByUF } from "../ibgeGeocoding/ibgeGeocoding.service";
// import { forecastService } from "@/modules/forecast/forecast.service";
// import { regionService } from "@/modules/region/regionStation.service";

// /**
//  * Orquestra a integração entre ONS, INMET, IBGE e OpenWeather.
//  * Responsável por atualizar e normalizar todos os dados externos.
//  */
// export const integrationOrchestrator = {
//     /**
//      * 🔄 Sincroniza dados energéticos da ONS.
//      */
//     async syncONS() {
//         const [realtime, pdp] = await Promise.all([
//             fetchRealTimeGeneration(),
//             fetchProgramacaoDiaria(),
//         ]);
//         console.log(`✔️ Dados da ONS sincronizados (${realtime.length} registros em tempo real)`);
//         return { realtime, pdp };
//     },

//     /**
//      * 🔄 Sincroniza estações meteorológicas e regiões.
//      */
//     async syncRegionsAndStations() {
//         const stations = await getAllStations(); // INMET
//         const estados = await getMunicipiosByUF(); // IBGE
//         console.log(`✔️ ${stations.length} estações INMET e ${estados.length} municípios IBGE carregados.`);

//         for (const s of stations) {
//             await regionService.Mutation.createRegion({
//                 name: s.DC_NOME,
//                 uf: s.SG_ESTADO,
//                 latitude: parseFloat(s.VL_LATITUDE),
//                 longitude: parseFloat(s.VL_LONGITUDE),
//                 altitude: parseFloat(s.VL_ALTITUDE),
//             });
//         }
//     },

//     /**
//      * 🔄 Atualiza dados climáticos com base em coordenadas.
//      */
//     async syncWeatherForAllRegions() {
//         const regions = await regionService.Query.findAllRegions();
//         console.log(`Atualizando clima para ${regions.length} regiões...`);

//         for (const region of regions) {
//             const weather = await getWeatherByCoords(region.latitude!, region.longitude!);
//             await forecastService.Mutation.createForecast({
//                 regionId: region._id.toString(),
//                 forecastDate: new Date(),
//                 irradiance: weather.solarRadiation || 0,
//                 predictedEnergy: weather.solarRadiation ? weather.solarRadiation * 0.2 : 0,
//                 efficiencyRate: 80,
//                 confidenceLevel: 0.8,
//                 recommendation: "Atualização automática via integração OpenWeather.",
//             });
//         }
//     },

//     /**
//      * 🔄 Sincroniza dados geográficos via IBGE + Geocoding
//      */
//     async syncGeoIntegration() {
//         const municipios = await getMunicipiosByUF();
//         for (const municipio of municipios) {
//             const coords = await getMunicipioCoords(municipio.nome);
//             console.log(`📍 ${municipio.nome}: ${coords?.lat}, ${coords?.lon}`);
//         }
//     },

//     /**
//      * 🚀 Executa integração completa (agendada ou manual)
//      */
//     async fullSync() {
//         console.log("🔁 Iniciando sincronização completa...");
//         await this.syncONS();
//         await this.syncRegionsAndStations();
//         await this.syncWeatherForAllRegions();
//         console.log("✅ Sincronização completa concluída!");
//     },
// };
