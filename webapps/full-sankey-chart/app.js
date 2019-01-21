(function() {
    
let dataset = dataiku.getWebAppConfig()['dataset'];
let sampling = {};
let max_links = dataiku.getWebAppConfig()['max_links'] || 12;
let min_weight = dataiku.getWebAppConfig()['min_weight'] || 0;
    
  
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
    
function load() {
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'From');
    data.addColumn('string', 'To');
    data.addColumn('number', 'Weight');
    let pre = allRows
        .sort((a, b) => b[2] - a[2])
        .slice(0, max_links)
    let post = allRows
        .map(r => [r[0], r[1]+' ', r[2]])
        .sort((a, b) => b[2] - a[2])
        .slice(0, max_links)
    rows = pre.concat(post);
    data.addRows(rows);
   
    let chart = new google.visualization.Sankey(document.getElementById('sankey'));
    chart.draw(data);
//     google.visualization.events.addListener(chart, 'select', function() {
//         if (chart.getSelection()[0].name) {
//             loadState(chart.getSelection()[0].name.trim())
//         }
//     });
}
    
})()