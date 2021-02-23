const retrieveInformationHtml = require("./retrieveInformationHtml")
const Nightmare =  require("nightmare")

function crawlTjms(code){
    const ERR_NAME_NOT_RESOLVED = -105
    const ERR_CONTENT_NOT_LOADED = -7
    let splitedCode = []
    const pattern  = /^\d{7}-\d{2}.\d{4}.\d{1}.\d{2}.\d{4}$/ // regex to ensure code correct pattern NNNNNNN-DD.AAAA.J.TR.OOOO

    async function executeRequisition(url, instance, tentatives = 1){

        return await new Promise(async function(resolve, reject){
            const nightmare = Nightmare({show: false, waitTimeout: 10000, gotoTimeout:5000})
            const [firstPartCode,secondPartCode] = splitedCode
            await nightmare
                     .goto(url)
                     .wait("#numeroDigitoAnoUnificado") // waits until input area is visible 
                     .insert("#numeroDigitoAnoUnificado",firstPartCode)  // inputs the first part of the code
                     .insert("#foroNumeroUnificado",secondPartCode) // inputs the second part of the code
                     .click(instance === 1 ? "#botaoConsultarProcessos" : "#pbConsultar") // clicks on button to search for the process
                     .wait(1000)
                     .evaluate(() => document.querySelector("body").innerHTML) // retrieves html from loaded page
                     .end()
                     .then(doc =>{
                         const information = retrieveInformationHtml(doc, instance)
                         resolve(information) // returns the information scraped from html 
                     })
                     .catch(error => {
                         
                         if(error.code === ERR_NAME_NOT_RESOLVED){
                             resolve({
                                 "error": "503"
                             })
                         }else if(error.code === ERR_CONTENT_NOT_LOADED && tentatives < 3){
                            resolve(executeRequisition(url, instance, tentatives+1))
                         }else{
                             resolve({
                                 "error": "408" + tentatives.toString()
                             })
                         }
                     })
         })
    }
    
    async function secondInstance(){
        const url = "https://esaj.tjms.jus.br/cposg5/open.do"
       
        return await executeRequisition(url, 2)
    }

    async function firstInstance(){
        const url = "https://esaj.tjms.jus.br/cpopg5/open.do"
    
        return await executeRequisition(url, 1)
    }
    
    async function crawl(){
        if(pattern.test(code)){

            splitedCode = code.split(".8.12.")
            const result = await Promise.all([
                firstInstance(),
                secondInstance()
            ]).catch(err=>console.log(err))
           
            return {
                "primeira instancia": await result[0],
                "segunda instancia": await result[1]
            }
        }else{

            return {
                "error": "400",
                "mensagem auxiliar": "codigo no formato errado, deve estar no formato: NNNNNNN-DD.AAAA.J.TR.OOOO"
            }
        } 
    }
    return crawl()
}

module.exports = crawlTjms;