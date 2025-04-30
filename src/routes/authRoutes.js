import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "../prismaClient.js"

// contains apis for register and login
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
    const {username, password} = req.body

    try{
        const user  = await prisma.user.findUnique({
            where: {
                username
            }
        })

        // Step 1: Check if user exists
        if (!user) {
            return res.status(401).json({ message: "User not found"})
        }

        // Step 2: Check if user is locked out or not 
        const lockedDuration = (user.lockedTimestamp - Date.now())/2.7778e-7 //convert milliseconds to hours
        if ( lockedDuration > 24){
            await prisma.post.update({
                where: { id: user.id },
                data: { isLocked: false },
              })
        }
        else{
            return res.send(403).json({message: "Your account is currently locked."})
        }

        // Step 3: Check if user already has 5 failed attempts. 
        // We will basically retrieve the first and last elements of the array, check their difference and then decide whether to allow user ahead or not

        // we will also need to remove items from the failedAttempts array in case they are more than 12 hours old.

        // Step 4: Check if password is valid i.e. login has succeeded
        const passwordIsValid = await bcrypt.compare(password, user.password)

        if (!passwordIsValid){
            // Step 5: Password is invalid. Add current timestamp to failedAttempts array
            try{
                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        failedAttempts: {
                            push: Date.now()
                        }
                    }
                })
            } catch{
                return res.status(503)
            }
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


// router.get('/api/home', async (req, res) => {
//     const {username, password} = req.body

//     try{
//         const user = prisma.user.findUnique({
//             where: {
//                 username
//             }
//         })

//         res.json({"username": username, "password": password})
//     }
//     catch(err){
//         console.error(err)
//         res.sendStatus(503)
//     }
// })

export default router