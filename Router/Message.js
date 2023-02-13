const express = require('express');
const router = express.Router();
const {getDb} = require('../db');
const { validateToken } = require('../middleware/AuthMiddleware');


// send message
router.post('/', validateToken,async (request,response)=>{
    const db = getDb();
    let reqData  = {
        conversationId : request.body.conversationId,
        senderId : request.body.senderId,
        receiverId: request.body.receiverId,
        createdAt: new Date(),
        updatedAt: new Date(),
        text: request.body.text

    }
   await db.collection('Message').insertOne(reqData)
   .then((data)=>{
        response.status(200).json(data)
    }).catch(()=>{
        response.status(500).json({error:"Error Request"})
    })
})


// get conversation
router.get('/:conversationId', validateToken,(request,response)=>{
    const db = getDb();
    let dataArray = [];
db.collection('Message').find({conversationId: request.params.conversationId}).forEach((data)=>{
        dataArray.push(data)
    }).then(()=>{
        response.status(200).json(dataArray);
    }).catch(()=>{
        response.status(500).json({error:"Error Request"})
    })
})

// delete conversation
router.delete('/:userid/:receiverId',validateToken,(request,response)=>{
    const db = getDb();
db.collection('Message').deleteMany({senderId: request.params.userid,receiverId: request.params.receiverId}).then(()=>{
    response.status(200).json("Delete Success")
}).catch(()=>{
    response.status(500).json({error:"Error Request"})
})
})

module.exports = router;