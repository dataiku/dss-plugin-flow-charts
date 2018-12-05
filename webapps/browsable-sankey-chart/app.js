(function() {
    
let dataset = getWebAppConfig()['dataset'];
let sampling = {};
let max_links = getWebAppConfig()['max_links'] || 12;
let min_weight = getWebAppConfig()['min_weight'] || 0;
    
  
let allRows;
let dataReady, chartReady;
google.charts.load('current', {'packages':['sankey']});
google.charts.setOnLoadCallback(function() {
    chartReady = true;
    start();
});
dataiku.fetch(dataset, sampling, function(dataFrame) {
    allRows = dataFrame.mapRecords(r => [r.from, r.to, +r.weight]).filter(r => r[2] > min_weight);
    dataReady = true;
    start()
});
function start() {
    if (!chartReady || !dataReady) {
        return;
    }
    loadState(getMostCommonSource());
}

function getMostCommonSource() {
    let counts = {}
    allRows.forEach(r => {
        counts[r[0]] = (counts[r[0]]||0) + 1;
    });
    let reducer = (x, curr) => counts[x] > counts[curr] ? x : curr;
    return Object.keys(counts).reduce(reducer, -Infinity)
}
    
function loadState(stateName) {
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'From');
    data.addColumn('string', 'To');
    data.addColumn('number', 'Weight');
    let pre = allRows
        .filter(r => r[1] == stateName && r[0] != stateName)
        .sort((a, b) => b[2] - a[2])
        .slice(0, max_links)
    let post = allRows
        .filter(r => r[0] == stateName && r[1] != stateName)
        .map(r => [r[0], r[1]+' ', r[2]])
        .sort((a, b) => b[2] - a[2])
        .slice(0, max_links)
    rows = pre.concat(post);
    data.addRows(rows);
    let options = {
        sankey: {
            node: {
                interactivity: true
            }
        }
    };
    let chart = new google.visualization.Sankey(document.getElementById('sankey'));
    chart.draw(data, options);
    google.visualization.events.addListener(chart, 'select', function() {
        if (chart.getSelection()[0].name) {
            loadState(chart.getSelection()[0].name.trim())
        }
    });
}
    
})()