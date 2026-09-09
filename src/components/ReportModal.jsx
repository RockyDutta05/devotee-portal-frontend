import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';

export default function ReportModal({ isOpen, onClose, jobId, onSubmit }) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(reason.trim());
      setReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Job">
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <Input
          label="Reason"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          placeholder="Why are you reporting this job?"
        />
        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Report'}</Button>
        </div>
      </form>
    </Modal>
  );
}
