const retrieveInformationHtml = require("./retrieveInformationHtml")
const retrieveHtml = require("./retrieveHtml")



function crawlTJAL(code, test = false){
    let splitedCode = code.split(".8.02.")
    const pattern  = /^\d{7}-\d{2}.\d{4}.\d{1}.\d{2}.\d{4}$/ // regex to ensure code correct pattern NNNNNNN-DD.AAAA.J.TR.OOOO

    function __retrieveInstanceResponse(htmlResponse, instance){

        switch (typeof htmlResponse){
            case "object":
                return htmlResponse
            default:
                return retrieveInformationHtml(htmlResponse, instance)
        }
    }

    async function __executeSecondInstance(){
        const url = "https://www2.tjal.jus.br/cposg5/open.do"
        const instance  = 2
        const htmlResponse = await retrieveHtml(url, instance, splitedCode).catch(err => console.log(err))

        return __retrieveInstanceResponse(await htmlResponse, instance)
    }

    async function __executeFirstInstance(){
        const url = "https://www2.tjal.jus.br/cpopg/open.do"
        const instance  = 1
        const htmlResponse = await retrieveHtml(url, instance, splitedCode).catch(err => console.log(err))

        return __retrieveInstanceResponse(await htmlResponse, instance)
    }
    
    async function __executeInstances(){

        return await Promise.all([
            __executeFirstInstance(),
            __executeSecondInstance()
        ]).catch(err=>console.log(err))
    }

    async function crawl(){
       
        if(pattern.test(code)){
            const [firstInstance, secondInstance] = await __executeInstances().catch(err => console.log(err))
           
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
    
    function __crawlTjal(){
        if(test === true){

            return{
                "retrieveInstance":(htmlResponse,instance) => __retrieveInstanceResponse(htmlResponse, instance),
            }
        }else{
            
            return crawl().catch(err=>console.log(err))
        }
    }

    return __crawlTjal()

}

module.exports = crawlTJAL;