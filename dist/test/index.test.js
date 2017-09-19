"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
describe('BillonLogger test', () => {
    const billonLogger = new src_1.BillonLogger();
    billonLogger.config.emailErrors = {
        active: true,
        nodemailer: {
            smtps: {
                host: 'asmtp.mail.hostpoint.ch',
                port: 465,
                secure: true,
                auth: {
                    user: 'info@billon.me',
                    pass: 'AqHwQDv6T5UcpLOK',
                },
            },
            subject(msg, meta) {
                return __awaiter(this, void 0, void 0, function* () {
                    return `Billon.Me - log.errors`;
                });
            },
            html(msg, meta) {
                return __awaiter(this, void 0, void 0, function* () {
                    return meta.join(src_1.newLine);
                });
            },
            to(msg, meta) {
                return __awaiter(this, void 0, void 0, function* () {
                    return `rkrohmorath@gmail.com`;
                });
            },
            from(msg, meta) {
                return __awaiter(this, void 0, void 0, function* () {
                    return '"Billon.me" <info@billon.me>';
                });
            },
        },
    };
    const log = billonLogger.child(__filename);
    it('works if prints test', () => __awaiter(this, void 0, void 0, function* () {
        log.debug(`test`, test);
    }));
    it('works if sent mail', () => __awaiter(this, void 0, void 0, function* () {
        const info = yield log.critical(`test error email`, `example error 1`, `example error 2`);
        log.debug(`info`, info);
    }));
});
//# sourceMappingURL=index.test.js.map