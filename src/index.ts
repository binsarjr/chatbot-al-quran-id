import {create as WhatsApp} from "@open-wa/wa-automate";
import { WABot } from "./WABot";
import { Chatbot } from "./Chatbot";

;(async () => {
    let chatbot: Chatbot = new Chatbot()
    await chatbot.train({force: true})

    let client = await WhatsApp({sessionId: ''})
    await WABot.Handler(client, chatbot)
})();