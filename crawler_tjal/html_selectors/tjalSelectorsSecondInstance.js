const classeSelector = `body > div > table:nth-child(4) > tbody > tr > td > div:nth-child(5) >
     table.secaoFormBody > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr > td > span > span`

const areaSelector =  `body > div > table:nth-child(4) > tbody > tr > td > div:nth-child(5) > 
    table.secaoFormBody > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr > td`

const assuntoSelector = `body > div > table:nth-child(4) > tbody > tr > td > div:nth-child(5) > 
    table.secaoFormBody > tbody > tr:nth-child(4) > td:nth-child(2) > span`

const movimentacoesSelector = `#tabelaTodasMovimentacoes`



module.exports = {
    classeSelector,
    areaSelector,
    assuntoSelector,
    movimentacoesSelector
}
