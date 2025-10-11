'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, LogOut, User } from 'lucide-react'; // Import LogOut and User icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Assuming you have shadcn dropdown-menu installed

// If not installed, run: npx shadcn-ui@latest add dropdown-menu

// Define props interface
interface HeaderProps {
  currentPageId: string;
  navItems: { id: string; label: string; icon: React.ElementType }[];
  children?: React.ReactNode; // For the mobile SheetTrigger
  userData: {
    email?: string | null;
    name?: string | null;
  };
  onLogout: () => Promise<void>; // Expecting a function that logs out
}

const Header: React.FC<HeaderProps> = ({ currentPageId, navItems, children, userData, onLogout }) => {
  const currentPageLabel = navItems.find(item => item.id === currentPageId)?.label || 'PwnTrack';
  const displayUserName = userData.name || userData.email || 'User'; // Prioritize name, then email, then 'User'
  const userInitials = displayUserName.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm z-10">
      {children} {/* This will render the mobile SheetTrigger */}

      <h1 className="text-2xl font-semibold lg:ml-0">
        PwnTrack - {currentPageLabel}
      </h1>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-full">
          <Search className="h-5 w-5" />
        </Button>
        <Button className="flex items-center rounded-md">
          <Plus className="mr-2 h-4 w-4" /> New
        </Button>

        {/* User Avatar/Profile with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-primary-foreground flex items-center justify-center text-sm font-semibold border-2 border-primary cursor-pointer">
              {userInitials}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>{displayUserName}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
