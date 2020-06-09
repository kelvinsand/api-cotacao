import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();

async function getPriceData(asset: string) {
    try {
        const response = await axios.get(`https://statusinvest.com.br/acoes/${asset}`);

        if (response.status !== 200) {
            return `Consulta a base de informações retornou com erro`;
        }

        let html = response.data;

        const searchFocusAreaPosition = {
            inital: html.match('<h3 class="(.*)">Valor atual<\/h3>')?.index,
            final: 0
        }

        if (searchFocusAreaPosition.inital === undefined
            && html.includes("Não encontramos o que você está procurando")) {
            return `A busca por ${asset} não retornou dados`;
        }

        searchFocusAreaPosition.final = html.indexOf('</div>', searchFocusAreaPosition.inital);
        html = html.slice(searchFocusAreaPosition.inital, searchFocusAreaPosition.final);

        const pricePosition = {
            inital: html.match(/>([\d,]+)/)?.index + 1,
            final: 0
        }
        pricePosition.final = html.indexOf('</', pricePosition.inital);

        return html.slice(pricePosition.inital, pricePosition.final);
    } catch (error) {
        console.error(error);
        return `Ocorreu um erro desconhecido`;
    }
}

function formatPrice(price: string){
    return parseFloat(price.replace(',', '.'));
}

app.use(cors());

app.get('/quote/:asset', async (request, response) => {
    const priceData: string = await getPriceData(request.params.asset);
    const price: number = formatPrice(priceData);
    
    if(isNaN(price)){
        response.status(500).send({
            error: priceData
        });    
    }

    response.json({
        price
    });
});

app.listen(process.env.PORT || 3333);
