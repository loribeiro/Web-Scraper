const retrieveInformationHtml = require("./retrieveInformationHtml")
const retrieveHtml = require("./retrieveHtml")

function crawlTjms(code, test = false){
    let splitedCode = code.split(".8.12.")
    const pattern  = /^\d{7}-\d{2}.\d{4}.\d{1}.\d{2}.\d{4}$/ // regex to ensure code correct pattern NNNNNNN-DD.AAAA.J.TR.OOOO

    function __retrieveInstanceResponse(htmlResponse, instance){

        switch (typeof htmlResponse){
            case "object":
                return htmlResponse
            default:
                if(typeof htmlResponse[Symbol.iterator] === "function" && htmlResponse !== null){

                    return retrieveInformationHtml(htmlResponse, instance)
                }else{
                    return{
                        "error": "503"
                    }
                }
        }
    }

    async function __executeSecondInstance(){
        const url = "https://esaj.tjms.jus.br/cposg5/open.do"
        const instance  = 2
        const htmlResponse = await retrieveHtml(url, instance, splitedCode)

        return __retrieveInstanceResponse(await htmlResponse, instance) 
    }

    async function __executeFirstInstance(){
        const url = "https://esaj.tjms.jus.br/cpopg5/open.do"
        const instance  = 1
        const htmlResponse = await retrieveHtml(url, instance, splitedCode)

       return __retrieveInstanceResponse(await htmlResponse, instance)
    }

    async function __executeInstances(){

        return  Promise.all([
            __executeFirstInstance(),
            __executeSecondInstance()
        ]).catch(err=>console.log(err))
    }

    async function crawl(){
        if(pattern.test(code)){
            const [firstInstance, secondInstance] = await __executeInstances()

            return {
                "primeira instancia": await firstInstance,
                "segunda instancia": await secondInstance
            }
        }else{

            return {
                "error": "400",
                "mensagem auxiliar": "codigo no formato errado, deve estar no formato: NNNNNNN-DD.AAAA.J.TR.OOOO"
            }
        } 
    }

    function __crawlTjms(){
        if(test === true){

            return{
                "retrieveInstance":(htmlResponse,instance) => __retrieveInstanceResponse(htmlResponse, instance),
            }
        }else{

            return crawl().catch(err=>console.log(err))
        }
    }

    return __crawlTjms()
}

module.exports = crawlTjms;