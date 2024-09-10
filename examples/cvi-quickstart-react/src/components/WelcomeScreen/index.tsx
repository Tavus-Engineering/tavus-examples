import { Button } from '../ui/button';

export const WelcomeScreen = ({ onStart, loading }: { onStart: () => void, loading: boolean }) => {
  return (
    <div className='flex flex-col items-center justify-center h-screen gap-10 p-10'>
      <h1 className='text-4xl'>
        Welcome to Tavus Conversational Video Interface
      </h1>
      <Button onClick={onStart}>{loading ? 'Loading...' : 'Start Conversation'}</Button>
    </div>
  );
};
