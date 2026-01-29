import TemplateController from '@/features/templates/TemplateController'
import { createControllerSpies } from './helpers/testUtils'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  deleteDoc: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  setDoc: jest.fn(),
}))

jest.mock('@/app/plugins/firebase', () => ({
  db: {},
}))

jest.mock('@/shared/models/Template', () => ({
  __esModule: true,
  default: class Template {
    constructor(data) {
      Object.assign(this, data)
    }

    toFirestore() {
      return { ...this }
    }

    static toTemplate(data) {
      return new Template(data)
    }
  },
}))

describe('TemplateController', () => {
  let templateController
  let spies

  beforeEach(() => {
    jest.clearAllMocks()
    templateController = new TemplateController()
    spies = createControllerSpies(templateController)
  })

  afterEach(() => {
    spies.restore()
  })

  describe('Structure', () => {
    it('should have createTemplate method', () => {
      expect(typeof templateController.createTemplate).toBe('function')
    })

    it('should have getPublicTemplates method', () => {
      expect(typeof templateController.getPublicTemplates).toBe('function')
    })

    it('should have getTemplatesOfUser method', () => {
      expect(typeof templateController.getTemplatesOfUser).toBe('function')
    })

    it('should have deleteTemplate method', () => {
      expect(typeof templateController.deleteTemplate).toBe('function')
    })
  })

  describe('createTemplate', () => {
    it('should create a template successfully', async () => {
      const mockTemplate = {
        toFirestore: jest.fn().mockReturnValue({ name: 'Test Template' }),
      }
      const mockResult = { id: 'template-123' }

      spies.create.mockResolvedValue(mockResult)

      const result = await templateController.createTemplate(mockTemplate)

      expect(spies.create).toHaveBeenCalledWith('templates', {
        name: 'Test Template',
      })
      expect(result).toEqual(mockResult)
    })

    it('should handle errors when creating template', async () => {
      const mockTemplate = {
        toFirestore: jest.fn().mockReturnValue({ name: 'Test Template' }),
      }
      const mockError = new Error('Create failed')

      spies.create.mockRejectedValue(mockError)

      await expect(
        templateController.createTemplate(mockTemplate),
      ).rejects.toThrow('Create failed')
    })
  })

  describe('getPublicTemplates', () => {
    it('should fetch public templates successfully', async () => {
      const mockDocs = [
        { id: 'template-1', data: () => ({ header: { isTemplatePublic: true } }) },
        { id: 'template-2', data: () => ({ header: { isTemplatePublic: true } }) },
      ]

      const { query, where, collection, getDocs } = require('firebase/firestore')
      query.mockReturnValue({})
      where.mockReturnValue({})
      collection.mockReturnValue({})
      getDocs.mockResolvedValue({ docs: mockDocs })

      spies.readOne = jest.fn()
      const parentProto = Object.getPrototypeOf(
        Object.getPrototypeOf(templateController),
      )
      jest.spyOn(parentProto, 'query').mockResolvedValue({
        docs: mockDocs,
      })

      const result = await templateController.getPublicTemplates()

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('id', 'template-1')
      expect(result[1]).toHaveProperty('id', 'template-2')
    })

    it('should return empty array when no public templates exist', async () => {
      const parentProto = Object.getPrototypeOf(
        Object.getPrototypeOf(templateController),
      )
      jest.spyOn(parentProto, 'query').mockResolvedValue({ docs: [] })

      const result = await templateController.getPublicTemplates()

      expect(result).toEqual([])
    })

    it('should handle errors when fetching public templates', async () => {
      const mockError = new Error('Query failed')
      const parentProto = Object.getPrototypeOf(
        Object.getPrototypeOf(templateController),
      )
      jest.spyOn(parentProto, 'query').mockRejectedValue(mockError)

      await expect(templateController.getPublicTemplates()).rejects.toThrow(
        'Query failed',
      )
    })
  })

  describe('getTemplatesOfUser', () => {
    it('should fetch user templates successfully', async () => {
      const userId = 'user-123'
      const mockDocs = [
        {
          id: 'template-1',
          data: () => ({ header: { templateAuthor: { userDocId: userId } } }),
        },
        {
          id: 'template-2',
          data: () => ({ header: { templateAuthor: { userDocId: userId } } }),
        },
      ]

      const parentProto = Object.getPrototypeOf(
        Object.getPrototypeOf(templateController),
      )
      jest.spyOn(parentProto, 'query').mockResolvedValue({ docs: mockDocs })

      const result = await templateController.getTemplatesOfUser(userId)

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('id', 'template-1')
      expect(result[1]).toHaveProperty('id', 'template-2')
    })

    it('should return empty array when user has no templates', async () => {
      const userId = 'user-123'
      const parentProto = Object.getPrototypeOf(
        Object.getPrototypeOf(templateController),
      )
      jest.spyOn(parentProto, 'query').mockResolvedValue({ docs: [] })

      const result = await templateController.getTemplatesOfUser(userId)

      expect(result).toEqual([])
    })

    it('should handle errors when fetching user templates', async () => {
      const userId = 'user-123'
      const mockError = new Error('Query failed')
      const parentProto = Object.getPrototypeOf(
        Object.getPrototypeOf(templateController),
      )
      jest.spyOn(parentProto, 'query').mockRejectedValue(mockError)

      await expect(
        templateController.getTemplatesOfUser(userId),
      ).rejects.toThrow('Query failed')
    })
  })

  describe('deleteTemplate', () => {
    it('should delete a template successfully', async () => {
      const templateId = 'template-123'

      spies.delete.mockResolvedValue()

      await templateController.deleteTemplate(templateId)

      expect(spies.delete).toHaveBeenCalledWith('templates', templateId)
    })

    it('should handle errors when deleting template', async () => {
      const templateId = 'template-123'
      const mockError = new Error('Delete failed')

      spies.delete.mockRejectedValue(mockError)

      await expect(
        templateController.deleteTemplate(templateId),
      ).rejects.toThrow('Delete failed')
    })
  })
})
