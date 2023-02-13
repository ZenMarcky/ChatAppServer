const express = require('express');
const bcryptjs = require('bcryptjs'); 
const {sign} = require('jsonwebtoken');
const {getDb} = require('../db');
const { validateToken } = require('../middleware/AuthMiddleware');
const { ObjectId } = require('mongodb');
const router = express.Router();


//get User
router.get('/get/:userId',validateToken,async (request,response)=>{
    const db = getDb();
db.collection('User').findOne({_id: new ObjectId(request.params.userId)}).then((data)=>{
    delete data.password
    response.status(200).json(data)
}).catch(()=>{
    response.status(500).json({error:"Error Request"})
})
})

//get All User
router.get('/get/',validateToken,async (request,response)=>{
    const db = getDb();
    let allUser = []
db.collection('User').find({}).forEach((data)=>{
    delete data.password
    allUser.push(data)
}).then(()=>{

    response.status(200).json(allUser)
}).catch(()=>{
    response.status(500).json({error:"Error Request"})
})

})

//Register User
router.post('/register',(request,response)=>{
    const db = getDb();
let {username,email,password} = request.body;
let checkUser = []
 db.collection('User').find({$or:[{username:username},{email:email}]}).forEach((data)=>{
    checkUser = data;
}).then(()=>{
    if(checkUser.username === username){
        response.status(200).json({error:"Username is Exists"})
    }
    else if(checkUser.email === email){
        response.status(200).json({error:"Email is Exists"})
    }
    else{
    bcryptjs.hash(password,10).then((hash)=>{
     db.collection('User').insertOne({
        username:username,
        email:email,
        password:hash,
        createdAt: new Date(),
        updatedAt: new Date()
    }).then((data)=>{
         const accessToken = sign({username:username,email:email,id:data.insertedId},process.env.JWT_PRIVATE_KEY);
         response.cookie('userToken',accessToken,{
             maxAge: 1000*60*60,
             expires: new Date('01 12 2021'),
             secure: process.env.NODE_ENV === "production" ? true : false,
             httpOnly: true,
             sameSite: 'lax'
         });
    response.status(200).json("Login Success");
    }).catch(()=>{
        response.status(500).json({error:"Error Request"})
    });
    })
    
    }
}).catch(()=>{
    response.status(500).json({error:"Error Request"})
});

});


// login User
router.post('/login',  (request,response)=>{
    let db = getDb();
    let {email,password} = request.body;
    let checkUser = []
  db.collection('User').find({email:email}).forEach((Data)=>{
        checkUser = Data
    }).then(()=>{
        if(checkUser.email === email){
            bcryptjs.compare(password,checkUser.password).then((match)=>{
           if(!match){
               response.status(200).json({error:"Wrong Email And Password Combination"});
           }
           else{
               const accessToken = sign({username:checkUser.username,email:checkUser.email,id:checkUser._id},process.env.JWT_PRIVATE_KEY);
               response.cookie(process.env.COOKIE_ACCESS,accessToken,{
                   maxAge: 1000*60*60,
                   expires: new Date('01 12 2021'),
                   secure: process.env.NODE_ENV === "production" ? true : false,
                   httpOnly: true,
                   sameSite: 'lax'
               });
                   response.status(200).json("Login Success");
           }
            });
           }
           else{
               response.status(200).json({error:"Email Not Exist"});
           }
    }).catch(()=>{
        response.status(500).json({error:"Error Request"})
    });

});

// Auth user from Cookies

router.get('/auth',validateToken,(request,response)=>{
    response.json(request.user);
})

//Logout User
router.get('/deletecookie',validateToken, (request, response) => {
    //show the saved cookies
    response.clearCookie("userToken")
    response.json("success");
  });
  

module.exports = router;