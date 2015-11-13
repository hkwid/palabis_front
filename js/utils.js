(function(){
  'use strict';

  var optionObj = {
  "enableHighAccuracy": false ,
  "timeout": 8000 ,
  "maximumAge": 5000 ,
  };

  if(navigator.geolocation) {
    // 現在位置を取得できる場合の処理
    console.log( "あなたの端末では、現在位置を取得することができます。" );
    console.log(optionObj);
    navigator.geolocation.getCurrentPosition(successFunc , errorFunc , optionObj);
  } else {
    console.log("あなたの端末では、現在位置を取得できません。");
  }

  function successFunc( position ){
    console.log('success');
    console.log('latitude: ' + position.coords.latitude );
    console.log('longitude: ' +  position.coords.longitude );
  }

  function errorFunc( error )
{
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

  // getpotholes
  /*
  params: fromYear
  params: endYear
  */

  // making marker


})();
