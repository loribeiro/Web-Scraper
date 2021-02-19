const classeSelector = `body > div > table:nth-child(4) > tbody > tr > td > div:nth-child(7) > 
    table.secaoFormBody > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr > td >
     span:nth-child(1) > span`

const areaSelector =  `body > div > table:nth-child(4) > tbody > tr > td > div:nth-child(7) > 
    table.secaoFormBody > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr > td`

const assuntoSelector = `body > div > table:nth-child(4) > tbody > tr > td > div:nth-child(7) > 
    table.secaoFormBody > tbody > tr:nth-child(4) > td:nth-child(2) > span`

const dataDistribuicaoSelector = `body > div > table:nth-child(4) > tbody > tr > td > div:nth-child(7) > 
    table.secaoFormBody > tbody > tr:nth-child(6) > td:nth-child(2) > span`

const juizSelector = `body > div > table:nth-child(4) > tbody > tr > td > div:nth-child(7) > table.secaoFormBody > tbody > 
    tr:nth-child(9) > td:nth-child(2) > span`

const valorAcaoSelector = `body > div > table:nth-child(4) > tbody > tr > td > div:nth-child(7) > table.secaoFormBody > tbody > 
    tr:nth-child(10) > td:nth-child(2) > span`

const partesProcessoSelector = `#tablePartesPrincipais`

const movimentacoesSelector = `#tabelaTodasMovimentacoes`


module.exports = {
    classeSelector,
    areaSelector,
    assuntoSelector,
    dataDistribuicaoSelector,
    juizSelector,
    valorAcaoSelector,
    partesProcessoSelector,
    movimentacoesSelector
}
