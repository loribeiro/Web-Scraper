const cheerio = require("cheerio")
const seletoresInstancia1 = require("./css_selectors/tjalSelectors")
const seletoresInstancia2 = require("./css_selectors/tjalSelectorsSecondInstance")
const elementCleaner = require("../elementCleaner")

function retrieveInformation(document, instance=1, test = false){
    const $ = cheerio.load(document) //jquery notation
 
    function __getPartesProcesso(){
        const element = $("body").find(seletoresInstancia1.partesProcessoSeletor)
        const info = elementCleaner(element, $)

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
            const treatedAsArray = elementCleaner(element, $)
            const data = treatedAsArray.shift()
            
            movimentacoes.push({
                "data": data,
                "movimentacao": treatedAsArray.join(" \n ")
            })

        })
        
        return movimentacoes
    }

    function __getDadosProcesso(){
        const seletor = instance === 1 ? seletoresInstancia1 : seletoresInstancia2
        const dadosProcesso = {}
        $("body").find(seletor.dadosProcessoSeletor).find("tr").each((index, element)=>{
            const treatedAsArray = elementCleaner(element, $)
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

    function __getResponse(){
        const dadosProcesso = __getDadosProcesso() 
        if(dadosProcesso.classe === undefined && dadosProcesso.assunto === undefined){

            return null
        }else{
            switch(instance){     
                case 1:

                    return {
                        "classe": dadosProcesso.classe,
                        "area": dadosProcesso.area,
                        "assunto": dadosProcesso.assunto,
                        "data_de_distribuicao": dadosProcesso.data,
                        "juiz": dadosProcesso.juiz,
                        "valor_da_acao": dadosProcesso.valor,
                        "partes_do_processo": __getPartesProcesso(),
                        "lista_das_movimentacoes_data_e_movimento": __getListaMovimentacoes(),
                    }
               case 2:

                    return {
                        "classe": dadosProcesso.classe,
                        "area": dadosProcesso.area,
                        "assunto": dadosProcesso.assunto,
                        "lista_das_movimentacoes_data_e_movimento": __getListaMovimentacoes(),
                    }    
            }
        }
    }

    function __retrieveInformation(){
        if(test === true){

            return{
                "finalResponse": () => __getResponse(),
                "getDadosProcesso": () => __getDadosProcesso(),
                "getPartesProcesso": () => __getPartesProcesso(),
                "getListaMovimentacoes": ()=> __getListaMovimentacoes(),
            }
        }else{

            return __getResponse()
        }
    }

    return __retrieveInformation()
}

module.exports = retrieveInformation;



