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

	var list = localforage.keys().then(function(keys) {
		console.log(keys);
	}).catch(function(err) {
	    console.log(err);
	});

}