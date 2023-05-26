# aibates - a CLI tool to let GPT3 debate against itself

## Usage

Clone this repo, then:

    cd aibates && pnpm install

Run build

    pnpm build

Link the cli tool

    pnpm link --global

Try it out

    aibate

# Note about API key & usage

You need your own OpenAI api key, you can either add it to the .env file in the project as OPEN_API_KEY or run inline:

    OPEN_API_KEY=xxx aibates

Otherwise it will prompt you to paste it in runtime. This tool is just for fun, so not thinking about adding a global config file for the key just yet. At the moment the key you enter isn't masked until Consola adds that ability. Enjoy!