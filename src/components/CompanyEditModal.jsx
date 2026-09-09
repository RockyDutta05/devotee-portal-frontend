import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import adminService from '../services/adminService';

export default function CompanyEditModal({ isOpen, onClose, company, onSaved }) {
  const [name, setName] = useState(company?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await adminService.updateCompany(company.id, { name: name.trim() });
      onSaved();
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update company');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Company">
      <div className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={isSaving} onClick={handleSave}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
