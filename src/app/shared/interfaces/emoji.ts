export interface Emoji {
  messageId: string;
  type: string;
  id?: string;
  usersIds: string[];
  /* reactions:string, */
  deleted: boolean;
}
