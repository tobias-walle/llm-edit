# llm-edit

Demo of different strategies that can be used to update files via llm.

You can find the strategies under [./src/strategies/](./src/strategies/).

## Getting Started

1. Make sure you have `bat` and `delta` installed (They are used for colored output)
2. Run `pnpm install`
3. Install the tool globally with `pnpm link`
4. Run `llm-edit --help` to see the available options

The tool expects the env variables `OPENAI_API_KEY` and optionally `OPENAI_BASE_URL` to be present.

Example values:

- `OPENAI_BASE_URL="https://api.openai.com/v1"`
- `OPENAI_API_KEY="sk-..."`
