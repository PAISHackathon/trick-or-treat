'use strict';
var validator = require('validator');

module.exports = function customValidations(object, cb) {
    var error = {}

    if (object["type"] === "T") {
            if (!object.topicTitle) {
                error["topicTitle"] = "topicTitle is empty";
            }
            if (!object.topicDesc) {
                error["topicDesc"] = "topicDesc is empty";
            }
            if (!object.options || !object.options instanceof Array) {
                error["options"] = "options are empty";
            }
            if(!object.startDate){
                error["startDate"] = "startDate is empty";
            }
            if(!object.endDate){
                error["endDate"] = "endDate is empty";
            }
    } else if (object["type"] === "V") {
            if (!object.userId || !validator.isUUID(object.userId)) {
                error["userId"] = "userId is invalid";
            }
            if (!object.topicId || !validator.isUUID(object.topicId)) {
                error["topicId"] = "topicId is empty";
            }
            if (!object.optionId) {
                error["optionId"] = "optionId is empty";
            }
    } else {
        return cb("unsupported object");
    }

    if(JSON.stringify(error) != '{}'){
        cb(error);
    }else{
        cb(null, "valid");
    }

}