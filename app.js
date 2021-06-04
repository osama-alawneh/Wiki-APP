//dependencies
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();
mongoose.connect("mongodb://localhost:27017/wikiDB" , {useUnifiedTopology: true,useNewUrlParser:true ,useFindAndModify: false, });

//setup middleware functions
app.set('view engine' , 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: 3,
        maxlength: 20,
        required: true
    },
    content: {
        type: String,
        minLength: 3,
        maxlength: 2000,
        required: true
    }
});

const Article = mongoose.model("Article" , articleSchema);

//routes
app.get("/articles" , (req,res)=>{
   Article.find()
       .then(result =>{
           if (result.length === 0){
               res.json({"msg" : "no articles found, you can insert one if u like"});
           } else {
               res.json({result});
           }
       })
       .catch(err =>{
           res.status(500).json({err});
       });
});

app.post("/articles" , (req,res) =>{
    const title = req.body.title;
    const content = req.body.content;

    const article = new Article({
        title: title,
        content: content
    });
    article.save()
        .then(result =>{
            res.json({"msg":"the new articles has inserted successfully "})
        })
        .catch(err =>{
            res.status(500).json({"msg": err});
        });
    // res.redirect('/articles');
});

app.get("/articles/:articleName" , (req,res) =>{
   const articleName = req.params.articleName;
   Article.findOne({title: articleName})
       .then(result =>{
           if (result === null){
               res.json({"msg": "No Article found By This Article Name"});
           }else {
               res.json(result);
           }
       })
       .catch(err =>{
           res.status(500).json({"msg": err});
       });
});

app.put("/articles/:articleName" , (req , res) =>{
    const articleName = req.params.articleName;
    const title = req.body.title;
    const content = req.body.content;
    Article.updateOne(
        {title: articleName },
        {title: title, content: content})
        .then((result) =>{
            res.redirect('/articles');
        })
        .catch(err =>{
           res.status(500).json({"msg": err});
        });
});

app.patch("/articles/:articleName" , (req , res) =>{
const articleName = req.params.articleName;
//because i dont know what the user whats to update (maybe the title or the content)
//so i want a dynamic way of changing the value, so we take the req.body
//which will have both values req.body = {title: "anyThing" , content: "anyThing"}, so this way we have access of them
const updatedArticle = req.body;
Article.updateOne(
    {title: articleName},
    {$set: updatedArticle}
    )
    .then(result =>{
        res.redirect('/articles');
    })
    .catch(err =>{
        res.status(500).json({"msg": err});
    });
});

app.delete("/articles" , (req,res) =>{
   Article.deleteMany({})
       .then(() =>{
           res.redirect('/articles');
       })
       .catch(err =>{
           res.status(500).json({"msg" : err});
       })
});

app.delete("/articles/:articleName" , (req , res) =>{
    const articleName = req.params.articleName;
    Article.deleteOne({title: articleName})
        .then(result =>{
            res.json({"msg": "the article is deleted successfully"});
        })
        .catch(err =>{
            res.status(500).json({"msg": err});
        })
});

// PORT setup
const PORT = process.env.Port || 3000;
app.listen(PORT , () =>{
    console.log(`Wiki-API is up and running at PORT ${PORT}`);
});
