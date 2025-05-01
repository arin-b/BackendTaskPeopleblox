import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "../prismaClient.js"

// contains apis for register and login
const router = express.Router()


// register API
router.post('/api/register', async (req, res) => {
    const {username, password} = req.body

    if (!username || !password){
        return res.send(400).json({message: "Username or password field cannot be blank."})
    }

    const hashedPassword = await bcrypt.hash(password, 8)

    try{
        // first we will check if the user already exists
        const isUserExisting = await prisma.user.findUnique({
            where: {
                username
            }
        })
        if (isUserExisting){
            return res.status(409).json({message: "Username already exists"})
        }

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })

        // here instead of giving token immediately on registration, I have asked user to login to gain access
        // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })  (old code)
        res.status(201).json({message: "User registered successfully. Please login with new credentials."})

    }catch(err){
        console.error(err)
        return res.status(500).json({message: "Registration failed due to error in server."})
    }
})



// login API
router.post('/api/login', async (req, res) => {
    const {username, password} = req.body

    if (!username || !password){
        return res.send(400).json({message: "Username or password field cannot be blank."})
    }

    try{
        let user  = await prisma.user.findUnique({  // have changed 'const' to 'let' so that we can edit user's properties without declaring another variable
            where: {
                username
            }
        })

        // Step 1: Check if user exists
        if (!user) {
            return res.status(401).json({ message: "User not found"})
        }

        // Step 2: Check if user is locked out or not 
        if (user.isLocked){
            const hourToMs = 60*60*1000 // convert hour to milliseconds (DateTime stores time in milliseconds)
            const lockTimestamp = user.lockedTimestamp.getTime()
            const unlockingTime = lockTimestamp + (hourToMs * 24) // we are checking for 24 hours
            const currentTime = Date.now()

            if(currentTime < unlockingTime){  // this means account is still locked
                const remainingTime = unlockingTime - currentTime // this answer is in milliseconds
                const remainingHours = Math.ceil(remainingTime/(1000*60*60))  // convert to number of hours
                return res.status(403).json({message: `Account is temporarily locked due to multiple failed login attempts. Try again in approx. ${remainingHours} hours.`})
            }
            else {  // this means 24hrs have passed. We need to unlock the account
                user = await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        isLocked: false,
                        failedAttempts: [] // reset array to empty after unlocking
                    }
                })
            }
        }

        // Step 3: Check if password is valid i.e. login has succeeded
        const passwordIsValid = await bcrypt.compare(password, user.password)

        if (!passwordIsValid){
            // Step 4: Password is invalid. Add current timestamp to failedAttempts array
            const hourToMs = 60*60*1000
            const now = new Date()
            const last12hours = new Date(now.getTime() - (hourToMs*12))  // find the limit of the last 12 horus

            // we need to remove attempts older than 12 hours
            const recentFailedAttempts = user.failedAttempts.filter(attempt => attempt.getTime() >= last12hours.getTime());
            // add timestamp for current d=failed attempt
            const updatedFailedAttempts = [...recentFailedAttempts, now]  

            // check if user has reached 5 failed attempts limit
            const shouldLockAccount = updatedFailedAttempts.length >= 5 // stores a boolean value of whether we should lock the account or not
            
            // creating a json object to contain the updated user information
            const dataToUpdate = {
                failedAttempts: updatedFailedAttempts  // we will update our failedAttempts array
            }

            // check if we need to lock the user's account
            if (shouldLockAccount){
                const now = new Date()
                dataToUpdate.isLocked = true;
                dataToUpdate.lockedTimestamp = now;
                console.log(`User ${username} locked due to 5 failed attempts within 12 hours.`);
            }

            try{
                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: dataToUpdate
                })

            } catch{
                return res.status(503)
            }
            return res.status(401).json({ message: "Invalid Credentials"})
        }

        // Step 6: Login is successful (we will reset the number of failed attempts to 0)
        if (user.failedAttempts.length > 0) { 
            await prisma.user.update({ 
                where: { 
                    id: user.id 
                },
                data: { 
                    failedAttempts: [] 
                } 
            });
       }
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'})
        res.json({token})

    }
    catch(err){
        console.error(err)
        res.sendStatus(503)
    }
})

export default router