const Nightmare =  require("nightmare")

async function retrieveHtml(url, instance, splitedCode, tentatives = 1){
    const ERR_NAME_NOT_RESOLVED = -105
    const ERR_CONTENT_NOT_LOADED = -7
    
    return await new Promise(async function(resolve, reject){
        const nightmare = Nightmare({show: false, waitTimeout: 10000, gotoTimeout:5000})
        const [firstPartCode,secondPartCode] = splitedCode
        await nightmare
                 .goto(url)
                 .wait("#numeroDigitoAnoUnificado") // waits until input area is visible 
                 .insert("#numeroDigitoAnoUnificado",firstPartCode)  // inputs the first part of the code
                 .insert("#foroNumeroUnificado",secondPartCode) // inputs the second part of the code
                 .click(instance === 1 ? "#botaoConsultarProcessos" : "#pbConsultar") // clicks on button to search for the process
                 .wait("#tabelaUltimasMovimentacoes", 4000)
                 .evaluate(() => document.querySelector("body").innerHTML) // retrieves html from loaded page
                 .end()
                 .then(html =>{
                     resolve(html) // returns the html 
                 })
                 .catch(error => {
                     
                     if(error.code === ERR_NAME_NOT_RESOLVED){
                         resolve({
                             "error": "503"
                         })
                     }else if(error.code === ERR_CONTENT_NOT_LOADED && tentatives < 3){
                        resolve(retrieveHtml(url, instance, splitedCode, tentatives+1))
                     }else{
                         resolve({
                             "error": "408"
                         })
                     }
                 })
     })
}

module.exports = retrieveHtml;