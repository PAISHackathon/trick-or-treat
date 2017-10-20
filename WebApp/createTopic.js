'use strict';

function submitTopic() {
  var options = [];
  options[0] = $('#opt1').val();
  options[1] = $('#opt2').val();
  options[2] = $('#opt3').val();
  options[3] = $('#opt4').val();
  $.ajax({
        url: 'http://localhost:3001/topic',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
            topicTitle: $('#topicTitle').val(),
            topicDesc: $('#topicDesc').val(),
            startDate: $('#startDate').val(),
            endDate: $('#endDate').val(),
            options: options,
            userId: '0xjhdsakdhaskjdasjdhsajiodjasld'
        }),
        dataType: 'json',
        success: function (data) {
            alert('Topic Created Successfully.')
            window.location = 'SelectTopic.html'
        },
        error: function (response) {
            alert('Error in creating new Topic')
        }
    });
}
