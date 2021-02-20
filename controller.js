const crawlTJAL = require("./crawler_tjal/crawlTjal")
const crawlTJMS = require("./crawler_tjms/crawlTjms")

function controller(code, response){
    if(code.includes(".8.12.")){

        crawlTJMS(code).then(resp=>{
            response.writeHead(200,{'Content-Type': 'application/json'});
            response.end(JSON.stringify(resp))
        }).catch(err =>{
            console.log(err)
            response.writeHead(400,{'Content-Type': 'application/json'});
            response.end(`{"error": "${http.STATUS_CODES[404]}"}`)      
        })
    
    }else if(code.includes(".8.02.")){
    
        crawlTJAL(code).then(resp=>{
            response.writeHead(200,{'Content-Type': 'application/json'});
            response.end(JSON.stringify(resp))
        }).catch(err => {
            console.log(err)
            response.writeHead(400,{'Content-Type': 'application/json'});
            response.end(`{"error": "${http.STATUS_CODES[404]}"}`)
    
        })
        
    }else{
        response.end(`{"error": "${http.STATUS_CODES[404]}"}`)
    }
}

module.exports = controller;