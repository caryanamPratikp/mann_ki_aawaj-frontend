import React, { useState } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Textarea } from '../../components/common/Textarea.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Send } from 'lucide-react';

export function ContactPage({ onNavigate }) {
  const { addToast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast('Support inquiry submitted successfully. Reference ticket generated.', 'success');
    setSubject('');
    setMessage('');
  };

  return (
    <PublicLayout activeRoute="/contact" onNavigate={onNavigate}>
      <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 16px' }} className="flex-col gap-md">
        <h1 className="page-heading">Contact Support & Safety Team</h1>
        <form onSubmit={handleSubmit} className="mka-card flex-col gap-md">
          <Input
            label="Inquiry Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Account, safety, or feature query..."
            required
          />
          <Textarea
            label="Message Details"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your question or issue in detail..."
            rows={5}
            required
          />
          <Button type="submit" variant="primary" icon={Send}>
            Submit Inquiry
          </Button>
        </form>
      </div>
    </PublicLayout>
  );
}
