//For simply making sure the student user actually has their CV + Interests on the page :)
module.exports = {
    checkIfStudentInfoThere: function (req, res, next){
        if (!req.user.firstTime) {
            return next();
        } else {
            if(req.user.userType === "student"){
                res.redirect('/users/registration/studentQuestionnare')
            } else {
                res.redirect('/users/registration/businessQuestionnare')
            }
        }
    }
}