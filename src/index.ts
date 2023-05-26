#!/usr/bin/env node
require('dotenv').config();
import { defineCommand, runMain } from "citty";
import { consola } from "consola";
import { Bot, Role } from "./bot";
import { Request } from "./openai";

const main = defineCommand({
  meta: {
    name: "aibate",
    version: "0.1.0",
    description: "A tool to let GPT3.5 debate against itself",
  },
  async run() {
    consola.info(
      "Welcome to aibate, a fun tool to let GPT-3.5 debate against itself in a ficticious debate environment.\n"
    );

    const apiKey = process.env.OPEN_API_KEY ?? await consola.prompt('Could not detect OPEN_API_KEY environment variable, please paste your key: \n', {
      type: 'text',
      required: true,
    });

    const requestor = new Request(apiKey as string);
    const topic = await consola.prompt(
      'What should the topic of the debate be? (Please phrase it as a question e.g. "Should dogs have the right to vote?")\n',
      {
        type: "text",
        required: true,
      }
    );

    const forName = await consola.prompt(
      'What would you like to name the AI that is FOR the topic?',
      {
        type: 'text',
        required: true,
      }
    );

    const againstName = await consola.prompt(
      'What would you like to name the AI that is AGAINST the topic?',
      {
        type: 'text',
        required: true,
      }
    );

    const forBot = new Bot(forName.replace(/\s+/g, '_'), topic, Role.Protagonist, requestor);
    const againstBot = new Bot(againstName.replace(/\s+/g, '_'), topic, Role.Antagonist, requestor);

    let current_bot = forBot.name;
    const getNextBot = () => {
      if (current_bot === forBot.name) {
        current_bot = againstBot.name;
        return againstBot;
      }

      current_bot = forBot.name;
      return forBot;
    }

    const getOpponent = (bot: Bot) => {
      return bot.name === forBot.name ? againstBot : forBot;
    }

    forBot.startDebate(againstBot);
    againstBot.startDebate(forBot);

    consola.start(`\nWaiting for ${forBot.name} to generate his first response...`);

    const firstResponse = await forBot.createInitial(againstBot);
    consola.success(`\n-------\n${forBot.name}\n-------\n ${firstResponse}\n`);

    let cont = await consola.prompt(`Continue with ${againstBot.name}'s reply?`, {
      type: 'confirm',
      required: true,
    });

    while (cont) {
      const bot = getNextBot();
      const opponent = getOpponent(bot);
      consola.start(`Waiting for ${bot.name} to generate its response...\n\n`);
      const reply = await bot.getNextResponse(opponent);
      consola.success(`\n-------\n${bot.name}\n-------\n ${reply}\n-------\n`);
      cont = await consola.prompt(`Continue with ${opponent.name}'s reply?`, {
        type: 'confirm',
        required: true,
      });
    }


    consola.info(`Thanks for playing!`)
    process.exit(0);
  },
});

runMain(main).catch(err => {
  console.log(err);
  process.exit(1);
})