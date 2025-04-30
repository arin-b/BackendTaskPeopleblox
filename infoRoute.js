import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "./prismaClient.js"


const router = express.Router()

router.get('/api/home', async (req, res) => {
    const {username, password} = req.body

    try{
        const user = prisma.user.findUnique({
            where: {
                username
            }
        })

        res.json({"username": username, "password": password})
    }
    catch(err){
        console.error(err)
        res.sendStatus(503)
    }
})

export default router