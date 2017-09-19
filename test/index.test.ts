import {
    BillonLogger,
} from '../src';

describe('BillonLogger test', () => {

    const billonLogger = new BillonLogger();

    billonLogger.config.emailErrors = {
        active: true,
        nodemailer: {
            smtps: {
                host: 'asmtp.mail.hostpoint.ch',
                port: 465,
                secure: true, // secure:true for port 465, secure:false for port 587
                auth: {
                    user: 'info@billon.me',
                    pass: 'AqHwQDv6T5UcpLOK',
                },
            },
            async subject(msg: string, meta: string[]) {
                return `Billon.Me - log.errors`;
            },
            async html(msg: string, meta: string[]) {
                return meta.join(', ');
            },
            async to(msg: string, meta: string[]) {
                return `rkrohmorath@gmail.com`;
            },
            async from(msg: string, meta: string[]) {
                return 'billonme';
            },
        },
    };

    const log = billonLogger.child(__filename);

    it('works if prints test', async () => {
        log.debug(`test`, test);
    });

    it('works if sent mail', async () => {
        const info = await log.critical(`test error email`);
        log.debug(`info`, info);
    });
});
