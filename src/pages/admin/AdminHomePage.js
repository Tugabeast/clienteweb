import React from 'react';
import MenuHamburguer from '../../components/MenuHamburguer';

const AdminHomePage = () => {
  return (
    <div style={{ display: 'flex' }}>
      <MenuHamburguer />
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>Admin Home</h1>
      </div>
    </div>
  );
};

export default AdminHomePage;
