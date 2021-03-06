var dashgoals_data;
var dashgoals_chart;

function bar_chart_goals(widget_name, chart_details)
{
	nv.addGraph(function() {
		var chart = nv.models.multiBarChart()
			.stacked(true)
			.showControls(false)
			.tooltipContent(function(key, y, e, graph) {
				return '@Todo: retrieve content with ajax';
				var perf = parseInt(e) - 100;
				if (perf > 0)
					return '<section class="panel"><header class="panel-heading">' + key + '</header><span class="dash_trend dash_trend_up">+' + perf + '%</span></section>';
				else if (perf < 0)
					return '<section class="panel"><header class="panel-heading">' + key + '</header><span class="dash_trend dash_trend_down">' + perf + '%</span></section>';
				else
					return '<section class="panel"><header class="panel-heading">' + key + '</header><span class="dash_trend dash_trend_right">-</span></section>';
			});

		chart.yAxis.tickFormat(d3.format('%'));

		dashgoals_data = chart_details.data;
		dashgoals_chart = chart;

		d3.select('#dash_goals_chart1 svg')
			.datum(chart_details.data)
			.transition()
			.call(chart);

		$('#dash_goals_chart1 .nv-legendWrap').remove();

		nv.utils.windowResize(chart.update);

		return chart;
	});
}

function selectDashgoalsChart(type)
{
	if (type !== false)
	{
		$.each(dashgoals_data, function(index, value) {
			if (value.key == type + '_real' || value.key == type + '_more' || value.key == type + '_less')
				value.disabled = false;
			else
				value.disabled = true;
		});
	}
	dashgoals_toggleDashConfig();
}

/* 	Refresh dashgoals chart when coming from the config panel
	Called from /js/admin-dashboard.js: toggleDashConfig() */
function dashgoals_toggleDashConfig()
{
	d3.select('#dash_goals_chart1 svg')
		.datum(dashgoals_data)
		.transition()
		.call(dashgoals_chart);
	nv.utils.windowResize(dashgoals_chart.update);
}

/* 	Calculate Sales based on the traffic, average cart value and conversion rate */
function dashgoals_calc_sales()
{
	$('.dashgoals_sales').each(function() {
		var key = $(this).attr('id').substr(16);
		var sales = parseFloat($('#dashgoals_traffic_' + key).val()) * parseFloat($('#dashgoals_avg_cart_value_' + key).val()) * parseFloat($('#dashgoals_conversion_' + key).val()) / 100;
		if (isNaN(sales))
			$(this).text(formatCurrency(0, currency_format, currency_sign, currency_blank));
		else
			$(this).text(formatCurrency(parseInt(sales), currency_format, currency_sign, currency_blank));
	});
}

function dashgoals_changeYear(xward)
{
	var new_year = dashgoals_year;
	if (xward == 'forward')
		new_year = dashgoals_year + 1;
	else if (xward == 'backward')
		new_year = dashgoals_year - 1;

	$.ajax({
		url: dashgoals_ajax_link,
		data: {
			ajax: true,
			action: 'changeconfyear',
			year: new_year
		},
		success : function(result){
			$('#dashgoals_title').text($('#dashgoals_title').text().replace(dashgoals_year, new_year));
			var hide_conf = $('#dashgoals_config').hasClass('hide');
			$('#dashgoals_config').replaceWith(result);
			dashgoals_calc_sales();
			if (!hide_conf)
				$('#dashgoals_config').removeClass('hide');
			$('.dashgoals_config_input').off();
			$('.dashgoals_config_input').keyup(function() { dashgoals_calc_sales(); });
			dashgoals_year = new_year;
			refreshDashboard('dashgoals', false, dashgoals_year);
		}
	});
}

$(document).ready(function() {
	$('.dashgoals_config_input').keyup(function() { dashgoals_calc_sales(); });
	dashgoals_calc_sales();
});
