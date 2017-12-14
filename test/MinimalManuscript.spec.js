const EncodingHelper = require('../app/common/encoding-helper')
const expectThrow = require('../test/helpers/expectThrow')

console.log('*********', Object.keys(contract))

var MinimalManuscript = artifacts.require('../contracts/MinimalManuscript.sol')

contract('MinimalManuscript', function (accounts) {

  // manuscript variables
  var ma = [];
  // manuscript address variables
  var adm = [];

  it('creates manuscripts', async function() {

    // set data addresses of manuscripts
    // Todo: set different data addresses
    var bytesOfAddress = [];
    for(var cnt=0; cnt<4; cnt++) {
      bytesOfAddress[cnt] = EncodingHelper.ipfsAddressToHexSha256('QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH');
    }

    // create 4 minimal manuscripts ma[...] with adresses adm[...]
    // each manuscript has a different owner accounts[...]
    for(var cnt=0; cnt<4; cnt++) {
      ma[cnt] = await MinimalManuscript.new(bytesOfAddress[cnt], {from: accounts[cnt]});
      adm[cnt] = await ma[cnt].address;
    }

    // check data addresses
    for(var cnt=0; cnt<4; cnt++) {
      let tempBytesOfAdress = await ma[cnt].dataAddress();
      assert.equal(tempBytesOfAdress, bytesOfAddress[cnt], "data address is not correct")
    }

  })

  it('adds authors to manuscripts', async function() {

    // add authors to manuscript ma[0] and ma[1]
    await ma[0].addAuthor(accounts[1], {from: accounts[0]});
    await ma[0].addAuthor(accounts[2], {from: accounts[0]});
    await ma[1].addAuthor(accounts[3], {from: accounts[1]});
    await ma[1].addAuthor(accounts[4], {from: accounts[1]});
    await ma[1].addAuthor(accounts[5], {from: accounts[1]});

    // check authors
    let authorCnt1 = await ma[0].authorCount();
    for( var cnt = 0; cnt<authorCnt1; cnt++) {
      let authorMa1 = await ma[0].author(cnt);
      assert.equal(authorMa1, accounts[cnt+1], "author address is not in author list")
    }
    let authorCnt2 = await ma[1].authorCount();
    for( var cnt = 0; cnt<authorCnt2; cnt++) {
      let authorMa2 = await ma[1].author(cnt);
      assert.equal(authorMa2, accounts[cnt+3], "author address is not in author list")
    }
  })

  it('cites papers', async function() {

    // check empt citation count of ma[0]
    let citationCnt1 = await ma[0].citationCount();
    assert.equal(citationCnt1, 0, "number of citations of manuscript ma[0] is not 0")

    // add 3 citations to ma[0]
    for( var cnt=1; cnt<4; cnt++) {
      await ma[0].citePaper(adm[cnt], {from: accounts[0]});
    }

    // verify succesfull citing
    let citationCnt2 = await ma[0].citationCount();
    assert.equal(citationCnt2, 3, "number of citations of manuscript ma[0] is not 3")
    for( var cnt=0; cnt<3; cnt++) {
      let tempCitation = await ma[0].citation(cnt);
      assert.equal(tempCitation, adm[cnt+1], "citation of manuscript is not correct");
    }

    // checks if double citation is impossible
    // cite manuscript ma[2] again
    await ma[0].citePaper(adm[2], {from: accounts[0]});
    // check if number of citations has changed.
    let citationCnt3 = await ma[0].citationCount();
    assert.equal(citationCnt3, 3, "double citation changed number of total citations")
  })

  it('removes citation', async function() {

    // remove citation ma[2] from manuscript ma[0]
    await ma[0].removeCitation(adm[2], {from: accounts[0]});

    // check if citation count was reduced by one
    let citationCnt4 = await ma[0].citationCount();
    assert.equal(citationCnt4, 2, "citation of ma[2] was not removed")

    // check if only citation of ma[1] and ma[3] remained
    let tempCitation1 = await ma[0].citation(0);
    assert.equal(tempCitation1, adm[1], "first citation of manuscript ma[0] is not ma[1]");
    let tempCitation2 = await ma[0].citation(1);
    assert.equal(tempCitation2, adm[3], "second citation of manuscript ma[0] is not ma[3]");
  })

  it('checks ownership restrictions', async function() {

    // check for throw of addAuthor() when msg.sender is not owner
    await expectThrow(ma[0].addAuthor(accounts[3], {from: accounts[1]}));

    // check for throw of citePaper() when msg.sender in not owner
    await expectThrow(ma[0].citePaper(adm[3], {from: accounts[1]}));

    // check for thro of removeCitation() when msg.sender in not owner
    await expectThrow(ma[0].removeCitation(adm[1], {from: accounts[1]}));
  })
})
