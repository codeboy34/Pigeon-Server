
var userManager = require('../socket/UserManager.js')
            

function getTableContent(){

    var allUsers = userManager.getLogdedUsers()
    var content = ""

    var userKeys = Object.keys(allUsers)
 
    userKeys.forEach(function(key,index){

        var userObj = allUsers[key]
        content = content.concat("<tr>")
        content =content.concat("<td>"+userObj.user.user_phone_number+"</td>")
        var date = new Date(userObj.timestamp)
        content =content.concat("<td>"+date.getHours()+" "+date.getMinutes()+" "+date.getSeconds()+"</td>")  
        content =content.concat("<td>Online</td>")  
        content =content.concat("</tr>")  
       
    })
    return content;
}

module.exports = getTableContent;
