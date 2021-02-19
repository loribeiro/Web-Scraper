const cheerio = require("cheerio")
const seletoresInstancia1 = require("./html_selectors/tjalSelectors")
const seletoresInstancia2 = require("./html_selectors/tjalSelectorsSecondInstance")


function retrieveInformation(document, instance=1){
    const $ = cheerio.load(document) //jquery notation

    function __getClasse(){
        const seletor = instance === 1 ? seletoresInstancia1 : seletoresInstancia2
        return $("body").find(seletor.classeSelector).text().trim()
    }

    function __getArea(){
        const seletor = instance === 1 ? seletoresInstancia1 : seletoresInstancia2

        return $("body").find(seletor.areaSelector).text().trim()
    }

    function __getAssunto(){
        const seletor = instance === 1 ? seletoresInstancia1 : seletoresInstancia2

        return $("body").find(seletor.assuntoSelector).text().trim() 
    }

    function __getDistribuicao(){
        return $("body").find(seletoresInstancia1.dataDistribuicaoSelector).text().trim()
    }

    function __getJuiz(){
        return $("body").find(seletoresInstancia1.juizSelector).text().trim()
    }

    function __getValorAcao(){
        return $("body").find(seletoresInstancia1.valorAcaoSelector).text().trim()
    }

    function __getPartesProcesso(){
        const info = $("body").find(seletoresInstancia1.partesProcessoSelector).text().trim()
            .replace(/\t/g,'').split("\n").filter(item => /\S/.test(item))

        const object = info.reduce((acumulator, currentValue, index)=>{
            if(index %2 === 0){
                acumulator[currentValue] = info[index+1]
            }
            return acumulator
        },{})

        return object        
    }

    function __getListaMovimentacoes(){
        const seletor = instance === 1 ? seletoresInstancia1 : seletoresInstancia2
        const movimentacoes = []
        const info = $("body").find(seletor.movimentacoesSelector).find("tr").each((index, element)=>{
             const treatedAsArray = $(element).text().replace(/\t/g,'').trim() //replaces all occurrences of "\t" with "" 
                .split("\n")  // transform into array by spliting the string on "\n"
                .filter(item => /\S/.test(item)) // removes all the occurences of "" character

             const data = treatedAsArray.shift()
              
             movimentacoes.push({
                 "data": data,
                 "movimentação": treatedAsArray.join(" \n")
             })

        })
        
        return movimentacoes
    }

    function execute(){
        if(instance === 1){

            return {
                "classe": __getClasse(),
                "área": __getArea(),
                "assunto": __getAssunto(),
                "data de distribuição": __getDistribuicao(),
                "juiz": __getJuiz(),
                "valor da ação": __getValorAcao(),
                "partes do processo": __getPartesProcesso(),
                "lista das movimentações (data e movimento)": __getListaMovimentacoes(),
            }
        }else{
            return {
                "classe": __getClasse(),
                "área": __getArea(),
                "assunto": __getAssunto(),
                "lista das movimentações (data e movimento)": __getListaMovimentacoes(),
            }
        }
    }
    return execute()
}
module.exports = retrieveInformation;

