const crawlTJAL = require("../crawler_tjal/crawlTjal")
const fs = require("fs")

describe("TJAL Segundo Grau", ()=>{
    const html = fs.readFileSync(__dirname + "/tjal_html/segundo_grau/pagina_resultado/resultado.htm","utf8")
    const code = "0037530-87.2012.8.02.0001"
    const testCrawl = crawlTJAL(code, true)

    test("it should return the result of the second instance", ()=>{
        const input = testCrawl.retrieveInstance(html, 2)
        const output = require("./tjal_responses/second_instance/response.json")
        
        expect(input).toMatchObject(output["segunda_instancia"]);
        
    })
    
})