import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "./prismaClient.js"

const router = express.Router()

router.post('/api/register', async (req, res) => {
    const {username, password} = req.body

    if (!username || !password){
        return res.send(401).json({message: "Username or password field cannot be blank."})
    }

    const hashedPassword = await bcrypt.hash(password, 8)

    try{
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json(token)

    }catch(err){
        console.error(err)
        return res.sendStatus(503)
    }
})

router.post('/api/login', async (req, res) => {
    const {username, password, failedAttempts} = req.body

    try{
        const user  = await prisma.user.findUnique({
            where: {
                username
            }
        })

        if (!user) {
            return res.status(401).json({ message: "User not found"})
        }

        const passwordIsValid = await bcrypt.compare(password, user.password)

        if (!passwordIsValid){
            return res.status(401).json({ message: "Invalid Password"})
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'})
        res.json({token})

    }
    catch(err){
        console.error(err)
        res.sendStatus(503)
    }
})


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