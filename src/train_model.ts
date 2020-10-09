import fs from "fs";
import { NlpManager } from "./interfaces/node-nlp";

const {
    NlpManager,
} = require('node-nlp');

const manager: NlpManager = new NlpManager({
    languages: ['id']
});


let data = JSON.parse(fs.readFileSync('dataset/namedEntities/surat.json').toString())

let namedEntities = 'alquran-surat'
data.forEach((data: any) => {
    manager.addNamedEntityText(
        namedEntities,
        data.intent,
        ['id'],
        data.sourceText,
    );
});



manager.addDocument('id', `surat %${namedEntities}%`, 'surat');
manager.addDocument('id', `surat %${namedEntities}% ayat %number%`, 'surat');
manager.addDocument('id', `surat %${namedEntities}% ayat %number% sampai %number%`, 'surat');

manager.addDocument('id', `saya ingin baca surat %${namedEntities}%`, 'surat');
manager.addDocument('id', `saya ingin baca surat %${namedEntities}% ayat %number%`, 'surat');
manager.addDocument('id', `saya ingin baca surat %${namedEntities}% ayat %number% sampai %number%`, 'surat');
manager.addDocument('id', `carikan surat %${namedEntities}%`, 'surat');
manager.addDocument('id', `carikan surat %${namedEntities}% ayat %number%`, 'surat');
manager.addDocument('id', `carikan surat %${namedEntities}% ayat %number% sampai %number%`, 'surat');

manager.addDocument('id', `bisa carikan surat %${namedEntities}%`, 'surat');
manager.addDocument('id', `bisa carikan surat %${namedEntities}% ayat %number%`, 'surat');
manager.addDocument('id', `bisa carikan surat %${namedEntities}% ayat %number% sampai %number%`, 'surat');

manager.addDocument('id', `tolong carikan surat %${namedEntities}%`, 'surat');
manager.addDocument('id', `tolong carikan surat %${namedEntities}% ayat %number%`, 'surat');
manager.addDocument('id', `tolong carikan surat %${namedEntities}% ayat %number% sampai %number%`, 'surat');

manager.addDocument('id', `saya ingin mencari surat %${namedEntities}%`, 'surat');
manager.addDocument('id', `saya ingin mencari surat %${namedEntities}% ayat %number%`, 'surat');
manager.addDocument('id', `saya ingin mencari surat %${namedEntities}% ayat %number% sampai %number%`, 'surat');

manager.addAnswer('id', 'surat', `surat`);


manager.addDocument('id', `assalamualaikum`, 'salam');
manager.addAnswer('id', 'salam', `waalaikumsallam`);

;(async () => {
    await manager.train();

    // let result = await manager.process('assalamualaikum, saya ingin mencari surat annas')
    
    // console.log(result)



    let tanyain: any[] = ['surat An-Nas ayat 1 sampai 5','surat annas','surat alfatiha','surat alfatihah ayat 1 sampai 4','assalamualaikum, saya ingin mencari surat annas','tolong carikan surat al ikhlas ayat ke 3'];
    for(let tanya of tanyain) {
        let result = await manager.process('id',tanya.toLowerCase())
    
        console.log(result)
    
        let targetMsg = ''
        // ﴾١﴿
    
        for(let i in result.entities) {
            let entities = result.entities
            if(entities[i].entity == namedEntities) {
                targetMsg += `surat ${entities[i].option}`
    
                if(
                    typeof entities[parseInt(i)+1] !== 'undefined'
                    &&
                    entities[parseInt(i)+1].entity == 'number'
                ) {
                    let ayatPrefix = entities[parseInt(i)+1];
                    targetMsg += ` ayat ke-${ayatPrefix.resolution.value}`
                }
    
                if(
                    typeof entities[parseInt(i)+2] !== 'undefined'
                    &&
                    entities[parseInt(i)+2].entity == 'number'
                    && 
                    entities[parseInt(i)+1].resolution.value != entities[parseInt(i)+2].resolution.value
                ) {
                    let ayatSuffix = entities[parseInt(i)+2];
                    targetMsg += ` sampai ayat ke-${ayatSuffix.resolution.value}`
                }
    
            }
        }
    
        console.log(targetMsg)
    }
})()