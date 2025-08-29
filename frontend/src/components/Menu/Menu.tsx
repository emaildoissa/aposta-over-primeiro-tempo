// src/components/Menu/Menu.tsx
import { NavLink } from 'react-router-dom';
import styles from './Menu.module.css';

// NavLink é um tipo especial de Link que sabe se está "ativo" ou não,
// permitindo estilizar a página atual de forma diferente.
const Menu = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <span className={styles.logo}>BetAnalyzer</span>
        <ul className={styles.navList}>
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/cadastro" 
              className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
            >
              Cadastro Principal 
            </NavLink>
          </li>
         <li>
            <NavLink 
              to="/recovery" 
              className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
            >
              Aposta Recovery
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Menu;