import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ items }) => {
  return (
    <aside className="w-64 min-h-screen bg-dark-surface border-r border-dark-border hidden lg:block p-4">
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all
              ${isActive ? 'bg-primary/10 text-primary' : 'text-light-muted hover:bg-white/5 hover:text-white'}
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;