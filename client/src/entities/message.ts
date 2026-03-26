import { Message as MessageSchema, messageSchema, Payload } from "@/schemas/message";

export class Message implements MessageSchema {
  private constructor(
    readonly messageType: MessageSchema["messageType"],
    readonly topic: MessageSchema["topic"],
    readonly timestamp: string,
    readonly payload?: Payload,
  ) {}

  static from(o: object): Message {
    const messageData = messageSchema.parse(o);
    const { messageType, topic, timestamp, payload } = messageData;

    return new Message(messageType, topic, timestamp, payload);
  }
}
