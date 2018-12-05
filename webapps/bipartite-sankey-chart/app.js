(function() {
    
let dataset = dataiku.getWebAppConfig()['dataset'];
let sampling = {};
let max_links = dataiku.getWebAppConfig()['max_links'] || 12;
let min_weight = dataiku.getWebAppConfig()['min_weight'] || 0;

let allRows;
let dataReady, chartReady;

function main() {
    try {
        dataiku.checkWebAppParameters();
    } catch (e) {
        alert(e.message + ' Go to settings tab');
        return;
    }
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
}

function start() {
    
    if (!chartReady || !dataReady) {
        return;
    }
    draw();
}

function draw() {
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'From');
    data.addColumn('string', 'To');
    data.addColumn('number', 'Weight');
    let rows = allRows
        .filter(r => r[2] > min_weight)
        .map(r => [r[0], r[1]+' ', r[2]])
        .sort((a, b) => b[2] - a[2])
        .slice(0, max_links)
    data.addRows(rows);
    let chart = new google.visualization.Sankey(document.getElementById('sankey'));
    chart.draw(data, {});
}
    
main();
    
})();