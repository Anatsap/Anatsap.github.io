import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface TrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseCode?: string;
  onSuccess: (message: string) => void;
}

export function TrainerModal({ isOpen, onClose, exerciseCode, onSuccess }: TrainerModalProps) {
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    trainer: 'Olena',
    datetime: ''
  });

  const submitSignup = useMutation(api.trainers.submitTrainerSignup);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitSignup({
        name: signupData.name,
        email: signupData.email,
        trainer: signupData.trainer,
        datetime: signupData.datetime,
        exerciseCode: exerciseCode,
      });
      
      onSuccess('Thank you! Your request was sent. The trainer will contact you.');
      onClose();
      setSignupData({ name: '', email: '', trainer: 'Olena', datetime: '' });
    } catch (error) {
      console.error('Signup error:', error);
      onSuccess('Error submitting request. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold">Sign up with a trainer</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              required
              value={signupData.name}
              onChange={(e) => setSignupData(s => ({...s, name: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              required
              type="email"
              value={signupData.email}
              onChange={(e) => setSignupData(s => ({...s, email: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred trainer</label>
            <select
              value={signupData.trainer}
              onChange={(e) => setSignupData(s => ({...s, trainer: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Olena</option>
              <option>Ivan</option>
              <option>Kateryna</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date & time</label>
            <input
              required
              type="datetime-local"
              value={signupData.datetime}
              onChange={(e) => setSignupData(s => ({...s, datetime: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {exerciseCode && (
            <div className="text-sm text-gray-600">
              Exercise: <strong>{exerciseCode}</strong>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Send request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
