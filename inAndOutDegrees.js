const data = require('./data/www_harvard_edu.json');
const table = [];
const total = { inDegrees: 0, };
data.map(el => {
    table.push({
        // inDegreeDistribution: el.referrer.length,
        outDegreesDistribution: el.outDegrees.length
    })
    total.inDegrees += el.referrer.length;
    // total.outDegrees += el.outDegrees.length;
    el.outDegrees.map(out => {
        const outUrl = 'https://braendi-dog.online' + out[0] == '/' ? out : '/'+out;
        if(outUrl == el.href) {
            return;
        }
        total.arcs+=1;
    })
})

console.table(table);
console.table(total);