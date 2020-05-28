import React, { useState, useEffect } from 'react';
import logo from './blockchain-service.svg';
import './App.css';
import { useToasts } from 'react-toast-notifications'

import Web3 from "web3"
import abi from "./abis/contract"

const Tx = require('ethereumjs-tx').Transaction;

const quorumjs = require("quorum-js");
// var toBuffer = require('blob-to-buffer')

const IpfsAPI = require('ipfs-api'); //Needs a 'require' instead of import

var provider = new Web3.providers.WebsocketProvider("wss://x5engine.blockchain.azure.com:3300/E-FlUTqcGM65Si6SaBQwe6sg");
var web3 = new Web3(provider);

var provider2 = new Web3.providers.WebsocketProvider("wss://node2-x5engine.blockchain.azure.com:3300/xYxMEh8VR-8Aq8I2zQQskMR6");
const web3_node2 = new Web3(provider);

quorumjs.extend(web3);
// const tessera = quorumjs.encalves.Tessera(web3, "http://localhost:9081");

var myContract = new web3.eth.Contract(abi, '0xc5bAd721fb0CDE3FBa9B952BFA8B0B703Cc822C6');
const account =  '0x3f833ebc25100a391C61a2D40A3f16a08c98FB0c';
const pk = '502ad50a5100783286b426746c9b348d842574a718f8645f97d713dbc063b456';
web3.eth.accounts.privateKeyToAccount("0x"+pk);
web3.eth.accounts.wallet.add("0x502ad50a5100783286b426746c9b348d842574a718f8645f97d713dbc063b456")
web3.eth.defaultAccount = "0x3f833ebc25100a391C61a2D40A3f16a08c98FB0c";

var privateKey = new Buffer(pk, 'hex')

//old public contract
// contract address 0x89da55DFda82E2874E5d7054D772FFFCF488C38B
// events 0x8f0a6aee96af394104f1cbde715858cdab311a3b41800fefe7527ee57d1ffe18

/**
 * New Deployed Private Contract 
 * Address : 0xc5bAd721fb0CDE3FBa9B952BFA8B0B703Cc822C6
 * Events: 0x8f0a6aee96af394104f1cbde715858cdab311a3b41800fefe7527ee57d1ffe18
 * Tx History: 0x068ce3d4cadb5a6e2092fb8fbde72d473b70d990887b2a92e06ff6afe5d435ee
 * Created by : 0x3e60dbCf0C918259835d7dF52d50CCd8Cc7DFD22
 */


function App() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const { addToast } = useToasts()
  const ipfs = IpfsAPI("ipfs.infura.io", "5001", {
    protocol: "https"
  });
  const buffer = ipfs.Buffer;

  useEffect(() => {
    subscribe2Events()
  }, []);
  

  const timeConverter = (UNIX_timestamp) => {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
  }

  const subscribe2Events =  () => {
    var subscription = web3.eth.subscribe('logs', {
      address: '0xc5bAd721fb0CDE3FBa9B952BFA8B0B703Cc822C6',
    }, function (error, result) {
        console.log("subscription",error, result);
    });
    console.log("myContract", myContract);
    onSubmit("Connected to Contract 0xc5bAd721fb0CDE3FBa9B952BFA8B0B703Cc822C6")
    myContract.events.allEvents({ fromBlock: 'latest' }, function (error, event) { console.log("events logs",error,event); })
      .on("connected", (subscriptionId) => {
        console.log("connected subscriptionId:",subscriptionId);
      })
      .on('data', async (event) => {//Here we get the events
        console.log("data",event); // we log it for debugging purposes only
        //we then get the tranasction receipt to get all other info needed
        const receipt = await web3.eth.getTransactionReceipt(event.transactionHash);
        const tx = await web3_node2.eth.getTransaction(event.transactionHash);
        console.log("tx",tx);
        // Send On-Chain data to Off-Chain
        if (event.event == "MessageAdded")// we only add to ipfs when we get the MessageAdded Event
        {
          send2IPFS(tx.input, event.transactionHash)
        }
        const block = await web3.eth.getBlock(receipt.blockNumber)//getting the block number is essential to get the timestamp
        const time = timeConverter(block.timestamp);//converting it to a readable date
        const readableMessage = "Event " + event.event +" time: " + time + ' from account ' + receipt.from +" blockNumber = " + receipt.blockNumber
        console.log(readableMessage, block, "receipt", receipt);// we log it for debugging purposes only
        onSubmit(readableMessage, false, true, 15000)//show a toast message
        onSubmit("Event " + event.event +" Data: "+JSON.stringify(event.returnValues), false, true, 15000)//show a toast message for data received from the event 
      })
      .on('changed', (event) => {
        console.log("changed", event)
      })
      .on('error', (error, receipt) => {
        console.log(error, receipt)
      });
  }


  const send2IPFS = async (payload, tx) => {
    onSubmit("Off-Chain Data Upload started, Transaction : "+tx, false, true, 15000)//show a toast message of upload start
    let bufferedString = await buffer.from(payload);
    
    ipfs.add(bufferedString,
      {
        progress: (prog) => console.log(`received: ${prog}`)
      },
      (err, result) => {
        if (result && result.length) {
          onSubmit("Encrypted data of private Transaction uploaded to IPFS : " + "https://ipfs.infura.io/ipfs/" + result[0].hash, false, true, 25000)//show a toast message of upload start
          ipfs.pin.add(result[0].hash, (err, result) => {
            console.log('image pin', err, result);
          })
        }
      })
  }

  const sendPrivateTxn = () => {
    web3.eth.getAccounts().then(console.log)
    web3.eth
    .getTransactionCount(account)
    .then(nonce => {
      const timeDate = new Date().toUTCString();
      const encoded = myContract.methods.addMessage("Testing Private Transaction " + Math.random() + " time " + timeDate).encodeABI()
      const rawTransaction = {
        nonce: `0x${nonce.toString(16)}`,
        from: "0x3f833ebc25100a391C61a2D40A3f16a08c98FB0c",
        to: "0xc5bAd721fb0CDE3FBa9B952BFA8B0B703Cc822C6",
        value: `0x${(0).toString(16)}`,
        gasLimit: `0x${(4300000).toString(16)}`,
        gasPrice: `0x${(0).toString(16)}`,
        data: encoded,
        privateFor: ["llGj6iwxark5ULgJ7vh1x6mmrI8KeDbFpd28xCg1YFk="],
        // privateFrom: "nOzQJIDGKR3Qa7yBwfp4TDnHawdxJU61RtXzuy1O4lg=",
        isPrivate: true
      };
      
      const rtmViaAPI = quorumjs.RawTransactionManager(web3, {
        privateUrl: "https://x5engine.blockchain.azure.com:3200"//can't find the right endpoint sadly
      })
      
      var tx = new Tx(rawTransaction, { chain: 'mainnet', hardfork: 'homestead' });
      tx.sign(privateKey);

      var serializedTx = tx.serialize();
      const rawTx = '0x' + serializedTx.toString('hex');

      //this is how it should be sent
      // rtmViaAPI.sendRawTransaction(rawTransaction)
      //   .then(function (o, e) {
      //     console.log("Sending private txn using newer API");
      //     console.log(o, e);
      //   });

      //this doesnt work for some reason because I don't have the privateUrl for Tessera!
      // web3.quorum.eth.sendRawPrivateTransaction(rawTx, { privateFor: ["llGj6iwxark5ULgJ7vh1x6mmrI8KeDbFpd28xCg1YFk="]})// this is the right way but can't have access to the privateURL on ABS

      // web3.eth.sendSignedTransaction(rawTx)
      web3.eth.sendTransaction(rawTransaction)
        .on('transactionHash', async (hash) => {
          console.log('txHash:', hash)
          const tx = await web3.eth.getTransaction(hash);
          console.log("tx private node", tx);
          const txx = await web3_node2.eth.getTransaction(hash);
          console.log("tx node2", txx, tx.input == txx.input);
        })
        .on('receipt', (receipt) => {
          console.log('receipt', receipt)
        })
        .on('error', console.error)


    })
  }

  const onSubmit = async (value, error, autoDismiss = true, autoDismissTimeout = 5000) => {
    if (error) {
      addToast(error, {
        appearance: 'error',
        autoDismiss: true,
      })
    } else {
      addToast(value, {
        appearance: 'info',
        autoDismiss,
        autoDismissTimeout
     })
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h6>
          Private Encrypted Transaction on Quorum with Tessera on-chain and off-chain on IPFS
        </h6>
        <p>
          A solution that will demonstrate creating a private transaction, using either Quorum with Tessera then to off-chain on IPFS
        </p>
        <p>
          Contract 0xc5bAd721fb0CDE3FBa9B952BFA8B0B703Cc822C6 PrivateMemoryBook
        </p>
        <br />
        <button onClick={sendPrivateTxn}>
          Send Raw Private Transaction To Quorum
        </button>
        <br />
        <a
          className="App-link"
          onClick={() => onSubmit("Azure Blockchain Service is Awesome!")}
        >
          Azure Blockchain Service
        </a>
      </header>
    </div>
  );
}

export default App;
