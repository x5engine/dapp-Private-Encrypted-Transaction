// "SPDX-License-Identifier: MIT"
pragma solidity >=0.5.8 <0.6.9;

//A Private book of memories
contract PrivateMemoryBook
{

    uint256 public messagesCount;
    mapping(uint256 => Message) public messagesList;

    struct Message {
        address author;
        string body;
    }

    event MessageAdded(string body, address author);
    event MessagesCounter(uint256 counter);

    // constructor function
    constructor(string memory message) public
    {
        messagesCount = 0;
        messagesList[messagesCount].author = msg.sender;
        messagesList[messagesCount].body = message;
        emit MessageAdded(message, msg.sender);
    }

    // call this function to send a message
    function addMessage(string memory message) public
    {
        messagesCount++;
        messagesList[messagesCount].author = msg.sender;
        messagesList[messagesCount].body = message;
        emit MessageAdded(message, msg.sender);
        emit MessagesCounter(messagesCount + 1);
    }

    function getLastMsg() public view returns (string memory) {
        return messagesList[messagesCount].body;
    }
    function getCount() public view returns (uint256) {
        return messagesCount + 1;
    }
}