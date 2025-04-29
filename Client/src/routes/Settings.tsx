import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, User, Mail, Shield, BellRing, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';



export default function Settings() {
  const navigate = useNavigate();
  const { onLogout } = useAuth();
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email:  '',
  });
  
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    studyReminders: true,
    newFeatures: true,
  });
  
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'advanced'>('account');
  const [changesSaved, setChangesSaved] = useState(false);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleToggleNotification = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [setting]: !prev[setting] }));
  };
  
  const handleSaveProfile = () => {
    // In a real app, this would update the user profile
    setChangesSaved(true);
    setTimeout(() => setChangesSaved(false), 3000);
  };
  

  
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={handleBack} className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      {changesSaved && (
        <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg text-success-700">
          Your changes have been saved successfully.
        </div>
      )}
      
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Card className="mb-6">
            <CardContent className="py-6">
              <nav className="space-y-1">
                <SettingsNavItem
                  icon={<User className="h-5 w-5" />}
                  label="Account"
                  active={activeTab === 'account'}
                  onClick={() => setActiveTab('account')}
                />
                <SettingsNavItem
                  icon={<BellRing className="h-5 w-5" />}
                  label="Notifications"
                  active={activeTab === 'notifications'}
                  onClick={() => setActiveTab('notifications')}
                />
                <SettingsNavItem
                  icon={<RefreshCw className="h-5 w-5" />}
                  label="Advanced"
                  active={activeTab === 'advanced'}
                  onClick={() => setActiveTab('advanced')}
                />
              </nav>
            </CardContent>
          </Card>
          
          <Button
            variant="outline"
            className="w-full text-error-600 border-error-200 hover:bg-error-50"
            leftIcon={<LogOut className="h-5 w-5" />}
            onClick={onLogout}
          >
            Logout
          </Button>
        </div>
        
        <div className="md:col-span-3">
          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <Input
                        label="Name"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        leftElement={<User className="h-4 w-4" />}
                      />
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        leftElement={<Mail className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-200">
                    <h3 className="text-lg font-medium mb-4">Account Security</h3>
                    <Button
                      variant="outline"
                      leftIcon={<Shield className="h-4 w-4" />}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="primary" onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <ToggleSetting
                        label="Study Reminders"
                        description="Receive emails when you have cards due for review"
                        checked={notifications.studyReminders}
                        onChange={() => handleToggleNotification('studyReminders')}
                      />
                      <ToggleSetting
                        label="Email Notifications"
                        description="Receive email notifications about account activity"
                        checked={notifications.emailReminders}
                        onChange={() => handleToggleNotification('emailReminders')}
                      />
                      <ToggleSetting
                        label="New Features"
                        description="Get notified when we launch new features"
                        checked={notifications.newFeatures}
                        onChange={() => handleToggleNotification('newFeatures')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="primary" onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === 'advanced' && (
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Study Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Cards per Study Session
                        </label>
                        <select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none transition-all duration-200">
                          <option value="all">All due cards</option>
                          <option value="10">Maximum 10 cards</option>
                          <option value="20">Maximum 20 cards</option>
                          <option value="30">Maximum 30 cards</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Default Sorting
                        </label>
                        <select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none transition-all duration-200">
                          <option value="due">By due date</option>
                          <option value="created">By creation date</option>
                          <option value="difficulty">By difficulty</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-200">
                    <h3 className="text-lg font-medium mb-4">Data Management</h3>
                    <div className="space-y-3">
                      <Button variant="outline">Export All Data</Button>
                      <Button variant="outline" className="text-error-600 border-error-200 hover:bg-error-50">
                        Reset All Progress
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="primary" onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface SettingsNavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function SettingsNavItem({ icon, label, active, onClick }: SettingsNavItemProps) {
  return (
    <button
      className={`flex items-center space-x-3 w-full p-3 rounded-lg text-left ${
        active
          ? 'bg-primary-50 text-primary-700'
          : 'text-neutral-700 hover:bg-neutral-100'
      }`}
      onClick={onClick}
    >
      <span className={active ? 'text-primary-600' : 'text-neutral-500'}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleSetting({ label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h4 className="font-medium">{label}</h4>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
      <div className="flex items-center h-6">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={onChange}
            />
            <div className={`block w-10 h-6 rounded-full ${checked ? 'bg-primary-500' : 'bg-neutral-300'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
          </div>
        </label>
      </div>
    </div>
  );
}