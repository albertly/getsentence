const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { app } = require('@azure/functions');

app.http('GetSentence', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        //const name = request.query.get('name') || await request.text() || 'world';
        const word = req.query.word || (req.body && req.body.word);
        if (!word) {
            context.res = {
                status: 400,
                body: "Please provide a word"
            };
            return;
        }

        const url = `https://sentence.yourdictionary.com/${word}`;
        try {
            const response = await fetch(url);
            if (response.ok) {
                const html = await response.text();
                const $ = cheerio.load(html);
                const sentences = [];
                $('p.sentence-item__text').each((index, element) => {
                    sentences.push($(element).text());
                });
                console.log(sentences);
                return  {
                    status: 200,
                    body: sentences
                };
            } else {
                return {
                    status: 500,
                    body: "Failed to fetch example sentences"
                };
            }
        } catch (error) {
            context.log('Error:', error);
            return {
                status: 500,
                body: "An error occurred"
            };
        }      
    }
});





module.exports = async function (context, req) {



};
