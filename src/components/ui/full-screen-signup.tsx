"use client";

import React, { useState } from 'react';
import { Loader2, SunIcon as Sunburst } from 'lucide-react';

export const FullScreenSignup: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePassword = (value: string) => value.length >= 8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!firstName.trim()) {
      setFirstNameError('يرجى إدخال الاسم الأول.');
      valid = false;
    } else {
      setFirstNameError('');
    }

    if (!lastName.trim()) {
      setLastNameError('يرجى إدخال اسم العائلة.');
      valid = false;
    } else {
      setLastNameError('');
    }

    if (!validateEmail(email)) {
      setEmailError('يرجى إدخال بريد إلكتروني صالح.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!validatePassword(password)) {
      setPasswordError('يجب أن تكون كلمة المرور 8 أحرف على الأقل.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!acceptTerms) {
      setTermsError('يجب الموافقة على الشروط والأحكام للمتابعة.');
      valid = false;
    } else {
      setTermsError('');
    }

    setSubmitted(true);

    if (valid) {
      // في هذه النسخة، الاعتماد الأساسي على تسجيل الدخول بحساب Google
      // يمكن لاحقاً ربط البريد/كلمة المرور بنظام مصادقة في الخادم
      // eslint-disable-next-line no-console
      console.log('Form submitted!', { firstName, lastName, email });
      setTimeout(() => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setAcceptTerms(false);
        setSubmitted(false);
      }, 1200);
    } else {
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden px-4 py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="w-full relative max-w-lg overflow-hidden flex flex-col shadow-[0_40px_120px_rgba(15,23,42,0.9)] rounded-3xl bg-[#020617]/95 border border-slate-800/80">
        {/* رأس البطاقة */}
        <div className="relative px-6 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-blue-600/80 flex items-center justify-center border border-blue-400/60 shadow-[0_0_20px_rgba(37,99,235,0.6)]">
              <span className="text-xs font-bold tracking-tight">ML</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">MonaLab الأكاديمي</span>
              <span className="text-[10px] text-slate-400">
                حساب واحد لإدارة أبحاثك ومحادثاتك.
              </span>
            </div>
          </div>
          <a
            href="/"
            className="text-[11px] text-slate-300 hover:text-white underline underline-offset-4"
          >
            العودة للموقع
          </a>
        </div>

        {/* محتوى النموذج */}
        <div className="relative p-6 pt-4 flex flex-col text-slate-50">
          {submitted && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <p className="text-xs text-slate-300">
                  جاري معالجة البيانات... قد يستغرق ذلك لحظات قليلة.
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-col items-start mb-6">
            <div className="text-blue-400 mb-4">
              <Sunburst className="h-9 w-9" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 tracking-tight">
              أنشئ حسابك أو سجّل دخولك
            </h2>
            <p className="text-xs text-slate-400">
              يمكنك تعبئة البيانات أدناه كنموذج أولي لنظام الحسابات (دون تسجيل دخول فعلي في هذه النسخة).
            </p>
          </div>

          <div className="flex flex-col gap-3 mb-6 w-full">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex-1 h-px bg-slate-800" />
              <span>إنشاء حساب بالبريد الإلكتروني</span>
              <span className="flex-1 h-px bg-slate-800" />
            </div>
          </div>

          <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-right">
              <div>
                <label htmlFor="firstName" className="block text-xs mb-1 text-slate-200">
                  الاسم الأول
                </label>
                <input
                  type="text"
                  id="firstName"
                  className={`text-sm w-full py-2.5 px-3 rounded-lg focus:outline-none focus:ring-1 bg-slate-900 text-slate-50 focus:ring-blue-500 ${
                    firstNameError ? 'border border-red-500' : 'border border-slate-700'
                  }`}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-invalid={!!firstNameError}
                />
                {firstNameError && (
                  <p className="text-red-400 text-xs mt-1">{firstNameError}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs mb-1 text-slate-200">
                  اسم العائلة
                </label>
                <input
                  type="text"
                  id="lastName"
                  className={`text-sm w-full py-2.5 px-3 rounded-lg focus:outline-none focus:ring-1 bg-slate-900 text-slate-50 focus:ring-blue-500 ${
                    lastNameError ? 'border border-red-500' : 'border border-slate-700'
                  }`}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-invalid={!!lastNameError}
                />
                {lastNameError && (
                  <p className="text-red-400 text-xs mt-1">{lastNameError}</p>
                )}
              </div>
            </div>

            <div className="w-full text-right">
              <label htmlFor="email" className="block text-xs mb-1 text-slate-200">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                className={`text-sm w-full py-2.5 px-3 rounded-lg focus:outline-none focus:ring-1 bg-slate-900 text-slate-50 focus:ring-blue-500 ${
                  emailError ? 'border border-red-500' : 'border border-slate-700'
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby="email-error"
              />
              {emailError && (
                <p id="email-error" className="text-red-400 text-xs mt-1">
                  {emailError}
                </p>
              )}
            </div>

            <div className="w-full text-right">
              <label htmlFor="password" className="block text-xs mb-1 text-slate-200">
                كلمة المرور
              </label>
              <input
                type="password"
                id="password"
                className={`text-sm w-full py-2.5 px-3 rounded-lg focus:outline-none focus:ring-1 bg-slate-900 text-slate-50 focus:ring-blue-500 ${
                  passwordError ? 'border border-red-500' : 'border border-slate-700'
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
                aria-describedby="password-error"
              />
              {passwordError && (
                <p id="password-error" className="text-red-400 text-xs mt-1">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
                />
                <span>
                  أوافق على{' '}
                  <a href="/terms" className="underline text-slate-100">
                    الشروط والأحكام
                  </a>
                </span>
              </label>
            </div>
            {termsError && (
              <p className="text-red-400 text-xs text-right mt-1">{termsError}</p>
            )}

            <button
              type="submit"
              disabled={submitted}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              إنشاء حساب جديد
            </button>

            <div className="text-center text-slate-400 text-xs mt-2">
              في الإصدار الحالي لا يوجد نظام تسجيل دخول فعلي، بل نموذج واجهة فقط لإدخال البيانات.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

