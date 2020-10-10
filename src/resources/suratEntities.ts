import { SimpleListener } from "@open-wa/wa-automate";
import fs from "fs";

const stringSimilarity = require('string-similarity');



interface SuratEntites {
    name: string;
    intent: string;
    sourceText: string[];
}


;(async () => {
    let filename = `dataset/alquran/data.json`
    let data = JSON.parse(fs.readFileSync(filename).toString())
    
    let surat: SuratEntites[] = data.map((tmp_data: any) => {
        let data: SuratEntites = {
            name: tmp_data.nama,
            intent: tmp_data.nama.replace(' ','').toLowerCase(),
            sourceText: [
                tmp_data.nama.toLowerCase(),
                tmp_data.nama.replace(' ','').toLowerCase(),
                tmp_data.nama.replace(' ','-').toLowerCase(),
                tmp_data.nama.replace('\'',' ').toLowerCase(),
            ]
        };
        if(stringSimilarity.compareTwoStrings(tmp_data.nama.replace(' ','').toLowerCase(),tmp_data.arti.replace(' ','').toLowerCase()) > 0.79) {
            data.sourceText = [...data.sourceText, ...[
                tmp_data.arti.toLowerCase(),
                tmp_data.arti.replace(' ','').toLowerCase(),
            ]]
        }
        data.sourceText = Array.from(new Set(data.sourceText))
        return data
    })
    
    let filesave = `dataset/namedEntities/surat.json`
    fs.writeFileSync(filesave,JSON.stringify(surat))

})();
