var fs = require('fs');
var etpl = require('etpl');
var marked = require('marked');

var config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

var exampleTpl = fs.readFileSync('tpl/example.tpl', 'utf-8');
var exampleTplRenderer = etpl.compile(exampleTpl);
config.examples.forEach(function (exampleConf) {
    var code = fs.readFileSync(
       'example/code/' + exampleConf.name + '.js', 'utf-8'
    );

    var html = exampleTplRenderer({
        title: exampleConf.title
    }).replace('{{code}}', code);

    fs.writeFileSync('example/' + exampleConf.name + '.html', html, 'utf-8');
});

// Build docs
var articleTpl = fs.readFileSync('tpl/article.tpl', 'utf-8');
var articleTplRenderer = etpl.compile(articleTpl);
var articlesGroupedByLang = {};

for (var name in config.languages) {
    var langConf = config.languages[name];

    var articles = config.articles.map(function (articleConf) {
        var articleMdUrl = langConf.markdownRoot + '/' + articleConf.markdownUrl;
        var articleHtmlUrl = articleMdUrl.split('/').pop().replace('.md', '.html');
        var articleMD = fs.readFileSync(articleMdUrl, 'utf-8');
        var articleDetail = marked(articleMD);

        return {
            title: articleConf.title,
            url: articleHtmlUrl,
            detail: articleDetail
        };
    });

    articles.forEach(function (article) {
        var html = articleTplRenderer({
            articleList: articles,
            article: article
        }).replace('{{articleHtml}}', article.detail);
        fs.writeFileSync(langConf.root + '/article/' + article.url, html, 'utf-8');
    });
}

// Index
var tpl = fs.readFileSync('tpl/index.tpl', 'utf-8');
fs.writeFileSync('index.html', tpl, 'utf-8');