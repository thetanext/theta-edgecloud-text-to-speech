import { CreateInfer } from "./ThetaEdgeCloudRequest"
import { InterRequestResponseBody, EdgeCloudResponse, ErrorStatus } from "./ThetaEdgeCloudResponse"

export class EdgeCloudClient {
	private apiToken: string
	private baseUrl = 'https://ondemand.thetaedgecloud.com'
	private model = 'kokoro_82m'

	constructor(apiToken: string) {
		this.apiToken = apiToken
	}

	async createInferRequest(createInfer: CreateInfer): Promise<InterRequestResponseBody> {
		const url = `${this.baseUrl}/infer_request/${this.model}`

		// console.log({ url, body })

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiToken}`,
			},
			body: JSON.stringify(createInfer),
		})
		const json = (await response.json()) as EdgeCloudResponse
		// console.log(json)
		if (json.status !== 'success')
			throw new Error(`Failed to create infer request '${response.statusText}' ${(json.status as ErrorStatus).message}`)
		// console.log(json.body)
		return json.body as InterRequestResponseBody
	}

	// can be used for GUI updates has to call for example every 3 seconds
	async getInferRequest(requestId: string) {
		const url = `${this.baseUrl}/infer_request/${requestId}`
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiToken}`,
			},
		})
		const json = await response.json()
		if (json.status !== 'success')
			throw new Error(`Failed to get infer request '${response.statusText}' ${(json.status as ErrorStatus).message}`)
		// console.log(json.body)
		return json.body as InterRequestResponseBody
	}



}
