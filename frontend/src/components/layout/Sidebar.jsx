import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileCheck2,
  Sparkles,
  ShoppingBag,
  Truck,
  PackageCheck,
  Receipt,
  Users2,
  AlertOctagon,
  BarChart3,
  FolderLock,
  History,
  Settings,
  Send,
  Boxes
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Sidebar = () => {
  const { user, isSupplier } = useAuth();

  const companyNavSections = [
    {
      title: 'CORE',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'PROCUREMENT',
      items: [
        { label: 'Requirements', path: '/purchase-requirements', icon: FileSpreadsheet },
        { label: 'RFQs', path: '/rfqs', icon: FileCheck2 },
        { label: 'Quotation AI Engine', path: '/quotations/compare', icon: Sparkles, badge: 'AI' },
        { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingBag }
      ]
    },
    {
      title: 'LOGISTICS & QC',
      items: [
        { label: 'Shipments', path: '/shipments', icon: Truck },
        { label: 'Goods Receipt (GRN)', path: '/deliveries', icon: PackageCheck }
      ]
    },
    {
      title: 'FINANCE & AUDIT',
      items: [
        { label: 'GST Invoices', path: '/invoices', icon: Receipt },
        { label: 'Audit Logs', path: '/audit-logs', icon: History }
      ]
    },
    {
      title: 'SUPPLIERS & INTEL',
      items: [
        { label: 'Supplier Directory', path: '/suppliers', icon: Users2 },
        { label: 'Price Anomalies', path: '/anomalies', icon: AlertOctagon, badge: 'AI' },
        { label: 'Analytics & Spend', path: '/analytics', icon: BarChart3 },
        { label: 'Document Vault', path: '/documents', icon: FolderLock }
      ]
    },
    {
      title: 'ADMIN',
      items: [
        { label: 'Settings & Weights', path: '/settings', icon: Settings }
      ]
    }
  ];

  const supplierNavSections = [
    {
      title: 'VENDOR PORTAL',
      items: [
        { label: 'Vendor Overview', path: '/supplier-portal', icon: LayoutDashboard },
        { label: 'Available RFQs', path: '/supplier-portal/rfqs', icon: FileCheck2 },
        { label: 'Submit Quotation', path: '/supplier-portal/quote', icon: Send },
        { label: 'Purchase Orders', path: '/supplier-portal/orders', icon: ShoppingBag },
        { label: 'Dispatch Shipment', path: '/supplier-portal/shipments', icon: Truck },
        { label: 'Upload Invoices', path: '/supplier-portal/invoices', icon: Receipt }
      ]
    }
  ];

  const sections = isSupplier ? supplierNavSections : companyNavSections;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
          <Boxes className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white">PROCURE<span className="text-brand-400">AI</span></span>
            <span className="text-[9px] uppercase tracking-wider font-bold bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded">SaaS</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Enterprise Supply Platform</p>
        </div>
      </div>

      {/* Nav Items List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 tracking-wider">{sec.title}</p>
            {sec.items.map((item, itemIdx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={itemIdx}
                  to={item.path}
                  end={item.path === '/dashboard' || item.path === '/supplier-portal'}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group
                    ${isActive
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      item.badge === 'AI' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Engine Status</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        </div>
      </div>
    </aside>
  );
};
