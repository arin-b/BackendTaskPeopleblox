import express from 'express'
import authRoutes from "./routes/authRoutes.js"
import authMiddleware from "./authMiddleware/authMiddleware.js"
import infoRoute from "./routes/infoRoute.js"


const app = express()
const port = process.env.PORT || 8000

app.use(express.json())

app.use(authRoutes)
app.use('/api/home', authMiddleware, infoRoute)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})