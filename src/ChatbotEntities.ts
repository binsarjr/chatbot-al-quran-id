import fs from "fs";
import { NlpManager, corpusObj } from "./interfaces/node-nlp";


export class ChatbotEntities {
    nlp: NlpManager;
    locale: string;
    constructor(locale: string,nlp: NlpManager) {
        this.locale = locale
        this.nlp=nlp
    }

    /**
     * @file dataset/namedEntities/surat.json
     */
    suratEntities() {
        let filepath = 'dataset/namedEntities/surat.json'
        let data = JSON.parse(fs.readFileSync(filepath).toString())


        data.forEach((data: any) => {
            this.nlp.addNamedEntityText(
                'alquran-surat',
                data.intent,
                [this.locale],
                data.sourceText,
            );
        });
    }
}