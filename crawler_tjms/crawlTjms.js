const retrieveInformationHtml = require("./retrieveInformationHtml")
const Nightmare =  require("nightmare")

function crawlTjms(code){
    const ERR_NAME_NOT_RESOLVED = -105
    const ERR_CONTENT_NOT_LOADED = -7

    async function executeRequisition(url, firstPartCode, secondPartCode, instance, tentatives = 1){
        return await new Promise(async function(resolve, reject){
            const nightmare = Nightmare({show: false, waitTimeout: 10000, gotoTimeout:5000})
            await nightmare
                     .goto(url)
                     .wait("#numeroDigitoAnoUnificado")
                     .insert("#numeroDigitoAnoUnificado",firstPartCode)
                     .insert("#foroNumeroUnificado",secondPartCode)
                     .click(instance === 1 ? "#botaoConsultarProcessos" : "#pbConsultar")
                     .wait(1000)
                     .evaluate(() => document.querySelector("body").innerHTML)
                     .end()
                     .then(doc =>{
                         const information = retrieveInformationHtml(doc, instance === 1 ? 1 : 2)
                         resolve(information)
                     })
                     .catch(error => {
                         //console.log(error.code)
                         if(error.code === ERR_NAME_NOT_RESOLVED){
                             resolve({
                                 "erro": "503"
                             })
                         }else if(error.code === ERR_CONTENT_NOT_LOADED && tentatives <2){
                            resolve(executeRequisition(url, firstPartCode, secondPartCode, instance,2))
                         }else{
                             resolve({
                                 "erro": "408"
                             })
                         }
                     })
         })
    }
    
    async function secondInstance(codeBreaked){
        const url = "https://esaj.tjms.jus.br/cposg5/open.do"
        const firstPartCode = codeBreaked[0]
        const secondPartCode = codeBreaked[1]

        return await executeRequisition(url, firstPartCode, secondPartCode, 2)
    }

    async function firstInstance(codeBreaked){
        const url = "https://esaj.tjms.jus.br/cpopg5/open.do"
        const firstPartCode = codeBreaked[0]
        const secondPartCode = codeBreaked[1]

        return await executeRequisition(url, firstPartCode, secondPartCode, 1)
        
    }
    
    async function crawl(){
        const pattern  = /^\d{7}-\d{2}.\d{4}.\d{1}.\d{2}.\d{4}$/
        if(pattern.test(code)){
            const codeBreaked = code.split(".8.12.")
            const result = await Promise.all([
                firstInstance(codeBreaked),
                secondInstance(codeBreaked)
            ]).catch(err=>console.log(err))
           
            return {
                "primeira instancia": await result[0],
                "segunda instancia": await result[1]
            }
        }else{

            return {
                "erro": "400",
                "mensagem auxiliar": "codigo no formato errado, deve estar no formato: NNNNNNN-DD.AAAA.J.TR.OOOO"
            }
        } 
    }
    return crawl()
}

module.exports = crawlTjms;

