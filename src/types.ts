export type TemplateOptions = {
  file: string;
  instruction: string;
  original: string;
  language: string;
  screenshot: boolean;
};

export type ApplyOptions = TemplateOptions & {
  response: string;
};

export type StrategyName = "naive" | "aider-diff" | "fast-apply";

export type Strategy = {
  name: StrategyName;
  template: (options: TemplateOptions) => string;
  apply: (options: ApplyOptions) => Promise<{
    result: string;
    stats?: Record<string, unknown>;
  }>;
};
