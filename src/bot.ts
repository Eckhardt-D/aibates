import { consola } from "consola";
import { Request } from "./openai";

export enum Role {
  Protagonist="protagonist",
  Antagonist="antagonist"
}

export enum AIRole {
  System="system",
  User="user",
  Assistant="assistant"
}

type HistoryItem = {
  role: AIRole;
  content: string;
  name: string;
}

export type History = HistoryItem[]

export class Bot {
  public name: string;
  public topic: string;
  public role: Role;
  public initialPrompt: string | undefined;
  public history: History = [];
  public initialized: boolean = false;
  private requestor: Request;

  constructor(name: string, topic: string, role: Role, requestor: Request) {
    this.name = name;
    this.topic = topic;
    this.role = role;
    this.requestor = requestor;
  }

  startDebate(opponent: Bot) {
    this.initialPrompt = `Imagine you are a highly-educated being at the world's largest debate conference. Your name is ${this.name} - so please introduce yourself to your opponent. Your opponent's name is ${opponent.name}. Your opponent is just as smart as you are. In this debate, your topic of discussion is: ${this.topic}. Today you will be the ${this.role} in this discussion and you have to deeply consider the point of your opponent and even if you might agree on some level - you need to come up with a reply that is the most effective, backed with solid evidence or research to win the debate. Your discussions may become heated, but you might lose points if it is not objective. If you do not have a reply and think your opponent outsmarted you - you may withdraw from the debate, which will let your opponent win. At this point - please just say 'I withdraw'.`;

    this.history.push({
      name: "system",
      role: AIRole.System,
      content: this.initialPrompt,
    });
  }

  async createInitial(opponent: Bot) {
    if (this.initialized) {
      throw new Error('Already initialized the debate...');
    }

    const prompt = `Hello ${this.name}, we are the judges of this debate today. Can you please state your first case regarding '${this.topic}'.`
    consola.info(`DEBATE JUDGES: \n${prompt}\n`)

    this.history.push({
      name: 'Judges',
      role: AIRole.User,
      content: prompt,
    });

    const response = await this.requestor.getNextMessage(this.history);

    if (!response) {
      throw new Error('Debate ended, no response');
    }

    this.history.push({
      role: response?.role as AIRole,
      content: response.content,
      name: this.name,
    });

    this.initialized = true;
    opponent.initialized = true;
    opponent.history.push({
      role: AIRole.User,
      content: response.content,
      name: this.name,
    });

    return response.content;
  }

  async getNextResponse(opponent: Bot) {
    if (!this.initialized) {
      throw new Error('Cannot get next response, not initialized yet...')
    }

    const response = await this.requestor.getNextMessage(this.history);

    if (!response) {
      throw new Error('Debate ended, no response');
    }

    this.history.push({
      role: AIRole.Assistant,
      content: response.content,
      name: this.name,
    });

    opponent.history.push({
      role: AIRole.User,
      content: response.content,
      name: this.name,
    });

    return response.content;
  }
}