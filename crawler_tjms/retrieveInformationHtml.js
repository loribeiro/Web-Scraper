const cheerio = require("cheerio")

function retrieveInformationHtml(document, instance = 1){
    const $ = cheerio.load(document) //jquery notation

    function __getDadosProcesso(){
        return{
            "classe": $("body").find("#classeProcesso").text().trim(),
            "area": $("body").find("#areaProcesso").find("span").text().trim() ,
            "assunto": $("body").find("#assuntoProcesso").text().trim(),
            "data": $("body").find("#dataHoraDistribuicaoProcesso").text().trim(),
            "juiz": $("body").find("#juizProcesso").text().trim(),
            "valor":$("body").find("#valorAcaoProcesso").text().trim(),
        }
    }

    function __getPartesProcesso(){
        
        const element  =  $("body").find("#tableTodasPartes").find("tr")
        const treatedArray = cleanElement(element,$)
        const partesProcesso = treatedArray.reduce((acumulator, currentValue, index)=>{
            if(index %2 === 0){
                acumulator[currentValue] = treatedArray[index+1]
            }
            return acumulator
        },{})
        return partesProcesso
    }

    function __getListaMovimentacoes(){
        
        const movimentacoes = []
        const info = $("body").find("#tabelaUltimasMovimentacoes").find("tr").each((index, element)=>{
            const treatedAsArray = cleanElement(element, $)
            const data = treatedAsArray.shift()
            
            movimentacoes.push({
                "data": data,
                "movimentação": treatedAsArray.join(" \n")
            })

        })
        
        return movimentacoes
    }

    function execute(){
        const dadosProcesso = __getDadosProcesso() 
        if(instance === 1){
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
        }else{
           
            return {
                "classe": dadosProcesso.classe,
                "área": dadosProcesso.area,
                "assunto": dadosProcesso.assunto,
                "lista das movimentações (data e movimento)": __getListaMovimentacoes(),
            }
        }
    }
       
    return execute()
}

module.exports = retrieveInformationHtml;

function cleanElement(element,$){
    const treatedAsArray = $(element).text().replace(/\t/g,'').trim() //replaces all occurrences of "\t" with "" 
    .split("\n")  // transform into array by spliting the string on "\n"
    .filter(item => /\S/.test(item)) // removes all the occurences of "" character

    return treatedAsArray
}