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
manager.addAnswer('id', 'surat', `surat`);

;(async () => {
    await manager.train();
    let result = await manager.process('saya ingin baca surat annas dari ayat 1 sampe 5'.toLowerCase())
    console.log(result)
})()