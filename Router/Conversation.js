const express = require('express');
const {getDb} = require('../db');
const { validateToken } = require('../middleware/AuthMiddleware');
const { ObjectId } = require('mongodb');
const router = express.Router();

// create conversation
router.post('/',validateToken, (request,response)=>{
    const db = getDb();
    let reqData  = {
        members:[
request.body.userToadd,request.user.id
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    }
    let user = request.body.userToadd
    let checkUser = []
 db.collection('conversation').find({members:[user,request.user.id]}).forEach((data)=>{
checkUser.push(data)
        }).then(()=>{
            if(checkUser.length > 0){
                response.status(200).json({error:"User Already Exists"})
                  }else{
                    console.log(checkUser)
                    db.collection('conversation').insertOne(reqData).then((data)=>{
                        response.status(200).json(data)
                    }).catch(()=>{
                        response.status(500).json({error:"Error Request"})
                    })
                  }
        })
})

// get conversation
router.get('/:userId',validateToken ,(request,response)=>{
    const db = getDb();
    let dataArray = [];
db.collection('conversation').find({
    members:{$in:[request.params.userId]}}).forEach((data)=>{
        dataArray.push(data)
    }).then(()=>{
        response.status(200).json(dataArray);
    }).catch(()=>{
        response.status(500).json({error:"Error Request"})
    })
})


// delete conversation
router.delete('/:conId' ,(request,response)=>{
    const db = getDb();
    db.collection('conversation').deleteOne({_id : new ObjectId(request.params.conId)})
    .then(()=>{
        response.status(200).json("Delete Successful")
    }).catch(()=>{
        response.status(500).json({error:"error"})
    })
})



module.exports = router;