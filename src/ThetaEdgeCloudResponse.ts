export interface EdgeCloudResponse {
	status: string | ErrorStatus // { status: 'error', message: '10 minute quota reached' }
	body: PresignedResponseBody | InterRequestResponseBody
}

export interface ErrorStatus {
	status: string
	message: string
}

export interface PresignedResponseBody {
	image_filename: ImageFilename
}

interface ImageFilename {
	presigned_url: string
	filename: string
}

export interface InterRequestResponseBody {
	infer_requests: InferResponse[] | InferCancelResponse[]
	model_quotas: Modelquota[]
}

export interface Modelquota {
	template_id: string
	ten_min_quota: number
	ten_min_remaining: number
	daily_quota: number
	daily_remaining: number
}

// hook response is the same but without the body
export interface InferResponse {
	id: string
	org_id: string
	project_id: string
	service_id: string
	template_id: string
	prediction: string
	webhook: null
	community_worker_only: null
	state: string
	infer_endpoint_id: null
	usage: Usage
	prediction_cost: Usage
	prediction_cost_divisor: number
	cost_usd: Usage
	input: Input
	output: OutputImage | OutputAudio
	create_time: string
	update_time: string
	assigned_time: null
	process_time: null
	success_time: null
	error_message: null
	error_time: null
	is_new: boolean
}

export interface InferCancelResponse extends InferResponse {
	changes: Changes
}

export interface OutputImage {
	image_url: string
}

export interface OutputAudio {
	audio_url: string
}

export interface Input {
	image_filename: string
}

export interface Usage {
	input: number
	output: number
}

// cancel response
export interface Changes {
	state: State
	infer_endpoint_id: Inferendpointid
}

export interface Inferendpointid {
	previous: string
	current: null
}

export interface State {
	previous: string
	current: string
}

export interface AudioResponse {
	id: string
}
