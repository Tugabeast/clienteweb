import React, { useContext } from 'react';
import MenuHamburguer from '../../components/MenuHamburguer';
import { AuthContext } from '../../context/AuthContext';

const UserHomePage = () => {
  const { username } = useContext(AuthContext);

  return (
    <div style={{ display: 'flex' }}>
      <MenuHamburguer />
      <div style={{ flex: 1, padding: '20px' }}>
        <h1 style={{textAlign: 'start'}}>Bem-vindo utilizador {username},</h1>
        <h1 style={{textAlign: 'start'}}>Tem várias páginas ao seu dispor, bom trabalho!!</h1>
      </div>
    </div>
  );
};

export default UserHomePage;
