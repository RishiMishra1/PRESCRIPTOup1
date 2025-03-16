import React, { useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { useState } from 'react'

const Doctors = () => {
  const {speciality}=useParams()
  const [showFilters,setShowFilters]=useState(false)
  const [filterDoc,setFilterDoc]=useState([])
  const navigate=useNavigate();

  const {doctors}=useContext(AppContext)

  const applyFilter=()=>{
    if(speciality){
      setFilterDoc(doctors.filter((doc)=> doc.speciality===speciality))
    }else{
      setFilterDoc(doctors)
    }
  }

  useEffect(()=>{
    applyFilter();
  },[doctors,speciality])
  return (
    <div className=''>
      <p className='text-gray-600'>Browse through the doctors specialist.</p>
      <div className='flex flex-col sm:flex-row gap-5 items-start mt-5'>
        <button onClick={()=>setShowFilters(prev=>!prev)} className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilters ? 'bg-primary text-white':''}`}>Filters</button>
        <div className={` flex-col gap-4 text-sm text-gray-600 ${showFilters ? 'flex':'sm:flex hidden'}`}>
          <p onClick={()=>speciality==='General physician' ? navigate('/doctors') : navigate('/doctors/General physician')} className={`w-[94vw] sm:w-auto border-gray-600 px-6 py-2 rounded-xl bg-slate-100 mt-1 cursor-pointer hover:bg-primary hover:text-white ${speciality==="General physician" ? "bg-indigo-100 text-black":""}`}>General physician</p>
          <p onClick={()=>speciality==='Gynecologist' ? navigate('/doctors') : navigate('/doctors/Gynecologist')} className={`w-[94vw] sm:w-auto border-gray-600 px-6 py-2 rounded-xl bg-slate-100 mt-1 cursor-pointer hover:bg-primary hover:text-white ${speciality==="Gynaecologist" ? "bg-indigo-100 text-black":""}`}>Gynecologist</p>
          <p onClick={()=>speciality==='Dermatologist' ? navigate('/doctors') : navigate('/doctors/Dermatologist')} className={`w-[94vw] sm:w-auto border-gray-600 px-6 py-2 rounded-xl bg-slate-100 mt-1 cursor-pointer hover:bg-primary hover:text-white ${speciality==="Dermatologist" ? "bg-indigo-100 text-black":""}`}>Dermatologist</p>
          <p onClick={()=>speciality==='Pediatrician' ? navigate('/doctors') : navigate('/doctors/Pediatricians')} className={`w-[94vw] sm:w-auto border-gray-600 px-6 py-2 rounded-xl bg-slate-100 mt-1 cursor-pointer hover:bg-primary hover:text-white ${speciality==="Pediatricians" ? "bg-indigo-100 text-black":""}`}>Pediatrician</p>
          <p onClick={()=>speciality==='Neurologist' ? navigate('/doctors') : navigate('/doctors/Neurologist')} className={`w-[94vw] sm:w-auto border-gray-600 px-6 py-2 rounded-xl bg-slate-100 mt-1 cursor-pointer hover:bg-primary hover:text-white ${speciality==="Neurologist" ? "bg-indigo-100 text-black":""}`}>Neurologist</p>
          <p onClick={()=>speciality==='Gastroenterologist' ? navigate('/doctors') : navigate('/doctors/Gastroenterologist')} className={`w-[94vw] sm:w-auto border-gray-600 px-6 py-2 rounded-xl bg-slate-100 mt-1 cursor-pointer hover:bg-primary hover:text-white ${speciality==="Gastroenterologist   " ? "bg-indigo-100 text-black":""}`}>Gastroenterologist</p>
        </div>
        <div className='grid grid-cols-auto gap-y-6 gap-4  w-full'>
          {
            filterDoc.map((item,index)=>( 
              <div onClick={()=>{navigate(`/appointment/${item._id}`)}} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'  key={index}>
                  <img className='bg-blue-50' src={item.image} alt="" />
                  <div className='p-4'>
                  <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : 'text-gray-500'} `}>
                                <p className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-gray-500'}  rounded-full`}></p><p>{item.available ? 'Available' : 'Not Available'}</p>
                            </div>
                      <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                      <p className='text-gray-600 text-sm'>{item.speciality}</p>
                  </div>
              </div>
          ))
          }
        </div>
      </div>
    </div>
  )
}

export default Doctors