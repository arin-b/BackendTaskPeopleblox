import jwt from 'jsonwebtoken'

// we will use this middleware only for our home page API to ensure that user is logged in
function authMiddleware(req, res, next){
    const authHeader = req.headers['authorization'] 
    const token = authHeader && authHeader.split(' ')[1]  // only for this line I too help of copilot since I was initially not able to understand how to access the bearer token
    

    if (!token) {
        return res.status(401).json({message: "No token recieved"})
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') { 
                return res.status(401).json({ message: 'Token expired' }); 
             }
             return res.status(401).json({message: "Invalid token"}) 
         }
        req.userId = decoded.id   
        next()
    })
}

export default authMiddleware