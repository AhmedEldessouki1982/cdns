import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '../ui/button';
import { api } from '@/api/client';
import { LogOutIcon, UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getAvatar } from '@/features/getAvatar';

const HeaderBar = () => {
  const navigate = useNavigate();
  const handleSignout = () => {
    api.signout();
    navigate('/login');
    toast.success('Signed out successfully');
  };
  const handleProfile = () => {
    navigate('/profile');
    toast.success('Profile opened successfully');
  };
  return (
    <header className="h-16 w-full flex justify-between items-center px-6 border-b sticky border-gray-200 bg-white shadow-sm top-0 z-10">
      <div className="flex items-center gap-1">
        <SidebarTrigger className="hover:bg-gray-100 rounded-lg transition-colors" />
        <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
      </div>

      <div className="flex items-center gap-1">
        {/* profile button */}
        <Button variant="outline" onClick={() => handleProfile()}>
          Profile
          <UserIcon className="w-4 h-4">
            <Link to="/profile" className="hover:text-blue-500">
              Profile
            </Link>
          </UserIcon>
        </Button>
        {/* sign out button */}
        <Button variant="outline" onClick={() => handleSignout()}>
          Exit
          <LogOutIcon className="w-4 h-4" />
        </Button>
        {/* avatar */}
        <Avatar>
          <AvatarImage className=" object-cover" src={getAvatar(129)} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default HeaderBar;
