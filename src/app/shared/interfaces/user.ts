export interface DABubbleUser {
    id: string;
    uid?: string;
    mail: string;
    username?: string;
    password?: string;
    isLoggedIn?: boolean;
    activated?: boolean;
    activeChannels?:[];
}
