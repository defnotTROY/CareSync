import { useState } from 'react';
import ClientSidebar from './ClientSidebar';
import ClientHeader from './ClientHeader';

export default function ClientLayout({ children, title }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-white w-full overflow-hidden">
            <ClientSidebar 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
            />
            <div className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-72 transition-all duration-300">
                <ClientHeader 
                    onMenuClick={() => setIsMobileMenuOpen(true)} 
                    title={title} 
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-4 md:p-8 lg:p-12 relative">
                    {children}
                </main>
            </div>
        </div>
    );
}
