'use strict';
var CryptoJS = require("crypto-js");
var express = require("express");
var bodyParser = require('body-parser');
var WebSocket = require("ws");
var customValidations = require("./customValidations");
var uuidv1 = require('uuid/v1');

var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
    }
}

class TopicDataBlock {
    constructor(topicId, topicTitle, topicDesc, startDate, endDate, options, userId) {
        this.type = "T";
        this.topicId = topicId;
        this.topicTitle = topicTitle;
        this.topicDesc = topicDesc;
        this.startDate = startDate;
        this.endDate = endDate;
        this.options = options;
        this.userId = userId;
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

var sockets = [];
var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

var getGenesisBlock = () => {
    return new Block(0, "0", 1465154705, "my genesis block!!", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
};

var blockchain = [getGenesisBlock()];

// var voteBlockData = {
//           type: "V",
//           data: {
//               userId: {public key},
//               topicId: 1,
//               optionId: 1
//           }
//       }
//
//       var topicBlockDate = {
//                 type: "T",
//                 data:{
//                     topicId: 1,
//                     topicTitle: "" (not blank),
//                     topicDesc: "" (not blank),
//                     startDate: timestamp (long),
//                     endDate: timestamp (long),
//                     options: {
//                         id: "" (n number of options - atleast 1 option)
//                     }
//                 }
//             }
//
//       var block = {
//         index = index;
//         previousHash = previousHash.toString();
//         timestamp = timestamp;
//         data = voteBlockData or topicBlockDate;
//         hash = hash.toString();
//       }

var initHttpServer = () => {
    var app = express();

    // Add headers
    app.use(function (req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', false);

        // Pass to next layer of middleware
        next();
    });

    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain)));
    // app.post('/mineBlock', (req, res) => {
    //     var newBlock = generateNextBlock(req.body.data);
    //     addBlock(newBlock);
    //     broadcast(responseLatestMsg());
    //     console.log('block added: ' + JSON.stringify(newBlock));
    //     res.send();
    // });
    // This is the base API to be referred for other apis
    // add topic
    app.post('/topic', (req, res) => {
        req.body.type = 'T';
        customValidations(req.body, function (err, response) {
            if (err) {
                res.status("400").send(err)
            } else {
                //            	var topicDataBlock = new TopicDataBlock(
                //                		uuidv1(),
                //    	    			req.body.topicTitle,
                //    	    			req.body.topicDesc,
                //    	    			req.body.startDate,
                //    	    			req.body.endDate,
                //    	    			req.body.options,
                //    	    			req.body.userId
                //                	);
                var topicDataBlock = addTopic(req.body);
                if (topicDataBlock) {
                    mineBlock(topicDataBlock, res)
                } else {
                    res.status("400").send("error: Invalid Request. A topic already exists.")
                }
            }
        })
    });
    app.post('/vote', (req, res) => {
        req.body.type = 'V';
        customValidations(req.body, function (err, response) {
            if (err) {
                res.status("400").send(err)
            } else {
                // add validation
                //            	var voteDataBlock = new VoteDataBlock(
                //            			req.body.userId,
                //            			req.body.topicId,
                //            			req.body.optionId
                //                	);
                var voteDataBlock = addVote(req.body);
                if (voteDataBlock) {
                    mineBlock(voteDataBlock, res)
                } else {
                    res.status("400").send("error: Invalid Vote!")
                }
            }
        })
    });

    app.get('/topic', (req, res) => {
        if (req.query.topicId) {
            var topic = (blockchain.filter(a => a.data.type == "T")).filter(function (b) {
                if (b.data && b.data.topicId == req.query.topicId) {
                    return b
                } else {
                    return null;
                }
            });
            if (topic.length > 0) {
                var optionVoteCount = []
                blockchain.filter(a => a.data.type == "V").filter(function (b) {
                    console.log(b.data.topicId)
                    console.log(topic[0].data.topicId)
                    if (b.data.topicId == topic[0].data.topicId) {
                        var optionIndex = topic[0].data.options.indexOf(b.data.optionId)
                        if (optionVoteCount[optionIndex]) {
                            optionVoteCount[optionIndex] = optionVoteCount[optionIndex] + 1;
                            return optionVoteCount
                        } else {
                            optionVoteCount[optionIndex] = 1
                            return optionVoteCount
                        }
                    } else {
                        return null;
                    }
                });
                for (var j = 0; j < topic[0].data.options.length; j++) {
                    if (!optionVoteCount[j]) {
                        optionVoteCount[j] = 0;
                    }
                }
                topic[0].data.optionVoteCount = optionVoteCount
                res.send(JSON.stringify(topic[0].data));
            } else {
                res.send();
            }
        } else {
            var topicsFromBlockChain = blockchain.filter(a => a.data.type == "T")
            var topics = []
            for (var i = 0; i < topicsFromBlockChain.length; i++) {

                var optionVoteCount = []
                blockchain.filter(a => a.data.type == "V").filter(function (b) {
                    if (b.data.topicId == topicsFromBlockChain[i].data.topicId) {
                        var optionIndex = topicsFromBlockChain[i].data.options.indexOf(b.data.optionId)
                        if (optionVoteCount[optionIndex]) {
                            optionVoteCount[optionIndex] = optionVoteCount[optionIndex] + 1;
                            return optionVoteCount
                        } else {
                            optionVoteCount[optionIndex] = 1
                            return optionVoteCount
                        }
                    } else {
                        return null;
                    }
                });
                for (var j = 0; j < topicsFromBlockChain[i].data.options.length; j++) {
                    if (!optionVoteCount[j]) {
                        optionVoteCount[j] = 0;
                    }
                }
                topicsFromBlockChain[i].data.optionVoteCount = optionVoteCount
                topics.push(topicsFromBlockChain[i].data)
            }

            res.send(JSON.stringify(topics));
        }
    });

    app.get('/vote', (req, res) => {
        if (req.query.userId) {
            var votes = []
            var vote = (blockchain.filter(a => a.data.type == "V")).filter(function (b) {
                if (b.data && b.data.userId == req.query.userId) {
                    return b
                } else {
                    return null;
                }
            });
            if (vote.length > 0) {
                for (var i = 0; i < vote.length; i++) {
                    blockchain.filter(a => a.data.type == "T").filter(function (b) {
                        if (b.data.topicId == vote[i].data.topicId) {
                            vote[i].data.topicDesc = b.data.topicDesc
                            vote[i].data.startDate = b.data.startDate
                            vote[i].data.endDate = b.data.endDate
                            vote[i].data.topicTitle = b.data.topicTitle
                            votes.push(vote[i].data)
                        } else {
                            return null;
                        }
                    });
                }

                res.send(JSON.stringify(votes));

            } else {
                res.send();
            }
        } else {
            res.status(400).send("userId is missing");
        }
    });
    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });
    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};

function mineBlock(data, res) {
    var newBlock = generateNextBlock(data);
    addBlock(newBlock);
    broadcast(responseLatestMsg());
    console.log('block added: ' + JSON.stringify(newBlock));
    res.send();

}


var initP2PServer = () => {
    var server = new WebSocket.Server({
        port: p2p_port
    });
    server.on('connection', ws => initConnection(ws));
    console.log('listening websocket p2p port on: ' + p2p_port);

};

var initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

var initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        var message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

var initErrorHandler = (ws) => {
    var closeConnection = (ws) => {
        console.log('connection failed to peer: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};


var generateNextBlock = (blockData) => {
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
    var nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
};


var calculateHashForBlock = (block) => {
    return calculateHash(block.index, block.previousHash, block.timestamp, block.data);
};

var calculateHash = (index, previousHash, timestamp, data) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};

var addBlock = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
    }
};

var isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
        console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
        return false;
    }
    return true;
};

var connectToPeers = (newPeers) => {
    newPeers.forEach((peer) => {
        var ws = new WebSocket(peer);
        ws.on('open', () => initConnection(ws));
        ws.on('error', () => {
            console.log('connection failed')
        });
    });
};

var handleBlockchainResponse = (message) => {
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("We can append the received block to our chain");
            blockchain.push(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        } else {
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
};

var replaceChain = (newBlocks) => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.log('Received blockchain invalid');
    }
};

var isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
        return false;
    }
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchainToValidate[i]);
        } else {
            return false;
        }
    }
    return true;
};

var getLatestBlock = () => blockchain[blockchain.length - 1];
var queryChainLengthMsg = () => ({
    'type': MessageType.QUERY_LATEST
});
var queryAllMsg = () => ({
    'type': MessageType.QUERY_ALL
});
var responseChainMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify(blockchain)
});
var responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
});

var write = (ws, message) => ws.send(JSON.stringify(message));
var broadcast = (message) => sockets.forEach(socket => write(socket, message));

connectToPeers(initialPeers);
initHttpServer();
initP2PServer();

var addVote = (blockData) => {
    //console.log("one");
    var userId = blockData.userId;
    var topicId = blockData.topicId;
    var optionId = blockData.optionId;

    var topicBlock;
    var status = true;
    blockchain.forEach((block) => {
        console.log(block);
        if (block.data.type == "V") {
            if (block.data.userId == userId) {
                status = false;
            }
        } else if (block && block.data && block.data.type == "T" && block.data.topicId == topicId) {
            topicBlock = block.data;
            status = false;
            if (block.data.options) {
                block.data.options.forEach((op) => {
                    if (op == optionId) {
                        status = true;
                    }
                })
            }
        }
    });
    if (topicBlock && status) {
        var vdb = new VoteDataBlock(userId, topicId, optionId);
        //console.log(vdb);
        return vdb;
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
        if (block && block.data) {
            //if(block.data.type == "T" && block.data.topicId == topicId) {
            if (block.data.type == "T" &&
                block.data.topicTitle == topicTitle &&
                block.data.startDate == startDate &&
                block.data.endDate == endDate) {
                status = false;
            }
        }
    });

    if (status) {
        var topicDataBlock = new TopicDataBlock(
            uuidv1(),
            blockData.topicTitle,
            blockData.topicDesc,
            blockData.startDate,
            blockData.endDate,
            blockData.options,
            blockData.userId
        );
        //console.log(tdb);
        return topicDataBlock;
    }
}

function countVotes() {
    var countByTopic = {
        "topic1": 0
    };

    var countByUser = {
        "userid": 0
    };


    blockchain.forEach((block) => {
        if (block && block.data) {
            var userID = null;
            var topicId = null;

            if (block.data.type == "V") {
                topicId = block.data.topicId;
                if (countByTopic[topicId] == undefined) {
                    countByTopic[countByTopic] = 0;
                } else {
                    countByTopic[countByTopic]++;
                }

                var userId = block.data.userId;
                if (countByTopic[userId] == undefined) {
                    countByTopic[userId] = 0;
                } else {
                    countByTopic[userId]++;
                }
            }
        }
    });
}