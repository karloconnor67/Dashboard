/* add-on script */
// MyAddon functionality
$(function() {
	// Call REST API via the iframe
	// Bridge functionality

	var projHeadRow;
	var projTable;

	var projectBaseUrl = baseUrl + "/browse/";
	var params = getQueryParams(document.location.search);
	var baseUrl = params.xdm_e + params.cp;

	var rootElement = d3.select(".projects");
	var projBody = buildTableAndReturnTbody(rootElement);

	function getQueryParams(qs) {
		qs = qs.split("+").join(" ");

		var params = {}, tokens, re = /[?&]?([^=]+)=([^&]*)/g;

		while (tokens = re.exec(qs)) {
			params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		}

		return params;
	}

	function buildTableAndReturnTbody(hostElement) {
		projTable = hostElement.append('table').classed({
			'project' : true,
			'aui' : true
		});

		projHeadRow = projTable.append("thead").append("tr");

		projHeadRow.append("th").text("Key");
		projHeadRow.append("th").text("To Do");
		projHeadRow.append("th").text("In Progress");

		return projTable.append("tbody");
	}

	// check if header already exists
	function hasColumn(tblSel, content) {
		var ths = document.querySelectorAll(tblSel + ' th');
		return Array.prototype.some.call(ths, function(el) {
			return el.textContent === content;
		});
	}
	;

	// JiraActivity is registered by an external script that was included
	AP.require([ 'request', 'JiraIssues' ], function(request, JiraIssues) {
		request({
			url : '/rest/api/2/search?jql=sprint="Sample Sprint 2"&status="Done"',
			success : function(response) {

				// Convert the string response to JSON
				response = JSON.parse(response);

				// console.log("JiraIssues", response);

				var keysArray = [];

				response.issues.forEach(function(com) {
					keysArray.push(com.key);

				});

				changeLog(keysArray);

			},
			error : function(response) {
				console.log("Error loading API (" + uri + ")");
				console.log(arguments);
			},
			contentType : "application/json"
		});
	});

	function changeLog(keysArray) {

		for (i = 0; i < keysArray.length; i++) {
			var urlAddress = ("/rest/api/2/issue/" + keysArray[i] + "/changelog");

			AP.require([ 'request', 'JiraChangeLog' ], function(request, JiraChangeLog, keysArray) {
				request({

					url : urlAddress,
					success : function(response) {

						// Convert the string response to JSON
						response = JSON.parse(response);

						populateTable(response);

					},
					error : function(response) {
						console.log("Error loading API (" + uri + ")");
						console.log(arguments);
					},
					contentType : "application/json"
				});
			});
		}
	}

	function getStatuses(response) {
		var statuses = [];

		console.log("RESPONSE", response);

		response.values.forEach(function(values) {
			values.items.forEach(function(element) {
				if (element.field == "status") {
					statuses.push(element.fromString);
					statuses.push(element.toString);
				}
			});

		});

		// remove duplicates
		var unique = statuses.filter(function(item, i, ar) {
			return ar.indexOf(item) === i;
		});

		return unique;

	}

	// function updateHeaders(response) {
	// var statuses = getStatuses(response);
	//
	// statuses.forEach(function(element) {
	//
	// projHeadRow.append("th").text(element);
	//
	// });
	//
	// }

	function populateTable(response) {

		var statuses = getStatuses(response);

		var transition = new Object();
		var allTransitions = new Array();

		console.log("CHANGELOG", response);

		var row = projBody.append("tr");
		row.append("td").text(response.self);

		// Loop through TRANSITIONS
		response.values.forEach(function(element) {
			// Loop through ITEMS - each Transition should only have a single
			// Item unless the transition is moved to "DONE"
			element.items.forEach(function(sub_element) {

				if (sub_element.field == "status") {
					
					var fromString = sub_element.fromString;
					var toString = sub_element.toString;

					transition = {FromString:fromString, ToString:toString};
					//console.log("Transition: ", transition.FromString);
					
					allTransitions.push(transition);
					

					
//					switch (sub_element.toString) {
//						case "To Do":
//							// toDo = element.created;
//							// row.append("td").text(toDo);
//														
//							break;
//						case "In Progress":
//
//							break;
//						case "Done":
//
//							break;
//						case Default:
//							row.append("td").text("In Default");
//							break;
//					}
				}
			});

		});
		
		console.log("Transition: ", transition.FromString);
	}

});
