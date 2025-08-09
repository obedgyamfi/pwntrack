'use client'; // This component uses client-side hooks like usePathname

import React from 'react';
import Link from 'next/link'; // Import Link
import { usePathname } from 'next/navigation'; // Import usePathname
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';

// Define props interface for clarity and type-safety
interface SidebarProps {
  currentPage: string; // This will now be derived from pathname
  setCurrentPage?: (pageId: string) => void; // Optional, only used for mobile sheet close logic
  closeSheet?: () => void; // Optional, used for closing mobile sheet
  isExpanded: boolean;
  toggleSidebar: () => void;
  navItems: { id: string; label: string; icon: React.ElementType; href: string }[]; // Added href
}

const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  toggleSidebar,
  navItems,
  closeSheet,
}) => {
  const pathname = usePathname(); // Get current pathname

  return (
    <div className={`flex flex-col h-full bg-card border-r transition-all duration-300 ease-in-out ${isExpanded ? 'w-72 p-4' : 'w-20 p-2'}`}>
      <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} p-2 mb-6`}>
        {isExpanded && <h2 className="text-2xl font-bold text-primary whitespace-nowrap overflow-hidden">PwnTrack</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-muted-foreground hover:text-primary rounded-full"
        >
          {isExpanded ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          // FIX: Wrap the entire Button with Link directly, remove legacyBehavior and passHref
          <Link key={item.id} href={item.href} onClick={closeSheet}>
            <Button
              variant={pathname.startsWith(item.href) ? "secondary" : "ghost"} // Highlight based on pathname
              className={`w-full text-lg h-12 rounded-md ${isExpanded ? 'justify-start px-4' : 'justify-center px-2'}`}
              // No onClick here as the Link handles navigation and the above onClick on Link closes sheet
            >
              <item.icon className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
              {isExpanded && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
            </Button>
          </Link>
        ))}
      </nav>
      <div className={`mt-auto p-2 border-t pt-4 ${isExpanded ? '' : 'flex justify-center'}`}>
        <Button
          variant="ghost"
          className={`text-lg h-12 rounded-md ${isExpanded ? 'w-full justify-start' : 'w-auto justify-center'}`}
          // Assuming handleLogout is passed down if needed, or moved to AuthenticatedLayout for direct call
          // For now, removing direct call to avoid undefined function error if not passed.
        >
          <Users className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
          {isExpanded && <span className="whitespace-nowrap overflow-hidden">My Account</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
