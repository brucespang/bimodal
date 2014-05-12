Array.prototype.random = function() {
		return this[Math.floor(Math.random() * this.length)];
}

function animate() {
		var opts = {
				N: 100,
				e: parseFloat($("#e").slider("value")),
				n_0: parseFloat($("#n_0").slider("value")),
				speed: parseInt($("#speed").slider("value"))
		};

		var radius = 15;

		var n_x = 10;
		var n_y = 10;
		var padding = 20;

		var nodes = []
		for (var i = 0; i < opts.N; i++) {
				var node = {
						name: i,
						x: i % n_x,
						y: Math.floor(i / n_x),
						infected: 0,
				}
				node.cx = 60*node.x + padding
				node.cy = 60*node.y + padding

				nodes.push(node)
		}

		for (var i = 0; i <  opts.n_0; i++) {
				nodes.random().infected = 1
		}

		$('#container').html('')

		var svg = d3.select("#container").append("svg:svg")
				.attr("width", "100%")
				.attr("height", "100%")

		svg.append('svg:defs').append('svg:marker')
				.attr('id', 'end-arrow')
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 6)
				.attr('markerWidth', 3)
				.attr('markerHeight', 3)
				.attr('orient', 'auto')
				.append('svg:path')
				.attr('d', 'M0,-5L10,0L0,5')
				.attr('fill', '#000');

		svg.append('svg:defs').append('svg:marker')
				.attr('id', 'end-arrow-broken')
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 6)
				.attr('markerWidth', 3)
				.attr('markerHeight', 3)
				.attr('orient', 'auto')
				.append('svg:path')
				.attr('d', 'M0,-5L10,0L0,5')
				.attr('fill', '#f00');

		var circle = svg.selectAll("circle")
				.data(nodes)
				.enter().append("svg:circle")
				.attr("r", radius)
				.attr("cx", function(d) { return d.cx })
				.attr("cy", function(d) { return d.cy })
				.attr("class", "node")
				.classed("infected", infected)

		var round = 1;
		var last = new Date();
		var delay = opts.speed;

		function tick() {
				svg.selectAll("line").remove()

				// for infected nodes, do gossip
				nodes.map(function(node) {
						if (node.infected) {
								var target;
								do {
										target = nodes.random()
								} while (target == node)
								if (0 < node.infected && node.infected < round) {
										if (target.infected != 0) return;

										var line = svg.append("line")
												.attr("x1", node.cx)
												.attr("y1", node.cy)
												.attr("x2", target.cx)
												.attr("y2", target.cy)
												.attr("stroke-width", 5)

										var lost = Math.random() < opts.e;
										if (lost) {
												line.style("marker-end", "url(#end-arrow-broken)")
														.attr("stroke", "#f00")
										} else {
												target.infected = round;
												line.style("marker-end", "url(#end-arrow)")
														.attr("stroke", "#000")
										}
								}
						}
				})
				circle.classed("infected", infected)
				circle.classed("new", function(d) { return round != 1 && d.infected == round })
				round += 1;

				$('.round span').text(round)

				var num_infected = nodes.filter(infected).length;
				$('.num span').text(num_infected)

				if(num_infected == nodes.length) {
						console.log("done in " + round + " rounds")
						clearInterval(timer)
				}
		}

		var running = true;
		var timer = setInterval(tick, opts.speed);
		tick()

		$('body').on('keypress', function(e) {
				if (e.keyCode != 32) {
						return;
				}

				if (running) {
						clearInterval(timer)
						running = false;
				} else {
						tick()
						setInterval(tick, opts.speed)
						running = true;
				}
		})

		function infected(d) {
				return 0 < d.infected
		}
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

$('.start').on('click', animate);
