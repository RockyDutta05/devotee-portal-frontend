import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { CheckCircle2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import WatermarkBackground from '../components/WatermarkBackground';
import authService from '../services/authService';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    initiatedName: '',
    email: '',
    phone: '',
    chantingRounds: '16',
    connectedToName: '',
    connectedToContact: '',
    currentEmployer: '',
    hideEmployer: false,
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.trim())) newErrors.phone = 'Phone number must be exactly 10 digits';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const rounds = parseInt(formData.chantingRounds, 10);
    if (isNaN(rounds) || rounds < 0 || rounds > 128) {
      newErrors.chantingRounds = 'Rounds must be between 0 and 128';
    }
    if (!formData.connectedToName.trim()) newErrors.connectedToName = 'Counselor/Mentor name is required';
    if (!formData.connectedToContact.trim()) newErrors.connectedToContact = 'Counselor/Mentor contact is required';
    else if (!/^\d{10}$/.test(formData.connectedToContact.trim())) newErrors.connectedToContact = 'Contact must be exactly 10 digits';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    let isValid = false;
    if (step === 1) isValid = validateStep1();
    if (step === 2) isValid = validateStep2();
    if (step === 3) isValid = validateStep3();

    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 4) {
      setIsLoading(true);
      setServerError('');
      try {
        await authService.signup(formData);
        setIsSubmitted(true);
        setTimeout(() => {
          navigate('/pending-approval');
        }, 3000);
      } catch (err) {
        setServerError(err.response?.data?.message || err.message || 'An error occurred during registration.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isSubmitted) {
    return (
      <>
        <WatermarkBackground />
        <div className="relative z-30 flex items-start justify-center min-h-[calc(100vh-5rem)] px-4 py-12">
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-orange-100 p-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-extrabold text-gray-950 mb-4">Registration Submitted Successfully!</h2>
            <p className="text-gray-800 font-medium">
              Your account is pending admin approval. You will be redirected shortly...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <WatermarkBackground />
      <div className="relative z-30 flex items-start justify-center min-h-[calc(100vh-5rem)] px-4 py-10">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-orange-100 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 bg-orange-100 rounded-full mb-4 border border-orange-200">
          <span className="text-2xl">🕉️</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">Create an Account</h2>
        <p className="text-gray-700 font-semibold mt-1">Step {step} of 4</p>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-6">
          <div
            className="bg-orange-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl flex items-start gap-3 border border-red-200">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-600" />
            <p className="text-sm font-semibold">{serverError}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-gray-950 mb-4 border-b-2 border-orange-200 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Legal Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="ENTER YOUR NAME" required />
              <Input label="Initiated Name (Optional)" name="initiatedName" value={formData.initiatedName} onChange={handleChange} placeholder="IF ANY" />
            </div>
            <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="ENTER YOUR EMAIL" required />
            <Input label="Phone Number" type="tel" name="phone" maxLength={10} value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="10-DIGIT PHONE NUMBER" required />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-gray-950 mb-4 border-b-2 border-orange-200 pb-2">Spiritual &amp; Community Connection</h3>
            <Input 
              label="Number of rounds of chanting (0-128)" 
              type="number" 
              name="chantingRounds" 
              min="0" 
              max="128" 
              value={formData.chantingRounds} 
              onChange={handleChange} 
              error={errors.chantingRounds}
              required 
            />
            <Input 
              label="Connected To (Counselor/President/Mentor Name)" 
              name="connectedToName" 
              placeholder="e.g. HG Chaitanya Charan Das" 
              value={formData.connectedToName} 
              onChange={handleChange} 
              error={errors.connectedToName}
              required 
            />
            <Input 
              label="Connected To (10-digit Mobile Number)" 
              type="tel"
              name="connectedToContact" 
              maxLength={10}
              placeholder="10-DIGIT MOBILE NUMBER" 
              value={formData.connectedToContact} 
              onChange={handleChange} 
              error={errors.connectedToContact}
              required 
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-gray-950 mb-4 border-b-2 border-orange-200 pb-2">Account Details</h3>
            <Input 
              label="Current Employer (Optional)" 
              name="currentEmployer" 
              placeholder="e.g. Google, Microsoft" 
              value={formData.currentEmployer} 
              onChange={handleChange} 
            />
            <div className="flex items-center gap-2 mb-4">
              <input 
                type="checkbox" 
                id="hideEmployer" 
                name="hideEmployer"
                checked={formData.hideEmployer}
                onChange={handleChange}
                className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
              />
              <label htmlFor="hideEmployer" className="text-sm font-semibold text-gray-900">Hide my employer from public view</label>
            </div>
            
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="••••••••" required />
            <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="••••••••" required />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-gray-950 mb-4 border-b-2 border-orange-200 pb-2">Review &amp; Submit</h3>
            <div className="bg-orange-50 p-6 rounded-xl space-y-4 text-sm border border-orange-100">
              <div className="grid grid-cols-3 gap-y-3 gap-x-4">
                <div className="text-gray-600 font-bold">Name</div>
                <div className="col-span-2 font-semibold text-gray-950">{formData.name}</div>
                <div className="text-gray-600 font-bold">Email</div>
                <div className="col-span-2 font-semibold text-gray-950">{formData.email}</div>
                <div className="text-gray-600 font-bold">Phone</div>
                <div className="col-span-2 font-semibold text-gray-950">{formData.phone}</div>
                <div className="text-gray-600 font-bold">Rounds</div>
                <div className="col-span-2 font-semibold text-gray-950">{formData.chantingRounds}</div>
                <div className="text-gray-600 font-bold">Connected To</div>
                <div className="col-span-2 font-semibold text-gray-950">{formData.connectedToName} ({formData.connectedToContact})</div>
                <div className="text-gray-600 font-bold">Employer</div>
                <div className="col-span-2 font-semibold text-gray-950">{formData.currentEmployer || 'None'} {formData.hideEmployer && '(Hidden)'}</div>
              </div>
            </div>
            <p className="text-sm text-gray-700 font-medium text-center">
              By submitting this form, you confirm that the information provided is accurate and you agree to our community guidelines.
            </p>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t mt-8">
          {step > 1 ? (
            <Button type="button" variant="ghost" onClick={prevStep} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div></div> 
          )}
          
          {step < 4 ? (
            <Button type="button" onClick={nextStep} className="flex items-center gap-2">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              {isLoading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          )}
        </div>
      </form>

      {step === 1 && (
        <p className="text-center mt-8 text-sm font-semibold text-gray-800">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-600 font-bold hover:underline">Login here</Link>
        </p>
      )}
    </div>
    </div>
    </>
  );
}
