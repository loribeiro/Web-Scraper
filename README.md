# Crawler-JS
API construída para obter informações do TJAL e TJMS com base nos requisitos no desafio Backend da JusBrasil.

## Executar o projeto
### Em um ambiente Node.Js (versão >= 12.19.0) execute o comando:
    > node index.js

## Entrada 
### Tipo de requisição: POST
    {
        "code": string,
    }

## Resposta
### Requisição bem sucedida
    {
        "primeira instancia": {
                "classe": string || null,
                "área": string || null,
                "assunto": string || null,
                "data de distribuição": string || null,
                "juiz": string || null,
                "valor da ação": string || null,
                "partes do processo": [string] || null,
                "lista das movimentações (data e movimento)":  null || [{
                    "data": string,
                    "movimentação": string,
                }] 
        }

        "segunda instancia": {
            
            "classe": string || null,
            "área": string || null,
            "assunto": string || null,
            "lista das movimentações (data e movimento)":  null || [{
                    "data": string,
                    "movimentação": string,
                }]
            
        }
    }
### Requisição mal sucedida
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

