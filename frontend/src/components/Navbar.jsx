import React, { useState } from 'react';
import { LogOut, ChevronDown, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export function Navbar() {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(null);

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    {
      label: 'Gestión',
      icon: '👥',
      submenu: [
        { label: 'Residentes', path: '/residents' },
        { label: 'Unidades', path: '/units' },
        { label: 'Parqueaderos', path: '/parking' },
        { label: 'Bodegas', path: '/storage' },
        { label: 'Documentos', path: '/documents' }
      ]
    },
    {
      label: 'Financiero',
      icon: '💰',
      submenu: [
        { label: 'Cobranza', path: '/billing' },
        { label: 'Contabilidad', path: '/finance' },
        { label: 'Presupuesto', path: '/budget' }
      ]
    },
    {
      label: 'Operaciones',
      icon: '🔧',
      submenu: [
        { label: 'Mantenimiento', path: '/maintenance' },
        { label: 'Proveedores', path: '/suppliers' },
        { label: 'Compras', path: '/purchases' }
      ]
    },
    {
      label: 'Comunicación',
      icon: '📢',
      submenu: [
        { label: 'Comunicados', path: '/communications' },
        { label: 'Asambleas', path: '/assemblies' },
        { label: 'Visitantes', path: '/visitors' },
        { label: 'Seguridad', path: '/security' }
      ]
    },
    {
      label: 'Administración',
      icon: '⚙️',
      submenu: [
        { label: 'Personal', path: '/employees' },
        { label: 'Reportes', path: '/reports' }
      ]
    }
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold flex items-center gap-2">
            🏢 Condominios
          </Link>

          <div className="flex gap-1 items-center flex-1 ml-8">
            {menuItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.submenu ? (
                  <button
                    className="hover:bg-blue-700 px-3 py-2 rounded flex items-center gap-1 transition text-sm"
                    onMouseEnter={() => setOpenMenu(item.label)}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                    <ChevronDown size={14} />
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className="hover:bg-blue-700 px-3 py-2 rounded flex items-center gap-1 transition text-sm"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                )}

                {item.submenu && openMenu === item.label && (
                  <div
                    className="absolute left-0 mt-0 w-48 bg-white text-gray-800 rounded shadow-lg z-50 py-1"
                    onMouseEnter={() => setOpenMenu(item.label)}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.path}
                        to={subitem.path}
                        className="block px-4 py-2 hover:bg-gray-100 transition text-sm"
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">{user?.username}</span>
              <p className="text-xs text-blue-100">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2 transition text-sm"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
