(function(){
  'use strict';


  /* get current position
  **
  */
  var optionObj = {
    "enableHighAccuracy": false ,
    "timeout": 8000 ,
    "maximumAge": 5000 ,
  };

  if(navigator.geolocation) {
    // 現在位置を取得できる場合の処理
    console.log( "あなたの端末では、現在位置を取得することができます。" );
    //console.log(optionObj);
    //navigator.geolocation.getCurrentPosition(successFunc , errorFunc , optionObj);
  } else {
    console.log("あなたの端末では、現在位置を取得できません。");
  }

  function successFunc( position ) {
    console.log('success');
    console.log('latitude: ' + position.coords.latitude );
    console.log('longitude: ' +  position.coords.longitude );
  }

  function errorFunc( error ) {
  // エラーコードのメッセージを定義
    var errorMessage = {
      0: "原因不明のエラーが発生しました…。" ,
      1: "位置情報の取得が許可されませんでした…。" ,
      2: "電波状況などで位置情報が取得できませんでした…。" ,
      3: "位置情報の取得に時間がかかり過ぎてタイムアウトしました…。" ,
    };

    // エラーコードに合わせたエラー内容をアラート表示
    console.log("error: " + errorMessage[error.code]);
  }



  // /* getpotholes
  // **
  // **
  // */
  // var props = [];
  // var getPotholes = function getPotholes() {
  //   $.getJSON('./get_map.json', function(data) {
  //     if(data.error === true) {
  //       console.log(data.error);
  //     } else {
  //       console.log("ok");
  //       var _potholes = data.potholes;
  //       $.each( _potholes, function( key, val ) {
  //         var _pothole = makeMaker(val);
  //         props.push(_pothole);
  //         console.log(_pothole);
  //       });
  //     }
  //   });
  // };

  // getPotholes();
  // /* making marker
  // **
  // **
  // */
  // var makeMaker = function makeMaker(in_obj){
  //   var _avrLat = (in_obj.from_lat + in_obj.to_lat) / 2;
  //   var _avrLng = (in_obj.from_lng + in_obj.to_lng) / 2;

  //   var out_obj = {
  //     'title': in_obj.street_name,
  //     'image' : '2-1-thmb.png',
  //     'type' : 'For Sale',
  //     'price' : '€100',
  //     'address' : '39 Remsen St, Brooklyn, NY 11201, USA',
  //     'bedrooms' : '3',
  //     'bathrooms' : '2',
  //     'area' : '3430 Sq Ft',
  //     'position' : {
  //           'lat' : _avrLat,
  //           'lng' : _avrLng
  //       },
  //       markerIcon : "marker-red.png"
  //   };
  //   console.log(_aveLat);
  //   return out_obj;
  // };


})();
