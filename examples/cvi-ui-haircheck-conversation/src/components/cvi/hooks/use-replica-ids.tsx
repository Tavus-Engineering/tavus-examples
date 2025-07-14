import { useParticipantIds } from '@daily-co/daily-react';

export const useReplicaIDs = (): string[] => {
	const replicasIDs = useParticipantIds({
		filter: (participant) => participant.user_id.includes('tavus-replica'),
	});

	return replicasIDs;
};
