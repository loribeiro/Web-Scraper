const responseController = require("./controller") 
const http = require("http")

const port = process.env.PORT || 3000

const requestListener = function (request, response) {
    if (request.method !== 'POST') {
        response.writeHead(400,{'Content-Type': 'application/json'});
        response.end(`{"error": "${http.STATUS_CODES[405]}"}`)
    } else {
        
        request.on("data",async (chunk)=>{

            const input = await JSON.parse(chunk.toString())
            const code = input.code
            responseController(code, response)
        })

        request.on("error",()=>response.end(`{"error": "${http.STATUS_CODES[404]}"}`))
        
    }
}
  
const server = http.createServer(requestListener);

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})


