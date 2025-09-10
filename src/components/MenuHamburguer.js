import React, { useContext } from 'react';
import {
  Sidebar,
  Menu,
  MenuItem,
  useProSidebar,
} from 'react-pro-sidebar';

import {
  FaHome,
  FaStar,
  FaList,
  FaChartBar,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUsers,
  FaBook,
  FaFileAlt,
  FaQuestion
} from 'react-icons/fa';
import { HiUserGroup } from "react-icons/hi2";
import { useNavigate } from 'react-router-dom';
import '../styles/MenuHamburguer.css';
import { AuthContext } from '../context/AuthContext';

const MenuHamburguer = () => {
  const { collapseSidebar, collapsed } = useProSidebar();
  const navigate = useNavigate();
  const { userType, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-container">
      <Sidebar
        collapsed={collapsed}
        width="250px"
        collapsedWidth="80px"
        className="custom-sidebar"
      >
        <div className="sidebar-toggle">
          <button
            className="hamburger-button"
            onClick={() => collapseSidebar(!collapsed)}
          >
            {collapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
          </button>
        </div>

        <Menu>
          <MenuItem icon={<FaHome size={18} />} onClick={() => navigate('/home')}>
            Home
          </MenuItem>

          {userType === 'admin' && (
            <>
              <MenuItem icon={<FaUsers size={18} />} onClick={() => navigate('/admin/users')}>
                Users
              </MenuItem>
              <MenuItem icon={<FaUser size={18} />} onClick={() => navigate('/admin/profile')}>
                Profile
              </MenuItem>
            </>
          )}

          {userType === 'investigator' && (
            <>
              <MenuItem icon={<FaBook size={18} />} onClick={() => navigate('/investigator/studies')}>
                Estudos
              </MenuItem>
              <MenuItem icon={<FaList size={18} />} onClick={() => navigate('/investigator/categories')}>
                Categorias
              </MenuItem>
              <MenuItem icon={<FaQuestion size={18} />} onClick={() => navigate('/investigator/questions')}>
                Perguntas
              </MenuItem>
              <MenuItem icon={<FaFileAlt size={18} />} onClick={() => navigate('/investigator/posts')}>
                Posts
              </MenuItem>
              <MenuItem icon={<HiUserGroup size={18} />} onClick={() => navigate('/investigator/groups')}>
                Grupos
              </MenuItem>
              <MenuItem icon={<FaChartBar size={18} />} onClick={() => navigate('/statistics')}>
                Estatísticas
              </MenuItem>
              <MenuItem icon={<FaUser size={18} />} onClick={() => navigate('/investigator/profile')}>
                Perfil
              </MenuItem>
            </>
          )}

          {userType === 'user' && (
            <>
              <MenuItem icon={<FaChartBar size={18} />} onClick={() => navigate('/statistics')}>
                Estatísticas
              </MenuItem>
              <MenuItem icon={<FaUser size={18} />} onClick={() => navigate('/profile')}>
                Perfil
              </MenuItem>
            </>
          )}


          <MenuItem icon={<FaSignOutAlt size={18} />} onClick={handleLogout}>
            Sair
          </MenuItem>
        </Menu>
      </Sidebar>
    </div>
  );
};

export default MenuHamburguer;