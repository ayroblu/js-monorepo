import z from "zod";
import { OpenAIApi } from "./index.ts";

const getWeatherArg = z.object({
  city: z.string(),
});
type GetWeatherArg = z.infer<typeof getWeatherArg>;
const getWeather = {
  description: "Get the current weather in a given location",
  params: getWeatherArg,
  handler: async (_args: GetWeatherArg) => {
    return { temperature: "18°C", condition: "Cloudy" };
  },
};
const api = new OpenAIApi({
  model: "grok-4-fast",
  functionTools: { getWeather },
});
await api.response("What's the weather like in Paris today?");
