export enum ConversationStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  ERROR = 'error',
}

export type IConversation = {
  id: string;
  model: string;
  version: string;
  input: {
    avatar_id: string;
    bucket: string;
    conversation_id: string;
    enable_transcription: boolean;
    make_greenscreen: boolean;
    persona_name: string;
    room_url: string;
    train_pipeline_id: string;
    tts_engine: string;
    user_id: number;
    voice_id: string;
  };
  logs: string;
  output: null | any; // The type of output is not specified, so using 'any' for flexibility
  data_removed: boolean;
  error: null | string; // Assuming error could be a string when present
  status: string;
  created_at: string;
  urls: {
    cancel: string;
    get: string;
  };
};
