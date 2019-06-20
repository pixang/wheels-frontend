'use strict';

var module = angular.module('supportAdminApp');

module.constant('constants', {
    LINE: 14,
    STATION: "镇龙车辆段",
    TRAIN_STATE_V: ['正常','报警','预警','设备异常'], /*0 正常,1 报警,2 预警,3 设备异常*/
    TRAIN_STATE:['正常','气隙报警','槽隙报警','温度报警','异常','气隙预警','槽隙预警','温度预警'],
    TRAIN_ID: ["001002","003004","005006","007008","009010","011012","013014","015016","017018","019020","021022","023024","025026","027028","029030","031032","033034","035036","037038","039040","041042","043044","045046","047048","049050","051052","053054","055056","057058","059060","071072","073074","075076","077078","079080","081082","083084","085086","087088","089090","091092","093094","095096","097098","099100","101102","103104","105106","107108","109110","111112","113114"],
    TRAIN_ID_LONG: ["全部","001002","003004","005006","007008","009010","011012","013014","015016","017018","019020","021022","023024","025026","027028","029030","031032","033034","035036","037038","039040","041042","043044","045046","047048","049050","051052","053054","055056","057058","059060","071072","073074","075076","077078","079080","081082","083084","085086","087088","089090","091092","093094","095096","097098","099100","101102","103104","105106","107108","109110","111112","113114"],
    API_URL: "http://ruiyi.vipgz1.idcfengye.com"
});
