//https://github.com/localForage/localForage
//https://localforage.github.io/localForage/
function setItem (key,value){
	localforage.setItem(key, value).then(function () {
	  return localforage.getItem('key');
	}).then(function (value) {
	  // we got our value
	}).catch(function (err) {
	  // we got an error
	  alert('Error saving item: ' + err)
	});
}

function getItem(key) {
	return localforage.getItem(key).then(function(value) {
	    // This code runs once the value has been loaded
	    // from the offline store.
	    console.log(value);
	}).catch(function(err) {
	    // This code runs if there were any errors
	    console.log(err);
	    alert(err)
	});
}
function removeItem(key){
	localforage.removeItem(key).then(function() {
	    // Run this code once the key has been removed.
	    console.log('Key is cleared!');
	}).catch(function(err) {
	    // This code runs if there were any errors
	    console.log(err);
	});
}

function getAllValues(){
	// Find the number of items in the datastore.
	localforage.length(function(length) {
	    // Loop over each of the items.
	    for (var i = 0; i < length; i++) {
	        // Get the key.
	        localforage.key(i, function(key) {
	            // Retrieve the data.
	               localforage.getItem(key, handleData);
	        });
	    }
	});
}