import express from "express"
import prisma from "../prismaClient.js"

// created separate file for this api since we need to authenticate it first using jwt

const router = express.Router()

router.get('/', async (req, res) => {
    const { userId } = req.userId

    try{
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                username
            }
        })

        if(!user){ // in case the user was deleted after the token was created
            return res.status(404).json({message: "User not found"})
        }

        res.json({ message: `Welcome, ${user.username}` })    
    }
    catch(err){
        console.error(err)
        res.status(500).json({message: "Server error while retrieveing data. "})
    }
})

export default router