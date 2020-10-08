import fs from "fs";

;(async () => {
    let filename = `dataset/alquran/data.json`
    let data = JSON.parse(fs.readFileSync(filename).toString())
    
    let surat: any[] = data.map((tmp_data: any) => {
        let data: any = {
            nama: tmp_data.nama.replace(' ','').toLowerCase(),
            namaFormat: tmp_data.nama,
            nomor: parseInt(tmp_data.nomor)
        };
        return data
    })
    
    let filesave = `dataset/namedEntities/suratClasses.json`
    fs.writeFileSync(filesave,JSON.stringify(surat))

})();
