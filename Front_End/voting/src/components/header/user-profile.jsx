
import React from 'react'
import { useNavigate } from 'react-router'

const UserProfile = ({userInfo}) => {
  const navigate = useNavigate()

  // logout
  const logout = () =>{
    localStorage.clear();
    navigate('/login',{replace:true})
  }

  return (
    <div className='flex items-center gap-2'>
        <div className='h-12 aspect-square border border-gray-800 flex items-center justify-center rounded-full bg-gray-100'>
            <span className='font-bold text-xl text-gray-700'>{userInfo?.first_name?.at(0) + userInfo?.last_name?.at(0)}</span>
        </div>
        <div>
            <p className='text-lg text-gray-900 font-semibold'>{userInfo?.first_name + ' ' + userInfo?.last_name}</p>
            <p onClick={logout} className='text-sm underline cursor-pointer w-fit text-red-500 font-semibold'>Logout</p>
        </div>
    </div>
  )
}

export default UserProfile