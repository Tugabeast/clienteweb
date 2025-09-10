import React from 'react';
import MenuHamburguer from '../../components/MenuHamburguer';

const UserHomePage = () => {
  return (
    <div style={{ display: 'flex' }}>
      <MenuHamburguer />
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>Bem-vindo à Home do Utilizador</h1>
      </div>
    </div>
  );
};

export default UserHomePage;
