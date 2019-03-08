exports.getLogin = (req, res, next) => {
    /* Before Session:
    // console.log(req.get('Cookie'));                       
    const isLoggedIn = req
        .get('Cookie')
        .trim()
        .split('=')[1] === 'true';
    // console.log(isLoggedIn);   
    */                    
    console.log(req.session.isLoggedIn)
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        // isAuthenticated: isLoggedIn // Before Session
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    req.session.isLoggedIn = true;
    res.redirect('/');
};