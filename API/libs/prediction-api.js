const fetch = require('node-fetch');

class PredictionAPI {
    constructor(predictionUrl) {
        this._predictionUrl = predictionUrl;
    }

    getPrediction = (photoUrl) => {
        try{
            return new Promise((resolve, reject) => {
                fetch(this._predictionUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ file_link: photoUrl })
                })
                    .then(response => {
                        if (!response.ok) {
                            reject(response.statusText);
                        }
                        resolve(response.json());
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        }
        catch(error){
            console.log(error);
            throw{
                status: 500,
                error: "Failed to get prediction"
            }
        }
    }
}

module.exports = PredictionAPI;