'use client'; // This component is explicitly a Client Component and uses client hooks

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname for active link logic
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

// Import your custom layout components
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

// Import all content components so their icons are accessible for navItems
import DashboardContent from '@/components/content/DashboardContent';
import ProjectsContent from '@/components/content/ProjectsContent';
import FindingsContent from '@/components/content/FindingsContent';
import ReportsContent from '@/components/content/ReportsContent';
import SettingsContent from '@/components/content/SettingsContent';

// Import the server action for logout
import { handleLogout } from '@/lib/actions'; // Assuming you've created this file

// Define navigation items (can be moved to a separate config file if preferred)
// Icons are accessed via the .icon property of the imported content components
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardContent.icon, href: '/dashboard' },
  { id: 'projects', label: 'Projects', icon: ProjectsContent.icon, href: '/projects' }, // Base path for projects
  { id: 'findings', label: 'Findings', icon: FindingsContent.icon, href: '/findings' },
  { id: 'reports', label: 'Reports', icon: ReportsContent.icon, href: '/reports' },
  { id: 'settings', label: 'Settings', icon: SettingsContent.icon, href: '/settings' },
];

interface AuthenticatedLayoutProps {
  children: React.ReactNode; // The content of the page it wraps
  userData: {
    email?: string | null;
    name?: string | null;
  };
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children, userData }) => {
  // Determine current page for sidebar active state
  const pathname = usePathname();
  // Get the base path (e.g., '/dashboard', '/projects', '/findings')
  const currentPageId = navItems.find(item => pathname.startsWith(item.href))?.id || 'dashboard';

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // State for sidebar expansion

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Helper function to safely close the mobile sheet
  const closeMobileSheet = () => {
    const sheetWrapper = document.querySelector('[data-radix-popper-content-wrapper]');
    if (sheetWrapper instanceof HTMLElement) {
      sheetWrapper.click();
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-inter">
      {/* Static Sidebar for larger screens */}
      <aside
        className={`hidden lg:flex flex-shrink-0 transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'w-72' : 'w-20'
        }`}
      >
        <Sidebar
          currentPage={currentPageId} // Use currentPageId from pathname
          isExpanded={isSidebarExpanded}
          toggleSidebar={toggleSidebar}
          navItems={navItems}
          // The setCurrentPage prop will no longer be directly used for routing here,
          // as Link components handle navigation. It's kept if Sidebar buttons have
          // other internal state to manage.
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header/Navbar */}
        <Header
          currentPageId={currentPageId} // Use currentPageId for Header title
          navItems={navItems}
          userData={userData}
          onLogout={handleLogout}
        >
          {/* Mobile Sheet Trigger (passed as children to Header) */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <div className="p-4 border-b">
                  <SheetTitle className="text-xl font-semibold">Main Menu</SheetTitle>
                  <SheetDescription className="sr-only">Primary navigation for PwnTrack.</SheetDescription>
                </div>
                <Sidebar
                  currentPage={currentPageId} // Use currentPageId for mobile sidebar
                  closeSheet={closeMobileSheet}
                  isExpanded={true} // Mobile sheet is always expanded
                  toggleSidebar={() => {}} // No toggle button in mobile sheet
                  navItems={navItems}
                  // For mobile sidebar, setCurrentPage should simply close the sheet
                  // and Link component within Sidebar will handle navigation
                  setCurrentPage={(id) => {
                     // In the mobile sidebar, this function will typically be part of the Link component's onClick
                     // or the closeSheet prop from a parent. For simplicity here, we assume the Link
                     // will trigger the route change and the closeSheet will hide the modal.
                     // No need to set internal state 'currentPage' here, as usePathname handles it.
                     // The setCurrentPage prop is mainly for the large sidebar to update its internal state.
                  }}
                />
              </SheetContent>
            </Sheet>
          </div>
        </Header>

        {/* Dynamic Page Content (children prop) */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
