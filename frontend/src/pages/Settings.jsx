import React from 'react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';

const Settings = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Settings</h1>
          <p className="text-secondary">Manage your profile, preferences, and security.</p>
        </div>
        <Button variant="secondary" title="Save changes" disabled>
          Save Changes
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Profile" className="space-y-3">
          <p className="text-secondary text-sm">Profile editing coming soon.</p>
        </Card>
        <Card title="Notifications" className="space-y-3">
          <p className="text-secondary text-sm">Notification preferences coming soon.</p>
        </Card>
        <Card title="Security" className="space-y-3">
          <p className="text-secondary text-sm">Password and device management coming soon.</p>
        </Card>
        <Card title="Appearance" className="space-y-3">
          <p className="text-secondary text-sm">Theme settings coming soon.</p>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
