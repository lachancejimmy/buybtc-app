import { Application } from '@nativescript/core';
import { registerFontIcon } from '@nativescript/font-icons';

registerFontIcon({
    cssFile: "app/fonts/fontawesome.css",
    fontFamily: "FontAwesome",
    android: "fontawesome-webfont.ttf",
    ios: "FontAwesome.ttf"
});

Application.run({ moduleName: 'app-root' });