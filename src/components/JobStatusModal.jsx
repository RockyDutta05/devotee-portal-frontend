import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import adminService from '../services/adminService';

export default function JobStatusModal({ isOpen, onClose, status, onSaved }) {
  const isEdit = !!status;
  const [name, setName] = useState(status?.name || '');
  const [isActive, setIsActive] = useState(status?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      if (isEdit) {
        await adminService.updateJobStatus(status.id, { name: name.trim(), isActive });
      } else {
        await adminService.createJobStatus({ name: name.trim(), isActive });
      }
      onSaved();
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save job status');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Job Status' : 'Add Job Status'}>
      <div className="space-y-4">
        <Input label="Status Name" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <span>Active</span>
        </label>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={isSaving} onClick={handleSubmit}>{isSaving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </Modal>
  );
}
