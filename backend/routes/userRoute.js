import express from 'express'
import { registerUser,loginUser, getProfile, updateProfile,bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay, generateReceipt } from '../controllers/userController.js'
import authUser from "../middlewares/authUser.js"
import upload from '../middlewares/multer.js'


const userRoute=express.Router()

userRoute.post('/register',registerUser)
userRoute.post('/login',loginUser)
userRoute.get('/get-profile',authUser,getProfile)
userRoute.post('/update-profile',upload.single('image'),authUser,updateProfile)

userRoute.post('/book-appointment',authUser,bookAppointment)

userRoute.get('/appointments',authUser,listAppointment)

userRoute.post('/cancel-appointment',authUser,cancelAppointment)

userRoute.post('/payment-razorpay',authUser,paymentRazorpay)

userRoute.post('/verify-razorpay',authUser,verifyRazorpay)

userRoute.post('/download-receipt',generateReceipt)

export default userRoute;

