import React from 'react';
import MenuHamburguer from '../../components/MenuHamburguer';

const InvestigatorHomePage = () => {
  return (
    <div style={{ display: 'flex' }}>
      <MenuHamburguer />
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>Home do Investigador</h1>
      </div>
    </div>
  );
};

export default InvestigatorHomePage;
