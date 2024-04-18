const knapsack = {};

(function() {
    this.combiner = function(items, weightfn, valuefn) {
        // approximation guarantees result >= (1-e) * optimal
        const _epsilon = 0.01;
        const _p = _.max(_.map(items,valuefn));
        const _k = _epsilon * _p / items.length;

        const _memo = (() => {
            const _mem = {};
            const _key = function(i, w) {
                return i + '::' + w;
            };

            return {
                get: function(i, w) {
                    return _mem[_key(i,w)];
                },
                put: function(i, w, r) {
                    _mem[_key(i,w)]=r;
                    return r;
                }
            };
        })();

        const _m = (i, w) => {

            i = Math.round(i);
            w = Math.round(w);


            if (i < 0 || w === 0) {
                // empty base case
                return {items: [], totalWeight: 0, totalValue: 0};
            }

            const mm = _memo.get(i,w);
            if (!_.isUndefined(mm)) {
                return mm;
            }

            const item = items[i];
            if (weightfn(item) > w) {
                //item does not fit, try the next item
                return _memo.put(i, w, _m(i-1, w));
            }

            // this item could fit.
            // are we better off excluding it?
            const excluded = _m(i-1, w);

            // or including it?
            const included = _m(i-1, w - weightfn(item));

            if (included.totalValue + Math.floor(valuefn(item)/_k) > excluded.totalValue) {
                // better off including it
                // make a copy of the list
                const i1 = included.items.slice();
                i1.push(item);
                return _memo.put(i, w,
                    {items: i1,
                        totalWeight: included.totalWeight + weightfn(item),
                        totalValue: included.totalValue + Math.floor(valuefn(item)/_k)});
            }

            //better off excluding it
            return _memo.put(i,w, excluded);
        };

        return {
            /* one point */
            one: (maxweight) => {
                const scaled = _m(items.length - 1, maxweight);
                return {
                    items: scaled.items,
                    totalWeight: scaled.totalWeight,
                    totalValue: scaled.totalValue * _k
                };
            },
            /* the entire EF */
            ef: (maxweight, step) => {
                return _.map(_.range(0, maxweight+1, step), (weight) => {
                    const scaled = _m(items.length - 1, weight);
                    return {
                        items: scaled.items,
                        totalWeight: scaled.totalWeight,
                        totalValue: scaled.totalValue * _k
                    };
                });
            }
        };
    };
}).apply(knapsack);

const getListings = () => {
    const dataset = []

    const parent = document.getElementsByClassName("searchItemList")[0]

    parent.querySelectorAll("tr.odd,tr.even").forEach((element) => {
        const spans = element.querySelectorAll("span")

        const value = parseInt(spans[0].textContent)
        const weight = parseInt(spans[1].textContent)

        dataset.push({ value, weight, element })
    })

    return dataset
}

const calculateCart = (maxCoins) => {
    const listings = getListings()
    const getWeight = x => x.weight
    const getValue = x => x.value

    const combiner = knapsack.combiner(listings, getWeight, getValue)
    const cart = combiner.one(maxCoins)

    return cart
}

const hideOtherItems = (except) => {
    const parent = except[0].parentNode

    const children = parent.children
    for (let element of children) {
        if(except.includes(element)) {
            element.style.display = ""
        } else {
            element.style.display = "none"
        }
    }
}

const unhideAll = () => {
    const parent = document.getElementsByClassName("searchItemList")[0]

    parent.querySelectorAll("tr.odd,tr.even").forEach((element) => {
        element.style.display = ""
    })

    document.getElementById("goldFilterInstructions")?.remove()
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const addInstructions = (cart) => {
    document.getElementById("goldFilterInstructions")?.remove()

    let totalCoins = 0
    let totalGold = 0

    cart.items.forEach(item => {
        totalCoins += item.weight
        totalGold += item.value
    })

    const pStyle = "margin-top: 0; margin-bottom: 0.5rem;"
    const goldPerCoin = Math.round(((totalGold / totalCoins) + Number.EPSILON) * 100) / 100

    const highlight = (text, color) => `<span style="color: ${color}; font-weight: 500;">${text}</span>`
    const goldHighlight = (text) => highlight(text, "#f9ad0f")
    const coinHighlight = (text) => highlight(text, "#ff8b17")
    const valueHighlight = (text) => highlight(text, "#6185aa")

    const parent = document.getElementById("goldFilterSection")

    const newElement = document.createElement("div")
    newElement.innerHTML = `
        <div id="goldFilterInstructions" style="margin-top: 1rem; display: flex; flex-direction: column;">
            <p style="${pStyle}">Buying all of the visible listings will give you the most gold for your coins</p>
            <p style="${pStyle}">You will spend ${coinHighlight(numberWithCommas(totalCoins))} coins</p>
            <p style="${pStyle}">You will receive ${goldHighlight(numberWithCommas(totalGold))} gold</p>
            <p style="${pStyle}">(${valueHighlight(goldPerCoin)} gold per coin)</p>
        </div>
    `

    parent.append(newElement)
}

const filterForBest = (maxCoins) => {
    const cart = calculateCart(maxCoins)
    const elements = _.map(cart.items, i => i.element)

    hideOtherItems(elements)
    addInstructions(cart)
}

const getListingSection = () => {
    const listing = document.getElementsByClassName("market-listing horizontal-only jspScrollable")
    return listing[0]
}


const runFilter = () => {
    const input = document.getElementById("goldValueFilter").value

    if (input === "") {
        unhideAll()
        return
    }

    const maxCoins = parseInt(input)

    if (isNaN(maxCoins)) {
        alert("Please enter a valid number.")
        input.val("")
        return
    }

    filterForBest(maxCoins)
}

const onHitEnter = (event) => {
    if (event.key === "Enter") {
        runFilter()
    }
}

const activate = () => {
    document.getElementById("goldFilterSection")?.remove()

    const buttonStyle = "background: none; border: none; color: #c1b575; cursor: pointer;"

    const listings = getListingSection()

    const newElement = document.createElement("div")
    newElement.innerHTML = `
    <div id="goldFilterSection" style="display: flex; flex-direction: column; margin-bottom: 1rem;">
      <div style="display: flex;">
        <input id="goldValueFilter" placeholder="Number of coins to spend"></input>
        <button style="${buttonStyle}" onclick="runFilter()">Filter</button>
      </div>
    </div>
  `
    listings.prepend(newElement)

    document.getElementById("goldValueFilter").addEventListener("keypress", onHitEnter)
}

const handleScriptActivation = () => {
    const element = document.getElementsByClassName("sideBtn active")[0].children[0]

    if (element.textContent === "Gold") activate()
}

let targetObserver

const setUpItemObserver = (targetNode) => {
    if (targetObserver) targetObserver.disconnect()

    targetObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === "attributes" && mutation.attributeName === "class") {
                handleScriptActivation()
            }
        })
    })

    const config = { attributes: true, subtree: true }

    targetObserver.observe(targetNode, config)
}

const setUpParentObserver = () => {
    const parentObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.target.className === "market-menu horizontal-only") {
                setUpItemObserver(mutation.addedNodes[0])
                return
            }
        })
    })

    const config = { childList: true, subtree: true }
    const targetNode = document.getElementById("wmstore")

    parentObserver.observe(targetNode, config)
}

window.onload = setUpParentObserver
