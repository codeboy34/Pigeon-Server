
const users = {}


function addUser(user){

    if(users[user.user_phone_number])
        delete users[user.user_phone_number]
        
     users[user.user_phone_number] = user
}


function getLogdedUsers(){
    return users;
}


function removeUser(user_phone_number){
    delete users[user_phone_number]

}

function isUserAuthenticated(phone_number){
    return users[phone_number] != undefined
}

function getUser(user_phone_number){
    return users[user_phone_number]
}

function getSocketId(user_phone_number){
    return users[user_phone_number].socket_id
}


module.exports = {
    addUser             :addUser,
    getLogdedUsers      :getLogdedUsers,
    removeUser          :removeUser,
    isUserAuthenticated:isUserAuthenticated,
    getSocketId         :getSocketId,
    getUser             :getUser
}