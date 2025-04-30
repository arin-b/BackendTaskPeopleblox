import express from 'express'
import authRoutes from "./authRoutes.js"
//import { PrismaClient } from "@prisma/client"

//const prisma = new PrismaClient()


const app = express()
const port = 8000

app.use(express.json())

app.use(authRoutes)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})