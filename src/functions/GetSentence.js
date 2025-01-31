const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { app } = require('@azure/functions');

function getRandomElement(arr) {
            const randomIndex = Math.floor(Math.random() * arr.length);
            return arr[randomIndex];
}

function extractTextsByKey(object, key, result = []) {
    if (typeof object === "object" && object !== null) {
      if (object.hasOwnProperty(key)) {
        result.push(object[key]);
      }
      for (const prop in object) {
        if (
          object.hasOwnProperty(prop) &&
          typeof object[prop] === "object"
        ) {
          extractTextsByKey(object[prop], key, result);
        }
      }
    }
    return result;
  }

app.http('GetSentence', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const word = request.query.get('word') || await request.text() || 'world';
       // const word = req.query.word || (req.body && req.body.word);
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
                    body: getRandomElement(sentences)
                };
            } else {
                const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=84ffb629-a7c3-4512-9c3c-a520c79ded19`;
                const response = await fetch(url);
                if (response.ok) {
                    const json = await response.text();
                    const sentences = extractTextsByKey(JSON.parse(json), "t");
                    return  {
                        status: 200,
                        body: getRandomElement(sentences)
                    };

                }
                else {
                    return {
                        status: 500,
                        body: "Failed to fetch example sentences"
                    };
                }
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