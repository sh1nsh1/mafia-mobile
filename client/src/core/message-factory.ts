import { Message } from "@/schemas/message";

export class MessageFactory {
  static command(topic: Message["topic"], payload: Message["payload"]) {
    const message: Message = {
      messageType: "Command",
      topic,
      timestamp: new Date().toISOString(),
      payload,
    };

    return message;
  }
}
