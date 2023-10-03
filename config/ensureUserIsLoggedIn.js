//For simply making sure the user is logged in so that they can view specific content
module.exports = {
    ensureAuthenticated: function (req, res, next){
        if (req.isAuthenticated()) {
            return next();
        } else {
            console.log("Please Log In To view these resources")
            res.redirect('/users/login')
        }
    }
}