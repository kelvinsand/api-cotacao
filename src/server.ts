import express from 'express';
import axios from 'axios';

const app = express();

async function getPrice(asset: string) {
    try {
        const response = await axios.get(`https://statusinvest.com.br/acoes/${asset}`);

        if (response.status === 200) {
            let html = response.data;

            const searchFocusAreaPosition = {
                inital: html.match('<h3 class="(.*)">Valor atual<\/h3>')?.index,
                final: 0
            }
            searchFocusAreaPosition.final = html.indexOf('</div>', searchFocusAreaPosition.inital);
            html = html.slice(searchFocusAreaPosition.inital, searchFocusAreaPosition.final);

            const pricePosition = {
                inital: html.match(/>([\d,]+)/)?.index + 1,
                final: 0
            }
            pricePosition.final = html.indexOf('</', pricePosition.inital);

            return html.slice(pricePosition.inital, pricePosition.final);
        }
    } catch (error) {
        console.error(error);
    }
}

app.get('/cotacao/:asset', async (request, response) => {
    const price = await getPrice(request.params.asset);
    response.json({
        price
    });
});

app.listen(3333);