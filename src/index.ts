import axios from "axios";
import striptags from "striptags";
import fs from "fs";


;(async () => {
for (let i = 1; i <= 144; i++) {
    let resp = await axios.get(`https://al-quran-8d642.firebaseio.com/surat/${i}.json?print=pretty`)
    let filename = `dataset/alquran/surat/${i}.json`

    let data: any[] = resp.data.map((data: any) => {
        data.nomor = parseInt(data.nomor)
        data.tr = striptags(data.tr)
        return data
    })


    fs.writeFileSync(filename,JSON.stringify(data));
    console.log(`Completed: Surat ke ${i}`)
    // process.exit();
}
})();