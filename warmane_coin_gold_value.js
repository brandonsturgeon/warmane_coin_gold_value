const getCartStats = cart => {
    const coinCosts = cart.map(e => e.coins)
    const totalCoins = coinCosts.reduce((a,b) => a + b, 0)

    const goldReceived = cart.map(e => e.gold)
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
        const gold = e.gold
        const coins = e.coins
        console.log(`Buy ${gold} gold for ${coins} coins`)
    })
}

const getListings = () => {
    let dataset = []
    $(".searchItemList").find("tr.odd,tr.even").each((index, element) => {
        const gold = parseInt($($(element).find("span")[0]).text())
        const coins = parseInt($($(element).find("span")[1]).text())
        const ratio = gold / coins

        dataset.push({ gold, coins, ratio })
    })

    dataset.sort((a,b) => (a.ratio < b.ratio) ? 1 : -1)

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

    dataset = dataset.filter(listing => listing.coins <= max && !cart.includes(a))

    const next = dataset[0]
    if (next === undefined) {
        return cart
    }

    cart.push(next)
    max = max - next.coins

    return bestValueForCoins(max, cart, listings)
}

const getCartForCoins = coins => printCart(bestValueForCoins(coins))

const findBestCoinValue = () => {
    const values = {}
    for (var i=3; i < 100; i++) {
        const cart = bestValueForCoins(i)

        const coinCosts = cart.map(e => e.coins)
        const totalCoins = coinCosts.reduce((a,b) => a + b, 0)

        const goldReceived = cart.map(e => e.gold)
        const totalGold = goldReceived.reduce((a,b) => a + b, 0)

        const ratio = totalGold / totalCoins

        values[i] = {"gold": totalGold, "ratio": ratio}
    }

    console.log(values)
}
