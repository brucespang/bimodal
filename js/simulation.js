Array.prototype.random = function() {
		return this[Math.floor(Math.random() * this.length)];
}


function Simulation() {
    this.N = 100;
    var radius = 15;

		var n_x = 10;
		var n_y = 10;
		var padding = 20;

		this.nodes = []
		for (var i = 0; i < this.N; i++) {
				var node = {
						name: i,
						x: i % n_x,
						y: Math.floor(i / n_x),
						infected: 0,
				}
				node.cx = 60*node.x + padding
				node.cy = 60*node.y + padding

				this.nodes.push(node)
		}

    $('#container').html('')

		this.svg = d3.select("#container").append("svg:svg")
				.attr("width", "100%")
				.attr("height", "100%")

		this.svg.append('svg:defs').append('svg:marker')
				.attr('id', 'end-arrow')
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 6)
				.attr('markerWidth', 3)
				.attr('markerHeight', 3)
				.attr('orient', 'auto')
				.append('svg:path')
				.attr('d', 'M0,-5L10,0L0,5')
				.attr('fill', '#000');

		this.svg.append('svg:defs').append('svg:marker')
				.attr('id', 'end-arrow-broken')
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 6)
				.attr('markerWidth', 3)
				.attr('markerHeight', 3)
				.attr('orient', 'auto')
				.append('svg:path')
				.attr('d', 'M0,-5L10,0L0,5')
				.attr('fill', '#f00');

		this.circle = this.svg.selectAll("circle")
				.data(this.nodes)
				.enter().append("svg:circle")
				.attr("r", radius)
				.attr("cx", function(d) { return d.cx })
				.attr("cy", function(d) { return d.cy })
				.attr("class", "node")
				.classed("infected", this.infected)
}

Simulation.prototype.infected = function(d) {
		return 0 < d.infected
}

Simulation.prototype.tick = function() {
    var self = this;

		this.svg.selectAll("line").remove()

		// for infected nodes, do gossip
		this.nodes.map(function(node) {
				if (0 < node.infected && node.infected < self.round) {
						var target;
						do {
								target = self.nodes.random()
						} while (target == node)

						if (target.infected == 0) {
						    var line = self.svg.append("line")
								    .attr("x1", node.cx)
								    .attr("y1", node.cy)
								    .attr("x2", target.cx)
								    .attr("y2", target.cy)
								    .attr("stroke-width", 4)

						    var lost = Math.random() < self.e;
						    if (lost) {
								    line.style("marker-end", "url(#end-arrow-broken)")
										    .attr("stroke", "#f00")
						    } else {
								    target.infected = self.round;
								    line.style("marker-end", "url(#end-arrow)")
										    .attr("stroke", "#000")
						    }
            }
				}
		})
		this.circle.classed("infected", this.infected)
		this.circle.classed("new", function(d) {
        return self.round != 1 && d.infected == self.round
    })
		this.round += 1;

		$('.round span').text(this.round)

		var num_infected = this.nodes.filter(function(d) { return self.infected(d) }).length;
		$('.num span').text(num_infected)

		if(num_infected == this.nodes.length) {
				console.log("done in " + self.round + " rounds")
        this.stop()
		}
}

Simulation.prototype.start = function() {
		this.e = parseFloat($("#e").slider("value"))
		this.n_0 = parseFloat($("#n_0").slider("value"))
		this.speed = parseInt($("#speed").slider("value"))

    for (var i = 0; i < this.N; i++) {
				this.nodes.random().infected = 0
		}

    for (var i = 0; i < this.n_0; i++) {
				this.nodes.random().infected = 1
		}

		this.round = 1;
    this.resume()
}

Simulation.prototype.stop = function() {
    clearInterval(this.timer)
    this.running = false
}

Simulation.prototype.resume = function() {
    this.tick()
		this.running = true;

    var self = this;
		this.timer = setInterval(function() { self.tick() }, this.speed)
}

$('#speed').slider({
		slide: function(e, ui){
				$("#speed_val").text(ui.value)
		},
		value: 500,
		min: 100,
		max: 2000,
		step: 100
});
$("#speed_val").text($('#speed').slider("value"))

$('#e').slider({
		slide: function(e, ui){
				$("#e_val").text(ui.value)
		},
		value: 0.5,
		min: 0,
		max: 0.99,
		step: 0.01
});
$("#e_val").text($('#e').slider("value"))

$('#n_0').slider({
		slide: function(e, ui){
				$("#n_0_val").text(ui.value)
		},
		value: 1,
		min: 1,
		max: 100,
});
$("#n_0_val").text($('#n_0').slider("value"))

var sim = new Simulation()
$('body').on('keypress', function(e) {
		if (e.keyCode != 32) {
				return;
		}

		if (sim.running) {
        sim.stop()
		} else {
        sim.resume()
		}
})
$('.start').on('click', function () {
    sim.start()
});
