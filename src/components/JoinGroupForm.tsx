import { useState } from 'react';
import { ArrowLeft, AlertCircle, FileText, CreditCard, Save } from 'lucide-react';

interface JoinGroupFormProps {
  group: {
    id: string;
    name: string;
    image: string;
  };
  onBack: () => void;
}

import { supabase } from '../lib/supabase';

export function JoinGroupForm({ group, onBack }: JoinGroupFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    bikeBrand: '',
    bikeModel: '',
    bikeYear: '',
    licenseNumber: '',
    rcNumber: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        alert("Please login first to join rides.");
        setIsSubmitting(false);
        return;
      }

      // Add user to the ride participants table
      const { error } = await supabase.from('ride_participants').insert([{
        ride_id: group.id,
        user_id: session.user.id
      }]);

      if (error && error.code !== '23505') throw error; // Ignore unique constraint if already joined
      
      alert('Group join request submitted successfully!');
      onBack();
    } catch (err) {
      console.error(err);
      alert('Failed to join ride. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen pb-6">
      {/* Header */}
      <div className="sticky top-14 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3 z-40">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-900 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-bold">Join Group</h2>
          <p className="text-sm text-slate-400">{group.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-6">
        {/* Important Notice */}
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Important Notice</h3>
              <p className="text-sm text-red-300/90">
                Please bring original copies of your driving license, RC book, and valid insurance documents on the ride day. Digital copies will not be accepted.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Personal Details
          </h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="fullName" className="block text-sm text-slate-400 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="phone" className="block text-sm text-slate-400 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="10-digit number"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm text-slate-400 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bike Details */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-500" />
            Bike Details
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="bikeBrand" className="block text-sm text-slate-400 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="bikeBrand"
                  name="bikeBrand"
                  value={formData.bikeBrand}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., Royal Enfield"
                />
              </div>
              <div>
                <label htmlFor="bikeModel" className="block text-sm text-slate-400 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="bikeModel"
                  name="bikeModel"
                  value={formData.bikeModel}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., Classic 350"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bikeYear" className="block text-sm text-slate-400 mb-1">
                Manufacturing Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="bikeYear"
                name="bikeYear"
                value={formData.bikeYear}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., 2023"
              />
            </div>
          </div>
        </div>

        {/* License & RC Details */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            License & RC Details
          </h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="licenseNumber" className="block text-sm text-slate-400 mb-1">
                Driving License Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter license number"
              />
              <p className="text-xs text-yellow-500 mt-1">⚠️ Bring original license on ride day</p>
            </div>

            <div>
              <label htmlFor="rcNumber" className="block text-sm text-slate-400 mb-1">
                RC Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="rcNumber"
                name="rcNumber"
                value={formData.rcNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter RC number"
              />
              <p className="text-xs text-yellow-500 mt-1">⚠️ Bring original RC book on ride day</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="font-semibold mb-3">Emergency Contact</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="emergencyContact" className="block text-sm text-slate-400 mb-1">
                Emergency Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Name"
              />
            </div>
            <div>
              <label htmlFor="emergencyPhone" className="block text-sm text-slate-400 mb-1">
                Emergency Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="10-digit number"
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm text-slate-400 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            placeholder="Any special requirements or information..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 opacity-90 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSubmitting ? 'Submitting...' : 'Submit Join Request'}
        </button>

        <p className="text-xs text-center text-slate-500">
          By submitting, you agree to the group's terms and conditions
        </p>
      </form>
    </div>
  );
}
