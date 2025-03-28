import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'
import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';




// api call to register user

const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.json({ success: false, message: "missing details" })

        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "enter a valid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "enter a strong password" })
        }

        // hashing user's password 
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,

        }

        const newUser = new userModel(userData)
        const user = await newUser.save();

        //creating token form _id
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error })

    }
}

//api for user login

const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "user doesn't exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }



    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error })
    }
}

//api to get user profile data

const getProfile = async (req, res) => {
    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to update user profile

const updateProfile = async (req, res) => {
    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !address || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {
            //upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })

            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })

        }
        res.json({ success: true, message: 'profile updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

//api to book appointment

const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body;

        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available) {
            return res.json({ success: false, message: "Doctor is not available" })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availability

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {

                return res.json({ success: false, message: "Slot is not available" })
            } else {
                slots_booked[slotDate].push(slotTime)

            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)

        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        //save new slots data in docData

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        res.json({ success: true, message: 'Appointment booked' })
    } catch (error) {

    }
}


const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body;
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId)

        //verify appointment user

        if (appointmentData.userId != userId) {
            return res.json({ success: false, message: "unauthorized action" })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctors slot

        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked;

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e != slotTime)
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: "Appointment Cancelled" })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}
//API to make payment of appointment using razorpay
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})
const paymentRazorpay = async (req, res) => {

    try {
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment cancelled or not found" })

        }

        //creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,

        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)
        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//api to verify the payment of razorpay
const verifyRazorpay=async (req,res)=>{
    try {
        const {razorpay_order_id}=req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        

        if(orderInfo.status === 'paid'){
                await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
                res.json({success:true,message:"Payment Successfull"})
        }else{
            res.json({success:false,message:"payment failed"})
            
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}



import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateReceipt = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        const receiptsDir = path.join(__dirname, "../receipts");
        if (!fs.existsSync(receiptsDir)) {
            fs.mkdirSync(receiptsDir, { recursive: true });
        }

        const filePath = path.join(receiptsDir, `receipt_${appointmentId}.pdf`);
        const doc = new PDFDocument({ margin: 50 });

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // **✅ Add Prescripto Logo**
        const logoPath = path.join(__dirname, "../assets/logo.png"); // Update path as needed
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 220, 30, { width: 150 }).moveDown(2); // Adjust positioning
        }

        // **Header**
        doc
            .fontSize(22)
            .fillColor("#333")
            .text("Payment Receipt", { align: "center" })
            .moveDown();

        // **Divider**
        

        // **Table Format**
        const tableData = [
            ["Receipt ID", appointmentId],
            ["Patient Name", appointmentData.userData.name],
            ["Doctor", appointmentData.docData.name],
            ["Appointment Date", appointmentData.slotDate],
            ["Appointment Time", appointmentData.slotTime],
            ["Amount Paid", `₹${appointmentData.amount}`],
            ["Payment Status", "✅ Completed"]
        ];

        const startX = 50, startY = doc.y, cellWidth = 250, cellHeight = 30;
        
        tableData.forEach(([label, value], i) => {
            const y = startY + i * cellHeight;
            doc
                .fontSize(12)
                .fillColor("#444")
                .rect(startX, y, cellWidth, cellHeight).stroke()
                .rect(startX + cellWidth, y, cellWidth, cellHeight).stroke()
                .fillColor("#000")
                .text(label, startX + 10, y + 10)
                .text(value, startX + cellWidth + 10, y + 10);
        });

        doc.moveDown(2);

        // **Thank You Message**
        doc
            .fontSize(12)
            .fillColor("#555")
            .text("Thank you for using Prescripto!", { align: "center" })
            .moveDown();

        // **Footer with Contact Info**
        doc
            .fillColor("#777")
            .fontSize(10)
            .text("For queries, contact us at support@prescripto.com", { align: "center" });

        doc.end();

        writeStream.on("finish", () => {
            res.download(filePath, `receipt_${appointmentId}.pdf`, (err) => {
                if (err) {
                    console.error("Error downloading file:", err);
                    return res.status(500).json({ success: false, message: "Error downloading receipt" });
                }
                setTimeout(() => fs.unlink(filePath, (err) => err && console.error("Error deleting file:", err)), 10000);
            });
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};







export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment ,paymentRazorpay,verifyRazorpay,generateReceipt}