const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

const port = 5000;

const Posts = require('./posts.js');

mongoose.connect('mongodb+srv://robertinfinity10:lvXpPG63ByTYKPAA@portal-noticiais.gg73jeq.mongodb.net/portal-noticiais?retryWrites=true&w=majority&appName=portal-noticiais', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Conectado com Sucesso!')
}).catch(() => console.log('Erro...'))

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    if (req.query.busca == null) {
        Posts.find({}).sort({ '_id': -1 }).exec(function (err, posts) {
            // Comando para pegar tudo do mais recente primeiro.
            posts = posts.map((val) => {
                return {
                    titulo: val.titulo,
                    categoria: val.categoria,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0, 100),
                    img: val.img,
                    slug: val.slug,
                }
            })


            Posts.find({}).sort({ 'views': -1 }).limit(3).exec(function (err, postsTop) {
                postsTop = postsTop.map(function (val) {
                    return {
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0, 100),
                        img: val.img,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }
                })
                res.render('home', { posts: posts, postsTop: postsTop });
            })
        })



    } else {
        res.render('busca', {});
    }
});

app.get('/:slug', (req, res) => {
    Posts.findOneAndUpdate(
        { slug: req.params.slug },
        { $inc: { views: 1 } },
        { new: true },
        (err, resposta) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao buscar e atualizar notícia.');
            }
            if (!resposta) {
                return res.status(404).send('Notícia não encontrada.');

            }
            Posts.find({}).sort({ 'views': -1 }).limit(3).exec(function (err, postsTop) {
                postsTop = postsTop.map(function (val) {
                    return {
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0, 100),
                        img: val.img,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }
                })
                res.render('single', { noticia: resposta, postsTop: postsTop });
            })
        }
    );
});


app.listen(port, () => {
    console.log("Rodando na porta", port);
});
