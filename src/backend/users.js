/*
const User = {
    ID:string,
    name:string,
    room:string
}*/
const userList = [];

exports.pushUser = function(userID) {
    userList.push({ID:userID});
}
exports.registUserRoom = function(userID, userName, userRoom){
    let existUser = userList.find((user) => user.ID === userID);
    if (existUser) { 
        existUser['name']=userName;
        existUser['room']=userRoom;
        console.log("registUser SSS",existUser.ID, existUser.name, existUser.room)
    }    
    console.log(userList);
}
exports.leaveUserRoom = function(userID) {    
    let existUser = userList.find((user) => user.ID === userID);
    if(existUser) {
        existUser['name']='';
        existUser['room']='';
        console.log("leaveUserRoom","leaveUserRoom","leaveUserRoom")
        console.log(existUser);
        console.log(userList)
    }
    return existUser;
}
exports.checkUserValid = function(userName) {    
    return exsitUser = userList.find((user) => user.name === userName);
}

exports.getUserList = function() { return userList; }


exports.removeUser = function(userID) {
    const index = userList.findIndex((ele) => ele.ID === userID);
    if (index != -1) return userList.splice(index, 1)[0];    
    return null;
}





