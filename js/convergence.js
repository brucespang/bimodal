$(function () {
    var chart = new Highcharts.Chart({
				chart: {
						renderTo: 'container',
				},
				title: {
						text: 'Expected percent of infected processes after n rounds',
						x: -20
				},
				xAxis: {
						type: 'linear',
						title: {
								text: "# of rounds"
						}
				},
				yAxis: {
						title: {
								text: '% of processes'
						},
						min: 0,
						max: 1
				},
				series: [
						{
								name: 'lower bound',
								data: []
						},
						{
								name: 'upper bound',
								data: []
						}
				]
		});

		function generate_chart() {
				// N = # of processes
				var N = 100;
				// R = # of rounds
				var R = parseInt($("#R").slider("value"));
				$("#R_val").text(R)
				// B = P(gossip to another process)
				var B = 1.0/N;
				// e = P(message failure)
				var e = parseFloat($("#e").slider("value"));
				$("#e_val").text(e)
				// lower bound on probability of message from process i to j
				// (P(gossip to another process w/ maximal message loss))
				var p_lo = B*(1-e);
				var q_lo = 1-p_lo;
				// upper bound on probability of message from process i to j
				// (P(gossip to another process w/ 0 message loss))
				var p_hi = B;
				var q_hi = 1-p_hi;

				var p_0 = parseFloat($("#p_0").slider("value"));
				$("#p_0_val").text(p_0)
				var s_0 = p_0*N;

				// # of infectious processes in round i
				var s_lo = [s_0];
				// # of processes in round t that have not received a gossip message yet
				var r_lo = [N-s_lo[0]];
				// % of infectious processes in round i
				var p_lo = [s_lo[0]/N];

				// # of infectious processes in round i
				var s_hi = [s_0];
				// # of processes in round t that have not received a gossip message yet
				var r_hi = [N-s_hi[0]];
				// % of infectious processes in round i
				var p_hi = [s_hi[0]/N];

				for (var t = 0; t <= R; t++) {
						// k = E[# of newly infected processes]
						var k_lo = r_lo[t]*(1-Math.pow(q_lo, s_lo[t]))
						s_lo[t+1] = s_lo[t] + k_lo;
						r_lo[t+1] = r_lo[t] - k_lo;
						p_lo[t+1] = s_lo[t+1]/N;

						var k_hi = r_hi[t]*(1-Math.pow(q_hi, s_hi[t]))
						s_hi[t+1] = s_hi[t] + k_hi;
						r_hi[t+1] = r_hi[t] - k_hi;
						p_hi[t+1] = s_hi[t+1]/N;
				}

				console.log(chart)
				chart.series[0].setData(p_lo, true)
				chart.series[1].setData(p_hi, true)
		}


		$('#R').slider({
				slide: generate_chart,
				value: 25,
				min: 8,
				max: 3000
		});
		$('#e').slider({
				slide: generate_chart,
				value: 0.5,
				min: 0,
				max: 0.99,
				step: 0.01
		});
		$('#p_0').slider({
				slide: generate_chart,
				value: 0.01,
				min: 0.01,
				max: 1,
				step: 0.01
		});
		generate_chart()
});
