import OpenAI from "openai";
import type {
  ResponseCreateParamsBase,
  Tool,
} from "openai/resources/responses/responses.js";
import type { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const origin =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "http://localhost:5173";
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: `${origin}/openai`,
  dangerouslyAllowBrowser: true,
});

type Options = {
  model: string;
  functionTools: FunctionTools;
};
export class OpenAIApi {
  options: Options = {
    model: "gpt-4o",
    functionTools: {},
  };

  constructor(options?: Partial<Options>) {
    if (options) {
      Object.assign(this.options, options);
    }
  }

  async *response(
    input: NonNullable<ResponseCreateParamsBase["input"]>,
  ): AsyncIterable<string> {
    const response = await openai.responses.create({
      model: this.options.model,
      instructions: "You are a helpful assistant.",
      input,
      tools: this.tools(),
      tool_choice: "auto",
      stream: true,
    });

    const outputItems = [];
    let functionCalls = 0;

    // https://platform.openai.com/docs/guides/function-calling
    for await (const event of response) {
      console.error("event.type:", event.type);
      switch (event.type) {
        case "response.refusal.delta":
        case "response.output_text.delta":
          yield event.delta;
          break;
        case "response.completed":
          console.error("\n✅ Done!");
          break;
        case "response.output_item.done":
          switch (event.item.type) {
            case "function_call":
              functionCalls += 1;
              const { name, arguments: args, id, call_id } = event.item;
              outputItems[event.output_index] = this.callTool(name, args).then(
                (result) => ({
                  type: "function_call_output" as const,
                  id,
                  call_id,
                  output: JSON.stringify(result),
                }),
              );
              break;
            default:
              // outputItems[event.output_index] = event.item;
              console.error("unused output item:", event.item.type, event);
          }
          break;
      }
    }
    if (functionCalls === 0) return;
    const results = await Promise.all(outputItems.filter(Boolean));
    const nextInput = [
      ...(typeof input === "string"
        ? [{ role: "user" as const, content: input }]
        : input),
      ...results,
    ];
    for await (const text of this.response(nextInput)) {
      yield text;
    }
  }

  private tools(): Tool[] {
    return Object.entries(this.options.functionTools).map(
      ([name, { description, params }]) => ({
        type: "function",
        name,
        description,
        strict: true,
        parameters: zodToJsonSchema(params, "args").definitions!.args,
      }),
    );
  }
  private callTool(name: string, args: string): Promise<unknown> {
    return this.options.functionTools[
      name as keyof typeof this.options.functionTools
    ]?.handler(JSON.parse(args));
  }
}

type FunctionTools = {
  [name: string]: FunctionTool<any>;
};
type FunctionTool<T> = {
  description: string;
  params: z.ZodType<T>;
  handler: (args: T) => Promise<unknown>;
};
