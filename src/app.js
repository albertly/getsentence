const fetch = require('node-fetch');
const cheerio = require('cheerio');

function extractTextsByKey(object, key, result = []) {
    if (typeof object === "object" && object !== null) {
      if (object.hasOwnProperty(key)) {
        result.push(object[key]);
      }
      for (const prop in object) {
        if (object.hasOwnProperty(prop) && typeof object[prop] === "object") {
          extractTextsByKey(object[prop], key, result);
        }
      }
    }
    return result;
}

function fetchFromYourDictionary(word) {
    const url = `https://sentence.yourdictionary.com/${word}`;
    return fetch(url)
        .then(response => response.text())
        .then(html => {
            const $ = cheerio.load(html);
            const sentences = [];
            $('p.sentence-item__text').each((index, element) => {
                sentences.push($(element).text());
            });
            return sentences;
        });
}

function fetchFromWordnik(word) {
    const url = `https://api.wordnik.com/v4/word.json/${word}/examples?includeDuplicates=false&useCanonical=false&limit=50&api_key=b96q5n6e6m25nyz9d13hs3x6qtn68jxf092kzvxmecy0mi9jt`;
    return  fetch(url)
        .then(response => response.json())
        .then(json => extractTextsByKey(json, "text"));
}

function getShortestUniqueStrings(arr, N) {
    const uniqueStrings = [...new Set(arr)];
    uniqueStrings.sort((a, b) => a.length - b.length);
    return uniqueStrings.slice(0, N);
}

const getArrayOfFetches = (word) => [fetchFromYourDictionary(word), fetchFromWordnik(word)];

async function fetchData(url) {
    try {
        const [arr1, arr2] = await Promise.all(getArrayOfFetches('sequacious'));

        console.log('Data fetched:', getShortestUniqueStrings([ ...arr1, ...arr2], 5));
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.text();
            console.log('Data fetched:', data);
        } else {
            console.error('HTTP Error:', response.status);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Example usage
const url = 'https://getsentences.azurewebsites.net/api/GetSentence?word=get';
fetchData(url);
