import {
  useState,
  type FormEvent,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';

type PopupType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

interface PopupState {
  open: boolean;
  type: PopupType;
  title: string;
  message: string;
}

const DEMO_ACCOUNTS = {
  admin: {
    label: 'Admin Demo',
    email: 'admin@demo.neddconsultant.com',
    password: 'admin123',
  },
  manager: {
    label: 'Manager Demo',
    email: 'manager@demo.neddconsultant.com',
    password: 'manager123',
  },
  employee: {
    label: 'Employee Demo',
    email: 'employee@demo.neddconsultant.com',
    password: 'employee123',
  },
} as const;

type DemoRole =
  keyof typeof DEMO_ACCOUNTS;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [
    activeDemoRole,
    setActiveDemoRole,
  ] =
    useState<DemoRole | null>(
      null
    );

  const [
    popup,
    setPopup,
  ] =
    useState<PopupState>({
      open: false,
      type: 'error',
      title: '',
      message: '',
    });

  const showPopup = (
    type: PopupType,
    title: string,
    message: string
  ) => {
    setPopup({
      open: true,
      type,
      title,
      message,
    });
  };

  const closePopup = () => {
    setPopup(
      (
        current
      ) => ({
        ...current,
        open: false,
      })
    );
  };

  const signIn = async (
    nextEmail: string,
    nextPassword: string
  ) => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const result =
        await login(
          nextEmail.trim(),
          nextPassword
        );

      if (
        result.success
      ) {
        navigate(
          '/dashboard',
          {
            replace: true,
          }
        );

        return;
      }

      showPopup(
        'error',
        'Login Failed',
        result.error ||
          'Invalid email or password.'
      );
    } catch {
      showPopup(
        'error',
        'Login Failed',
        'Unable to sign in. Please try again.'
      );
    } finally {
      setLoading(
        false
      );

      setActiveDemoRole(
        null
      );
    }
  };

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (
        loading
      ) {
        return;
      }

      if (
        !email.trim()
      ) {
        showPopup(
          'warning',
          'Email Required',
          'Please enter your email address.'
        );

        return;
      }

      if (
        !password.trim()
      ) {
        showPopup(
          'warning',
          'Password Required',
          'Please enter your password.'
        );

        return;
      }

      await signIn(
        email,
        password
      );
    };

  const handleDemoSignIn =
    async (
      role:
        DemoRole
    ) => {
      if (
        loading
      ) {
        return;
      }

      const account =
        DEMO_ACCOUNTS[
          role
        ];

      setActiveDemoRole(
        role
      );

      setEmail(
        account.email
      );

      setPassword(
        account.password
      );

      await signIn(
        account.email,
        account.password
      );
    };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 px-4 py-6">
      <Popup
        open={
          popup.open
        }
        type={
          popup.type
        }
        title={
          popup.title
        }
        message={
          popup.message
        }
        onClose={
          closePopup
        }
      />

      <div className="w-full max-w-sm">
        <div className="mb-4 flex flex-col items-center">
          <img
            src="/neddconsultantlogo.png"
            alt="Nedd Consultant"
            className="h-16 w-auto object-contain"
          />

          <h1 className="mt-3 text-xl font-semibold text-gray-900">
            Nedd Consultant
          </h1>

          <p className="text-xs text-gray-500">
            Leave Management Software
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl shadow-gray-200/50">
          <h2 className="text-base font-semibold text-gray-900">
            Demo Sign In
          </h2>

          <p className="mt-0.5 text-xs leading-5 text-gray-500">
            Demo data only. Nothing is saved to the production database.
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {(
              Object.entries(
                DEMO_ACCOUNTS
              ) as Array<
                [
                  DemoRole,
                  (
                    typeof DEMO_ACCOUNTS
                  )[DemoRole],
                ]
              >
            ).map(
              ([
                role,
                account,
              ]) => (
                <button
                  key={
                    role
                  }
                  type="button"
                  disabled={
                    loading
                  }
                  onClick={() =>
                    void handleDemoSignIn(
                      role
                    )
                  }
                  className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {
                    loading &&
                    activeDemoRole ===
                      role
                      ? 'Signing in...'
                      : account.label
                  }
                </button>
              )
            )}
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-4 space-y-3"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={
                  email
                }
                onChange={(
                  event
                ) =>
                  setEmail(
                    event
                      .target
                      .value
                  )
                }
                disabled={
                  loading
                }
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={
                  password
                }
                onChange={(
                  event
                ) =>
                  setPassword(
                    event
                      .target
                      .value
                  )
                }
                disabled={
                  loading
                }
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            <Button
              type="submit"
              disabled={
                loading
              }
              className="w-full"
            >
              {
                loading &&
                !activeDemoRole
                  ? 'Signing in...'
                  : 'Sign in'
              }
            </Button>
          </form>
        </div>

        <p className="mt-3 text-center text-[10px] leading-4 text-amber-600">
          Demo mode: employee, leave, approval, policy and admin actions are temporary browser data only.
        </p>

        <p className="mt-3 text-center text-[10px] text-gray-400">
          © 2026 Nedd Consultant · Leave Management Software
        </p>
      </div>
    </div>
  );
}
