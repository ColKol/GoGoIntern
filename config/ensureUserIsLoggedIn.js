//For simply making sure the user is logged in so that they can view specific content
module.exports = {
    ensureAuthenticated: function (req, res, next){
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/')
        }
    }
}