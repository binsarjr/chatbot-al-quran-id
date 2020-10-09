import fs from "fs";
import { NlpManager, corpusObj } from "./interfaces/node-nlp";


export class ChatbotEntities {
    nlp: NlpManager;
    locale: string;
    constructor(locale: string,nlp: NlpManager) {
        this.locale = locale
        this.nlp=nlp

        // initial entities
        this.suratAlquranEntities()
    }

    /**
     * @file dataset/namedEntities/surat.json
     */
    suratAlquranEntities() {
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

    /**
     * @file dataset/namedEntities/suratClasses.json
     */
    getSuratAlquranEntities(surat: string,start: number = 0,end: number = 0) {
        let filepath = 'dataset/namedEntities/suratClasses.json'
        let filedata: any[] = JSON.parse(fs.readFileSync(filepath).toString())
        let obj: {[i: string]: any} = filedata.filter(el => el.nama == surat)[0]

        let fileSurat = `dataset/alquran/surat/${obj.nomor.toString().padStart(3,'0')}.json`
        let data: any[] = JSON.parse(fs.readFileSync(fileSurat).toString())

        let result = `*QS. ${obj.namaFormat} (${obj.nomor}) : `
        let bismillah = surat == 'alfatihah' ? '' : `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nDengan menyebut nama Allah Yang Maha Pemurah lagi Maha Penyayang.\n\n\n`
        
        // Semua ayat
        if(start == 0 && end == 0) {
            result += `1-${data.length}*\n\n${bismillah}`
        }
        // Ayat sesuai `start`
        else if(start != 0 && end == 0) {
            result += `${start}*\n\n${bismillah}`
            data = data.filter(data => data.nomor == start)
        }
        // ayat dari `start` sampai `end`
        else {
            result += `${start}-${end}*\n\n${bismillah}`
            data = data.filter(data => data.nomor >= start && data.nomor <= end)
        }

        if(data.length > 0) {
            data.forEach(obj => {
                result += obj.ar
                result += "\n\n"
                result += `${obj.nomor}. ${obj.id}`
                result += "\n\n"
            });
    
            return result
        } else {
            return "Ayat yang kamu cari tidak ada."
        }
    }
}