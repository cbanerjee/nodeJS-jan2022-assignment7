import express from 'express';
import axios from 'axios';
import redis from 'redis';
const port = 6379;
const server = express();

const client = redis.createClient();
client.connect();
client.on('error', (err) => {
    console.log(err)
})

server.get('/', (req,res)=>{
    res.send('Response from Server at 6379');
})

// localhost:7700/getWiki?country=india
server.get('/wiki/:country',(req,res) => {
    const country = req.params.country;
    const url = `https://en.m.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${country}`

    return client.get(`wiki:${country}`, (err, result) => {
        if(result){
            const output = JSON.parse(result);
            return res.status(200).json(output)
        } else {
            return axios.get(url)
                .then( response => {
                    const output = response.data;
                    client.set(`wiki:${country}`,3600,JSON.stringify({source:'*** Redis Cache ***',...output}));
                    return res.status(200).json({source:'API',...output})
                })
                .catch(err => {
                    return res.send(err)
                }) 
        }
    })
})

server.listen(port,(err)=>{
    console.log(`Express erver is running on port ${port}`)
});