let allRows;

function draw() {
    const cfg = dataiku.getWebAppConfig();
//     const max_links = cfg['max_links'] || 12;
    const min_weight = cfg['min_weight'] || 0;
    
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'From');
    data.addColumn('string', 'To');
    data.addColumn('number', 'Weight');
    let rows = allRows
        .filter(r => r[2] > min_weight)
        .map(r => [r[0], r[1], r[2]]);
    data.addRows(rows);
    let chart = new google.visualization.Sankey(document.getElementById('sankey'));
    chart.draw(data, {});
}
    
initSankey( (data) => {
    allRows = data;
    draw(); 
});