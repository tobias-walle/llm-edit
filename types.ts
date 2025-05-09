export type TemplateOptions = {
  file: string;
  instruction: string;
  original: string;
};

export type ApplyOptions = TemplateOptions & {
  response: string;
};

export type StrategyName = "naive" | "search-and-replace";

export type Strategy = {
  name: StrategyName;
  template: (options: TemplateOptions) => string;
  apply: (options: ApplyOptions) => Promise<string>;
};
