import fs from "fs";
import path from "path";
import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Classes
import { ChatbotEntities } from "./ChatbotEntities";

const {
    NlpManager,
} = require('node-nlp');
const Recursive = require("recursive-readdir");

// Interface
import { NlpManager, corpusObj, process as NlpResult } from "./interfaces/node-nlp";

interface trainOpts {
    folderPath?: string;
    modelPath?: string;
    modelMinified?: boolean;
    force?: boolean;
    modeRecursive?: boolean;
}


class Chatbot{
    locale: string;
    nlp: NlpManager;
    corpusDir: string;
    chatbotEntities: ChatbotEntities;

    constructor(locale: string = 'id') {
        this.corpusDir = 'dataset/corpus'

        
        this.locale = locale;
        this.nlp = new NlpManager({
            languages: [this.locale], nlu: { log: false }
        })

        this.chatbotEntities = new ChatbotEntities(this.locale,this.nlp)
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
        await this.nlp.train();
        this.nlp.save(modelPath, modelMinified)
    }

    async process(utterance: string) {
        return await this.nlp.process(this.locale,utterance)
    }


    cariSurat(result: NlpResult) {
        let target = {
            surat: '',
            start: 0,
            end: 0,
        }
        
        // ﴾١﴿
        for(let i in result.entities) {
            let entities = result.entities
            if(entities[i].entity == 'alquran-surat') {
                target.surat = entities[i].option
    
                if(
                    typeof entities[parseInt(i)+1] !== 'undefined'
                    &&
                    entities[parseInt(i)+1].entity == 'number'
                ) {
                    let ayatPrefix = entities[parseInt(i)+1];
                    target.start = ayatPrefix.resolution.value
                }
    
                if(
                    typeof entities[parseInt(i)+2] !== 'undefined'
                    &&
                    entities[parseInt(i)+2].entity == 'number'
                    && 
                    entities[parseInt(i)+1].resolution.value != entities[parseInt(i)+2].resolution.value
                    &&
                    entities[parseInt(i)+1].resolution.value < entities[parseInt(i)+2].resolution.value
                ) {
                    let ayatSuffix = entities[parseInt(i)+2];
                    target.end = ayatSuffix.resolution.value
                }
    
            }
        }
    
        if(target.surat != '') {
            return this.chatbotEntities.getSuratAlquranEntities(target.surat, target.start,target.end)
        } else {
            return "Maaf,kami tidak bisa menemukan surat yang anda cari."
        }
    }


    private async getFiles(folderPath: string, modeRecursive: boolean = true) {
        if(modeRecursive) {
            return await Recursive(folderPath)
        } else {
            let files = fs.readdirSync(folderPath).map(dir => {
                if(fs.lstatSync(path.join(folderPath, dir)).isFile()) {
                    return path.join(folderPath, dir)
                }
            })
            files = files.filter(el => el != null)
            return files
        }
    }
}


;(async () => {
    let chatbot = new Chatbot()
    await chatbot.train({force:true})

    async function rQuestion() {
        await rl.question("You > ", async function(input) {
            let result = await chatbot.process(input)

            if(result.intent == 'tanyaSurat') {
                console.log(`bot > ${chatbot.cariSurat(result)}`)
            } else {
                console.log(`bot > ${result.answer}`)
            }

            await rQuestion()
        });
    }

    await rQuestion()

})();