const getCartStats = cart => {
    const coinCosts = cart.map(e => e[1])
    const totalCoins = coinCosts.reduce((a,b) => a + b, 0)

    const goldReceived = cart.map(e => e[0])
    const totalGold = goldReceived.reduce((a,b) => a + b, 0)

    const ratio = totalGold / totalCoins

    return { totalGold, totalCoins, ratio }
}

const printCart = cart => {
    const stats = getCartStats(cart)

    console.log(`Total coins spent: ${stats.totalCoins}`)
    console.log(`Total gold received: ${stats.totalGold}`)
    console.log(`Gold / Coin Ratio: ${stats.ratio}`)

    console.log("Items:")
    cart.forEach(e => {
        const gold = e[0]
        const coins = e[1]
        console.log(`Buy ${gold} gold for ${coins} coins`)
    })
}

const getListings = () => {
    let dataset = []
    $(".searchItemList").find("tr.odd,tr.even").each((index, element) => {
        const gold = $($(element).find("span")[0]).text()
        const coins = $($(element).find("span")[1]).text()
        dataset.push([parseInt(gold), parseInt(coins), gold/coins])
    })

    return dataset
}

const bestValueForCoins = (_max, _cart, _listings) => {
    let max = _max
    const cart = _cart || []

    if (max <= 1) {
        return cart
    }

    const listings = _listings || getListings()
    let dataset = listings.slice()

    dataset = dataset.filter(a => a[1] <= max)
    dataset.sort((a,b) => (a[2] < b[2]) ? 1 : -1)

    const next = dataset[0]
    if (next === undefined) {
        return cart
    }

    cart.push(next)
    max = max - next[1]

    return bestValueForCoins(max, cart, listings)
}

const getCartForCoins = coins => printCart(bestValueForCoins(coins))

const findBestCoinValue = () => {
    const values = {}
    for (var i=3; i < 100; i++) {
        const cart = bestValueForCoins(i)

        const coinCosts = cart.map(e => e[1])
        const totalCoins = coinCosts.reduce((a,b) => a + b, 0)

        const goldReceived = cart.map(e => e[0])
        const totalGold = goldReceived.reduce((a,b) => a + b, 0)

        const ratio = totalGold / totalCoins

        values[i] = {"gold": totalGold, "ratio": ratio}
    }

    console.log(values)
}
