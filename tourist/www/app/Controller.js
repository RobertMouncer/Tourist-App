var Conference = Conference || {};

Conference.controller = (function ($, dataContext, document) {
    "use strict";

    var position = null;
    var mapDisplayed = false;
    var currentMapWidth = 0;
    var currentMapHeight = 0;
    var sessionsListSelector = "#sessions-list-content";
    var noSessionsCachedMsg = "<div>Your sessions list is empty.</div>";
    var databaseNotInitialisedMsg = "<div>Your browser does not support local databases.</div>";

    var TECHNICAL_SESSION = "Technical",
        SESSIONS_LIST_PAGE_ID = "sessions",
        MAP_PAGE = "map";

    // This changes the behaviour of the anchor <a> link
    // so that when we click an anchor link we change page without
    // updating the browser's history stack (changeHash: false).
    // We also don't want the usual page transition effect but
    // rather to have no transition (i.e. tabbed behaviour)
    var initialisePage = function (event) {
        change_page_back_history();
    };

    var onPageChange = function (event, data) {
        // Find the id of the page
        var toPageId = data.toPage.attr("id");

        // If we're about to display the map tab (page) then
        // if not already displayed then display, else if
        // displayed and window dimensions changed then redisplay
        // with new dimensions
        switch (toPageId) {
            case SESSIONS_LIST_PAGE_ID:
                dataContext.processSessionsList(renderSessionsList);
                break;
            case MAP_PAGE:
                if (!mapDisplayed || (currentMapWidth != get_map_width() ||
                    currentMapHeight != get_map_height())) {
                    deal_with_geolocation();
                }
                break;
        }
    };

    var renderSessionsList = function (sessionsList) {

        var view = $(sessionsListSelector);

        view.empty();

        if (sessionsList.length === 0) {

            $(noSessionsCachedMsg).appendTo(view);
        } else {

            var liArray = [],
                listItem,
                sessionsCount = sessionsList.length,
                session,
                i;

            // Loop through all sessionList data and build up the session list item
            // HTML data dynamically using jQuery and jQuery Mobile commands
            // such as appendTo and listView
            
            //<form class="ui-filterable">
            //<input id="myFilter" data-type="search" placeholder="Search for sessions..">
            //</form>
            var filterForm = $("<form class=\"ui-filterable\">");
            var inputField = $("<input id=\"myFilter\" data-type=\"search\" placeholder=\"Search for sessions...\">");
            inputField.appendTo(filterForm);
            filterForm.appendTo(view);
        
            var ul = $("<ul id=\"session-list\" data-role=\"listview\" data-filter=\"true\" data-input=\"#myFilter\"></ul>").appendTo(view);

            for (i = 0; i < sessionsCount; i += 1) {

                listItem = "<li>";
                session = sessionsList[i];

                if (session.type === TECHNICAL_SESSION) {
                    listItem = listItem + "<a data-url=\"index.html#events?sessionId=" + session._id + "\" href=\"index.html#events?sessionId=" + session._id + "\">";
                } else {
                    listItem = listItem + "<a href=\"\">";
                }
                liArray.push(listItem
                    + "<span class='session-list-item'>"
                    + "<h3>" + session.title + "</h3>"
                    + "<div>"
                    + "<h6>" + session.type + "</h6>"
                    + "<h6>" + session.starttime + " - " + session.endtime + "</h6>"
                    + "</div>"
                    + "</span>"
                    + "</a>"
                    + "</li>");

            }

            var listItems = liArray.join("");
            $(listItems).appendTo(ul);


            ul.listview();
        }
    };

    var noDataDisplay = function (event, data) {
        var view = $(sessionsListSelector);
        view.empty();
        $(databaseNotInitialisedMsg).appendTo(view);
    }

    var change_page_back_history = function () {
        $('a[data-role="tab"]').each(function () {
            var anchor = $(this);
            anchor.bind("click", function () {
                $.mobile.changePage(anchor.attr("href"), { // Go to the URL
                    transition: "none",
                    changeHash: false
                });
                return false;
            });
        });
    };

    var deal_with_geolocation = function () {
        var phoneGapApp = (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1 );
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
            // Running on a mobile. Will have to add to this list for other mobiles.
            // We need the above because the deviceready event is a phonegap event and
            // if we have access to PhoneGap we want to wait until it is ready before
            // initialising geolocation services
            if (phoneGapApp) {
                //alert('Running as PhoneGapp app');
                document.addEventListener("deviceready", initiate_geolocation, false);
            }
            else {
                initiate_geolocation(); // Directly from the mobile browser
            }
        } else {
            //alert('Running as desktop browser app');
            initiate_geolocation(); // Directly from the browser
        }
    };

    var initiate_geolocation = function () {

        // Do we have built-in support for geolocation (either native browser or phonegap)?
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(handle_geolocation_query, handle_errors);
        }
        else {
            // We don't so let's try a polyfill
            yqlgeo.get('visitor', normalize_yql_response);
        }
    };

    var handle_errors = function (error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert("user did not share geolocation data");
                break;

            case error.POSITION_UNAVAILABLE:
                alert("could not detect current position");
                break;

            case error.TIMEOUT:
                alert("retrieving position timed out");
                break;

            default:
                alert("unknown error");
                break;
        }
    };

    var normalize_yql_response = function (response) {
        if (response.error) {
            var error = { code: 0 };
            handle_errors(error);
            return;
        }

        position = {
            coords: {
                latitude: response.place.centroid.latitude,
                longitude: response.place.centroid.longitude
            },
            address: {
                city: response.place.locality2.content,
                region: response.place.admin1.content,
                country: response.place.country.content
            }
        };

        handle_geolocation_query(position);
    };

    var get_map_height = function () {
        return $(window).height() - ($('#maptitle').height() + $('#mapfooter').height());
    }

    var get_map_width = function () {
        return $(window).width();
    }

    var handle_geolocation_query = function (pos) {
        position = pos;

        var the_height = get_map_height();
        var the_width = get_map_width();

        var image_url = 'https://maps.googleapis.com/maps/api/staticmap?center=' + position.coords.latitude + ',' +
                      position.coords.longitude + '&zoom=14&size=' +
                      the_width + 'x' + the_height + '&markers=color:blue|label:S|' +
                      position.coords.latitude + ',' + position.coords.longitude +
                      '&key=AIzaSyBCFS6kPyHymErUmlY28foF2SBv90xAC-4';
         
        $('#map-img').remove();

        jQuery('<img/>', {
            id: 'map-img',
            src: image_url,
            title: 'Google map of my location'
        }).appendTo('#mapPos');

        mapDisplayed = true;
    };

    var init = function () {
        // The pagechange event is fired every time we switch pages or display a page
        // for the first time.
        var d = $(document);

        var databaseInitialised = dataContext.init();
        if (!databaseInitialised) {
            d.on('pagechange', $(document), noDataDisplay);
        }
       
        // The pagechange event is fired every time we switch pages or display a page
        // for the first time.
        d.on('pagechange', $(document), onPageChange);
        // The pageinit event is fired when jQM loads a new page for the first time into the
        // Document Object Model (DOM). When this happens we want the initialisePage function
        // to be called.
        d.on('pageinit', $(document), initialisePage);

        $('#cameraTakePicture').on('click',cameraTakePicture)
        $('#removePicture').on('click', removePicture)
    };


    // Provides an object wrapper for the "public" functions that we return to external code so that they
    // know which functions they can call. In this case just init.
    var pub = {
        init: init
    };

    return pub;
}(jQuery, Conference.dataContext, document));

function cameraTakePicture() {

   // navigator.camera.getPicture(onSuccess, onFail, {  
   //    quality: 50, 
   //    destinationType: Camera.DestinationType.DATA_URL 
   // });  
   onSuccess();


   function onSuccess(imageData) { 
        removePicture()
        // image = "data:image/jpeg;base64,"+ imageData;

        image = "data:image/jpeg;base64,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";
        $('#imagePreviewImg').attr('src',image)

        var picButton = document.getElementById('cameraTakePicture') ;
        $("#cameraTakePicture").html('Take Another?');

        //document.getElementsByClassName('hiddenDelete')[0].style.display = "block";
        $("#removePicture")[0].style.display = "block";
   }  
   
   function onFail(message) { 
      alert('Failed because: ' + message); 
   } 
}

function removePicture(){
    //$('div#imagePreview > img').remove();
    $('#imagePreviewImg').attr('src','')
    $("#cameraTakePicture").html('Take Picture?');
    //document.getElementsByClassName('hiddenDelete')[0].style.display = "none";
    $("#removePicture")[0].style.display = "none";
}

function submitVisit(){
    var base64 = encodeImagetoBase64();
    var dateTime = new Date($.now());

    if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            //success
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            var visit = {
                "Title": $('#Title').val(),
                "Notes": $('#Notes').val(),
                "Image": base64,
                "DateTime": dateTime,
                "Position": pos
            };

        setItem(dateTime, visit);
        console.log(getAllValues());
        }, function() {
    
        alert('Please enable location');
        });
    }

}

//https://stackoverflow.com/questions/40196273/convert-image-on-my-page-to-base64
function encodeImagetoBase64() {
    var canvas = document.createElement("canvas");
    var canvasContext = canvas.getContext("2d");

    var img = document.getElementById("imagePreviewImg");
    var width = img.width;
    var height = img.height;

    canvas.width = width;
    canvas.height = height;

    canvasContext.drawImage(img, 0, 0);

    //console.log(canvas.toDataURL());
    return canvas.toDataURL();

    
    }

// Called when jQuery Mobile is loaded and ready to use.
$(document).on('mobileinit', $(document), function () {
    window.onload=function(){
        Conference.controller.init();    
    }
    
    

});


