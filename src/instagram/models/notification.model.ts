export interface Notification {
    id?:string,
    senderId?:string;
    recipientId?:string;
    text?:string;
    href?:string;
    date?:string;
    read?:any
}