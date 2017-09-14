"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const importer_1 = require("./importer");
exports.simpleDateFormat = () => {
    return `[${importer_1.moment().format('HH:mm:ss')}]`;
};
exports.dateFormat = () => {
    return importer_1.colors.grey(exports.simpleDateFormat());
};
//# sourceMappingURL=logger.format.js.map