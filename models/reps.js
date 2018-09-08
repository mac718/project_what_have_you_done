const request = require('request');
const rp = require('request-promise');
const fs = require('file-system');

const baseUri = 'https://www.googleapis.com/civicinfo/v2/';

const googleKey = process.env.CIVIC_INFO_API_KEY;
//wrap method in promise

var extractRepInfo = function(result){
  let parsedResult = JSON.parse(result);
    let state = parsedResult.normalizedInput.state;

    let houseRepIndices = parsedResult.offices.filter(obj => 
            { return obj.name.includes('United States House of Representatives'); })[0].officialIndices;
    
    let houseReps = [];
    
    houseRepIndices.forEach( i => {
      parsedResult.officials[i].state = state;
      houseReps.push(parsedResult.officials[i]);
    });

    let senateRepIndices = parsedResult.offices.filter(obj => 
            { return obj.name.includes('United States Senate'); })[0].officialIndices;

    let senateReps = [];

    senateRepIndices.forEach( i => {
      parsedResult.officials[i].state = state;
      senateReps.push(parsedResult.officials[i]);
    });

    //console.log(senateReps);

    return [houseReps, senateReps];
  }

class Rep {
  findReps(address) {
    var options = {
        uri: `${baseUri}representatives`,
        qs: {
            key: googleKey, // -> uri + '?access_token=xxxxx%20xxxxx'
            address: address
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: false // Automatically parses the JSON string in the response
    };

    return rp(options)
      .then(function (result) {
          let repInfo = extractRepInfo(result);
          
          //console.log(repInfo);
          
          fs.unlink('houseReps.json', err => { if (err) throw err; });
          fs.unlink('senateReps.json', err => { if (err) throw err; });

          
          repInfo.forEach( (rep, index) => {
            console.log(index);
            if (index == 0) {
              fs.appendFile('houseReps.json', JSON.stringify(rep), 'utf8', err => {
                if (err) throw err;
              })
            } else {
              fs.appendFile('senateReps.json', JSON.stringify(rep), 'utf8', err => {
                if (err) throw err;
              })
            }
          })
          
          return Promise.resolve(repInfo);
      })
      .catch(function (err) {
          console.log('nope');
      });

    // console.log('in instance method');
    // return Promise.resolve(request(, 
    //   function(error, response, body) {
    //     //console.log(body);
    //     console.log('in requst');
    //     return body;
    //   })).then(result => { return result });
    
    
  }
}

module.exports = Rep;