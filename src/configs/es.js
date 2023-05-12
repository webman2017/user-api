const { Client } = require('@elastic/elasticsearch')
const client = new Client({
   node: ['http://192.168.107.2:9200', 'http://192.168.107.2:9300'],
})

module.exports = client
