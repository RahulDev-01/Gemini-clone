import React from 'react'
import './main.css'
import { assets } from '../../assets/assets'
function Main() {
  return (
    <div className='main'>
        <div className='nav'>
            <p>Gemini</p>
            <img src={assets.user_icon} alt="" />
        </div>
        <div className="main-container">
            <div className="greet">
                <p><span>Hello,Rahul</span></p>
                <p>How can I Help You Today ?</p>
            </div>
            <div className='cards'>
                <div className="card">
                    <p>Suggest beautiful places to see on an upcoming road trip</p>
                    <img src={assets.compass_icon} alt="" />
                </div>
                <div className="card">
                    <p>Explain the process of photosynthesis in simple terms</p>
                    <img src={assets.message_icon} alt="" />
                </div>
                <div className="card">
                    <p>How do you create a responsive navbar using CSS and JavaScript?</p>
                    <img src={assets.bulb_icon} alt="" />
                </div>
                <div className="card">
                    <p>What are some essential skills for becoming a front-end developer?</p>
                    <img src={assets.code_icon} alt="" />
                </div>
            </div>
            <div className="main-bottom">
                <div className="search-box">
                    <input type="text" placeholder='Enter a prompt here' />
                    <div>
                        <img src={assets.gallery_icon} alt="" />
                        <img src={assets.menu_icon} alt="" />
                        <img src={assets.send_icon} alt="" />
                    </div>
                </div>
                <p className='bottom-info'>Gemini may display inaccurate info, including about people, so double-check its responses. Your privacy & Gemini Apps</p>
            </div>
        </div>
    </div>
  )
}

export default Main