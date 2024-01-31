//For simply making sure the student user actually has their CV + Interests on the page :)
module.exports = {
    checkIfStudentInfoThere: function (req, res, next){
        if (!req.user.firstTime) {
            return next();
        } else {
            console.log("Please Log In To view these resources")
            res.redirect('/users/registration/studentQuestionnare')
        }
    }
}