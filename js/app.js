(function($) {
    "use strict";

    // Custom options for map
    var options = {
        zoom : 14,
        mapTypeId : 'Styled',
        disableDefaultUI: true,
        mapTypeControlOptions : {
            mapTypeIds : [ 'Styled' ]
        }
    };
    var styles = [{
        stylers : [ {
            hue : "#cccccc"
        }, {
            saturation : -100
        }]
    }, {
        featureType : "road",
        elementType : "geometry",
        stylers : [ {
            lightness : 100
        }, {
            visibility : "simplified"
        }]
    }, {
        featureType : "road",
        elementType : "labels",
        stylers : [ {
            visibility : "on"
        }]
    }, {
        featureType: "poi",
        stylers: [ {
            visibility: "off"
        }]
    }];

    var newMarker = null;
    var markers = [];
    var resultPotholes = [];
    var pages = 1;
    var currentPage = 1;

// Get map information by pull down
    $('.city-select li').click(function () {
        var place = $(this).text();
        var map_infomation = $.ajax({
            url: 'http://maps.google.com/maps/api/geocode/json?address=' + place + '&sensor=false',
            type: "get",
            data: {address:place, sensor:false},
            async: false
        });

        if (map_infomation.success()) {
            var lng = map_infomation.responseJSON.results[0].geometry.location.lng;
            var lat = map_infomation.responseJSON.results[0].geometry.location.lat;


            setTimeout(function() {
                $('body').removeClass('notransition');

                map = new google.maps.Map(document.getElementById('mapView'), options);
                var styledMapType = new google.maps.StyledMapType(styles, {
                    name : 'Styled'
                });

                map.mapTypes.set('Styled', styledMapType);
                map.setCenter(new google.maps.LatLng(lat,lng));
                map.setZoom(12);

                google.maps.event.addListener(map, 'idle', function() {
                    getPotholes(map);
                    addMarkers(props, map);
                });

                if ($('#address').length > 0) {
                    newMarker = new google.maps.Marker({
                        position: new google.maps.LatLng(lat,lng),
                        map: map,
                        icon: new google.maps.MarkerImage(
                            'images/marker-new.png',
                            null,
                            null,
                            // new google.maps.Point(0,0),
                            null,
                            new google.maps.Size(36, 36)
                        ),
                        draggable: true,
                        animation: google.maps.Animation.DROP
                    });

                    google.maps.event.addListener(newMarker, "mouseup", function(event) {
                        var latitude = this.position.lat();
                        var longitude = this.position.lng();
                        $('#latitude').text(this.position.lat());
                        $('#longitude').text(this.position.lng());
                    });
                }

                addMarkers(props, map);
            }, 300);
            return map_infomation.responseJSON;
        } else {
            return map_infomation.error();
        }

    });
//-----------------> my code <--------------------------//
    var today = new Date();
    var thisYear = today.getFullYear();
    var filter = {
      min_year: 1950,
      max_year: 2050,
      min_cost: 0,
      max_cost: 20000
    };
    /* get current position
     **
     */
    var mapCenter = {
        'lat': 52.529231599999996,
        'lng': 13.378650799999999
    };
    var optionObj = {
        "enableHighAccuracy": false ,
        "timeout": 8000 ,
        "maximumAge": 5000
    };

    if(navigator.geolocation) {
        console.log( "Your device can get your current location" );
        //console.log(optionObj);
        //navigator.geolocation.getCurrentPosition(successFunc , errorFunc , optionObj);
    } else {
        console.log("Your device cannot get your current location");
    }

    function successFunc( position ) {
        console.log('success');
        mapCenter.lat = position.coords.latitude;
        mapCenter.lng = position.coords.longitude;
        console.log(mapCenter);
    }

    function errorFunc( error ) {
        // エラーコードのメッセージを定義
        var errorMessage = {
            0: "原因不明のエラーが発生しました…。" ,
            1: "位置情報の取得が許可されませんでした…。" ,
            2: "電波状況などで位置情報が取得できませんでした…。" ,
            3: "位置情報の取得に時間がかかり過ぎてタイムアウトしました…。"
        };

        console.log("error: " + errorMessage[error.code]);
    }


    // json for properties markers on map
    var props = [];
    var setProps = function setProps(data) {
        props = [];
        $.each( data, function( key, val ) {
            var _pothole = makeMarker(val);
            props.push(_pothole);
        });
        pages = Math.ceil(props.length / 6);
    };

    var getPotholes = function getPotholes(map) {
        var _potholes = $.ajax({
            type: "POST",
            url: "./ajax/map/",
            data: {
                'minLat':map.getBounds().getSouthWest().lat(),
                'maxLat':map.getBounds().getNorthEast().lat(),
                'minLng':map.getBounds().getSouthWest().lng(),
                'maxLng':map.getBounds().getNorthEast().lng()
            },
            async: false,
        }).responseJSON;

        setProps(_potholes.potholes);

        return _potholes.potholes;

    };

    //getPotholes();
    /* making marker
     **
     **
     */
    var getDummyPotholes = function getDummyPotholes() {
        $.getJSON('./get_map.json', function(data) {
            if(data.error === true) {
                console.log(data.error);
            } else {
                console.log('get dummy potholes :)');
                //console.dir(data.potholes);
                setProps(data.potholes);
                return data.potholes;
            };
        });
    };

    var makeMarker = function makeMarker(in_obj){
        var _lat = Number(in_obj.lat);
        var _lng = Number(in_obj.lng);

        var _markerColor = '';
        var _price = Number(in_obj.expected_cost);
        var _expected_date = castToDate(in_obj.expected_date);
        var _diff = getDiffYear(_expected_date, today);

        var _image = './kanbotsu-1.jpg';

        if(_diff < 0) _diff *= -1;
        if(_diff < 3) {
            _markerColor = 'green';
            _image = './kanbotsu-1.jpg';
        } else if (( _diff >= 3) && (_diff < 6)) {
            _markerColor = 'yellow';
            //_price *= 2;
            _image = './kanbotsu-2.jpg';
        } else if (_diff >= 6) {
            _markerColor = 'red';
            //_price *= 3;
            _image = './kanbotsu-3.jpg';
        } else {
            console.log('never come here!');
        }
        _price *= _diff;
        if(_price > 20000) { _price = 20000};
        //console.log('lat: ' + Math.round( _avrLat * 10000 ) / 10000 + ', ' + 'lng: ' + Math.round( _avrLng * 10000 ) / 10000);
        var out_obj = {
            'title': in_obj.street_name,
            'image' : _image,
            'diff' : _diff,
            'price' : '€' + _price,
            'address' : 'lat: ' + Math.round( _lat * 1000 ) / 1000 + ', ' + 'lng: ' + Math.round( _lng * 1000 ) / 1000,
            'bedrooms' : '3',
            'bathrooms' : '2',
            'expected_date' : in_obj.expected_date,
            'position' : {
                'lat' : _lat,
                'lng' : _lng
            },
            'markerIcon' : "marker-" + _markerColor+ ".png"
        };

        return out_obj;
    };

    var castToDate = function castTodate(date_a) {
        var _temp = date_a.split('-');
        var _year = _temp[0];
        var _month = _temp[1];
        var _date = _temp[2];
        return new Date(_year, _month, _date);
    }

    var getDiffYear = function getDiffYear(date_a, date_b) {
        var _diff = (date_a.getTime() - date_b.getTime())/(1000 * 60 * 60 *24*365);
        _diff = Math.floor(_diff);
        return _diff;
    };

    // filter ling
    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }
    function clearMarkers() {
        setMapOnAll(null);
    }
    function deleteMarkers() {
        clearMarkers();
        markers = [];
    }

    // test code
    document.onkeydown = function (e){
        if(!e) e = window.event;
        //console.log(e.keyCode);

        if(e.keyCode === 68){
            // d key
            clearMarkers();

        } else if(e.keyCode === 32) {
            // space key
            addMarkers(props, map);
            console.log($("[title = 'this.title']").length);
            // for (var i = 0; i < markers.length; i++) {
            //   addMarkerWithTimeout(markers[i], i * 200);
            // }
        } else if(e.keyCode === 70) {
            // f key
            //filterByYear(props, 2017, 2015);
            //console.log(props);
            var _props = filterByYear(props, 2000, 2017);
            addMarkers(_props, map);
        } else if(e.keyCode === 67) {
            // f key
            //filterByYear(props, 2017, 2015);
            var _props = simulateByYear(props, 2020);
            setTimeout(addMarkers(_props, map), 400);
        }
    };

    function filterByYear(props, min_year, max_year) {
        var _minYear = Number(min_year);
        var _maxYear = Number(max_year);
        console.log('year: ' + _minYear + ' - ' + _maxYear);
        var _out = [];
        $.map(props, function(prop, id) {
            var _expected_date = castToDate(prop.expected_date);
            var _year = _expected_date.getFullYear();

            if((_year >= min_year) && (_year <= max_year)) {
              _out.push(prop);
            }
        });
        return _out;
    };

    function filterByCost(props, min_cost, max_cost) {
        console.log('cost: ' + min_cost + ' - ' + max_cost);
        var _out = [];
        $.map(props, function(prop, id) {
          var _cost = prop.price.replace(/€/gi, '');
          _cost = Number(_cost);
          //console.log(_cost);

          if((_cost >= min_cost) && (_cost <= max_cost)) {
            _out.push(prop);
          }
        });
        return _out;
    };

    function filterByCostAndYear(props, min_cost, max_cost, min_year, max_year) {
      var _out = [];
      var _minYear = Number(min_year);
      var _maxYear = Number(max_year);
      //console.log('cost: ' + min_cost + ' - ' + max_cost);
      //console.log('year: ' + _minYear + ' - ' + _maxYear);
      infobox.open(null,null);
      $.map(props, function(prop, id) {
          var _cost = prop.price.replace(/€/gi, '');
          _cost = Number(_cost);
          var _expected_date = castToDate(prop.expected_date);
          var _year = _expected_date.getFullYear();

          if((_cost >= min_cost) && (_cost <= max_cost) && (_year >= min_year) && (_year <= max_year)) {
            _out.push(prop);
          }
        });
      return _out;
    }

    function simulateByYear(props, sim_year) {

        //console.log('sim_year: ' + sim_year);
        var _out = [];
        var _sim_year = new Date(sim_year+'-01-01');
        $.map(props, function(prop, id) {
          var _expected_date =  castToDate(prop.expected_date);
          var _diff = getDiffYear(_expected_date, _sim_year);
          //console.log(_sim_year);
          //console.log(_diff);
          var _markerColor = '';
          var _price = Number(prop.price.replace(/€/gi, ''));
          if(_diff < 0) _diff *= -1;
          if(_diff < 3) {
            _markerColor = 'green';
            //_price *= 1;
          } else if (( _diff >= 3) && (_diff < 6)) {
            _markerColor = 'yellow';
            //_price *= 2;
          } else if (_diff >= 6) {
            _markerColor = 'red';
            //_price *= 3;
          } else {
            console.log('never come here!');
          }
          _price *= _diff;
          if(_price > 20000) { _price = 20000};
        //console.log('lat: ' + Math.round( _avrLat * 10000 ) / 10000 + ', ' + 'lng: ' + Math.round( _avrLng * 10000 ) / 10000);
          var _outObj = {
              'title': prop.title,
              'image' : '2-1-thmb.png',
              'diff' : _diff,
              'price' : '€' + _price,
              'address' : prop.address,
              'bedrooms' : '3',
              'bathrooms' : '2',
              'expected_date' : prop.expected_date,
              'position' : prop.position,
              'markerIcon' : "marker-" + _markerColor+ ".png"
          };
          _out.push(_outObj);
        });
        return _out;
    };

    function getResultPotholes(resultph, page) {
      var _page = parseInt(page, 10) - 1;
      $(".resultsList .row .col-xs-12").remove();
        $(".resultsList .row").append(resultph.slice(0 + 6*_page, 6 + 6*_page));
    };

//-----------------> my code <--------------------------//


    // custom infowindow object
    var infobox = new InfoBox({
        disableAutoPan: false,
        maxWidth: 202,
        pixelOffset: new google.maps.Size(-101, -285),
        zIndex: null,
        boxStyle: {
            background: "url('images/infobox-bg.png') no-repeat",
            opacity: 1,
            width: "202px",
            height: "245px"
        },
        closeBoxMargin: "28px 26px 0px 0px",
        closeBoxURL: "",
        infoBoxClearance: new google.maps.Size(1, 1),
        pane: "floatPane",
        enableEventPropagation: false
    });

    // function that adds the markers on map
    var addMarkers = function(props, map) {
        resultPotholes = [];
        $.each(props, function(i, prop) {
            var latlng = new google.maps.LatLng(prop.position.lat,prop.position.lng);
            var marker = new google.maps.Marker({
                position: latlng,
                map: map,
                icon: new google.maps.MarkerImage(
                    'images/' + prop.markerIcon,
                    null,
                    null,
                    null,
                    new google.maps.Size(36, 36)
                ),
                title: 'marker-' + i,
                draggable: false
                //,animation: google.maps.Animation.DROP,
            });
            var infoboxContent = '<div class="infoW">' +
                '<div class="propImg">' +
                '<img src="images/prop/' + prop.image + '">' +
                '<div class="propBg">' +
                '<div class="propPrice">' + prop.price + '</div>' +
                    //'<div class="propType">' + prop.type + '</div>' +
                '</div>' +
                '</div>' +
                '<div class="paWrapper">' +
                '<div class="propTitle">' + prop.title + '</div>' +
                '<div class="propAddress">' + prop.address + '<br>' +
                  prop.expected_date +
                '</div>' +
                '</div>' +
                '<div class="propRating">' +
                '<span class="fa fa-star"></span>' +
                '<span class="fa fa-star"></span>' +
                '<span class="fa fa-star"></span>' +
                '<span class="fa fa-star"></span>' +
                '<span class="fa fa-star-o"></span>' +
                '</div>' +
                '<ul class="propFeat">' +
                //'<li><span class="fa fa-moon-o"></span> ' + prop.bedrooms + '</li>' +
                //'<li><span class="icon-drop"></span> ' + prop.bathrooms + '</li>' +
                //'<li><span class="icon-frame"></span> ' + prop.area + '</li>' +
                '</ul>' +
                '<div class="clearfix"></div>' +
                '<div class="infoButtons">' +
                '<a class="btn btn-sm btn-round btn-gray btn-o closeInfo">Close</a>' +
                '<a href="#" class="btn btn-sm btn-round btn-blue viewInfo">View</a>' +
                '</div>' +
                '</div>';

            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    infobox.open(null,null);
                    marker.setIcon(new google.maps.MarkerImage(
                        'images/marker-blue.png',
                        null,
                        null,
                        // new google.maps.Point(0,0),
                        null,
                        new google.maps.Size(36, 36)
                    ));
                    console.log(this.title);
                    infobox.setContent(infoboxContent);
                    infobox.open(map, marker);
                }
            })(marker, i));

            $(document).on('click', '.closeInfo', function() {
                infobox.open(null,null);
            });

            markers.push(marker);

            var resultPothole = '<div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 animated bounceIn">' +
            '<a href="#" class="card">' +
            '<div class="figure">' +
            '<img src="images/prop/' + prop.image + '" alt="image">' +
            '<div class="figCaption">' +
            '<div>' + prop.price + '</div>' +
            '<span class="icon-eye"> 200</span>' +
            '<span class="icon-heart"> 54</span>' +
            '<span class="icon-bubble"> 13</span>' +
            '</div>' +
            '<div class="figView"><span class="icon-eye"></span></div>' +
            '</div>' +
            '<h2>' + prop.title + '</h2>' +
            '<div class="cardAddress"><span class="icon-pointer"></span>' + prop.address + '</div>' +
            '<div class="cardRating">' +
            '<span class="fa fa-star"></span>' +
            '<span class="fa fa-star"></span>' +
            '<span class="fa fa-star"></span>' +
            '<span class="fa fa-star"></span>' +
            '<span class="fa fa-star-o"></span>' +
            '</div>' +
            // '<ul class="cardFeat">' +
            // '<li><span class="fa fa-moon-o"></span> 3</li>' +
            // '<li><span class="icon-drop"></span> 2</li>' +
            // '<li><span class="icon-frame"></span> 3430 Sq Ft</li>' +
            // '</ul>' +
            '<div class="clearfix"></div>' +
            '</a>' +
            '</div>';

            resultPotholes.push(resultPothole);
        });

        console.log(resultPotholes.length);
        pages = Math.ceil(resultPotholes.length / 6);
        $(".resultsList .row .col-xs-12").remove();
        $(".resultsList .row").append(resultPotholes.slice(0, 6));

        var pagenations = '<li class="disabled"><a href="#"><span class="fa fa-angle-left"></span></a></li>';
        // var pagenations = '';
        //console.log(pages);
        for(var i = 1; i <= pages; i++) {
          pagenations += '<li><a href="#">' + i +'</a></li>';
        }
        pagenations += '<li><a href="#"><span class="fa fa-angle-right"></span></a></li>';
        //console.log(pagenations);
        $(".pagination li").remove();
        $('.pagination').append(pagenations);
        $(".pagination li").eq(currentPage).removeClass('disable').addClass('active');

        // page nation
        $('.pagination > li > a').on('click', function(e){
          var _html = this.text;

          currentPage = parseInt(_html, 10);
          if(currentPage <= 1) {
            currentPage = 1;
          } else if(currentPage >= pages) {
            currentPage = pages;
          }
          $('.pagination .active').removeClass('active');
          $(this).parent().addClass('active');
          getResultPotholes(resultPotholes, currentPage);
          console.log(currentPage);
        });
    }

    var map;
    var windowHeight;
    var windowWidth;
    var contentHeight;
    var contentWidth;
    var isDevice = true;

    // calculations for elements that changes size on window resize
    var windowResizeHandler = function() {
        windowHeight = window.innerHeight;
        windowWidth = $(window).width();
        contentHeight = windowHeight - $('#header').height();
        contentWidth = $('#content').width();

        $('#leftSide').height(contentHeight);
        $('.closeLeftSide').height(contentHeight);
        $('#wrapper').height(contentHeight);
        $('#mapView').height(contentHeight);
        $('#content').height(contentHeight);
        setTimeout(function() {
            $('.commentsFormWrapper').width(contentWidth);
        }, 300);

        if (map) {
            google.maps.event.trigger(map, 'resize');
        }

        // Add custom scrollbar for left side navigation
        if(windowWidth > 767) {
            $('.bigNav').slimScroll({
                height : contentHeight - $('.leftUserWraper').height()
            });
        } else {
            $('.bigNav').slimScroll({
                height : contentHeight
            });
        }
        if($('.bigNav').parent('.slimScrollDiv').size() > 0) {
            $('.bigNav').parent().replaceWith($('.bigNav'));
            if(windowWidth > 767) {
                $('.bigNav').slimScroll({
                    height : contentHeight - $('.leftUserWraper').height()
                });
            } else {
                $('.bigNav').slimScroll({
                    height : contentHeight
                });
            }
        }

        // reposition of prices and area reange sliders tooltip
        var priceSliderRangeLeft = parseInt($('.priceSlider .ui-slider-range').css('left'));
        var priceSliderRangeWidth = $('.priceSlider .ui-slider-range').width();
        var priceSliderLeft = priceSliderRangeLeft + ( priceSliderRangeWidth / 2 ) - ( $('.priceSlider .sliderTooltip').width() / 2 );
        $('.priceSlider .sliderTooltip').css('left', priceSliderLeft);

        var areaSliderRangeLeft = parseInt($('.areaSlider .ui-slider-range').css('left'));
        var areaSliderRangeWidth = $('.areaSlider .ui-slider-range').width();
        var areaSliderLeft = areaSliderRangeLeft + ( areaSliderRangeWidth / 2 ) - ( $('.areaSlider .sliderTooltip').width() / 2 );
        $('.areaSlider .sliderTooltip').css('left', areaSliderLeft);

        var dateSliderRangeLeft = parseInt($('.dateSlider .ui-slider-range').css('left'));
        var dateSliderRangeWidth = $('.dateSlider .ui-slider-range').width();
        var dateSliderLeft = dateSliderRangeLeft + ( dateSliderRangeWidth / 2 ) - ( $('.dateSlider .sliderTooltip').width() / 2 );
        $('.dateSlider .sliderTooltip').css('left', dateSliderLeft);
    }

    var repositionTooltip = function( e, ui ){
        var div = $(ui.handle).data("bs.tooltip").$tip[0];
        var pos = $.extend({}, $(ui.handle).offset(), {
            width: $(ui.handle).get(0).offsetWidth,
            height: $(ui.handle).get(0).offsetHeight
        });
        var actualWidth = div.offsetWidth;

        var tp = {left: pos.left + pos.width / 2 - actualWidth / 2}
        $(div).offset(tp);

        $(div).find(".tooltip-inner").text( ui.value );
    }

    windowResizeHandler();
    $(window).resize(function() {
        windowResizeHandler();
    });

    setTimeout(function() {
        $('body').removeClass('notransition');

        map = new google.maps.Map(document.getElementById('mapView'), options);
        var styledMapType = new google.maps.StyledMapType(styles, {
            name : 'Styled'
        });

        map.mapTypes.set('Styled', styledMapType);
        map.setCenter(new google.maps.LatLng(52.529231599999996,13.378650799999999));
        map.setZoom(12);

        google.maps.event.addListener(map, 'idle', function() {
            getPotholes(map);
            //getDummyPotholes();
            setTimeout(function(){
              addMarkers(props, map);
            }, 400);
        });

        google.maps.event.addListener(map, 'zoom_changed', function() {
            getPotholes(map);
            //getDummyPotholes();
            setTimeout(function(){
              addMarkers(props, map);
            }, 400);
        });

        if ($('#address').length > 0) {
            newMarker = new google.maps.Marker({
                position: new google.maps.LatLng(52.529231599999996,13.378650799999999),
                map: map,
                icon: new google.maps.MarkerImage(
                    'images/marker-new.png',
                    null,
                    null,
                    // new google.maps.Point(0,0),
                    null,
                    new google.maps.Size(36, 36)
                ),
                draggable: true,
                animation: google.maps.Animation.DROP
            });

            google.maps.event.addListener(newMarker, "mouseup", function(event) {
                var latitude = this.position.lat();
                var longitude = this.position.lng();
                $('#latitude').text(this.position.lat());
                $('#longitude').text(this.position.lng());
            });
        }

        addMarkers(props, map);
    }, 300);

    if(!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)) {
        $('body').addClass('no-touch');
        isDevice = false;
    }

    // Header search icon transition
    $('.search input').focus(function() {
        console.log($(this));
        $('.searchIcon').addClass('active');
    });
    $('.search input').blur(function() {
        $('.searchIcon').removeClass('active');
    });

    // Notifications list items pulsate animation
    $('.notifyList a').hover(
        function() {
            $(this).children('.pulse').addClass('pulsate');
        },
        function() {
            $(this).children('.pulse').removeClass('pulsate');
        }
    );

    // Exapnd left side navigation
    var navExpanded = false;
    $('.navHandler, .closeLeftSide').click(function() {
        if(!navExpanded) {
            $('.logo').addClass('expanded');
            $('#leftSide').addClass('expanded');
            if(windowWidth < 768) {
                $('.closeLeftSide').show();
            }
            $('.hasSub').addClass('hasSubActive');
            $('.leftNav').addClass('bigNav');
            if(windowWidth > 767) {
                $('.full').addClass('m-full');
            }
            windowResizeHandler();
            navExpanded = true;
        } else {
            $('.logo').removeClass('expanded');
            $('#leftSide').removeClass('expanded');
            $('.closeLeftSide').hide();
            $('.hasSub').removeClass('hasSubActive');
            $('.bigNav').slimScroll({ destroy: true });
            $('.leftNav').removeClass('bigNav');
            $('.leftNav').css('overflow', 'visible');
            $('.full').removeClass('m-full');
            navExpanded = false;
        }
    });

    // functionality for map manipulation icon on mobile devices
    $('.mapHandler').click(function() {
        if ($('#mapView').hasClass('mob-min') ||
            $('#mapView').hasClass('mob-max') ||
            $('#content').hasClass('mob-min') ||
            $('#content').hasClass('mob-max')) {
            $('#mapView').toggleClass('mob-max');
            $('#content').toggleClass('mob-min');
        } else {
            $('#mapView').toggleClass('min');
            $('#content').toggleClass('max');
        }

        setTimeout(function() {
            var priceSliderRangeLeft = parseInt($('.priceSlider .ui-slider-range').css('left'));
            var priceSliderRangeWidth = $('.priceSlider .ui-slider-range').width();
            var priceSliderLeft = priceSliderRangeLeft + ( priceSliderRangeWidth / 2 ) - ( $('.priceSlider .sliderTooltip').width() / 2 );
            $('.priceSlider .sliderTooltip').css('left', priceSliderLeft);

            var areaSliderRangeLeft = parseInt($('.areaSlider .ui-slider-range').css('left'));
            var areaSliderRangeWidth = $('.areaSlider .ui-slider-range').width();
            var areaSliderLeft = areaSliderRangeLeft + ( areaSliderRangeWidth / 2 ) - ( $('.areaSlider .sliderTooltip').width() / 2 );
            $('.areaSlider .sliderTooltip').css('left', areaSliderLeft);

            var dateSliderRangeLeft = parseInt($('.dateSlider .ui-slider-range').css('left'));
            var dateSliderRangeWidth = $('.dateSlider .ui-slider-range').width();
            var dateSliderLeft = dateSliderRangeLeft + ( dateSliderRangeWidth / 2 ) - ( $('.dateSlider .sliderTooltip').width() / 2 );
            $('.dateSlider .sliderTooltip').css('left', dateSliderLeft);

            if (map) {
                google.maps.event.trigger(map, 'resize');
            }

            $('.commentsFormWrapper').width($('#content').width());
        }, 300);

    });

    // Expand left side sub navigation menus
    $(document).on("click", '.hasSubActive', function() {
        $(this).toggleClass('active');
        $(this).children('ul').toggleClass('bigList');
        $(this).children('a').children('.arrowRight').toggleClass('fa-angle-down');
    });

    if(isDevice) {
        $('.hasSub').click(function() {
            $('.leftNav ul li').not(this).removeClass('onTap');
            $(this).toggleClass('onTap');
        });
    }

    // functionality for custom dropdown select list
    $('.dropdown-select li a').click(function() {
        if (!($(this).parent().hasClass('disabled'))) {
            $(this).prev().prop("checked", true);
            $(this).parent().siblings().removeClass('active');
            $(this).parent().addClass('active');
            $(this).parent().parent().siblings('.dropdown-toggle').children('.dropdown-label').html($(this).text());
        }
    });

    $('.priceSlider').slider({
        range: true,
        min: 0,
        max: 20000,
        values: [1000, 20000],
        step: 1000,
        slide: function(event, ui) {
            $('.priceSlider .sliderTooltip .stLabel').html(
                '€' + ui.values[0].toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") +
                ' <span class="fa fa-arrows-h"></span> ' +
                '€' + ui.values[1].toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
            );
            var priceSliderRangeLeft = parseInt($('.priceSlider .ui-slider-range').css('left'));
            var priceSliderRangeWidth = $('.priceSlider .ui-slider-range').width();
            var priceSliderLeft = priceSliderRangeLeft + ( priceSliderRangeWidth / 2 ) - ( $('.priceSlider .sliderTooltip').width() / 2 );
            $('.priceSlider .sliderTooltip').css('left', priceSliderLeft);
        },
        change: function(event, ui) {
          clearMarkers();
          // filter.min_cost = parseInt(ui.values[0], 10);
          // filter.max_cost = parseInt(ui.values[1], 10);
          filter.min_cost = ui.values[0];
          filter.max_cost = ui.values[1];
          //var _props = filterByCost(props, ui.values[0], ui.values[1]);
          var _props = filterByCostAndYear(props, filter.min_cost, filter.max_cost, filter.min_year, filter.max_year);
          setTimeout(addMarkers(_props, map), 400);
          //console.log('year: ' + ui.values[0] + '-' + ui.values[1]);
        }
    });
    $('.priceSlider .sliderTooltip .stLabel').html(
        '€' + $('.priceSlider').slider('values', 0).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") +
        ' <span class="fa fa-arrows-h"></span> ' +
        '€' + $('.priceSlider').slider('values', 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    );
    var priceSliderRangeLeft = parseInt($('.priceSlider .ui-slider-range').css('left'));
    var priceSliderRangeWidth = $('.priceSlider .ui-slider-range').width();
    var priceSliderLeft = priceSliderRangeLeft + ( priceSliderRangeWidth / 2 ) - ( $('.priceSlider .sliderTooltip').width() / 2 );
    $('.priceSlider .sliderTooltip').css('left', priceSliderLeft);

    $('.areaSlider').slider({
        range: true,
        min: 0,
        max: 20000,
        values: [5000, 10000],
        step: 10,
        slide: function(event, ui) {
            $('.areaSlider .sliderTooltip .stLabel').html(
                ui.values[0].toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' Sq Ft' +
                ' <span class="fa fa-arrows-h"></span> ' +
                ui.values[1].toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' Sq Ft'
            );
            var areaSliderRangeLeft = parseInt($('.areaSlider .ui-slider-range').css('left'));
            var areaSliderRangeWidth = $('.areaSlider .ui-slider-range').width();
            var areaSliderLeft = areaSliderRangeLeft + ( areaSliderRangeWidth / 2 ) - ( $('.areaSlider .sliderTooltip').width() / 2 );
            $('.areaSlider .sliderTooltip').css('left', areaSliderLeft);
        }
    });
    $('.areaSlider .sliderTooltip .stLabel').html(
        $('.areaSlider').slider('values', 0).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' Sq Ft' +
        ' <span class="fa fa-arrows-h"></span> ' +
        $('.areaSlider').slider('values', 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' Sq Ft'
    );
    var areaSliderRangeLeft = parseInt($('.areaSlider .ui-slider-range').css('left'));
    var areaSliderRangeWidth = $('.areaSlider .ui-slider-range').width();
    var areaSliderLeft = areaSliderRangeLeft + ( areaSliderRangeWidth / 2 ) - ( $('.areaSlider .sliderTooltip').width() / 2 );
    $('.areaSlider .sliderTooltip').css('left', areaSliderLeft);

    $('.dateSlider').slider({
        range: true,
        min: 1950,
        max: 2050,
        values: [1950, 2050],
        step: 1,
        slide: function(event, ui) {
            $('.dateSlider .sliderTooltip .stLabel').html(
                ui.values[0].toString() +
                ' <span class="fa fa-arrows-h"></span> ' +
                ui.values[1].toString()
            );
            var dateSliderRangeLeft = parseInt($('.dateSlider .ui-slider-range').css('left'));
            var dateSliderRangeWidth = $('.dateSlider .ui-slider-range').width();
            var dateSliderLeft = dateSliderRangeLeft + ( dateSliderRangeWidth / 2 ) - ( $('.dateSlider .sliderTooltip').width() / 2 );
            $('.dateSlider .sliderTooltip').css('left', dateSliderLeft);
        },
        change: function(event, ui) {
          clearMarkers();
          filter.min_year = ui.values[0];
          filter.max_year = ui.values[1];
          //var _props = filterByCost(props, filter.min_cost, filter.max_cost);
          //var _props = filterByYear(props, ui.values[0], ui.values[1]);
          var _props = filterByCostAndYear(props, filter.min_cost, filter.max_cost, filter.min_year, filter.max_year);
          setTimeout(addMarkers(_props, map), 400);
          //console.log('year: ' + ui.values[0] + '-' + ui.values[1]);
        }
    });
    $('.dateSlider .sliderTooltip .stLabel').html(
        $('.dateSlider').slider('values', 0).toString() +
        ' <span class="fa fa-arrows-h"></span> ' +
        $('.dateSlider').slider('values', 1).toString()
    );
    var dateSliderRangeLeft = parseInt($('.dateSlider .ui-slider-range').css('left'));
    var dateSliderRangeWidth = $('.dateSlider .ui-slider-range').width();
    var dateSliderLeft = dateSliderRangeLeft + ( dateSliderRangeWidth / 2 ) - ( $('.dateSlider .sliderTooltip').width() / 2 );
    $('.dateSlider .sliderTooltip').css('left', dateSliderLeft);

    $('.volume .btn-round-right').click(function() {
        var currentVal = parseInt($(this).siblings('input').val());
        if (currentVal < 10) {
            $(this).siblings('input').val(currentVal + 1);
        }
    });
    $('.volume .btn-round-left').click(function() {
        var currentVal = parseInt($(this).siblings('input').val());
        if (currentVal > 1) {
            $(this).siblings('input').val(currentVal - 1);
        }
    });

    $('.handleFilter').click(function() {
        $('.filterForm').slideToggle(200);
    });

    //Enable swiping
    $(".carousel-inner").swipe( {
        swipeLeft:function(event, direction, distance, duration, fingerCount) {
            $(this).parent().carousel('next');
        },
        swipeRight: function() {
            $(this).parent().carousel('prev');
        }
    });

    $(".carousel-inner .card").click(function() {
        window.open($(this).attr('data-linkto'), '_self');
    });

    $('#content').scroll(function() {
        if ($('.comments').length > 0) {
            var visible = $('.comments').visible(true);
            if (visible) {
                $('.commentsFormWrapper').addClass('active');
            } else {
                $('.commentsFormWrapper').removeClass('active');
            }
        }
    });

    $('.btn').click(function() {
        if ($(this).is('[data-toggle-class]')) {
            $(this).toggleClass('active ' + $(this).attr('data-toggle-class'));
        }
    });

    $('.tabsWidget .tab-scroll').slimScroll({
        height: '235px',
        size: '5px',
        position: 'right',
        color: '#939393',
        alwaysVisible: false,
        distance: '5px',
        railVisible: false,
        railColor: '#222',
        railOpacity: 0.3,
        wheelStep: 10,
        allowPageScroll: true,
        disableFadeOut: false
    });

    $('.progress-bar[data-toggle="tooltip"]').tooltip();
    $('.tooltipsContainer .btn').tooltip();

    $("#slider1").slider({
        //range: "min",
        value: 12,
        min: 10,
        max: 19,
        stop: repositionTooltip,
        slide: function(event, ui) {
            repositionTooltip
            map.setZoom(ui.value);
            getPotholes(map);
            //getDummyPotholes();
            setTimeout(function(){
              addMarkers(props, map);
            }, 400);
        }
    });
    $("#slider1 .ui-slider-handle:first").tooltip({
        title: $("#slider1").slider("value"),
        trigger: "manual"}).tooltip("show");

    $("#slider2").slider({
        value: thisYear,
        min: thisYear,
        max: 2050,
        slide: repositionTooltip,
        stop: repositionTooltip,
        change: function(event, ui){
          clearMarkers();
          var _props = filterByCostAndYear(props, filter.min_cost, filter.max_cost, filter.min_year, filter.max_year);
          _props = simulateByYear(_props, ui.value);
          setTimeout(addMarkers(_props, map), 400);
        }
    });
    $("#slider2 .ui-slider-handle:first").tooltip({ title: $("#slider2").slider("value"), trigger: "manual"}).tooltip("show");

    $("#slider3").slider({
        range: true,
        min: 0,
        max: 500,
        values: [ 190, 350 ],
        slide: repositionTooltip,
        stop: repositionTooltip
    });
    $("#slider3 .ui-slider-handle:first").tooltip({ title: $("#slider3").slider("values", 0), trigger: "manual"}).tooltip("show");
    $("#slider3 .ui-slider-handle:last").tooltip({ title: $("#slider3").slider("values", 1), trigger: "manual"}).tooltip("show");

    $('#autocomplete').autocomplete({
        source: ["ActionScript", "AppleScript", "Asp", "BASIC", "C", "C++", "Clojure", "COBOL", "ColdFusion", "Erlang", "Fortran", "Groovy", "Haskell", "Java", "JavaScript", "Lisp", "Perl", "PHP", "Python", "Ruby", "Scala", "Scheme"],
        focus: function (event, ui) {
            var label = ui.item.label;
            var value = ui.item.value;
            var me = $(this);
            setTimeout(function() {
                me.val(value);
            }, 1);
        }
    });

    $('#tags').tagsInput({
        'height': 'auto',
        'width': '100%',
        'defaultText': 'Add a tag'
    });

    $('#datepicker').datepicker();

    // functionality for autocomplete address field
    if ($('#address').length > 0) {
        var address = document.getElementById('address');
        var addressAuto = new google.maps.places.Autocomplete(address);

        google.maps.event.addListener(addressAuto, 'place_changed', function() {
            var place = addressAuto.getPlace();

            if (!place.geometry) {
                return;
            }
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
            }
            newMarker.setPosition(place.geometry.location);
            newMarker.setVisible(true);
            $('#latitude').text(newMarker.getPosition().lat());
            $('#longitude').text(newMarker.getPosition().lng());

            return false;
        });
    }

    $('input, textarea').placeholder();
})(jQuery);
