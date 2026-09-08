import { useState } from 'react';

import {
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
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
    description: 'Manage employees, policies, reports and settings.',
    email: 'admin@demo.neddconsultant.com',
    password: 'admin123',
    icon: ShieldCheck,
  },
  manager: {
    label: 'Manager Demo',
    description: 'Review team requests, approvals and availability.',
    email: 'manager@demo.neddconsultant.com',
    password: 'manager123',
    icon: UsersRound,
  },
  employee: {
    label: 'Employee Demo',
    description: 'Apply for leave, view balances and track requests.',
    email: 'employee@demo.neddconsultant.com',
    password: 'employee123',
    icon: UserRound,
  },
} as const;

type DemoRole =
  keyof typeof DEMO_ACCOUNTS;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

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

      setLoading(
        true
      );

      setActiveDemoRole(
        role
      );

      try {
        const result =
          await login(
            account.email,
            account.password
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

        setPopup({
          open: true,
          type: 'error',
          title: 'Login Failed',
          message:
            result.error ||
            'Unable to open the demo account.',
        });
      } catch {
        setPopup({
          open: true,
          type: 'error',
          title: 'Login Failed',
          message:
            'Unable to open the demo account. Please try again.',
        });
      } finally {
        setLoading(
          false
        );

        setActiveDemoRole(
          null
        );
      }
    };

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-8 text-slate-900 sm:px-6">
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

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
              <img
                src="/neddconsultantlogo.png"
                alt="Nedd Consultant"
                className="h-16 w-auto object-contain sm:h-20"
              />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Leave Management Software
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Explore the demo
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Choose a role below to see how the system works from each user&apos;s point of view.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
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
              ]) => {
                const Icon =
                  account.icon;

                const isActive =
                  loading &&
                  activeDemoRole ===
                    role;

                return (
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
                    className="group flex min-h-[230px] flex-col items-start rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60 disabled:cursor-not-allowed disabled:opacity-60 sm:p-7"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                      <Icon className="h-5 w-5" />
                    </span>

                    <h2 className="mt-6 text-lg font-semibold text-slate-950">
                      {
                        isActive
                          ? 'Opening demo...'
                          : account.label
                      }
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {
                        account.description
                      }
                    </p>

                    <span className="mt-auto pt-6 text-sm font-semibold text-blue-600">
                      {
                        isActive
                          ? 'Please wait'
                          : 'Open demo'
                      }
                    </span>
                  </button>
                );
              }
            )}
          </div>

          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center shadow-sm">
            <p className="text-xs leading-5 text-slate-500">
              Demo mode only. Changes to employees, leave requests, approvals, policies and settings are temporary browser data and are not saved to the production database.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © 2026 Nedd Consultant · Leave Management Software
          </p>
        </div>
      </div>
    </div>
  );
}
