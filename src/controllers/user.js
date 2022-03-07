const userModel = require('../models/user/User')

module.exports = {
    // just some tests -> no idea if it works/if it's right
    /*
        accessLevel (number)
        email (string)
        notifications (array of map)
        title (string)
        description (string)
        myAnswers (array of map)
        answerDocId (string)
        accessLevel (number) 
        progress (number)
        total (number)
        testType(string)
        testTitle(string)
        testDocId(string)
        updateDate(string)
        testAuthorName(string)
    */
    getUsers: async payload => {
        try{
            payload = Object.assign(payload, { collection: "users" });
        } catch(e){
            return new InternalError(e.code)
        }
    },
    updateMyTest: async payload=> {
        try{
            payload = Object.assign(payload, {
                collection: "users",
                param: "myTests",
              });        
        }
        catch{
            return new InternalError(e.code)
        }
    }

}