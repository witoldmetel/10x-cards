import { FC } from 'react';
import logo from '../../../assets/logo.png';

type LogoProps = {
  className?: string;
}

export const Logo: FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logo} alt="10xCards Logo" className="w-8 h-8" />
      <span className="text-xl font-bold">
        <span className="bg-gradient-to-r from-[hsl(176,43%,55%)] to-[hsl(42,93%,76%)] bg-clip-text text-transparent">
          10x
        </span>
        Cards
      </span>
    </div>
  );
};
