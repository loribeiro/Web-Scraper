const retrieveInformationHtml = require("./retrieveInformationHtml")
const Nightmare =  require("nightmare")

function crawlTjms(code){

    async function executeRequisition(url, firstPartCode, secondPartCode, instance){
        return await new Promise(async function(resolve, reject){
            const nightmare = new Nightmare({show: false})
            await nightmare
                     .goto(url)
                     .wait("#numeroDigitoAnoUnificado")
                     .insert("#numeroDigitoAnoUnificado",firstPartCode)
                     .insert("#foroNumeroUnificado",secondPartCode)
                     .click(instance === 1 ? "#botaoConsultarProcessos" : "#pbConsultar")
                     .wait(2000)
                     .evaluate(() => document.querySelector("body").innerHTML)
                     .end()
                     .then(doc =>{
                         const information = retrieveInformationHtml(doc, instance === 1 ? 1 : 2)
                         resolve(information)
                     })
                     .catch(error => {
                         console.log(error)
                         resolve({
                             "erro": "Ocorreu um erro ao buscar a informação, por favor tente novamente"
                         })
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
                "erro": "codigo no formato errado, deve estar no formato: NNNNNNN-DD.AAAA.J.TR.OOOO"
            }
        } 
    }
    return crawl()
}

module.exports = crawlTjms;

