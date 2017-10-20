jQuery(document).ready(function () {

     $.ajax({
			                url: "http://localhost:3001/topic",
			                type: "get",
			                success: function (data) {
			                    var datato = JSON.parse(data)
			                	datato.forEach(function (item) {
									var votes = []
									item.options.forEach(function (option){
										votes[item.options.indexOf(option)] = option + " : "+ item.optionVoteCount[item.options.indexOf(option)]
									})
			                	    var markup = "<tr id="+item["topicId"]+" onClick='javascript:voteFor(this)'><td>"+ item["topicTitle"] +"</td><td>"+ item["topicDesc"] + "</td><td>"+ item["startDate"] + "</td><td>"+ item["endDate"] + "</td><td>"+ item["userId"] + "</td><td>"+ votes + "</td></tr>";
            						$("#topicList").append(markup);
			                	});
			                },
			                error: function (response) {
			                    alert("Error While Fetching Topics "+response);
			                }
			            });

});


function voteFor(x){

	window.location  = "Vote.html?topicId=" + x.id;
}
