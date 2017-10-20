'use strict';
var validator = require('validator');

module.exports = function customValidations(object, cb) {
    var error = {}

    if (object["type"] === "T") {
        if (object.data) {
            if (!object.data.topicId ||!validator.isUUID(object.data.topicId)) {
                error["data.topicId"] = "topicId is invalid";
            }
            if (!object.data.title) {
                error["data.topicTitle"] = "topicTitle is empty";
            }
            if (!object.data.description) {
                error["data.topicDesc"] = "topicDesc is empty";
            }
            if (!object.data.options || !object.data.options instanceof Array) {
                error["data.options"] = "options are empty";
            }
            if(!object.data.startDate){
                error["data.startDate"] = "startDate is empty";
            }
            if(!object.data.endDate){
                error["data.endDate"] = "endDate is empty";
            }
        }else{
            error["data"] = "data is empty";
        }
    } else if (object["type"] === "V") {
        if(object.data){
            if (!object.data.userId || !validator.isUUID(object.data.userId)) {
                error["data.userId"] = "userId is invalid";
            }
            if (!object.data.topicId) {
                error["data.topicId"] = "topicId is empty";
            }
            if (!object.data.optionId) {
                error["data.optionId"] = "optionId is empty";
            }
        }else{
            error["data"] = "data is empty";
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