import { LoginVisualPanel } from './LoginVisualPanel';
import { RegisterForm } from './RegisterForm';

export function RegisterLayout() {
  return (
    <div className="flex w-full h-screen">
      <LoginVisualPanel />
      
      <div className="flex-1 flex items-center justify-center bg-[#F4F1ED] border-l border-[#DDD8D2]">
        <RegisterForm />
      </div>
    </div>
  );
}
