
import React, { useState } from 'react';
import { UserProfile, Gender } from '../types';

interface ProfileFormProps {
  initialData?: UserProfile;
  onSubmit: (data: UserProfile) => void;
  title: string;
  buttonText: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSubmit, title, buttonText }) => {
  const [formData, setFormData] = useState<UserProfile>(initialData || {
    name: '',
    birthDate: '',
    birthTime: '12:00',
    gender: Gender.MALE
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-amber-500/20 p-8 rounded-3xl gold-glow max-w-md w-full">
      <h2 className="text-2xl font-bold text-amber-200 mb-6 text-center">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Họ và Tên</label>
          <input
            required
            type="text"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            placeholder="Nhập tên của bạn"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Ngày sinh</label>
            <input
              required
              type="date"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 outline-none"
              value={formData.birthDate}
              onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Giờ sinh</label>
            <input
              type="time"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 outline-none"
              value={formData.birthTime}
              onChange={e => setFormData({ ...formData, birthTime: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Giới tính</label>
          <select
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 outline-none"
            value={formData.gender}
            onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
          >
            {Object.values(Gender).map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 mt-4"
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
