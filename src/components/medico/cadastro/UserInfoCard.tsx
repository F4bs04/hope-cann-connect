
import React from 'react';
import { User } from 'lucide-react';

interface UserInfo {
  name?: string;
  email?: string;
  photoUrl?: string;
}

interface UserInfoCardProps {
  userInfo: UserInfo;
}

const UserInfoCard = ({ userInfo }: UserInfoCardProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
        {userInfo.photoUrl ? (
          <img 
            src={userInfo.photoUrl} 
            alt={userInfo.name || "Foto de perfil"} 
            className="w-20 h-20 rounded-full object-cover mb-3" 
          />
        ) : (
          <User className="w-20 h-20 p-4 bg-gray-200 text-gray-500 rounded-full mb-3" />
        )}
        <h3 className="font-medium text-lg">{userInfo.name}</h3>
        <p className="text-gray-500">{userInfo.email}</p>
      </div>
    </div>
  );
};

export default UserInfoCard;
