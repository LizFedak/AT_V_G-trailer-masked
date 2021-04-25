const https = require('https');

myFunc = async (req,res) => {
  try {
    let makes = await getAirtableData("Make");
    let types = await getAirtableData("Type");

    let makesSet = await getSet(makes, "Make");
    let typesSet = await getSet(types, "Type");
    
    // DELETE EXISTING TYPE IF NOT IN THE AIRTABLE ANYMORE
    let typeObject = await getCollectionInfo('621ddc81','Typelist');
    let filteredTypesToDelete = await createReqObjDeleteRowsTYPE(typeObject, 'Typelist', typesSet);
    await deleteRows(JSON.stringify(filteredTypesToDelete), '621ddc81','Typelist');

    // DELETE EXISTING MAKE IF NOT IN THE AIRTABLE ANYMORE
    let makeObject = await getCollectionInfo('621ddc81','Makes');
    let filteredMakesToDelete = await createReqObjDeleteRowsMAKE(makeObject, 'Makes', makesSet);
    await deleteRows(JSON.stringify(filteredMakesToDelete), '621ddc81','Makes');

    // SEND any NEW makes or types that are NOT IN THE TABLE ALREADY

    ///////////////////// MAKES
    // get the makes that need to be updated on Duda
    let makesToSendToDuda = await makeListToSendToDudaMAKES(makesSet, makeObject);
    // console.log(makesToSendToDuda);
    
    // make the object to send to duda
    let makesObj4Duda = await makeAddRowObjectMAKE(makesToSendToDuda);
    // send them to Duda
    await addRowsDuda(JSON.stringify(makesObj4Duda), '621ddc81', 'Makes')

    //////////////////////// TYPES
    // get the types that need to be updated on Duda
    let typesToSendToDuda = await makeListToSendToDudaTYPES(typesSet, typeObject);

    // make the object to send to Duda
    let typesObj4Duda = await makeAddRowObjectTYPE(typesToSendToDuda);

    await addRowsDuda(JSON.stringify(typesObj4Duda), '621ddc81', 'Typelist');

    // res.writeHead(200);
    // res.end();
  } catch (err) {
    console.log(err);
    res.writeHead(500);
    res.end();
  }
}

async function addRowsDuda(obj, siteID, collectionName) {
  let authorization = process.env.DUDA_API;
  // console.log(arr);
  let path = `https://api.duda.co/api/sites/multiscreen/${encodeURIComponent(siteID)}/collection/${encodeURIComponent(collectionName)}/row`;
  const options = {
    hostname: 'api.duda.co',
    port: 443,
    method: 'POST',
    path: path,
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Length': arr.length,
      'Authorization': authorization
    },
    body: obj
  }

  res = await new Promise((resolve, reject) => {
    req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);
      resolve();
    })
    req.on('error', error => {
      console.error(error);
      // reject();
      res.writeHead(500);
    res.end();
    })
    req.write(obj);
    req.end()
  }).then(function() {
    return true;
  });
}

async function makeAddRowObjectTYPE(arr) {
  let items = [];
  arr.forEach(x => {
    let temp = {
      "data": {
          "Type": "",
      }
  }
  temp.data.Type = x;
  items.push(temp);
  });
  return items;
}

async function makeAddRowObjectMAKE(arr) {
  let items = [];
  arr.forEach(x => {
    let temp = {
      "data": {
          "Make": "",
      }
  }
  temp.data.Make = x;
  items.push(temp);
  });
  return items;
}

async function makeListToSendToDudaMAKES(fullListAirtable, currentListDuda) {
  let newForDuda = [];
  let dudaList = JSON.parse(currentListDuda).values.map(x => x.data.Make);
  fullListAirtable.forEach(x => {
    if (!dudaList.includes(x)) {
      newForDuda.push(x);
    }
  })
  return newForDuda;
}

async function makeListToSendToDudaTYPES(fullListAirtable, currentListDuda) {
  let newForDuda = [];
  let dudaList = JSON.parse(currentListDuda).values.map(x => x.data.Type);
  fullListAirtable.forEach(x => {
    if (!dudaList.includes(x)) {
      newForDuda.push(x);
    }
  })
  return newForDuda;
}

async function deleteRows(arr, siteID, collectionName) {
  let authorization = process.env.DUDA_API;
  console.log(arr);
  let path = `https://api.duda.co/api/sites/multiscreen/${encodeURIComponent(siteID)}/collection/${encodeURIComponent(collectionName)}/row`;
  const options = {
    hostname: 'api.duda.co',
    port: 443,
    method: 'DELETE',
    path: path,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': arr.length,
      'Authorization': authorization
    },
    body: arr
  }

  res = await new Promise((resolve, reject) => {
    req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);
      resolve();
    })
    req.on('error', error => {
      console.error(error);
      // reject();
      res.writeHead(500);
    res.end();
    })
    req.write(arr);
    req.end()
  }).then(function() {
    return true;
  });
}

async function createReqObjDeleteRowsTYPE(obj, collectionName, newItemsToCompare) {
  let deleteItems = [];
  JSON.parse(obj).values.forEach(item => {
    if (!newItemsToCompare.has(item.data.Type)) {
      console.log("DELETE " + item.data.Type)
      deleteItems.push(item.id);
      // return true;
    }
  });
  // console.log(deleteItems);
  return deleteItems;
}

async function createReqObjDeleteRowsMAKE(obj, collectionName, newItemsToCompare) {
  let deleteItems = [];
  JSON.parse(obj).values.forEach(item => {
    if (!newItemsToCompare.has(item.data.Make)) {
      console.log("DELETE " + item.data.Make)
      deleteItems.push(item.id);
      // return true;
    }
  });
  // console.log(deleteItems);
  return deleteItems;
}

async function getSet(obj, field) {
  return new Set(JSON.parse(obj).records.map(item => item.fields[field]));
}

async function getAirtableData(field) {
  let path = `https://api.airtable.com/v0/appBdRkKDKoN7ufAS/Table%201?view=Grid%20view&fields%5B%5D=${encodeURIComponent(field)}`;
  // let path = "https://api.airtable.com/v0/appBdRkKDKoN7ufAS/Table%201?maxRecords=3&view=Grid%20view";
  let authorization = process.env.AT_API;
  const options = {
    hostname: 'api.airtable.com',
    port: 443,
    path: path,
    method: 'GET',
    headers: {
      'Authorization': authorization
    }
  }
  let resultObject = await new Promise((resolve, reject) => {
    let req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);
      res.on('data', function(chunk) {
        let resolver = String(chunk);
        return resolve(resolver);
      });
    })
    req.on('error', error => {
      console.error(error);
      reject();
    })
    req.end()
  })
  return resultObject;
}

async function getCollectionInfo(siteName, collectionName) {
  let path = `https://api.duda.co/api/sites/multiscreen/${encodeURIComponent(siteName)}/collection/${encodeURIComponent(collectionName)}`;
  let authorization = process.env.DUDA_API;
  const options = {
    hostname: 'api.duda.co',
    port: 443,
    path: path,
    method: 'GET',
    headers: {
      'Authorization': authorization
    }
  }

  let resultObject = await new Promise((resolve, reject) => {
    let req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);
      res.on('data', function(chunk) {
        let resolver = String(chunk);
        // console.log(resolver, "RESULT");
        return resolve(resolver);
      });
    })
    req.on('error', error => {
      console.error(error);
      reject();
    })
    req.end()
  })
  return resultObject;
}

myFunc();
