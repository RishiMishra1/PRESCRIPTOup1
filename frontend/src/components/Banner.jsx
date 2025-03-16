import React from 'react'
import { assets } from '../assets/assets'
import {useNavigate} from 'react-router-dom'

const Banner = () => {
  const navigate=useNavigate()
  return (
    <div className='flex bg-primary rounded-lg px-6 md:px-14 sm:px-10 lg:px-12 my-20 md:mx-10'>
        {/*------LEFT SIDE------ */}
        <div className='flex-1 sm:py-10 md:py-16 lg:py-24 lg:pl-5 font-medium'>
            <div className='text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl'>
                <p >Book Appointment</p>
                <p className='mt-4'>With 100+ Trusted Doctors</p>
            </div>
            <button onClick={()=>{navigate('/login');scrollTo(0,0)}} className='bg-white text-sm mt-6 text-gray-600 px-8 py-3 rounded-full hover:scale-105 transition-all duration-500'>Create account</button>
        </div>

        {/*------RIGHT SIDE------ */}
        <div className='hidden md:block md:w-1/2 lg:w-[370px] relative'>
            <img className='w-full absolute bottom-0 right-0 max-w-md' src={assets.appointment_img} alt="" />
        </div>
    </div>
  )
}

export default Banner