'use strict';

function submitTopic() {
  var options = [];
  options[0] = $('#opt1').html();
  options[1] = $('#opt2').html();
  options[2] = $('#opt3').html();
  options[3] = $('#opt4').html()
  $.ajax({
        url: 'http://localhost:3001/topic',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
            topicTitle: $('#topicTitle').html(),
            topicDesc: $('#topicDesc').html(),
            startDate: $('#startDate').html(),
            endDate: $('#endDate').html(),
            options: options,
            userId: '0xjhdsakdhaskjdasjdhsajiodjasld'
        }),
        dataType: 'json',
        success: function (data) {
            alert('Topic Created Successfully.')
        },
        error: function (response) {
            alert('Error in creating new Topic')
        }
    });
}
