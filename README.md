# Web Scraper-JS
API construída para obter informações do TJAL e TJMS com base nos requisitos no desafio Backend da JusBrasil.

### Observações
Durante os testes verifiquei que os sites do TJMS sofrem diversas instabilidades ao longo do dia.
Devido a isso suas requisições podem sofrer variações de tempo de resposta. 
Para tentar superar os problemas de conexão a API tenta até 3 vezes uma conexão 
em caso falha.  

## Executar o projeto
### Em um ambiente Node.Js (versão >= 12.19.0) execute os comandos:
    > npm install 
    > node index.js
### OBS: "npm install" deve ser executado apenas ao rodar o projeto a primeira vez
## Entrada 
### Tipo de requisição: POST
    {
        "code": string,
    }

## Resposta
### Requisição bem sucedida
    {
        "primeira instancia": null || {
                "classe": string,
                "área": string,
                "assunto": string,
                "data de distribuição": string,
                "juiz": string,
                "valor da ação": string,
                "partes do processo": [string],
                "lista das movimentações (data e movimento)":  [] || [{
                    "data": string,
                    "movimentação": string,
                }] 
        }

        "segunda instancia": null || {
            
            "classe": string,
            "área": string,
            "assunto": string,
            "lista das movimentações (data e movimento)":  [] || [{
                    "data": string,
                    "movimentação": string,
                }]
            
        }
    }
#### OBS: A requisição bem sucedida retornará "null" se o processo não for encontrada na instância pesquisada 

## Requisição mal sucedida
    {
        "erro": "400" || "408" || "503"
    }

## Crawlers / Tribunais onde os dados serão coletados

Tanto o TJAL como o TJMS tem uma interface web para a consulta de processos. O endereço para essas consultas são:

* TJAL
  - 1º grau - https://www2.tjal.jus.br/cpopg/open.do
  - 2º grau - https://www2.tjal.jus.br/cposg5/open.do
* TJMS
  - 1º grau - https://esaj.tjms.jus.br/cpopg5/open.do
  - 2º grau - https://esaj.tjms.jus.br/cposg5/open.do

### Dados a serem coletados:

* classe
* área
* assunto
* data de distribuição
* juiz
* valor da ação
* partes do processo
* lista das movimentações (data e movimento)

### Exemplos de processos
* 0710802-55.2018.8.02.0001 - TJAL
  - para mais numeros de processo, busque no diario oficial de alagoas: https://www.jusbrasil.com.br/diarios/DJAL/
* 0821901-51.2018.8.12.0001  - TJMS
  - para mais numeros de processo, busque no diario oficial de mato grosso do sul: https://www.jusbrasil.com.br/diarios/DJMS/

