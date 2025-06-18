import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img
            src="/favicon.svg"
            alt="App Logo"
            width={props.width}
            height={props.height}
            className={props.className}
            style={props.style}
            draggable={false}
        />
    );
}
