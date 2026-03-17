import { LoginVisualPanel } from './LoginVisualPanel';
import { LoginForm } from './LoginForm';

export function LoginLayout() {
  return (
    <div className="flex w-full h-screen">
      <LoginVisualPanel />
      
      <div className="flex-1 flex items-center justify-center bg-[#F4F1ED] border-l border-[#DDD8D2]">
        <LoginForm />
      </div>
    </div>
  );
}
