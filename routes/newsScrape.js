var request = require("request");
var cheerio =  require("cheerio");
var Article = require("../models/Article.js");

module.exports = (router, db) => {
    router.get("/", (req, res) => {
        db.Article.find({
            saved: false
        }).exec((err, doc) => {
            if(err) {
                res.send(err);
            }
            else
            {
                res.render("home", {Article: doc});
            }
        });
    });

    router.get("/savedArticles", (req, res) => {
        db.Article.find({saved: true}).populate("comments", "body").exec((err, doc) => {
            if(err)
            {
                res.send(err);
            }
            else
            {
                res.render("savedArticles", {saved: doc});
            }
        });
    });

    router.get("/scraped", (req, res) => {
        var link = "https://www.nytimes.com/section/world";
        request(link, (err, response, html) => {
            let $ = cheerio.load(html);
            let values = [];
            $("h2").each((i, el) => {
                let content = {};
                content.link = $('h2').children('a').attr('href');
                content.imgURL = $('h2').children('a').children('img').attr('src');
                content.title = $('h2').children('a').text();
            
                if(content.link && content.imgURL && content.title)
                {
                    values.push(new Article(content));
                }
            });

            for(let i = 0; i < values.length; i++)
            {
                values[i].save((err, data) => {
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        console.log(data);
                    }
                });

                if(i === (values.length - 1))
                {
                    res.redirect("/");
                }
            }
        });
    });

    router.put("/saved/:id", (req, res) => {
        db.Article.update({_id: req.params.id}, {$set: {saved: true}}, (err, doc) => {
            if(err)
            {
                res.send(err);
            }
            else
            {
                res.sendStatus(200);
            }
        });
    });

    router.put("/unsaved/:id", (req, res) => {
        db.Article.update({ _id: req.params.id }, { $set: { saved: false } }, (err, doc) => {
            if (err) {
                res.send(err);
            }
            else {
                res.sendStatus(200);
            }
        });
    });

    router.post("/newComment/:id", (req,res) => {
        db.Note.create(req.body).then((dbNote) => {
            return db.Article.findOneAndUpdate({_id: req.params.id}, {$push: {comments: dbNote._id}}, {new: true});
        }).then((dbArticle) => {
            res.sendStatus("201");
        }).catch((err) => {
            res.sendStatus("404");
        });
    });

    router.delete("/notes/delete/:id", (req,res) => {

        db.Note.remove({_id: req.params.id}, (err, doc) => {
            if(err)
            {
                res.send(err);
            }
            else
            {
                res.sendStatus("202");
            }
        });
    });
}