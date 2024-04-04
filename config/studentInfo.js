//For simply making sure the student user actually has their CV + Interests on the page :)
module.exports = {
    studentInfo: function (req, res, next){
        if(req.isAuthenticated()){
            if (req.user.firstTime === true) {
                req.session.newUser = req.user;
                return next();
            }
        } else if(req.session.newUser){
            return next();
        } else {
            res.redirect('/users/register')
        }
    }
}