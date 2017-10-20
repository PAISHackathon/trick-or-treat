class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
    }
}

var blockchain = [];

class TopicDataBlock {
    constructor(topicId, topicTitle, topicDesc, startDate, endDate, options) {
        this.type = "T";
        this.topicId = topicId;
        this.topicTitle = topicTitle;
        this.topicDesc = topicDesc;
        this.startDate = startDate;
        this.endDate = endDate;
        this.options = options;
    }
}

class VoteDataBlock {
    constructor(userId, topicId, optionId) {
        this.type = "V";
        this.userId = userId;
        this.topicId = topicId;
        this.optionId = optionId;
    }
}

var addVote = (blockData) => {
    var userId = blockData.userId;
    var topicId = blockData.topicId;
    var optionId = blockData.optionId;

    var topicBlock = null;
    var status = true;
    blockchain.forEach((block) => {
        //console.log(block);
        if(block.data.type == "V") {
            if(block.data.userId == userId) {
                status = false;
            }
        } else if(block && block.data && block.data.type == "T" && block.data.topicId == topicId) {
            topicBlock = block.data;
            if (block.data.options[optionId] == undefined) {
                status = false;
            }
        }
    });

    if (status) {
        var vdb = new VoteDataBlock(userId, topicId, optionId);
        //console.log(vdb);
        return topicBlock == null ? null : vdb;
    }
};

var addTopic = (blockData) => {
    var topicId = blockData.topicId;
    var topicTitle = blockData.topicTitle;
    var topicDesc = blockData.topicDesc;
    var startDate = blockData.startDate;
    var endDate = blockData.endDate;
    var options = blockData.options;

    var status = true;
    blockchain.forEach((block) => {
        if(block && block.data) {
            if(block.data.type == "T" && block.data.topicId == topicId) {
                status = false;
            }
        }
    });

    if (status) {
        var tdb = new TopicDataBlock(topicId, topicTitle, topicDesc, startDate, endDate, options);
        //console.log(tdb);
        return tdb;
    }
}

/// Testing code
//var tdb = new TopicDataBlock("topic1", "topictitle1", "topic desc", "2017-10", "2017-10", {1:"A", 2:"B"});
//blockchain.push(new Block(0, "0", 1465154705, tdb, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7"));

var test_data = {
    topicId : "topic1",
    topicTitle : "topic1 title",
    topicDesc : "topic1 desc",
    startDate : "startdate",
    endDate : "endDate",
    options : {1:"A", 2:"B"}
}
var tdb = addTopic(test_data);
//console.log(tdb);
var b1 = new Block(0, "0", 1465154705, tdb, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
if (tdb) {
    blockchain.push(b1);
}

var tdb2 = addTopic(test_data);
//console.log(tdb2);
var b2 = new Block(1, "0", 1465154705, tdb2, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
if (tdb2) {
    blockchain.push(b2);
}

var bd = {
    userId : "aaa",
    topicId : "topic1",
    optionId : "2"
}
var v1 = addVote(bd)
//console.log(v1);
if(v1) {
    blockchain.push(new Block(0, "0", 1465154705, v1, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7"));
}

var v2 = addVote(bd)
console.log(v2);
if(v2) {
    blockchain.push(new Block(0, "0", 1465154705, v2, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7"));
}

//console.log(blockchain);
