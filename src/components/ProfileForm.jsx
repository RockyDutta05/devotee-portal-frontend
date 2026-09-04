import React from 'react';
import Input from './Input';

export function ProfileForm({ 
  formData, 
  isEditing, 
  onChange,
  isPublicView = false
}) {
  return (
    <div className="space-y-8">
      {/* Personal Info */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Name" 
            name="name"
            value={formData.name} 
            onChange={onChange}
            disabled={!isEditing} 
          />
          <Input 
            label="Initiated Name" 
            name="initiatedName"
            value={formData.initiatedName || ''} 
            onChange={onChange}
            disabled={!isEditing} 
          />
          {!isPublicView && (
            <>
              <Input 
                label="Email" 
                name="email"
                type="email"
                value={formData.email} 
                onChange={onChange}
                disabled={!isEditing} 
              />
              <Input 
                label="Phone" 
                name="phone"
                type="tel"
                maxLength={10}
                value={formData.phone} 
                onChange={onChange}
                disabled={!isEditing} 
              />
            </>
          )}
        </div>
        {isPublicView && (
           <p className="text-sm text-gray-500 mt-3 italic">Contact details are hidden in public view. Others must send a contact request to view your email and phone.</p>
        )}
      </section>

      {/* Spiritual Info */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-4">Spiritual & Community Connection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Connected To (Counselor/Mentor)" 
            name="connectedToName"
            value={formData.connectedToName} 
            onChange={onChange}
            disabled={!isEditing} 
          />
          <Input 
            label="Connected Contact" 
            name="connectedToContact"
            value={formData.connectedToContact} 
            onChange={onChange}
            disabled={!isEditing} 
          />
          <Input 
            label="Chanting Rounds (0-128)" 
            name="chantingRounds"
            type="number"
            min="0" max="128"
            value={formData.chantingRounds} 
            onChange={onChange}
            disabled={!isEditing} 
          />
        </div>
      </section>

      {/* Professional Info */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-4">Professional Information</h3>
        {isPublicView && formData.hideEmployer ? (
           <p className="text-sm text-gray-500 italic">Employer information is hidden by the user.</p>
        ) : (
          <div className="space-y-4">
            <Input 
              label="Job Title" 
              name="jobTitle"
              value={formData.jobTitle || ''} 
              onChange={onChange}
              disabled={!isEditing} 
            />
            <Input 
              label="Current Employer" 
              name="currentEmployer"
              value={formData.currentEmployer || ''} 
              onChange={onChange}
              disabled={!isEditing} 
            />
            <Input 
              label="Location" 
              name="location"
              value={formData.location || ''} 
              onChange={onChange}
              disabled={!isEditing} 
            />
            {!isPublicView && (
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="hideEmployer" 
                  name="hideEmployer"
                  checked={formData.hideEmployer}
                  onChange={onChange}
                  disabled={!isEditing}
                  className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 disabled:opacity-50"
                />
                <label htmlFor="hideEmployer" className="text-sm text-gray-700">Hide my employer from public view</label>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
