import dotenv from 'dotenv'
dotenv.config()

import { EdgeCloudClient } from './ThetaEdgeCloud'
import { CreateInfer } from './ThetaEdgeCloudRequest'
import { PollingManager } from './PollingManager'

export class TextToSpeech {
	private client: EdgeCloudClient
	private apiToken: string

	constructor() {
		this.apiToken = process.env.ON_DEMAND_API_ACCESS_TOKEN || ''
		if (!this.apiToken) throw new Error('ON_DEMAND_API_ACCESS_TOKEN is not set in .env')
		this.client = new EdgeCloudClient(this.apiToken)
	}

	async call(request: CreateInfer): Promise<string> {
		console.log('Sending inference request...')
		const response = await this.client.createInferRequest(request)

		// get cost and usage
		for (const inferRequest of response.infer_requests) {
			console.log(
				`ID: ${inferRequest.id} | Cost USD: ${inferRequest.cost_usd.input + inferRequest.cost_usd.output} | Usage In: ${
					inferRequest.usage.input
				} | Usage Out: ${inferRequest.usage.output}`
			)
		}

		// quota
		for (const quota of response.model_quotas) {
			console.log(`Daily: ${quota.daily_remaining}/${quota.daily_quota} | 10Min: ${quota.ten_min_remaining}/${quota.ten_min_quota}`)
		}

		const inferRequests = response.infer_requests as any[]
		if (!inferRequests || inferRequests.length === 0 || !inferRequests[0].id) {
			console.error('[TextToSpeech] No request ID returned from createInferRequest:', inferRequests)
			throw new Error('No request ID returned from createInferRequest')
		}

		const requestId = inferRequests[0].id
		return requestId
	}
}

// call
const pollingManager = new PollingManager()
pollingManager.startPolling()

const textToSpeechClient = new TextToSpeech()
const request: CreateInfer = {
	input: {
		text: 'A beautiful sunrise over the mountains',
		voice: 'af_sky',
		speed: 1.0,
	},
}

console.log('[Main] Starting inference with polling...')

textToSpeechClient
	.call(request)
	.then(async (requestId) => {
		await pollingManager.saveRequestIdToFile(requestId)
		console.log('[Main] Inference request ID saved.')
	})
	.catch((error) => {
		console.error('[Main] Error during inference:', error)
	})
