const crawlTJAL = require("./crawler_tjal/crawlTjal")
const crawlTJMS = require("./crawler_tjms/crawlTjms")

const http = require("http")

const port = process.env.PORT || 3000

const requestListener = function (request, response) {
    if (request.method !== 'POST') {
        response.end(`{"error": "${http.STATUS_CODES[405]}"}`)
    } else {
        response.writeHead(200);
        request.on("data",async (chunk)=>{

            const input = await JSON.parse(chunk.toString())
            const code = await input.code.toString()
            
            if(await code.includes(".8.12.")){
                crawlTJMS(code).then(resp=>{
                    response.end(JSON.stringify(resp))
                }).catch(err =>{
                    console.log(err)
                    response.end(`{"error": "${http.STATUS_CODES[404]}"}`)      
                })
            }else if(await code.includes(".8.02.")){
                crawlTJAL(code).then(resp=>{
                    response.end(JSON.stringify(resp))
                }).catch(err => {
                    console.log(err)
                    response.end(`{"error": "${http.STATUS_CODES[404]}"}`)

                })
            }else{
                response.end(`{"error": "${http.STATUS_CODES[404]}"}`)
            }
        })
        request.on("error",()=>response.end(`{"error": "${http.STATUS_CODES[404]}"}`))
        
    }
}
  
const server = http.createServer(requestListener);

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})


