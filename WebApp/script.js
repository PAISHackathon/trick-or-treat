jQuery(document).ready(function () {

     $.ajax({
			                url: "localhost:8080/topic",
			                type: "get",
			                success: function (data) {
			                	data.forEach(function (item) {
			                		var markup = "<tr onClick='voteFor("+data+")'><td>"+ data["title"] +"</td><td>"+ data["description"] + "</td><td>"+ data["startDate"] + "</td><td>"+ data["endDate"] + "</td><td>"+ data["userId"] + "</td></tr>";
            						$("#topicList").append(markup);
			                	});
			                },
			                error: function (response) {
			                    alert("Error While Fetching Topics "+response);
			                }
			            });

});


function voteFor(data){
	window.location  = "Vote.html?topicId="+data["topicId"];
}