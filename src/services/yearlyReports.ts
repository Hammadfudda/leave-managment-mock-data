import api from './api';

export interface YearlyLeaveSnapshot {
  leaveYear: number;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  division: string;
  department: string;
  designation: string;
  grade: string;
  leaveType: string;
  granted: number;
  used: number;
  remaining: number;
  employeeStatus?: string;
  detailsStatus?: string;
  capturedAt?: string;
}

export async function getYearlyLeaveReport(
  year: number
): Promise<YearlyLeaveSnapshot[]> {
  const response = await api.get(
    '/audit-logs/yearly',
    {
      params: {
        year,
      },
    }
  );

  return response.data?.data || [];
}

export async function exportYearlyLeaveReport(
  year: number
): Promise<Blob> {
  const response = await api.get(
    '/audit-logs/yearly/export.csv',
    {
      params: {
        year,
      },
      responseType: 'blob',
    }
  );

  return response.data;
}
