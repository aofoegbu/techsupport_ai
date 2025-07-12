import { Bell, Settings } from "lucide-react";

interface HeaderProps {
  onSectionChange?: (section: string) => void;
  onNotificationClick?: () => void;
}

export default function Header({ onSectionChange, onNotificationClick }: HeaderProps) {
  const handleSectionClick = (section: string, e: React.MouseEvent) => {
    e.preventDefault();
    console.log(`Header ${section} clicked`);
    if (onSectionChange) {
      onSectionChange(section);
    } else {
      // Fallback: Try to trigger FAQ sidebar directly
      const event = new CustomEvent('faq-section-change', { detail: section });
      window.dispatchEvent(event);
    }
  };

  const handleNotificationClick = () => {
    console.log('Header notifications clicked');
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      // Fallback: Try to trigger FAQ sidebar notifications
      const event = new CustomEvent('faq-section-change', { detail: 'notifications' });
      window.dispatchEvent(event);
    }
  };

  return (
    <header className="bg-surface shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19A2 2 0 0 0 5 21H11V19H5V3H13V9H21Z"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-secondary">AI Support Troubleshooter</h1>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={(e) => handleSectionClick('faq', e)}
              className="text-primary font-medium border-b-2 border-primary pb-1"
            >
              Dashboard
            </button>
            <button 
              onClick={(e) => handleSectionClick('knowledge', e)}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Knowledge Base
            </button>
            <button 
              onClick={(e) => handleSectionClick('history', e)}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              History
            </button>
            <button 
              onClick={(e) => handleSectionClick('settings', e)}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Settings
            </button>
          </nav>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleNotificationClick}
              className="p-2 text-gray-400 hover:text-secondary transition-colors"
            >
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">SE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
