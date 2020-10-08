import fs from "fs";

const {
    NlpManager,
} = require('node-nlp');

const manager = new NlpManager({
    languages: ['id']
});


let data = JSON.parse(fs.readFileSync('dataset/namedEntities/surat.json').toString())

let namedEntities = data[0].name
data.forEach((data: any) => {
    manager.addNamedEntityText(
        data.name,
        data.intent,
        ['id'],
        data.sourceText,
    );
});



manager.addDocument('id', `saya ingin baca surat %${namedEntities}%`, 'surat');
manager.addDocument('id', `saya ingin baca surat %${namedEntities}% ayat %number% sampai %number% `, 'surat');
manager.addAnswer('id', 'surat', `surat`);

;(async () => {
    await manager.train();

    let tanyain: any[] = ['surat An-Nas ayat 1 sampai 5','surat annas','surat alfatiha','surat alfatihah ayat 1 sampai 4'];
    for(let tanya of tanyain) {
        let result = await manager.process(tanya.toLowerCase())
    
        // console.log(result)
    
        let targetMsg = ''
    
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