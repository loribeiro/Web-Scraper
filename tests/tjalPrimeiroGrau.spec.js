const crawlTJAL = require("../crawler_tjal/crawlTjal")
const fs = require("fs")

describe("TJAL Primeiro Grau", ()=>{
    const html = fs.readFileSync(__dirname + "/tjal_html/primeiro_grau/pagina_resultado/resultado.htm","utf8")
    const code = "0037530-87.2012.8.02.0001"
    const testCrawl = crawlTJAL(code, true)

    test("it should return the result of the first instance", ()=>{
        const input = testCrawl.retrieveInstance(html, 1)
        const output = require("./tjal_responses/first_instance/response.json")
        
        expect(input).toMatchObject(output["primeira instancia"]);
        
    })
    
})