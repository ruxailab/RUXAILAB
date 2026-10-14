import AIAgentController from '@/features/agents/controllers/AIAgentController'
import { dashboardNavigationItems } from '@/features/dashboard/dashboardItems'

jest.mock('@/app/plugins/firebase/FirebaseFirestoreRepository', () => {
  const query = jest.fn()
  return {
    __esModule: true,
    default: class Repository {
      query(...args) {
        return query(...args)
      }
    },
    query,
  }
})

const { query } = require('@/app/plugins/firebase/FirebaseFirestoreRepository')

describe('Community Agents', () => {
  it('queries public visibility directly without loading private or shared agents', async () => {
    query.mockResolvedValue({
      docs: [
        {
          id: 'public-agent',
          data: () => ({
            name: 'Public reviewer',
            ownerId: 'owner',
            visibility: 'public',
            model: 'model',
          }),
        },
      ],
    })
    const agents = await new AIAgentController().listPublic()
    expect(query).toHaveBeenCalledTimes(1)
    expect(query).toHaveBeenCalledWith('agents', {
      field: 'visibility',
      condition: '==',
      value: 'public',
    })
    expect(agents[0].id).toBe('public-agent')
    expect(agents[0].visibility).toBe('public')
  })

  it('exposes the page inside Community navigation', () => {
    const community = dashboardNavigationItems.find(
      (item) => item.id === 'community',
    )
    expect(community.children).toContainEqual(
      expect.objectContaining({
        id: 'community-agents',
        title: 'navigation.communityAgents',
      }),
    )
  })
})
