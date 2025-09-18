export interface CreateInfer {
	input: ImageInput | TextToSpeechRequest
	wait?: number
	webhook?: string
}

export interface ImageInput {
	image_filename: string
}

export interface TextToSpeechRequest {
	text: string // Description of the shot for the text to video
	speed?: number
	voice:
		| 'af_sky'
		| 'af_kore'
		| 'af_nova'
		| 'am_adam'
		| 'am_echo'
		| 'am_eric'
		| 'am_liam'
		| 'am_onyx'
		| 'am_puck'
		| 'bf_emma'
		| 'bf_lily'
		| 'af_alloy'
		| 'af_aoede'
		| 'af_bella'
		| 'af_heart'
		| 'af_river'
		| 'af_sarah'
		| 'am_santa'
		| 'bf_alice'
		| 'bm_fable'
		| 'bm_lewis'
		| 'af_nicole'
		| 'am_fenrir'
		| 'bm_daniel'
		| 'bm_george'
		| 'af_jessica'
		| 'am_michael'
		| 'bf_isabella'
}
