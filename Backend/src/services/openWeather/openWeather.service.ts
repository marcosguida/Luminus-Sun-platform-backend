import { env } from "@/config/env";
import axios from "axios";

const API_KEY = env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const OpenWeatherService = {
    getCurrentWeather: async ({ lat, lon }: { lat: number, lon: number }) => {
        const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;
        const { data } = await axios.get(url);
        return data;
    },

    getForecastHourly5Days: async ({ lat, lon }: { lat: number, lon: number }) => {
        const url = `${BASE_URL}/forecast/hourly?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;
        console.log("Request URL:", url);
        const { data } = await axios.get(url);
        return data;
    },

    getForecastThreeHours5Days: async ({ lat, lon }: { lat: number, lon: number }) => {
        const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;
        const { data } = await axios.get(url);
        return data;
    },

    getForecast16Days: async ({ city, country = "BR" }: { city: string, country: string }) => {
        const url = `${BASE_URL}/forecast/daily?q=${city},${country}&cnt=16&appid=${API_KEY}&units=metric&lang=pt_br`;
        const { data } = await axios.get(url);
        return data;
    },
};
