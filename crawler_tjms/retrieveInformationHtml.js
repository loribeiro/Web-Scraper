const cheerio = require("cheerio")

function retrieveInformationHtml(document, instance = 1, test = false){
    const $ = cheerio.load(document) //jquery notation

    function __getDadosProcesso(){

        return{
            "classe": $("body").find(classeSelector).text().trim(),
            "area": $("body").find(areaSelector).find("span").text().trim() ,
            "assunto": $("body").find(subjectSelector).text().trim(),
            "data": $("body").find(dateSelector).text().trim(),
            "juiz": $("body").find(judgeSelector).text().trim(),
            "valor": $("body").find(amountSelector).text().trim(),
        }
    }

    function __getPartesProcesso(){
        
        const element  =  $("body").find("#tableTodasPartes").find("tr")
        const cleanedUpArray = cleanElement(element,$)
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
        const info = $("body").find("#tabelaUltimasMovimentacoes").find("tr").each((index, element)=>{
            const cleanedUpArray = cleanElement(element, $)
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
        if(dadosProcesso.classe === undefined, dadosProcesso.assunto === undefined){
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

function cleanElement(element,$){
    const cleanedUpArray = $(element).text().replace(/\t/g,'').trim() //replaces all occurrences of "\t" with "" 
    .split("\n")  // transform into array by spliting the string on "\n"
    .filter(item => /\S/.test(item)) // removes all the occurences of "" character

    return cleanedUpArray
}

const classeSelector = "#classeProcesso"
const areaSelector = "#areaProcesso"
const subjectSelector = "#assuntoProcesso"
const dateSelector = "#dataHoraDistribuicaoProcesso"
const judgeSelector = "#juizProcesso"
const amountSelector = "#valorAcaoProcesso"