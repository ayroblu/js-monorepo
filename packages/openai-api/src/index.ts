import OpenAI from "openai";
import type {
  ResponseCreateParamsBase,
  ResponseInputItem,
  Tool,
} from "openai/resources/responses/responses.js";
import { z } from "zod";

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
  systemPrompt: string;
};
export class OpenAIApi {
  options: Options = {
    model: "gpt-4o",
    functionTools: {},
    systemPrompt: "You are a helpful assistant.",
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
      instructions: this.options.systemPrompt,
      input,
      tools: this.tools(),
      tool_choice: "auto",
      stream: true,
    });

    const updatedInput =
      typeof input === "string"
        ? [{ role: "user" as const, content: input }]
        : input;
    const functionCallResults = [];
    let functionCalls = 0;

    // https://platform.openai.com/docs/guides/function-calling
    for await (const event of response) {
      // console.error("event.type:", event.type);
      switch (event.type) {
        case "response.refusal.delta":
        case "response.output_text.delta":
          yield event.delta;
          break;
        case "response.completed":
          // console.error("\n✅ Done!");
          break;
        case "response.output_item.done":
          switch (event.item.type) {
            case "function_call":
              functionCalls += 1;
              const { name, arguments: args, call_id } = event.item;
              functionCallResults[event.output_index] = this.callTool(
                name,
                args,
              ).then(
                (result): ResponseInputItem => ({
                  type: "function_call_output" as const,
                  // id,
                  call_id,
                  output: JSON.stringify(result),
                }),
              );
              updatedInput.push({
                type: "function_call",
                call_id: event.item.call_id,
                name: event.item.name,
                arguments: event.item.arguments,
              });
              break;
            default:
            // console.error("unused output item:", event.item.type, event);
          }
          break;
      }
    }
    if (functionCalls === 0) return;
    const results = await Promise.all(functionCallResults.filter(Boolean));
    const nextInput = [...updatedInput, ...results];
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
        parameters: z.toJSONSchema(params, { target: "openapi-3.0" }),
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
