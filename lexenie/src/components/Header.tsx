import React from 'react';
import Logo from './Logo';
import Login from './Login';
import UserSettings from './UserSettings';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  loggedIn: boolean;
}

const Header: React.FC<HeaderProps> = ({ loggedIn }) => {
  return (
    <div className='flex justify-between align-middle w-full px-12'>
      {loggedIn ? <UserSettings/> : <Login/>}
      <Logo/>
      <LanguageSelector/>
    </div>
  );
};

export default Header;
