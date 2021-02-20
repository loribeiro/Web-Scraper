const cheerio = require("cheerio")
const seletoresInstancia1 = require("./html_selectors/tjalSelectors")
const seletoresInstancia2 = require("./html_selectors/tjalSelectorsSecondInstance")

function retrieveInformation(document, instance=1){
    const $ = cheerio.load(document) //jquery notation
 
    function __getPartesProcesso(){
        const element = $("body").find(seletoresInstancia1.partesProcessoSeletor)
        const info = cleanElement(element, $)

        const partesProcesso = info.reduce((acumulator, currentValue, index)=>{
            if(index %2 === 0){
                acumulator[currentValue] = info[index+1]
            }
            return acumulator
        },{})

        return partesProcesso        
    }

    function __getListaMovimentacoes(){
        const seletor = instance === 1 ? seletoresInstancia1 : seletoresInstancia2
        const movimentacoes = []
        const info = $("body").find(seletor.movimentacoesSeletor).find("tr").each((index, element)=>{
            const treatedAsArray = cleanElement(element, $)
            const data = treatedAsArray.shift()
            
            movimentacoes.push({
                "data": data,
                "movimentação": treatedAsArray.join(" \n")
            })

        })
        
        return movimentacoes
    }

    function __getDadosProcesso(){
        const seletor = instance === 1 ? seletoresInstancia1 : seletoresInstancia2
        const dadosProcesso = {}
        $("body").find(seletor.dadosProcessoSeletor).find("tr").each((index, element)=>{
            const treatedAsArray = cleanElement(element, $)
            switch(treatedAsArray[0]){
                case "Classe:":
                    dadosProcesso["classe"] = treatedAsArray[1]
                    break
                case "Assunto:":
                    dadosProcesso["assunto"] = treatedAsArray[1]
                    break
                case "Área :":
                    dadosProcesso["area"] = treatedAsArray[1]
                case "Distribuição:":
                    dadosProcesso["data"] = treatedAsArray[1]
                    break
                case "Juiz:":
                    dadosProcesso["juiz"] = treatedAsArray[1]
                    break
                case "Valor da ação:":
                    dadosProcesso["valor"] = treatedAsArray[1]
                    break
                default:
                    if(treatedAsArray[0].startsWith("Área:")){
                        dadosProcesso["area"] = treatedAsArray[0].replace('Área:','')
                        break
                    }else{
                        break
                    }
            }
            
        })
       
        return dadosProcesso
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

module.exports = retrieveInformation;


function cleanElement(element,$){
    const treatedAsArray = $(element).text().replace(/\t/g,'').trim() //replaces all occurrences of "\t" with "" 
    .split("\n")  // transform into array by spliting the string on "\n"
    .filter(item => /\S/.test(item)) // removes all the occurences of "" character

    return treatedAsArray
}
