$(function()
{
	"use strict";

	// Get parameters from query string
	// and stick them in an object
	function getQueryParams(qs)
	{
		qs = qs.split("+").join(" ");

		var params =
		{}, tokens, re = /[?&]?([^=]+)=([^&]*)/g;

		while (tokens = re.exec(qs))
		{
			params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		}

		return params;
	}

	function diff_minutes(dt2, dt1)
	{

		var diff = (dt2.getTime() - dt1.getTime()) / 1000;
		diff /= 60;
		return Math.abs(Math.round(diff));
	}

	AP.define('JiraChangeLog',
	{
		buildProjectTable : function(projects, selector)
		{
			var params = getQueryParams(document.location.search);
			var baseUrl = params.xdm_e + params.cp;

			function buildTableAndReturnTbody(hostElement)
			{
				var projTable = hostElement.append('table').classed(
				{
					'project' : true,
					'aui' : true
				});

				// table > thead > tr, as needed below
				var projHeadRow = projTable.append("thead").append("tr");

				projHeadRow.append("th").text("Key");
				projHeadRow.append("th").text("To Do");
				projHeadRow.append("th").text("In Progress");

				return projTable.append("tbody");
			}

			var projectBaseUrl = baseUrl + "/browse/";

			var rootElement = d3.select(selector);
			var projBody = buildTableAndReturnTbody(rootElement);

			console.log("SELECTOR", selector);

			var previousState = 0;
			var previousDate = 0;
			var totalInProgressTime = 0;
			var totalToDoTime = 0;

			console.log("PROJECTS", projects);

			// 1st LOOP
			projects.forEach(function(com)
			{
				var row = projBody.append("tr");
				row.append("td").text(com.self);

				// 2nd LOOP
				com.values.forEach(function(val)
				{
					var createdDate = new Date(val.created);

					var toState = val.items[0].toString;

					switch (previousState)
					{
						case "In Progress":
							totalInProgressTime = totalInProgressTime + diff_minutes(createdDate, previousDate);
							break;
						case "To Do":
							totalToDoTime = totalToDoTime + diff_minutes(createdDate, previousDate);

							break;
					}
					previousState = toState;
					previousDate = createdDate;

				});

				// row.append("td").text(Math.abs(Math.round(totalToDoTime /
				// 60)) + " hrs");
				// row.append("td").text(Math.abs(Math.round(totalInProgressTime
				// / 60)) + " hrs");
				row.append("td").text(Math.abs(Math.round(totalToDoTime)) + " mins");
				row.append("td").text(Math.abs(Math.round(totalInProgressTime)) + " mins");

			});

		}
	});

});