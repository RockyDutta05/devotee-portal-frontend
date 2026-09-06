import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import WatermarkBackground from '../components/WatermarkBackground';
import authService from '../services/authService';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    initiatedName: '',
    email: '',
    phone: '',
    chantingRounds: '',
    connectedToName: '',
    connectedToContact: '',
    connectedToTemple: '',
    currentEmployer: '',
    hideEmployer: false,
    password: '',
    confirmPassword: '',
    profilePictureFile: null,
    profilePictureUrl: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.trim())) newErrors.phone = 'Phone number must be exactly 10 digits';
    
    const rounds = formData.chantingRounds === '' ? NaN : parseInt(formData.chantingRounds, 10);
    if (isNaN(rounds) || rounds < 0 || rounds > 64) {
      newErrors.chantingRounds = 'Rounds must be between 0 and 64';
    }
    if (!formData.connectedToName.trim()) newErrors.connectedToName = 'Counselor/Mentor name is required';
    if (!formData.connectedToContact.trim()) newErrors.connectedToContact = 'Counselor/Mentor contact is required';
    else if (!/^\d{10}$/.test(formData.connectedToContact.trim())) newErrors.connectedToContact = 'Contact must be exactly 10 digits';
    if (!formData.connectedToTemple.trim()) newErrors.connectedToTemple = 'Temple name is required';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep1 = async () => {
    const isValid = validateStep1();
    if (!isValid) return;

    if (!otpSent) {
      setIsSendingOtp(true);
      setServerError('');
      try {
        await authService.sendOtp(formData.email);
        setOtpSent(true);
      } catch (err) {
        setServerError(err.response?.data?.message || err.message || 'Failed to send OTP.');
      } finally {
        setIsSendingOtp(false);
      }
    } else {
      if (!otp.trim()) {
        setErrors(prev => ({ ...prev, otp: 'OTP is required' }));
        return;
      }
      setIsVerifyingOtp(true);
      setServerError('');
      try {
        await authService.verifyOtp(formData.email, otp);
        setStep(2);
      } catch (err) {
        setServerError(err.response?.data?.message || err.message || 'Invalid OTP.');
      } finally {
        setIsVerifyingOtp(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 2) {
      const isValid = validateForm();
      if (!isValid) return;

      setIsLoading(true);
      setServerError('');
      try {
        let finalProfilePictureUrl = formData.profilePictureUrl;
        
        // Upload profile picture if provided
        if (formData.profilePictureFile) {
          const presignedData = await authService.getPresignedProfileUrl(
            formData.profilePictureFile.name,
            formData.profilePictureFile.type,
            formData.profilePictureFile.size
          );
          await authService.uploadProfileToCloudflare(presignedData.presignedUrl, formData.profilePictureFile);
          finalProfilePictureUrl = presignedData.fileUrl;
        }

        const submitData = {
          ...formData,
          profilePictureUrl: finalProfilePictureUrl
        };
        delete submitData.profilePictureFile; // Clean up before sending

        await authService.signup(submitData);
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
        <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">Create Account</h2>
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
            <Input label="Enter email address" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" disabled={otpSent} required />
            
            {otpSent && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input label="Enter the OTP" type="text" name="otp" value={otp} onChange={(e) => { setOtp(e.target.value); if(errors.otp) setErrors(prev => ({...prev, otp: ''})) }} error={errors.otp} placeholder="4-digit code" required />
                <p className="text-xs text-gray-500 mt-2 font-medium">An OTP has been sent to your email. Please check your inbox (and spam folder).</p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-950 mb-4 border-b-2 border-orange-200 pb-2">Personal Information</h3>
              
              <div className="w-full flex flex-col gap-1 mb-4">
                <label className="text-sm font-semibold text-gray-700">Profile Picture (Optional)</label>
                <input 
                  type="file" 
                  name="profilePictureFile"
                  accept="image/*"
                  onChange={handleChange}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-orange-50 file:text-orange-700 file:font-semibold file:mr-4 file:px-4 file:py-1 file:rounded-full hover:file:bg-orange-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Legal Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="ENTER YOUR NAME" required />
                <Input label="Initiated Name (Optional)" name="initiatedName" value={formData.initiatedName} onChange={handleChange} placeholder="IF ANY" />
              </div>
              <Input label="Phone Number" type="tel" name="phone" maxLength={10} value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="10-DIGIT PHONE NUMBER" required />
            </div>

            {/* Spiritual Connection */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-950 mb-4 border-b-2 border-orange-200 pb-2">Spiritual &amp; Community Connection</h3>
              <Input label="Number of rounds of chanting" type="number" name="chantingRounds" min="0" max="64" value={formData.chantingRounds} onChange={handleChange} error={errors.chantingRounds} required />
              <Input label="Connected To (Counselor/President/Mentor Name)" name="connectedToName" placeholder="e.g. HG Chaitanya Charan Das" value={formData.connectedToName} onChange={handleChange} error={errors.connectedToName} required />
              <Input label="Mobile no of whom with which you are connected" type="tel" name="connectedToContact" maxLength={10} value={formData.connectedToContact} onChange={handleChange} error={errors.connectedToContact} required />
              <Input label="Temple name of whom with which you are connected" name="connectedToTemple" placeholder="e.g. ISKCON Juhu, Mumbai" value={formData.connectedToTemple} onChange={handleChange} error={errors.connectedToTemple} required />
            </div>

            {/* Account Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-950 mb-4 border-b-2 border-orange-200 pb-2">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="••••••••" required />
                <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="••••••••" required />
              </div>
            </div>

            <p className="text-sm text-gray-700 font-medium text-center">
              By submitting this form, you confirm that the information provided is accurate and you agree to our community guidelines.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t mt-8">
          {step === 1 ? (
            <Button type="button" onClick={handleNextStep1} disabled={isSendingOtp || isVerifyingOtp} className="w-full">
              {isSendingOtp ? "Sending..." : isVerifyingOtp ? "Verifying..." : !otpSent ? "Send OTP" : "Verify & Continue ->"}
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 w-full md:w-auto px-8">
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
