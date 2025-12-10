import React from 'react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';

const Help = () => {
  const faqs = [
    {
      q: 'How do I start a new screening?',
      a: 'Go to New Screening and complete the form. Results show instantly.'
    },
    {
      q: 'Why did I get logged out?',
      a: 'Sessions expire after inactivity. If issues persist, try reloading and logging in again.'
    },
    {
      q: 'Is guest mode limited?',
      a: 'Guest mode can run screenings but does not store history or analytics.'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Help & Support</h1>
          <p className="text-secondary">Find quick answers or reach out for assistance.</p>
        </div>
        <Button variant="secondary" title="Contact support" disabled>
          Contact Support
        </Button>
      </div>

      <Card title="FAQ" className="space-y-3">
        {faqs.map((item) => (
          <div key={item.q} className="space-y-1">
            <p className="font-medium text-primary">{item.q}</p>
            <p className="text-secondary text-sm">{item.a}</p>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default Help;
