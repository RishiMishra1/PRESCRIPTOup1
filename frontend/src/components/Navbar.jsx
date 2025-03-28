import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Chat from './Chat'; // Import the Chat component

const Navbar = () => {
    const { token, setToken, userData } = useContext(AppContext);
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [showChat, setShowChat] = useState(false); // State to toggle chatbot visibility

    const logout = () => {
        setToken(false);
        localStorage.removeItem('token');
    };

    return (
        <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
            <img onClick={() => navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt="" />
            <ul className='hidden md:flex items-start gap-5 font-med'>
                <NavLink to='/'>
                    <li className='py-1'>HOME</li>
                    <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
                </NavLink>
                <NavLink to='/doctors'>
                    <li className='py-1'>ALL DOCTORS</li>
                    <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
                </NavLink>
                <NavLink to='/about'>
                    <li className='py-1'>ABOUT</li>
                    <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
                </NavLink>
                <NavLink to='/contact'>
                    <li className='py-1'>CONTACT</li>
                    <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
                </NavLink>
            </ul>
            <div className='flex items-center gap-4'>
                {token ? (
                    <div className='flex items-center gap-2 cursor-pointer group relative'>
                        <img className='w-8 rounded-full' src={userData.image} alt="" />
                        <img className='w-2.5' src={assets.dropdown_icon} alt="" />
                        <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
                            <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                                <p onClick={() => navigate('/my-profile')} className='hover:text-black'>My Profile</p>
                                <p onClick={() => navigate('/my-appointments')} className='hover:text-black'>My Appointments</p>
                                <p onClick={logout} className='hover:text-black'>Logout</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>Create Account</button>
                )}
                <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />
                {/* Mobile Menu */}
                <div className={`${showMenu ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
                    <div className='flex items-center px-5 py-6 justify-between'>
                        <img className='w-36' src={assets.logo} alt="" />
                        <img className='w-7' onClick={() => setShowMenu(false)} src={assets.cross_icon} alt="" />
                    </div>
                    <ul className='flex flex-col items-center mt-5 px-5 gap-2 text-lg font-medium'>
                        <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-4 py-2 rounded inline-block'>Home</p></NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/doctors'><p className='px-4 py-2 rounded inline-block'>All DOCTORS</p></NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/about'><p className='px-4 py-2 rounded inline-block'>ABOUT</p></NavLink>
                        {!token? <NavLink onClick={() => setShowMenu(false)} to='/login' className='px-4 py-2 rounded inline-block'>CREATE ACCOUNT</NavLink>:""}
                        <NavLink onClick={() => setShowMenu(false)} to='/contact'><p className='px-4 py-2 rounded inline-block'>CONTACT</p></NavLink>
                    </ul>
                </div>
            </div>

            {/* Chatbot Icon (Always visible) */}
            <div className='fixed bottom-5 right-5'>
                <button
                    onClick={() => setShowChat(!showChat)} // Toggle visibility of the chatbox
                    className='bg-slate-200 text-white p-3 rounded-full shadow-lg hover:bg-primary-dark transition-all'>
                    <img src={assets.chats_icon} alt="Chatbot" className="w-8 h-8" />
                </button>
            </div>

            {/* Chatbot UI */}
            {showChat && (
                <div className='fixed bottom-0 right-0 w-96 h-96 bg-transparent border-none z-50'>
                    <Chat closeChat={() => setShowChat(false)} /> {/* Pass the closeChat function to Chat */}
                </div>
            )}
        </div>
    );
};

export default Navbar;
