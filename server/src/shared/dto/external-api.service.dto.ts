import { SlackChannel } from 'src/common/enums';

export class SendSlackMessageDto {
  message: string;
  username?: string;
  emoji?: string;
  channel: SlackChannel;
}
