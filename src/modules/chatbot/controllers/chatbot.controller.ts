import {Controller, Get, Version} from '@nestjs/common';
import {MessageService} from "../services/message.service";

@Controller('chatBot')
export class ChatbotController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/messages')
  @Version('1')
  async getMessageHistory() {
    let userId="670991506145238731571b42"
    return this.messageService.getAllMessages(userId);
  }
}
