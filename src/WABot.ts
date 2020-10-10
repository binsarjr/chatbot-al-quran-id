import { Client, Message } from "@open-wa/wa-automate";
import schedule from "node-schedule";
import { Chatbot } from "./Chatbot";

export class WABot {
    client: Client
    chatbot: Chatbot
    constructor(client: Client,chatbot: Chatbot) {
        this.client = client
        this.chatbot = chatbot
    }

    static async Handler(client: Client, chatbot: Chatbot) {
        let WABot = new this(client, chatbot)

    
        WABot.client.setPresence(true)
        WABot.clearAllChatSchedule()
        await WABot.onAddedToGroup()
        await WABot.onIncomingCall()
        await WABot.onMessage()
    }

    clearAllChatSchedule() {
        schedule.scheduleJob('* * * * * 7',async () =>{ // hapus semua chat setiap hari
            let chatIds: string[] = await this.client.getAllChatIds()
            chatIds.forEach(async chatId => await this.client.clearChat(chatId))
        });
    }

    
    async onIncomingCall() {
        await this.client.onIncomingCall(async call => {
            let chatId = call.peerJid
            await this.client.sendText(chatId,"Maaf nomor anda saya block karena telah melanggar peraturan BOT.")
            await this.client.contactBlock(chatId)
        })
    }

    async onAddedToGroup() {
        await this.client.onAddedToGroup(async chat => {
            this.leaveGroup(chat.id)
        })
    }

    async onMessage() {
        await this.client.onMessage(async message => {
            let result = await this.chatbot.process(message.content)
            if(!message.isGroupMsg) {
                if(result.intent == 'tanyaSurat') {
                    await this.client.sendText(message.from, this.chatbot.cariSurat(result));
                } else {
                    await this.client.sendText(message.from, result.answer ?? '');
                }
            }
        })
    }

    async leaveGroup(chatId: any) {
        await this.client.sendText(chatId,"Maaf saya dibuat hanya untuk keperluan privasi saja.")
        await setTimeout(async () => {
            await this.client.leaveGroup(chatId)
            await setTimeout(async () => {
                await this.client.deleteChat(chatId)
            }, 500);
        }, 1000);
    }
}