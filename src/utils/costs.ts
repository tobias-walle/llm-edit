import type { CompletionUsage } from "openai/resources.mjs";
import type { ResponseUsage } from "openai/resources/responses/responses.mjs";

interface ModelPricing {
  inputPricePer1000Tokens: number;
  outputPricePer1000Tokens: number;
}

const modelPricing: { [modelName: string]: ModelPricing } = {
  "gpt-4o": { inputPricePer1000Tokens: 0.0025, outputPricePer1000Tokens: 0.01 },
  "gpt-4o-audio-preview": {
    inputPricePer1000Tokens: 0.0025,
    outputPricePer1000Tokens: 0.01,
  },
  "gpt-4o-mini": {
    inputPricePer1000Tokens: 0.00015,
    outputPricePer1000Tokens: 0.0006,
  },
  "gpt-4o-mini-audio-preview": {
    inputPricePer1000Tokens: 0.00015,
    outputPricePer1000Tokens: 0.0006,
  },
  "gpt-4o-realtime-preview": {
    inputPricePer1000Tokens: 0.005,
    outputPricePer1000Tokens: 0.02,
  },
  "gpt-4o-mini-realtime-preview": {
    inputPricePer1000Tokens: 0.0006,
    outputPricePer1000Tokens: 0.0024,
  },
  "gpt-4.5-preview": {
    inputPricePer1000Tokens: 0.075,
    outputPricePer1000Tokens: 0.15,
  },
  "gpt-4.1": {
    inputPricePer1000Tokens: 0.002,
    outputPricePer1000Tokens: 0.008,
  },
  "gpt-4.1-mini": {
    inputPricePer1000Tokens: 0.0004,
    outputPricePer1000Tokens: 0.0016,
  },
  "gpt-4.1-nano": {
    inputPricePer1000Tokens: 0.0001,
    outputPricePer1000Tokens: 0.0004,
  },
  o1: { inputPricePer1000Tokens: 0.015, outputPricePer1000Tokens: 0.06 },
  "o1-pro": { inputPricePer1000Tokens: 0.15, outputPricePer1000Tokens: 0.6 },
  o3: { inputPricePer1000Tokens: 0.01, outputPricePer1000Tokens: 0.04 },
  "o4-mini": {
    inputPricePer1000Tokens: 0.0011,
    outputPricePer1000Tokens: 0.0044,
  },
  "o3-mini": {
    inputPricePer1000Tokens: 0.0011,
    outputPricePer1000Tokens: 0.0044,
  },
  "o1-mini": {
    inputPricePer1000Tokens: 0.0011,
    outputPricePer1000Tokens: 0.0044,
  },
};

export function calculateUsagePrice(
  usage: ResponseUsage | CompletionUsage,
  modelName: string,
): string {
  const pricing = modelPricing[modelName];

  if (!pricing) {
    throw new Error(`Pricing not found for model: ${modelName}`);
  }

  const inputTokens =
    "input_tokens" in usage ? usage.input_tokens : usage.prompt_tokens;
  const outputTokens =
    "output_tokens" in usage ? usage.output_tokens : usage.completion_tokens;

  const inputCost = (inputTokens / 1000) * pricing.inputPricePer1000Tokens;
  const outputCost = (outputTokens / 1000) * pricing.outputPricePer1000Tokens;

  const dollar = (value: number) => `${parseFloat(value.toFixed(5))}$`;
  return `${dollar(inputCost + outputCost)} (Input: ${dollar(inputCost)}, Output: ${dollar(outputCost)})`;
}
