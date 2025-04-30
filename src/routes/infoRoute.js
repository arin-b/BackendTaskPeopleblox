import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "../prismaClient.js"

// created separate file for this api since we need to authenticate it first using jwt

const router = express.Router()

router.get('/api/home', async (req, res) => {
    const { id } = req.body

    try{
        const user = prisma.user.findUnique({
            where: {
                id
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