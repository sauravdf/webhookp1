import express, { Router } from "express";
import pkg from "body-parser";
const {json} = pkg;
import axios from "axios";
import 'dotenv/config'
import serverless from 'serverless-http';
const router = Router();
const app=express().use(json());

const token=process.env.TOKEN;
const mytoken=process.env.VERIFY_TOKEN;

console.log("hello world");

app.listen(process.env.PORT,()=>{
    console.log("webhook is listening at port "+process.env.PORT);
});

app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let challenge = req.query['hub.challenge'];
    let token = req.query['hub.verify_token'];

    // const mytoken="saurabh"


    if(mode && token){

        if(mode==="subscribe" && token===mytoken){
            res.status(200).send(challenge);
        }else{
            res.status(403);
        }
    }
});

app.post("/webhook",(req,res)=>{ //i want some 

    let body_param=req.body;

    console.log(JSON.stringify(body_param,null,2));

    if(body_param.object){
        console.log("inside body param");
        if(body_param.entry && 
            body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.messages && 
            body_param.entry[0].changes[0].value.messages[0]  
            ){
               let phon_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
               let from = body_param.entry[0].changes[0].value.messages[0].from; 
               let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

               console.log("phone number "+phon_no_id);
               console.log("from "+from);
               console.log("body param "+msg_body);

               axios({
                   method:"POST",
                   url:"https://graph.facebook.com/v15.0/"+phon_no_id+"/messages?access_token="+token,
                   data:{
                       messaging_product:"whatsapp",
                       to:from,
                       text:{
                           body:"Hi.. I'm Saurav, your message is "+msg_body
                       }
                   },
                   headers:{
                       "Content-Type":"application/json"
                   }

               });

               res.sendStatus(200);
            }else{
                res.sendStatus(404);
            }

    }

});

app.get("/",(req,res)=>{
    res.status(200).send("hello this is webhook setup");
});

app.use('/.netlify/functions/api',router)
export const handler =serverless(app)