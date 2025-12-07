"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import FormField from '../../../components/FormField';
import Alert from '../../../components/Alert';
import Spinner from '../../../components/Spinner';
import Input from '../../../components/Input';

export default function DoctorRegister() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    specializations: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.full_name) errs.full_name = 'Full name is required';
    if (!formData.email || !formData.email.includes('@')) errs.email = 'Valid email is required';
    if (!formData.password || formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length ? errs : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientError = validate();
    if (clientError) {
      const first = Object.values(clientError)[0];
      return setError(first);
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/doctor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          specializations: formData.specializations
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.doctor));
      localStorage.setItem('userRole', 'doctor');

      router.push('/doctor/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <h1 className="text-2xl font-bold mb-4">Doctor Registration</h1>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="mt-4">
          <FormField label="Full Name" htmlFor="full_name">
            <Input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => { handleChange(e); setFieldErrors((s) => ({ ...s, full_name: undefined })); }}
              className={fieldErrors.full_name ? 'border-red-400 ring-1 ring-red-100' : ''}
            />
          </FormField>

          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => { handleChange(e); setFieldErrors((s) => ({ ...s, email: undefined })); }}
              className={fieldErrors.email ? 'border-red-400 ring-1 ring-red-100' : ''}
            />
          </FormField>

          <FormField label="Phone" htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Specializations (comma-separated)" htmlFor="specializations">
            <Input
              textarea
              id="specializations"
              name="specializations"
              value={formData.specializations}
              onChange={handleChange as any}
              placeholder="e.g., Cardiology, Surgery"
            />
          </FormField>

          <FormField label="Password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => { handleChange(e); setFieldErrors((s) => ({ ...s, password: undefined })); }}
              className={fieldErrors.password ? 'border-red-400 ring-1 ring-red-100' : ''}
            />
          </FormField>

          <div className="mt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner className="h-4 w-4" /> : 'Register'}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">Already have an account? <Link href="/doctor/login" className="text-blue-600 underline">Login here</Link></p>
      </Card>
    </div>
  );
}
