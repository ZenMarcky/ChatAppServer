const {MongoClient} = require('mongodb');

let dbConnection

module.exports = {
    connectMongoDb: function(callBack){
        MongoClient.connect(process.env.MONGO_URI)
        .then((client)=>{
dbConnection = client.db()
 callBack();
        }).catch((error)=>{
            console.log(error)
        callBack(error);
        })
    },
    getDb: function(){
        return dbConnection
    }
};