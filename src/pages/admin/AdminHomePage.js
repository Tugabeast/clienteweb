import React, { useContext } from 'react';
import MenuHamburguer from '../../components/MenuHamburguer';
import { AuthContext } from '../../context/AuthContext';

const AdminHomePage = () => {
  const { username } = useContext(AuthContext);

  return (
    <div style={{ display: 'flex' }}>
      <MenuHamburguer />
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>Bem-vindo administrador {username},</h1>
        <h1>Tem várias páginas ao seu dispor, bom trabalho!!</h1>
      </div>
    </div>
  );
};

export default AdminHomePage;
