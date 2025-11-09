// Mock next-auth server session so API routes think the request is authenticated
// Mock next-auth server session so API routes think the request is authenticated
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => {
    // return a dummy handler function the auth route expects
    return (_req: any, _res: any) => {};
  }),
  getServerSession: jest.fn(async () => ({ user: { id: 'user1', clinicId: 'clinic-demo' } })),
}));

// Mock Prisma client used by the route
jest.mock('@/lib/prisma', () => {
  const patientData: any[] = [];
  return {
    prisma: {
      patient: {
        create: jest.fn(async ({ data }: { data: any }) => ({ id: 'p1', ...data })),
        findMany: jest.fn(async () => patientData),
      },
    },
  };
});

import { prisma } from '@/lib/prisma';
import * as PatientsRoute from '@/app/api/patients/route';

describe('Patients API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/patients creates a patient', async () => {
    const body = { name: 'Test', email: 't@example.com', age: 30, condition: 'N/A' };
    const req = new Request('http://localhost/api/patients', { method: 'POST', body: JSON.stringify(body) });

    const res = await PatientsRoute.POST(req as any);
    // route returns NextResponse.json — check status and body
    const json = await res.json();

    expect(prisma.patient.create).toHaveBeenCalled();
    expect(json.patient.name).toBe('Test');
  });

  test('GET /api/patients returns list', async () => {
    // ensure findMany mock returns array
    (prisma.patient.findMany as jest.Mock).mockResolvedValueOnce([{ id: 'p1', name: 'A', age: 20, condition: 'N/A' }]);

    const req = new Request('http://localhost/api/patients', { method: 'GET' });
    const res = await PatientsRoute.GET();
    const json = await res.json();

    expect(Array.isArray(json.patients)).toBe(true);
    expect(json.patients[0].name).toBe('A');
  });
});
