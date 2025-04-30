import express from 'express'
import authRoutes from "./routes/authRoutes.js"
import authMiddleware from "./authMiddleware/authMiddleware.js"
import infoRoute from "./routes/infoRoute.js"
//import { PrismaClient } from "@prisma/client"

//const prisma = new PrismaClient()


const app = express()
const port = 8000

app.use(express.json())

app.use(authRoutes)
app.use(authMiddleware, infoRoute)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})