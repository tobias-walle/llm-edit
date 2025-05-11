export type TemplateOptions = {
  file: string;
  instruction: string;
  original: string;
  language: string;
};

export type ApplyOptions = TemplateOptions & {
  response: string;
};

export type StrategyName = "naive" | "aider-diff";

export type Strategy = {
  name: StrategyName;
  template: (options: TemplateOptions) => string;
  apply: (options: ApplyOptions) => Promise<string>;
};
