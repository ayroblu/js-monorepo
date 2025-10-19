import { OpenAIApi } from "@agent-smith/openai-api";
import z from "zod";

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
export const api = new OpenAIApi({
  model: "grok-4-fast",
  functionTools: { getWeather },
});
