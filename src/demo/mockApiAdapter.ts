import type {
  AxiosAdapter,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

const DEMO_STATE_KEY = 'nedd-demo-api-state-v1';
const DEMO_USER_KEY = 'nedd-demo-current-user-id';

// Dedicated demo repository: never call the production backend.
export const isDemoMode = true;

type JsonRecord = Record<string, any>;

interface DemoState {
  users: JsonRecord[];
  grades: JsonRecord[];
  departments: JsonRecord[];
  designations: JsonRecord[];
  roles: JsonRecord[];
  leavePolicies: JsonRecord[];
  leaveRequests: JsonRecord[];
  notifications: JsonRecord[];
  auditLogs: JsonRecord[];
  feedback: JsonRecord[];
}

const now = () => new Date().toISOString();

function seedState(): DemoState {
  return {
    users: [
      {
        _id: 'u1', employeeId: 'NDD-001', fullName: 'Sarah Mitchell',
        email: 'admin@demo.neddconsultant.com', role: 'admin',
        designation: 'Chief Operating Officer', department: 'Management',
        gradeId: { _id: 'g1', name: 'Grade A' }, dateOfJoining: '2021-01-10',
        cnic: '42201-1234567-1', phone: '+92-321-1234567', status: 'active',
        managerId: null, canApproveOtherDepartments: true,
        detailsStatus: 'complete', pendingFields: [], mustChangePassword: false,
        passwordChangedFromDefault: true,
      },
      {
        _id: 'u2', employeeId: 'NDD-002', fullName: 'James Carter',
        email: 'manager@demo.neddconsultant.com', role: 'manager',
        designation: 'Engineering Manager', department: 'Engineering',
        gradeId: { _id: 'g2', name: 'Grade B' }, dateOfJoining: '2021-03-15',
        cnic: '42201-2345678-2', phone: '+92-322-2345678', status: 'active',
        managerId: 'u1', canApproveOtherDepartments: false,
        detailsStatus: 'complete', pendingFields: [], mustChangePassword: false,
        passwordChangedFromDefault: true,
      },
      {
        _id: 'u3', employeeId: 'NDD-003', fullName: 'Priya Sharma',
        email: 'employee@demo.neddconsultant.com', role: 'employee',
        designation: 'Senior Software Engineer', department: 'Engineering',
        gradeId: { _id: 'g3', name: 'Grade C' }, dateOfJoining: '2022-01-20',
        cnic: '42201-3456789-3', phone: '+92-333-3456789', status: 'active',
        managerId: 'u2', canApproveOtherDepartments: false,
        detailsStatus: 'complete', pendingFields: [], mustChangePassword: false,
        passwordChangedFromDefault: true,
      },
      {
        _id: 'u4', employeeId: 'NDD-004', fullName: 'Alex Thompson',
        email: 'alex@demo.neddconsultant.com', role: 'employee',
        designation: 'Software Engineer', department: 'Engineering',
        gradeId: { _id: 'g3', name: 'Grade C' }, dateOfJoining: '2023-06-01',
        cnic: '42201-4567890-4', phone: '+92-300-4567890', status: 'active',
        managerId: 'u2', canApproveOtherDepartments: false,
        detailsStatus: 'complete', pendingFields: [], mustChangePassword: false,
        passwordChangedFromDefault: true,
      },
      {
        _id: 'u5', employeeId: 'NDD-005', fullName: 'Maria Santos',
        email: 'maria@demo.neddconsultant.com', role: 'employee',
        designation: 'Marketing Specialist', department: 'Marketing',
        gradeId: { _id: 'g4', name: 'Grade D' }, dateOfJoining: '2024-02-12',
        cnic: '42201-5678901-5', phone: '+92-301-5678901', status: 'active',
        managerId: 'u2', canApproveOtherDepartments: false,
        detailsStatus: 'complete', pendingFields: [], mustChangePassword: false,
        passwordChangedFromDefault: true,
      },
    ],
    grades: [
      { _id: 'g1', name: 'Grade A', description: 'Senior leadership & executives' },
      { _id: 'g2', name: 'Grade B', description: 'Managers & senior professionals' },
      { _id: 'g3', name: 'Grade C', description: 'Mid-level professionals' },
      { _id: 'g4', name: 'Grade D', description: 'Junior & entry-level employees' },
    ],
    departments: [
      { _id: 'd1', name: 'Management', saturdayOff: true },
      { _id: 'd2', name: 'Engineering', saturdayOff: true },
      { _id: 'd3', name: 'Marketing', saturdayOff: true },
      { _id: 'd4', name: 'Design', saturdayOff: false },
    ],
    designations: [
      { _id: 'des1', name: 'Chief Operating Officer' },
      { _id: 'des2', name: 'Engineering Manager' },
      { _id: 'des3', name: 'Senior Software Engineer' },
      { _id: 'des4', name: 'Software Engineer' },
      { _id: 'des5', name: 'Marketing Specialist' },
    ],
    roles: [
      { _id: 'r1', name: 'Admin' },
      { _id: 'r2', name: 'Manager' },
      { _id: 'r3', name: 'Employee' },
    ],
    leavePolicies: [
      {
        _id: 'lp1', leaveType: 'annual', isPaid: true,
        documentRequirement: 'optional', carryForwardAllowed: true,
        maxCarryForwardDays: 5, finalApprovalMode: true,
        gradeQuotas: [
          { gradeId: { _id: 'g1', name: 'Grade A' }, yearlyQuota: 25 },
          { gradeId: { _id: 'g2', name: 'Grade B' }, yearlyQuota: 21 },
          { gradeId: { _id: 'g3', name: 'Grade C' }, yearlyQuota: 18 },
          { gradeId: { _id: 'g4', name: 'Grade D' }, yearlyQuota: 14 },
        ],
        approvalRouting: { approverIds: [] },
      },
      {
        _id: 'lp2', leaveType: 'sick', isPaid: true,
        documentRequirement: 'required', carryForwardAllowed: false,
        maxCarryForwardDays: 0, finalApprovalMode: true,
        gradeQuotas: [
          { gradeId: { _id: 'g1', name: 'Grade A' }, yearlyQuota: 14 },
          { gradeId: { _id: 'g2', name: 'Grade B' }, yearlyQuota: 12 },
          { gradeId: { _id: 'g3', name: 'Grade C' }, yearlyQuota: 10 },
          { gradeId: { _id: 'g4', name: 'Grade D' }, yearlyQuota: 7 },
        ],
        approvalRouting: { approverIds: [] },
      },
      {
        _id: 'lp3', leaveType: 'casual', isPaid: true,
        documentRequirement: 'not_required', carryForwardAllowed: false,
        maxCarryForwardDays: 0, finalApprovalMode: true,
        gradeQuotas: [
          { gradeId: { _id: 'g1', name: 'Grade A' }, yearlyQuota: 10 },
          { gradeId: { _id: 'g2', name: 'Grade B' }, yearlyQuota: 8 },
          { gradeId: { _id: 'g3', name: 'Grade C' }, yearlyQuota: 6 },
          { gradeId: { _id: 'g4', name: 'Grade D' }, yearlyQuota: 5 },
        ],
        approvalRouting: { approverIds: [] },
      },
    ],
    leaveRequests: [
      {
        _id: 'lr1', employeeId: { _id: 'u3', fullName: 'Priya Sharma' },
        employeeName: 'Priya Sharma', department: 'Engineering', leaveType: 'annual',
        startDate: '2026-09-07', endDate: '2026-09-11', totalDaysRequested: 5,
        totalWorkingDays: 5, excludedWeekendDates: [], reason: 'Family vacation',
        status: 'pending', requiredApproverIds: ['u2'], approvedByIds: [], rejectedByIds: [],
        approvalHistory: [], isAdminOnlyDecision: false, isExtension: false,
        isStopRequest: false, createdAt: now(), hasAttachment: false,
      },
      {
        _id: 'lr2', employeeId: { _id: 'u4', fullName: 'Alex Thompson' },
        employeeName: 'Alex Thompson', department: 'Engineering', leaveType: 'sick',
        startDate: '2026-08-10', endDate: '2026-08-11', totalDaysRequested: 2,
        totalWorkingDays: 2, excludedWeekendDates: [], reason: 'Medical appointment',
        status: 'approved', requiredApproverIds: ['u2'], approvedByIds: ['u2'], rejectedByIds: [],
        approvalHistory: [{ approverId: 'u2', approverName: 'James Carter', approverRole: 'manager', action: 'approved', comment: 'Approved.', actionDate: now() }],
        isAdminOnlyDecision: false, isExtension: false, isStopRequest: false,
        createdAt: now(), hasAttachment: true, attachmentName: 'medical-note.pdf',
      },
    ],
    notifications: [
      { _id: 'n1', userId: 'u2', type: 'leave_pending_approval', message: 'Priya Sharma submitted annual leave. Action required.', relatedLeaveRequestId: 'lr1', isRead: false, createdAt: now() },
      { _id: 'n2', userId: 'u4', type: 'leave_approved', message: 'Your sick leave request was approved.', relatedLeaveRequestId: 'lr2', isRead: true, createdAt: now() },
    ],
    auditLogs: [
      { _id: 'a1', actorId: 'u1', actorName: 'Sarah Mitchell', action: 'CREATE_EMPLOYEE', targetType: 'User', targetId: 'u5', details: 'Created employee Maria Santos', affectedPerson: 'Maria Santos', department: 'Marketing', createdAt: now() },
      { _id: 'a2', actorId: 'u2', actorName: 'James Carter', action: 'APPROVE_LEAVE', targetType: 'LeaveRequest', targetId: 'lr2', details: 'Approved sick leave for Alex Thompson', affectedPerson: 'Alex Thompson', department: 'Engineering', leaveType: 'sick', createdAt: now() },
    ],
    feedback: [
      { id: 'f1', _id: 'f1', organizationId: 'org1', organizationName: 'Demo Company', submittedByName: 'Sarah Mitchell', submittedByEmail: 'admin@demo.neddconsultant.com', type: 'feedback', subject: 'Dashboard looks good', message: 'Demo feedback item for the SaaS owner view.', status: 'new', superAdminNote: '', createdAt: now(), updatedAt: now() },
    ],
  };
}

function loadState(): DemoState {
  try {
    const raw = sessionStorage.getItem(DEMO_STATE_KEY);
    if (raw) return JSON.parse(raw) as DemoState;
  } catch {
    // Ignore and re-seed demo state.
  }
  const seeded = seedState();
  saveState(seeded);
  return seeded;
}

function saveState(state: DemoState) {
  sessionStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
}

export function resetDemoData() {
  sessionStorage.removeItem(DEMO_STATE_KEY);
  sessionStorage.removeItem(DEMO_USER_KEY);
  localStorage.removeItem('accessToken');
  localStorage.removeItem('authUser');
  loadState();
}

function makeResponse(
  config: AxiosRequestConfig,
  data: any,
  status = 200
): AxiosResponse {
  return {
    data,
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
    headers: {},
    config: config as any,
    request: {},
  };
}

function parseBody(config: AxiosRequestConfig): JsonRecord {
  const data = config.data;
  if (!data) return {};

  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const out: JsonRecord = {};
    data.forEach((value, key) => {
      out[key] = value instanceof File ? value.name : value;
    });
    return out;
  }

  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return {}; }
  }

  return typeof data === 'object' ? data : {};
}

function pathOf(config: AxiosRequestConfig) {
  const raw = String(config.url || '').split('?')[0];
  return raw.replace(/^https?:\/\/[^/]+\/api/, '').replace(/^\/api/, '') || '/';
}

function methodOf(config: AxiosRequestConfig) {
  return String(config.method || 'get').toLowerCase();
}

function currentUser(state: DemoState) {
  const id = sessionStorage.getItem(DEMO_USER_KEY) || 'u1';
  return state.users.find((user) => user._id === id) || state.users[0];
}

function gradeObject(state: DemoState, gradeId: any) {
  const id = typeof gradeId === 'object' ? gradeId?._id : gradeId;
  return state.grades.find((grade) => grade._id === id) || null;
}

function employeeFromPayload(state: DemoState, body: JsonRecord, existing?: JsonRecord) {
  const grade = gradeObject(state, body.gradeId ?? existing?.gradeId);
  return {
    ...(existing || {}),
    ...body,
    _id: existing?._id || `u${Date.now()}`,
    gradeId: grade,
    status: body.status || existing?.status || 'active',
    detailsStatus: body.detailsStatus || existing?.detailsStatus || 'complete',
    pendingFields: body.pendingFields || existing?.pendingFields || [],
    dateOfJoining: body.dateOfJoining || existing?.dateOfJoining || new Date().toISOString().slice(0, 10),
    canApproveOtherDepartments: Boolean(body.canApproveOtherDepartments ?? existing?.canApproveOtherDepartments),
  };
}

function leaveIdFromPath(path: string) {
  return path.split('/')[2] || '';
}

function workingDays(start: string, end: string) {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  let count = 0;
  for (const d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return Math.max(0, count);
}

const demoAxiosAdapter: AxiosAdapter = async (config) => {
  await new Promise((resolve) => setTimeout(resolve, 120));

  const state = loadState();
  const path = pathOf(config);
  const method = methodOf(config);
  const body = parseBody(config);

  // Authentication
  if (path === '/auth/login' && method === 'post') {
    const email = String(body.email || '').trim().toLowerCase();
    const passwords: Record<string, string> = {
      'admin@demo.neddconsultant.com': 'admin123',
      'manager@demo.neddconsultant.com': 'manager123',
      'employee@demo.neddconsultant.com': 'employee123',
    };
    const user = state.users.find((item) => item.email.toLowerCase() === email);
    if (!user || passwords[email] !== body.password) {
      return makeResponse(config, { success: false, message: 'Invalid demo email or password.' }, 401);
    }
    sessionStorage.setItem(DEMO_USER_KEY, user._id);
    return makeResponse(config, { success: true, accessToken: `demo-token-${user._id}`, user });
  }

  if (path === '/auth/logout' && method === 'post') {
    sessionStorage.removeItem(DEMO_USER_KEY);
    return makeResponse(config, { success: true });
  }

  if ((path === '/auth/change-password' || path === '/employees/me/change-password') && ['post', 'patch'].includes(method)) {
    return makeResponse(config, { success: true, message: 'Demo password updated for this browser session.' });
  }

  if (path === '/employees/me' && method === 'get') {
    return makeResponse(config, { success: true, data: currentUser(state) });
  }

  // Employees
  if (path === '/employees' && method === 'get') {
    return makeResponse(config, { success: true, data: state.users.filter((u) => u.status !== 'pending_deletion'), total: state.users.length, page: 1, limit: 500, totalPages: 1 });
  }

  if (path === '/employees/removed' && method === 'get') {
    return makeResponse(config, { success: true, data: state.users.filter((u) => u.status === 'pending_deletion') });
  }

  if (path === '/employees/export.csv' && method === 'get') {
    const header = 'fullName,email,employeeId,role,designation,grade,department,status';
    const rows = state.users.map((u) => [u.fullName, u.email, u.employeeId, u.role, u.designation, u.gradeId?.name || '', u.department, u.status].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    return makeResponse(config, [header, ...rows].join('\n'));
  }

  if (path === '/employees/import' && method === 'post') {
    const mode = String((config.params as any)?.mode || 'preview');
    if (mode === 'preview') {
      return makeResponse(config, {
        success: true, preview: true, requiresConfirmation: true,
        summary: { total: 3, complete: 3, pending: 0, blocking: 0 },
        pendingEmployees: [], hardErrors: [],
        message: 'Demo preview only. No real accounts or emails are created.'
      });
    }
    return makeResponse(config, {
      success: true, preview: false, created: 3,
      summary: { total: 3, complete: 3, pending: 0, blocking: 0 },
      pendingEmployees: [], hardErrors: [],
      message: 'Demo import completed in temporary browser data. No email was sent.'
    });
  }

  if (path === '/employees' && method === 'post') {
    const created = employeeFromPayload(state, body);
    state.users.push(created);
    state.auditLogs.unshift({ _id: `a${Date.now()}`, actorId: currentUser(state)._id, actorName: currentUser(state).fullName, action: 'CREATE_EMPLOYEE', targetType: 'User', targetId: created._id, details: `Created demo employee ${created.fullName}`, affectedPerson: created.fullName, department: created.department, createdAt: now() });
    saveState(state);
    return makeResponse(config, { success: true, data: created }, 201);
  }

  const employeeMatch = path.match(/^\/employees\/([^/]+)$/);
  if (employeeMatch && method === 'get') {
    const employee = state.users.find((u) => u._id === employeeMatch[1]);
    return makeResponse(config, { success: Boolean(employee), data: employee }, employee ? 200 : 404);
  }
  if (employeeMatch && method === 'patch') {
    const index = state.users.findIndex((u) => u._id === employeeMatch[1]);
    if (index < 0) return makeResponse(config, { success: false, message: 'Employee does not exist.' }, 404);
    state.users[index] = employeeFromPayload(state, body, state.users[index]);
    saveState(state);
    return makeResponse(config, { success: true, data: state.users[index] });
  }

  const completeMatch = path.match(/^\/employees\/([^/]+)\/complete-pending$/);
  if (completeMatch && method === 'patch') {
    const employee = state.users.find((u) => u._id === completeMatch[1]);
    if (!employee) return makeResponse(config, { success: false, message: 'Employee does not exist.' }, 404);
    employee.cnic = body.cnic || employee.cnic;
    employee.detailsStatus = 'complete'; employee.pendingFields = [];
    saveState(state);
    return makeResponse(config, { success: true, data: employee });
  }

  const removeMatch = path.match(/^\/employees\/([^/]+)\/remove$/);
  if (removeMatch && method === 'patch') {
    const employee = state.users.find((u) => u._id === removeMatch[1]);
    if (employee) employee.status = 'pending_deletion';
    saveState(state);
    return makeResponse(config, { success: Boolean(employee), data: employee });
  }

  const restoreMatch = path.match(/^\/employees\/([^/]+)\/restore$/);
  if (restoreMatch && method === 'patch') {
    const employee = state.users.find((u) => u._id === restoreMatch[1]);
    if (employee) employee.status = 'active';
    saveState(state);
    return makeResponse(config, { success: Boolean(employee), data: employee });
  }

  // Master data
  const masters: Record<string, keyof DemoState> = {
    '/grades': 'grades', '/departments': 'departments', '/designations': 'designations', '/roles': 'roles',
  };
  if (masters[path] && method === 'get') {
    return makeResponse(config, { success: true, data: state[masters[path]] });
  }
  if (masters[path] && method === 'post') {
    const key = masters[path];
    const item = { _id: `${String(key)}-${Date.now()}`, ...body };
    (state[key] as JsonRecord[]).push(item);
    saveState(state);
    return makeResponse(config, { success: true, data: item }, 201);
  }
  for (const [base, key] of Object.entries(masters)) {
    const match = path.match(new RegExp(`^${base}/([^/]+)$`));
    if (!match) continue;
    const list = state[key] as JsonRecord[];
    const index = list.findIndex((item) => item._id === match[1] || item.name === decodeURIComponent(match[1]));
    if (method === 'patch' && index >= 0) {
      list[index] = { ...list[index], ...body };
      saveState(state);
      return makeResponse(config, { success: true, data: list[index] });
    }
    if (method === 'delete') {
      if (index >= 0) list.splice(index, 1);
      saveState(state);
      return makeResponse(config, { success: true });
    }
  }

  // Leave policies
  if (path === '/leave-policies' && method === 'get') {
    return makeResponse(config, { success: true, data: state.leavePolicies });
  }
  if (path === '/leave-policies' && method === 'post') {
    const policy = { _id: `lp${Date.now()}`, ...body };
    state.leavePolicies.push(policy); saveState(state);
    return makeResponse(config, { success: true, data: policy }, 201);
  }
  const policyMatch = path.match(/^\/leave-policies\/([^/]+)$/);
  if (policyMatch && method === 'patch') {
    const index = state.leavePolicies.findIndex((p) => p._id === policyMatch[1]);
    if (index >= 0) state.leavePolicies[index] = { ...state.leavePolicies[index], ...body };
    saveState(state);
    return makeResponse(config, { success: index >= 0, data: state.leavePolicies[index] });
  }
  if (policyMatch && method === 'delete') {
    state.leavePolicies = state.leavePolicies.filter((p) => p._id !== policyMatch[1]);
    saveState(state);
    return makeResponse(config, { success: true });
  }

  // Leave requests and balances
  if (path === '/leave-requests' && method === 'get') {
    return makeResponse(config, { success: true, data: state.leaveRequests, total: state.leaveRequests.length });
  }
  if (path === '/leave-requests' && method === 'post') {
    const user = currentUser(state);
    const startDate = String(body.startDate || new Date().toISOString().slice(0, 10));
    const endDate = String(body.endDate || startDate);
    const request = {
      _id: `lr${Date.now()}`, employeeId: { _id: user._id, fullName: user.fullName }, employeeName: user.fullName,
      department: user.department, leaveType: body.leaveType || 'annual', startDate, endDate,
      totalDaysRequested: workingDays(startDate, endDate), totalWorkingDays: workingDays(startDate, endDate),
      excludedWeekendDates: [], reason: body.reason || '', status: 'pending', requiredApproverIds: user.managerId ? [user.managerId] : ['u1'],
      approvedByIds: [], rejectedByIds: [], approvalHistory: [], isAdminOnlyDecision: false,
      isExtension: false, isStopRequest: false, createdAt: now(), hasAttachment: Boolean(body.attachment),
      attachmentName: body.attachment || undefined,
    };
    state.leaveRequests.unshift(request);
    state.notifications.unshift({ _id: `n${Date.now()}`, userId: user.managerId || 'u1', type: 'leave_pending_approval', message: `${user.fullName} submitted ${request.leaveType} leave. Action required.`, relatedLeaveRequestId: request._id, isRead: false, createdAt: now() });
    saveState(state);
    return makeResponse(config, { success: true, data: request }, 201);
  }

  const balanceMatch = path.match(/^\/leave-requests\/balance\/([^/]+)$/);
  if (balanceMatch && method === 'get') {
    const employee = state.users.find((u) => u._id === balanceMatch[1]);
    const gradeId = employee?.gradeId?._id || employee?.gradeId;
    const balances: Record<string, { quota: number; used: number; remaining: number }> = {};
    state.leavePolicies.forEach((policy) => {
      const quota = Number((policy.gradeQuotas || []).find((q: any) => (q.gradeId?._id || q.gradeId) === gradeId)?.yearlyQuota || 0);
      const used = state.leaveRequests.filter((r) => (r.employeeId?._id || r.employeeId) === balanceMatch[1] && r.leaveType === policy.leaveType && r.status === 'approved').reduce((sum, r) => sum + Number(r.totalWorkingDays || 0), 0);
      balances[policy.leaveType] = { quota, used, remaining: Math.max(0, quota - used) };
    });
    return makeResponse(config, { success: true, data: balances });
  }

  const attachmentMatch = path.match(/^\/leave-requests\/([^/]+)\/attachment-url$/);
  if (attachmentMatch && method === 'get') {
    return makeResponse(config, { success: true, data: { url: 'data:text/plain;charset=utf-8,Demo%20attachment', expiresAt: Date.now() + 3600000, expiresInSeconds: 3600, name: 'demo-attachment.txt' } });
  }

  const actionMatch = path.match(/^\/leave-requests\/([^/]+)\/(approve|reject|act-on-behalf)$/);
  if (actionMatch && method === 'patch') {
    const request = state.leaveRequests.find((r) => r._id === actionMatch[1]);
    if (!request) return makeResponse(config, { success: false, message: 'Leave request not found.' }, 404);
    const actor = currentUser(state);
    const action = actionMatch[2] === 'act-on-behalf' ? body.action : (actionMatch[2] === 'approve' ? 'approved' : 'rejected');
    const approverId = actionMatch[2] === 'act-on-behalf' ? body.approverId : actor._id;
    request.approvalHistory = [...(request.approvalHistory || []), { approverId, approverName: actor.fullName, approverRole: actor.role, action, comment: body.comment, actionDate: now() }];
    if (action === 'approved') {
      request.approvedByIds = Array.from(new Set([...(request.approvedByIds || []), approverId]));
      const required = request.requiredApproverIds || [];
      request.status = required.length === 0 || required.every((id: string) => request.approvedByIds.includes(id)) || actor.role === 'admin' ? 'approved' : 'pending';
    } else {
      request.rejectedByIds = Array.from(new Set([...(request.rejectedByIds || []), approverId]));
      request.status = 'rejected';
    }
    saveState(state);
    return makeResponse(config, { success: true, data: request });
  }

  const extendMatch = path.match(/^\/leave-requests\/([^/]+)\/extend$/);
  if (extendMatch && method === 'post') {
    const original = state.leaveRequests.find((r) => r._id === extendMatch[1]);
    if (!original) return makeResponse(config, { success: false, message: 'Leave request not found.' }, 404);
    const extension = { ...original, _id: `lr${Date.now()}`, startDate: original.endDate, endDate: body.newEndDate, reason: body.reason || 'Extension request', status: 'pending', approvedByIds: [], rejectedByIds: [], approvalHistory: [], isExtension: true, originalRequestId: original._id, createdAt: now() };
    extension.totalWorkingDays = workingDays(extension.startDate, extension.endDate);
    extension.totalDaysRequested = extension.totalWorkingDays;
    state.leaveRequests.unshift(extension); saveState(state);
    return makeResponse(config, { success: true, data: extension }, 201);
  }

  const stopMatch = path.match(/^\/leave-requests\/([^/]+)\/request-stop$/);
  if (stopMatch && method === 'post') {
    const original = state.leaveRequests.find((r) => r._id === stopMatch[1]);
    if (!original) return makeResponse(config, { success: false, message: 'Leave request not found.' }, 404);
    const stop = { ...original, _id: `lr${Date.now()}`, startDate: body.returnDate, endDate: body.returnDate, reason: body.reason || 'Stop leave request', status: 'pending', approvedByIds: [], rejectedByIds: [], approvalHistory: [], isStopRequest: true, originalRequestId: original._id, createdAt: now() };
    state.leaveRequests.unshift(stop); saveState(state);
    return makeResponse(config, { success: true, data: stop }, 201);
  }

  // Notifications
  if (path === '/notifications' && method === 'get') {
    const user = currentUser(state);
    const data = state.notifications.filter((n) => !n.userId || n.userId === user._id);
    return makeResponse(config, { success: true, data, unreadCount: data.filter((n) => !n.isRead).length, total: data.length, page: 1, limit: 100, totalPages: 1 });
  }
  if (path === '/notifications/read-all' && method === 'patch') {
    const user = currentUser(state);
    state.notifications.forEach((n) => { if (!n.userId || n.userId === user._id) n.isRead = true; });
    saveState(state); return makeResponse(config, { success: true });
  }
  const notificationMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
  if (notificationMatch && method === 'patch') {
    const notification = state.notifications.find((n) => n._id === notificationMatch[1]);
    if (notification) notification.isRead = true;
    saveState(state); return makeResponse(config, { success: Boolean(notification), data: notification });
  }

  // Audit logs
  if (path === '/audit-logs' && method === 'get') {
    return makeResponse(config, { success: true, data: state.auditLogs });
  }

  // Feedback
  if (path === '/feedback' && method === 'get') {
    return makeResponse(config, { success: true, data: state.feedback });
  }
  if (path === '/feedback' && method === 'post') {
    const user = currentUser(state);
    const item = { id: `f${Date.now()}`, _id: `f${Date.now()}`, organizationName: 'Demo Company', submittedByName: user.fullName, submittedByEmail: user.email, type: body.type || 'feedback', subject: body.subject || '', message: body.message || '', status: 'new', superAdminNote: '', createdAt: now(), updatedAt: now() };
    state.feedback.unshift(item); saveState(state);
    return makeResponse(config, { success: true, data: item, emailSent: false }, 201);
  }

  // Profile/photo and any harmless UI-only endpoint: succeed without external side effects.
  if (path.includes('/profile-photo') && ['post', 'patch', 'delete'].includes(method)) {
    return makeResponse(config, { success: true, data: currentUser(state), message: 'Demo profile photo action simulated.' });
  }

  // Safe fallback: GET -> empty data, writes -> echo body. No network request ever leaves the browser.
  if (method === 'get') {
    return makeResponse(config, { success: true, data: [] });
  }

  return makeResponse(config, { success: true, data: body, message: 'Demo action completed locally.' });
};

export function installDemoApiAdapter(instance: AxiosInstance) {
  if (!isDemoMode) return;
  instance.defaults.adapter = demoAxiosAdapter;
}
