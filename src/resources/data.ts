import Axios from "axios";
import fs from "fs";


;(async () => {
    let resp = await Axios.get('https://al-quran-8d642.firebaseio.com/data.json')
    let data = resp.data.map((data: any) => {
        data.nomor = parseInt(data.nomor)
        return data
    })
    // console.log(data)
    let filename = `dataset/alquran/data.json`
    fs.writeFileSync(filename,JSON.stringify(data));
})();