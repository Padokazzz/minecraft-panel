import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({stack: true}),
    winston.format.json()
);

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'minecraft-api'},
    transports: [

        //Arquivo de erros
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error'
        }),

        //Arquivo geral
        new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
        }),
    ],
});

// Em desenvolvimento, também mostrar no console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}