import jwt from 'jsonwebtoken'

// we will use this middleware only for our home page API to ensure that user is logged in
function authMiddleware(req, res, next){
    const token = req.body  

    if (!token) {
        return res.status(401).json({message: "No token recieved"})
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({message: "Invalid token"})
        }
        req.userId = decoded.id   
        next()
    })
}

export default authMiddleware