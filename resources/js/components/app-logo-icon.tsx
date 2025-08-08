import { ImgHTMLAttributes } from 'react';

interface AppLogoIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
    className?: string;
}

export default function AppLogoIcon({ className, ...props }: AppLogoIconProps) {
    return (
        <img
            src="/images/logo.jpeg"
            alt="RT Express Logo"
            className={`object-contain ${className}`}
            {...props}
        />
    );
}
