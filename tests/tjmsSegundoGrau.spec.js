const crawlTJMS = require("../crawler_tjms/crawlTjms")
const fs = require("fs")

describe("TJMS Segundo Grau", ()=>{
    const html = fs.readFileSync(__dirname + "/tjms_html/segundo_grau/pagina_resultado/resultado.htm","utf8")
    const code = "0821901-51.2018.8.12.0001"
    const testCrawl = crawlTJMS(code, true)

    test("it should return the result of the first instance", ()=>{
        const input = testCrawl.retrieveInstance(html, 2)
        const output = require("./tjms_responses/second_instance/response.json")

        expect(input).toMatchObject(output["segunda_instancia"]);
    })
    
})