import { Bell, User, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const navigationItems = [
  { label: 'Home', active: false },
  { label: 'Bookings', active: false },
  { label: 'Reviews', active: false },
  { label: 'Complaints', active: true },
  { label: 'Dashboard', active: false },
];

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">SB</span>
              </div>
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900">ServiceBook</span>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant={item.active ? 'default' : 'ghost'}
                className={item.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>
            
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-gray-50">
        <div className="px-4 py-2 space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`w-full justify-start ${
                item.active ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
              }`}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}