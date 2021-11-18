// TODO:
var corona = d3.dsv(';', '../data/COVID-19_aantallen_gemeente_per_dag.csv', 
    (data) => {
        console.table(data);
    }
);