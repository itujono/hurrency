
const Restify = require("restify")
const request = require("request")

const server = Restify.createServer({
    name: "Currencers"
})


server.use(Restify.plugins.bodyParser())
server.use(Restify.plugins.jsonp())


const convertCurrency = (amountToConvert, outputCurrency, callback) => {
    const { amount, currency } = amountToConvert

    return request({
        url: "https://api.fixer.io/latest",
        qs: {
            base: currency,
            symbols: outputCurrency
        },
        method: "GET",
        json: true
    }, (error, response, body) => {
        if (response.statusCode === 200) {
            const computedVal = Math.round(body.rates[outputCurrency] * amount)
            callback(null, `${amount} ${currency} converts to around ${outputCurrency} ${computedVal}`)
        } else {
            callback(error, null)
        }
    })
}


server.post("/", (req, res, next) => {
    const {status, result} = req.body

    console.log(result)

    if (status.code === 200 && result.action === "convert") {
        const { outputCurrency, amountToConvert } = result.parameters

        // Cek kalo ada yang iseng
        if (amountToConvert.currency === outputCurrency) {
            const { amount, currency } = amountToConvert

            const responseText = `Well, what's the big idea converting ${currency} to ${outputCurrency}? You want to play around?`

            res.json({
                speech: responseText,
                displayText: responseText,
                source: "Currencers"
            })
        } else {

            // Mulai deh pake API Fixer.io nya!
            convertCurrency(amountToConvert, outputCurrency, (error, result) => {
                if (!error) {
                    res.json({
                        speech: result,
                        displayText: result,
                        source: "Currencers"
                    })
                }
            })

        }
    }

    if (status.code === 200 && result.action === "goodbye") {
        const { outputCurrency, amountToConvert } = result.parameters
        
        const makanan = "Kamu pikir itu enak?"

        res.json({
            speech: makanan,
            displayText: makanan,
            source: "Currencers"
        })
    }

    return next()
})

// "https://f2e59dfd.ngrok.io" -----> Ngrok Port!

const port = process.env.PORT || 3000

server.listen(port, () => console.log(`App jalan dengan lancar di port ${port}`))