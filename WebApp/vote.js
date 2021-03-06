jQuery(document).ready(function () {

     $.ajax({
			                url: "http://localhost:3001/topic?topicId="+getUrlParameter("topicId"),
			                type: "get",
			                success: function (data) {
			                    var data = JSON.parse(data)
			                	$('#title').val(data["topicTitle"]);
			                	$('#description').val(data["topicDesc"]);
			                	var options = data["options"]
			                	var markup = "<option value='"+options[0]+"'>"+options[0]+"</option>" +
			                					"<option value='"+options[1]+"'>"+options[1]+"</option>" +
			                					"<option value='"+options[2]+"'>"+options[2]+"</option>" +
			                					"<option value='"+options[3]+"'>"+options[3]+"</option>"
			                			$("#options").append(markup);
			                },
			                error: function (response) {
			                    alert("Error While Fetching Topic "+response);
			                }
			            });

    function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function submitVote() {
		$.ajax({
	        url: 'http://localhost:3001/vote',
	        type: 'post',
	        contentType: 'application/json',
	        data: JSON.stringify({
	            optionId: $('#options').find(":selected").text(),
	            topicId: getUrlParameter("topicId"),
	            userId: localStorage.getItem("userid")
	        }),
	        success: function () {
	            alert('Vote submitted Successfully.')
	            window.location = 'ViewMyVotes.html'
	        },
	        error: function (response) {
	            alert('Error in submitting your vote')
	        }
	    });
	}
});
