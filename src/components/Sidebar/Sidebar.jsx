import { useState } from "react";
import { assets } from "../../assets/assets";
import './sidebar.css'
const Sidebar = () => {

    const [extended,setExtended]=useState(false);

  return (
    <div className="sidebar">
      <div className="top">
        <img src={assets.menu_icon} className="menu" alt="menu-icon" onClick={()=>setExtended(prev=>!prev)}/>

        <div className="new-chat">
          <img src={assets.plus_icon} alt="plus-icon" />
          {extended?<p>New Chat</p>:null}
        </div>
        {extended?<div className="recent">
          <p className="recent-title">Recent</p>

          <div className="recent-entry">
            <img src={assets.message_icon} alt="message-icon" />
            <p >What is react...</p>
          </div>
        </div>
   
    :null}
        
    </div>
      <div className="bottom">
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt="help-icon" className="mt-10 "/>
          {extended?<p >Help </p>:null}
        </div>
        <div className="bottom-item recent-entry">
          <img src={assets.history_icon} alt="history-icon" />
          {extended?<p>History</p>:null}
        </div>
        <div className="bottom-item recent-entry">
          <img src={assets.setting_icon} alt="settings-icon" />
          {extended?<p>Settings</p>:null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
