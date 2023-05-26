import {OpenAIApi, Configuration} from "openai";
import { History } from "./bot";

export class Request {
  private client: OpenAIApi;

  constructor(key: string) {
    this.client = new OpenAIApi(
      new Configuration({
        apiKey: key,
      })
    )
  }

  async getNextMessage(messages: History) {
    try {
      const response = await this.client.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
      });
      return response.data.choices[0].message;
    } catch (error) {
      console.log(error.response);
      throw 'Something went wrong';
    }
  }
}