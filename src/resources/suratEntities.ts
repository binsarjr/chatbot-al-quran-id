import fs from "fs";

interface SuratEntites {
    name: string;
    intent: string;
    sourceText: string[];
}


;(async () => {
    let filename = `dataset/alquran/data.json`
    let data = JSON.parse(fs.readFileSync(filename).toString().toLowerCase())
    
    let surat: SuratEntites[] = data.map((tmp_data: any) => {
        let data: SuratEntites = {
            name: 'alquran.surat',
            intent: tmp_data.nama.replace(' ',''),
            sourceText: [
                tmp_data.nama,
                tmp_data.nama.replace(' ',''),
                tmp_data.nama.replace(' ','-'),
            ]
        };
        data.sourceText = Array.from(new Set(data.sourceText))
        return data
    })
    
    let filesave = `dataset/namedEntities/surat.json`
    fs.writeFileSync(filesave,JSON.stringify(surat))

})();
