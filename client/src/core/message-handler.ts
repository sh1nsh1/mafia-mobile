import { Message } from "@/schemas/message";

export class MessageHandler {
  constructor(readonly onMessage: (message: Message) => void) {}

  next(message: Message) {
    this.onMessage(message);
  }

  error(e: any) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error(e);
    }
  }

  complete() {
    console.log("Соединение закрыто");
  }
}
