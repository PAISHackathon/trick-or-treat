class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
    }
}

var getGenesisBlock = () => {
    return new Block(0, "0", 1465154705, "my genesis block!!", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
};

var blockchain = [getGenesisBlock()];

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
    blockchain.forEach((block) => {
        if(block.data.type == "V") {
            if(block.data.userId == userId) {
                return false;
            }
        } else if(block.data.type == "T" && block.data.topicId == topicId) {
            topicBlock = block;
            if (topicBlock.options[optionId] == undefined) {
                return false;
            }
        }
    });

    return topicBlock == null ? null : new VoteDataBlock(userId, topicId, optionId);
};

var addTopic = (blockData) => {
    return
}

var bd = {
    userId : "aaa",
    topicId : "bbb",
    optionId : "ccc"
}


console.log(doVote(bd));