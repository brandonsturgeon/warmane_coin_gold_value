fetch('https://cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min.js')
  .then(response => response.text())
  .then(text => eval(text))

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
  $(".searchItemList").find("tr.odd,tr.even").each((_, element) => {
    const ele = $(element)
    const spans = ele.find("span")

    const value = parseInt($(spans[0]).text())
    const weight = parseInt($(spans[1]).text())

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
  const parent = $(except[0]).parent()

  $(parent).children().each((_, element) => {
    if(except.includes(element)) {
      $(element).css("display", "")
    } else {
      $(element).css("display", "none")
    }
  })
}

const filterForBest = (maxCoins) => {
  const cart = calculateCart(maxCoins)
  const elements = _.map(cart.items, i => i.element)
  hideOtherItems(elements)
}

const getListingSection = () => {
  const listing = $(".market-listing.horizontal-only.jspScrollable")
  return listing[0]
}


const runFilter = () => {
  const input = $("#goldValueFilter").val()
  const maxCoins = parseInt(input)

  if (isNaN(maxCoins)) {
    alert("Please enter a valid number.")
    return
  }

  filterForBest(maxCoins)
}

const activate = () => {
  $("#goldFilterSection").remove()

  const listings = getListingSection()
  $(listings).prepend(`
    <div id="goldFilterSection">
      <input id="goldValueFilter" placeholder="Number of coins to spend"></input>
      <button onclick="runFilter()">Filter</button>
    </div>
  `)
}

const handleScriptActivation = () => {
  const targetElement = $($($(".sideBtn.active")[0]).children()[0]);

  if (targetElement.text() === "Gold") {
    console.log("Activating script.");
    activate()
  }
}

const setUpObserver = () => {
  console.log("Creating observer.")
  const targetObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      console.log("Mutation detected.")

      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        handleScriptActivation()
      }
    })
  })

  const config = { attributes: true, childList: true, subtree: true, characterData: false }
  const targetNode = $(".marketplace-left")[0]

  console.log("Setting up observer.")
  targetObserver.observe(targetNode, config)
}

setUpObserver()
