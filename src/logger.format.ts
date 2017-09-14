import {
    moment, colors,
} from './importer';

export const simpleDateFormat = () => {
    return `[${moment().format('HH:mm:ss')}]`;
};

export const dateFormat = () => {
    return colors.grey(simpleDateFormat());
};
