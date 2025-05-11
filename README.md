# llm-edit

Demo of different strategies that can be used to update files via llm.

```sh
❯ llm-edit --help
Usage: llm-edit [options]

Options:
  -p, --prompt <p>    Edit instruction
  -f, --file <f>      Path to file
  -o, --out <f>       Path to output file
  -s, --strategy <s>  Update strategy (default: "naive")
  -m, --model <m>     Model to use (default: "gpt-4.1")
  -h, --help          display help for command
```

You can find the strategies under [./src/strategies/](./src/strategies/).

- **naive** - Replace the content of the whole file.
- **aider-diff** - Use search/replace blocks similar to [Aider](https://aider.chat/).
- **fast-apply** - Apply the changes with a small LLM like `4.1-nano`.

If you are interested into the topic I can recommend the blog post of my colleague Fabian Hertwig [Code Surgery: How AI Assistants Make Precise Edits to Your Files](https://fabianhertwig.com/blog/coding-assistants-file-edits/).

## Getting Started

1. Make sure you have `bat` and `delta` installed (They are used for colored output)
2. Run `pnpm install`
3. Install the tool globally with `pnpm link`
4. Run `llm-edit --help` to see the available options

The tool expects the env variables `OPENAI_API_KEY` and optionally `OPENAI_BASE_URL` to be present.

Example values:

- `OPENAI_BASE_URL="https://api.openai.com/v1"`
- `OPENAI_API_KEY="sk-..."`
