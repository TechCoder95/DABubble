export interface Emoji {
  messageId: string;
  type: string;
  id?: string;
  usersIds: string[];
  deleted: boolean;
}
