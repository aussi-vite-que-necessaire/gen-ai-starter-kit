import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addWorkflowJob, queues } from './queues'
import { QueueName } from './config'

// Mock BullMQ
vi.mock('bullmq', () => {
    return {
        Queue: class {
            add = vi.fn().mockResolvedValue({ id: 'job-123' })
        },
        Worker: vi.fn(),
    }
})

// Mock config to avoid import issues
vi.mock('./config', () => ({
    QUEUE_CONFIGS: {
        'test-queue': { concurrency: 1 },
    },
}))

describe('addWorkflowJob', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should add a job to the queue and return the job id', async () => {
        // Manually inject a mock queue for testing purposes since the real one is initialized at module level
        const mockAdd = vi.fn().mockResolvedValue({ id: 'job-123' })
        // @ts-expect-error - Mocking partial queue
        queues['test-queue'] = { add: mockAdd }

        const result = await addWorkflowJob('test-queue' as QueueName, {
            workflowId: 'wf-1',
            webhookPath: 'hook',
            payload: { foo: 'bar' },
        })

        expect(mockAdd).toHaveBeenCalledWith(
            'process-workflow',
            {
                workflowId: 'wf-1',
                webhookPath: 'hook',
                payload: { foo: 'bar' },
            },
            expect.objectContaining({
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
            })
        )
        expect(result).toBe('job-123')
    })
})
