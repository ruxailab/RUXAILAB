import { jest } from '@jest/globals';

const mockSet = jest.fn();
const mockUpdate = jest.fn();
const mockGet = jest.fn();

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: {
    firestore: Object.assign(jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          set: mockSet,
          get: mockGet,
          update: mockUpdate,
          id: 'mock-calib-id'
        }),
      }),
    }), {
      FieldValue: {
        serverTimestamp: jest.fn().mockReturnValue('mock-timestamp')
      }
    })
  },
  functions: {
    onRequest: jest.fn((opts) => opts?.handler || opts),
  },
}));

const { receiveCalibration, getCalibrationConfig } = await import('../src/https/eyeTracking.js');

describe('eyeTracking.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('receiveCalibration', () => {
    it('returns 405 if not POST', async () => {
      const req = { method: 'GET' };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      
      await receiveCalibration(req, res);
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.send).toHaveBeenCalledWith('Method Not Allowed');
    });

    it('returns 400 if session_id is missing', async () => {
      const req = { method: 'POST', body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      await receiveCalibration(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'session_id is required' });
    });

    it('saves calibration and updates existing user', async () => {
      const req = { method: 'POST', body: { session_id: 'user-123', screen_height: 1080, screen_width: 1920, k: 5 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockGet.mockResolvedValueOnce({ exists: true });

      await receiveCalibration(req, res);
      
      expect(mockSet).toHaveBeenCalledWith({
        session_id: 'user-123',
        screen_height: 1080,
        screen_width: 1920,
        k: 5,
        createdAt: 'mock-timestamp'
      });
      expect(mockUpdate).toHaveBeenCalledWith({ calibrationId: 'mock-calib-id' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Calibration saved and user updated successfully' });
    });

    it('sets calibration if user doc does not exist', async () => {
      const req = { method: 'POST', body: { session_id: 'user-456' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockGet.mockResolvedValueOnce({ exists: false });

      await receiveCalibration(req, res);
      expect(mockSet).toHaveBeenCalledTimes(2); 
    });

    it('handles exceptions correctly', async () => {
      const req = { method: 'POST', body: { session_id: 'user-error' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      mockGet.mockRejectedValueOnce(new Error('Calib Error'));

      await receiveCalibration(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Calib Error' });
    });
  });

  describe('getCalibrationConfig', () => {
    it('returns 405 if not GET', async () => {
        const req = { method: 'POST' };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        
        await getCalibrationConfig(req, res);
        expect(res.status).toHaveBeenCalledWith(405);
        expect(res.send).toHaveBeenCalledWith('Method Not Allowed');
    });

    it('returns 400 if testId is missing', async () => {
        const req = { method: 'GET', query: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        
        await getCalibrationConfig(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'testId is required' });
    });

    it('returns 404 if test not found', async () => {
        const req = { method: 'GET', query: { testId: 'not-exist' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        mockGet.mockResolvedValueOnce({ exists: false });

        await getCalibrationConfig(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Test not found' });
    });

    it('returns 404 if config is missing', async () => {
        const req = { method: 'GET', query: { testId: 'no-config' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ calibrationConfig: null }) });

        await getCalibrationConfig(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Calibration config not found in test' });
    });

    it('returns config data correctly', async () => {
        const req = { method: 'GET', query: { testId: 'has-config' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ calibrationConfig: { color: 'blue' } }) });

        await getCalibrationConfig(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ testId: 'has-config', calibrationConfig: { color: 'blue' } });
    });
  });
});
