import { FC } from 'react';
import logo from '../../../assets/logo.png';

type LogoProps = {
  className?: string;
};

export const Logo: FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logo} alt='10xCards Logo' className='w-8 h-8' />
      <span className='text-xl font-bold'>
        <span className='text-primary'>10x</span>
        Cards
      </span>
    </div>
  );
};
