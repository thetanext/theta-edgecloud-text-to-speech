import fs from 'fs/promises'
import { EdgeCloudClient } from './ThetaEdgeCloud'
import { OutputAudio } from './ThetaEdgeCloudResponse'

export class PollingManager {
	private client: EdgeCloudClient
	private apiToken: string
	private readonly requestIdFile: string = 'request_ids.txt'
	readonly outputDir: string = 'outputs'

	constructor() {
		this.apiToken = process.env.ON_DEMAND_API_ACCESS_TOKEN || ''
		if (!this.apiToken) throw new Error('ON_DEMAND_API_ACCESS_TOKEN is not set in .env')
		this.client = new EdgeCloudClient(this.apiToken)
	}

	// start polling for all request IDs in the file
	async startPolling(intervalMs: number = 30000): Promise<void> {
		console.log(`[PollingManager] Starting polling every ${intervalMs / 1000} seconds...`)
		setInterval(async () => {
			const requestIds = await this.readRequestIdsFromFile()
			for (const requestId of requestIds) {
				const isDone = await this.pollRequestId(requestId)
				if (isDone) {
					if (isDone !== 'failed') {
						const outputPath = `${this.outputDir}/${requestId}.wav`
						await this.downloadResultFile(isDone, outputPath)
					}
					await this.removeRequestIdFromFile(requestId)
				}
			}
		}, intervalMs)
	}

	async saveRequestIdToFile(requestId: string): Promise<void> {
		await fs.appendFile(this.requestIdFile, requestId + '\n')
		console.log(`[PollingManager] Saved request ID ${requestId} to file ${this.requestIdFile}`)
	}

	async readRequestIdsFromFile(): Promise<string[]> {
		try {
			const data = await fs.readFile(this.requestIdFile, 'utf-8')
			return data.split('\n').filter((id) => id.trim() !== '')
		} catch (error) {
			console.error(`[PollingManager] Error reading request IDs from file ${this.requestIdFile}:`, error)
			return []
		}
	}

	async removeRequestIdFromFile(requestId: string): Promise<void> {
		try {
			const ids = await this.readRequestIdsFromFile()
			const updatedIds = ids.filter((id) => id !== requestId)
			await fs.writeFile(this.requestIdFile, updatedIds.join('\n'))
			console.log(`[PollingManager] Removed request ID ${requestId} from file ${this.requestIdFile}`)
		} catch (error) {
			console.error(`[PollingManager] Error removing request ID ${requestId} from file ${this.requestIdFile}:`, error)
		}
	}

	async pollRequestId(requestId: string): Promise<undefined | string> {
		try {
			const statusResponse = await this.client.getInferRequest(requestId)
			const status = statusResponse.infer_requests[0].state
			console.log(`[PollingManager] Request ID ${requestId} status: ${status}`)
			if (status === 'completed') {
				console.log(`[PollingManager] Request ID ${requestId} completed.`)
				const audio = statusResponse.infer_requests[0].output as OutputAudio
				return audio.audio_url
			} else if (status === 'error') {
				// console.log(`${JSON.stringify(statusResponse.infer_requests[0])}`)
				console.error(`[PollingManager] Request ID ${requestId} failed with ${statusResponse.infer_requests[0].error_message}.`)
				return 'failed'
			}
			return undefined
		} catch (err: any) {
			console.error(`[PollingManager] Error polling request ID ${requestId}:`, err)
		}
	}

	async downloadResultFile(fileUrl: string, outputPath: string): Promise<void> {
		try {
			console.log(`[PollingManager] Downloading file from ${fileUrl} to ${outputPath}...`)
			const response = await fetch(fileUrl)
			if (!response.ok) throw new Error(`Failed to download file: ${response.statusText}`)

			const arrayBuffer = await response.arrayBuffer()
			const buffer = Buffer.from(arrayBuffer)
			await fs.writeFile(outputPath, buffer)
			console.log(`File downloaded to ${outputPath}`)
		} catch (err: any) {
			console.error(`Error downloading file: ${err.message}`)
		}
	}
}
