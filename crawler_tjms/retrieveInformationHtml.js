const cheerio = require("cheerio")
const selectors  = require("./css_selectors/selectors")
const elementCleaner = require("../elementCleaner")

function retrieveInformationHtml(document, instance = 1, test = false){
    const $ = cheerio.load(document) //jquery notation

    function __getDadosProcesso(){

        return{
            "classe": $("body").find(selectors.classeSelector).text().trim(),
            "area": $("body").find(selectors.areaSelector).find("span").text().trim() ,
            "assunto": $("body").find(selectors.subjectSelector).text().trim(),
            "data": $("body").find(selectors.dateSelector).text().trim(),
            "juiz": $("body").find(selectors.judgeSelector).text().trim(),
            "valor": $("body").find(selectors.amountSelector).text().trim(),
        }
    }

    function __getPartesProcesso(){
        
        const element  =  $("body").find("#tableTodasPartes").find("tr")
        const cleanedUpArray = elementCleaner(element,$)
        const partesProcesso = cleanedUpArray.reduce((acumulator, currentValue, index)=>{
            if(index %2 === 0){
                acumulator[currentValue] = cleanedUpArray[index+1]
            }

            return acumulator
        },{})

        return partesProcesso
    }

    function __getListaMovimentacoes(){
        
        const movimentacoes = []
        const info = $("body").find(selectors.tableMovimentacoesSelector).find("tr").each((index, element)=>{
            const cleanedUpArray = elementCleaner(element, $)
            const data = cleanedUpArray.shift()
            
            movimentacoes.push({
                "data": data,
                "movimentação": cleanedUpArray.join(" \n ")
            })

        })
        
        return movimentacoes
    }

    function __getResponse(){
        
        const dadosProcesso = __getDadosProcesso() 
        if((dadosProcesso.classe === undefined && dadosProcesso.assunto === undefined )
            || (dadosProcesso.classe === "" && dadosProcesso.assunto === "")){

            return null
        }else{
            switch(instance){
                case 1:

                    return {
                        "classe": dadosProcesso.classe,
                        "área": dadosProcesso.area,
                        "assunto": dadosProcesso.assunto,
                        "data de distribuição": dadosProcesso.data,
                        "juiz": dadosProcesso.juiz,
                        "valor da ação": dadosProcesso.valor,
                        "partes do processo": __getPartesProcesso(),
                        "lista das movimentações (data e movimento)": __getListaMovimentacoes(),
                    }
            
                case 2:   

                    return {
                        "classe": dadosProcesso.classe,
                        "área": dadosProcesso.area,
                        "assunto": dadosProcesso.assunto,
                        "lista das movimentações (data e movimento)": __getListaMovimentacoes(),
                    }
            }
        }

    }

    function __retrieveInformation(){
        if(test === true){

            return{
                "getDadosProcesso": () => __getDadosProcesso(),
                "getPartesProcesso": () => __getPartesProcesso(),
                "getListaMovimentacoes": () => __getListaMovimentacoes(),
            }
        }else{

            return __getResponse()
        }
    }

    return __retrieveInformation()
}

module.exports = retrieveInformationHtml;



