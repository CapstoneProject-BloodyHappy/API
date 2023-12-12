const fetch = require('node-fetch');

class PredictionAPI {
    constructor(predictionUrl) {
        this._predictionUrl = predictionUrl;
    }

    getPrediction = (photoUrl) => {
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
}

module.exports = PredictionAPI;