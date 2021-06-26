const express=require('express');
const bodyParser= require('body-parser');

const bcrypt =require('bcrypt-nodejs');
const cors=require('cors');

const app=express();

//db
const knex=require('knex');


const db=knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',//= localhost
    user : 'postgres',
    password : 'hamzahandball',
    database : 'wayz'
  }
});

app.use(bodyParser.json());

app.use(cors());







app.get('/',(req,res)=>{
	db.select('*').from('users')
	.then(users=>{
		res.send(users);
	})

  
})

app.post('/signin',(req,res)=>{
  
  db.select('email','hash').from('login')
  .where('email','=',req.body.email)
    .then(data=>{
    const isValid=	bcrypt.compareSync(req.body.password, data[0].hash);
    	if(isValid){ 
    	return	db.select('*').from('users')
    		  .where('email','=',req.body.email)
    		  .then(user=>{
    		  	console.log(isValid)
    		  	res.json(user[0])
    		  })
    		  .catch(err=>res.status(400).json('unable to get user'))
    	} else{
    		res.status(400).json('wrong credentials')
    	}

    })
    .catch(err=>res.status(400).json("wrong credentials"))
  

})

app.post('/register',(req,res)=>{
  const {email,name,password,lastName,number,ville,sexe}=req.body;
  
  const hash = bcrypt.hashSync(password);


  db.transaction(trx=>{
  	 trx.insert({
  	 	hash:hash,
  	 	email:email
  	 })
  	 .into('login')
  	 .returning('email')
  	 .then(loginEmail=>{
  	 	  trx('users')
        .returning('*')
        .insert({
              email:loginEmail[0],
              name:name,
              lastname:lastName,
              number:number,
              ville:ville,
              sexe:sexe,
              joined:new Date()
            })
         .then(user=>{
            res.json(user[0]);  
          }) 
           })
  .then(trx.commit)
  .catch(trx.rollback)
  	
  })
  .catch(err=>res.status(400).json('unable to register'))


})








app.get('/profile/:id',(req,res)=>{
  const {id}=req.params;
  let found=false;
  database.users.forEach(user=>{
    if(user.id===id){
      found=true;
     return res.json(user)
    }

  })
  if(!found){
    return res.status(400).json('not found');
  }
})

app.listen(3001,()=>{

  console.log('app is runing on port 3001');
})

