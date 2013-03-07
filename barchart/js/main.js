//indexes
var TYPE = 0;
var URL = 1;
var ATTENTION = 1;
var MEDITATION = 2;
var DELTA = 0;
var THETA = 1;
var LOWALPHA = 2;
var HIGHALPHA = 3;
var LOWBETA = 4;
var HIGHBETA = 5;
var LOWGAMMA = 6;
var HIGHGAMMA = 7;

var TYPE_URL = "1";
var TYPE_DATA = "2";
var TYPE_ACTION = "3";

var HOFCHART = 200;

var Main = {
    start: function() {
        Main.container = $("#main-container");
        Main.load("../resources/brainwave.log");
    },

    hasZeroField: function(values, startIndex) {
        for (var i = startIndex, n = values.length; i < n; i++) {
            var value = parseInt(values[i]);
            if (value == 0) {
                return true;
            }
        }
        return false;
    },
    
    load: function(url) {
        $.get(url, function(data){
            var lines = data.split("\n");
            //finds min and max data -----------------------
            var EDGES = [];
            for (var i = 0, n = HIGHGAMMA-DELTA+1; i < n; i++) {
                EDGES.push({max:-Number.MAX_VALUE, min:Number.MAX_VALUE});
            }
            
            /*
            for (var i = 0, n = lines.length; i < n; i++) {
                var line = lines[i];
                if (line.length == 0) {
                    continue;
                }
                if (line.charAt(0) != TYPE_DATA) {
                    continue;
                }
                var elements = line.split(",");
                if (Main.hasZeroField(elements, 3) == true) {
                    continue;
                }
                for (var j = 0, m = EDGES.length; j < m; j++) {
                    var value = parseInt(elements[j+3]);
                    var edge = EDGES[j];
                    edge.max = Math.max(edge.max, value);
                    edge.min = Math.min(edge.min, value);
                }
            }
            var max = -Number.MAX_VALUE;
            var min = Number.MAX_VALUE;
            for (var j = 0, m = EDGES.length; j < m; j++) {
                var edge = EDGES[j];
                max = Math.max(edge.max, max);
                min = Math.min(edge.min, min);
            }
            for (var j = 0, m = EDGES.length; j < m; j++) {
                var edge = EDGES[j];
                edge.hrate = HOFCHART / (edge.max - edge.min);
//                console.log(edge.max+" "+edge.min+" "+edge.hrate);
            }
            */
            
            //make averages ---------------------------------
            var AVERAGES = {};

            for (var i = 0, n = lines.length; i < n; i++) {
                var line = lines[i];
                if (line.length == 0) {
                    continue;
                }
                var sign = line.charAt(0);
                if (sign == TYPE_ACTION) {
                    continue;
                }
                var elements = line.split(",");
                if (sign == TYPE_URL) {
                    var url  = elements[URL];
                    if (!AVERAGES[url]) {
                        var zeroarray = [];
                        for (var j = 0, m = EDGES.length; j < m; j++) {
                            zeroarray.push(0);
                        }
                        zeroarray.push(0);//for counting
                        AVERAGES[url] = zeroarray;
                    }
                    continue;
                }
                if (Main.hasZeroField(elements, 3) == true) {
                    continue;
                }
                for (var j = 0, m = EDGES.length; j < m; j++) {
                    var value = parseInt(elements[j+3]);
                    AVERAGES[url][j] += value;
                }
                AVERAGES[url][EDGES.length] += 1;
            }
            for (url in AVERAGES) {
                var values = AVERAGES[url];
                var count = values[values.length-1];
                for (var j = 0, m = values.length-1; j < m; j++) {
                    values[j] /= count;
                    var edge = EDGES[j];
                    edge.max = Math.max(edge.max, values[j]);
                    edge.min = Math.min(edge.min, values[j]);
                }
            }

            for (var j = 0, m = EDGES.length; j < m; j++) {
                var edge = EDGES[j];
                edge.hrate = HOFCHART / (edge.max - edge.min);
            }

            for (url in AVERAGES) {
                var container = $(document.createElement("div"));
                container.addClass("chart-container");

                var title = $(document.createElement("div"));
                title.addClass("title");
                title.html("<a href='"+url+"'>"+url+"</a>");
                
                var chart = $(document.createElement("div"));
                chart.addClass("chart");
                
                var values = AVERAGES[url];
//                var hrate = HOFCHART/(max - min);
                for (var i = 0, n = values.length-1; i < n; i++) {
                    var element = $(document.createElement("div"));
                    element.addClass("element");
                    var edge = EDGES[i];
                    var height = (values[i]-edge.min) * edge.hrate;
                    element.css({"height":height, "top":(HOFCHART-height)+"px"});
                    
                    chart.append(element);
                }
                container.append(chart);
                container.append(title);

                Main.container.append(container);
            }
        });
    }
}

$(document).ready(function() {
    Main.start();
});
