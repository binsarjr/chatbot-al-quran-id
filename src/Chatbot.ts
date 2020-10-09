import fs from "fs";
import path from "path";

// Classes
import { ChatbotEntities } from "./ChatbotEntities";

const {
    NlpManager,
} = require('node-nlp');
const Recursive = require("recursive-readdir");

// Interface
import { NlpManager, corpusObj } from "./interfaces/node-nlp";

interface trainOpts {
    folderPath?: string;
    modelPath?: string;
    modelMinified?: boolean;
    force?: boolean;
    modeRecursive?: boolean;
}


class Chatbot {
    locale: string;
    nlp: NlpManager;
    corpusDir: string;
    chatbotEntities: ChatbotEntities;

    constructor(locale: string = 'id') {
        this.corpusDir = 'dataset/corpus'

        
        this.locale = locale;
        this.nlp = new NlpManager({
            languages: [this.locale]
        })

        this.chatbotEntities = new ChatbotEntities(this.locale,this.nlp)
    }

    initialEntities() {
        this.chatbotEntities.suratEntities()
    }


    async train({
        folderPath = this.corpusDir,
        modelPath = 'model.nlp',
        modelMinified = true,
        force = false,
        modeRecursive = true,
    }: trainOpts = {}) {
        if (fs.existsSync(modelPath) && !force) {
            this.nlp.load(modelPath)
            return;
        }

        let files: string[] = await this.getFiles(folderPath,modeRecursive)
        files.forEach(file => {
            let data: any = fs.readFileSync(file).toString()
            try {
                data = JSON.parse(data)
            } catch (error) {
                throw new Error(`${file} invalid JSON Format`)
            }
            let jsonObj: corpusObj[] = data
            jsonObj.forEach(data => {
                if (data.intent !== 'None') {
                    data.utterances.forEach((utterance: string) => {
                        this.nlp.addDocument(this.locale, utterance.toLowerCase(), data.intent);
                    });
                    data.answers.forEach((answer: any) => {
                        this.nlp.addAnswer(this.locale, data.intent, answer);
                    });
                } else {
                    data.answers.forEach((answer: any) => {
                        this.nlp.addAnswer(this.locale, "None", answer);
                    });
                }
            })
        })

        
        const hrstart = process.hrtime();
        await this.nlp.train();
        const hrend = process.hrtime(hrstart);
        console.info('Trained (hr): %ds %dms', hrend[0], hrend[1] / 1000000);


        this.nlp.save(modelPath, modelMinified)
    }


    private async getFiles(folderPath: string, modeRecursive: boolean = true) {
        if(modeRecursive) {
            return await Recursive(folderPath)
        } else {
            let files = fs.readdirSync(folderPath).map((dir: string) => {
                if(fs.lstatSync(path.join(folderPath, dir)).isFile()) {
                    return path.join(folderPath, dir)
                }
            })
            files = files.filter((el: any) => el != null)
            return files
        }
    }
}


;(async () => {
    let chatbot = new Chatbot()
    chatbot.initialEntities()
    await chatbot.train({force:true})
    let res = await chatbot.nlp.process('id',"tolong carikan surat annas")
    console.log(res)
})();