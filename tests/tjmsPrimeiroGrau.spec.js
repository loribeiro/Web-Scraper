const crawlTJMS = require("../crawler_tjms/crawlTjms")
const fs = require("fs")

describe("TJMS Primeiro Grau", ()=>{
    const html = fs.readFileSync(__dirname + "/tjms_html/primeiro_grau/pagina_resultado/resultado.htm","utf8")
    const code = "0821901-51.2018.8.12.0001"
    const testCrawl = crawlTJMS(code, true)

    test("it should return the result of the first instance", ()=>{
        const input = testCrawl.retrieveInstance(html, 1)
        const output = require("./tjms_responses/first_instance/response.json")

        expect(input).toMatchObject(output["primeira_instancia"]);
    })
    
})