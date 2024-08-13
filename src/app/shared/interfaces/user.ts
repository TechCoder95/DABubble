export interface DABubbleUser {
    id?: string;
    uid?: string;
    mail: string;
    username?: string;
    password?: string;
    isLoggedIn?: boolean;
    activeChannels?: string[];
    avatar: string;
}
