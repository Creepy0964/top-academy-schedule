import { Telegraf } from 'telegraf';
import { CronJob } from 'cron';
import { spawn } from 'child_process';
import Database from 'better-sqlite3';
import { appendFileSync, readFileSync } from 'fs';

const db = new Database(process.env.DB_PATH);

const bot = new Telegraf(process.env.TOKEN);

const users = readFileSync('users.txt', 'utf8').split('\n');

const renew = new CronJob('0 6 * * 1-5,7', () => {
    const x = spawn('python', ['main.py']);
    x.stdout.on('data', (data) => {
        console.log('Renewed: ' + data);
    });
}, null, true, 'Europe/Moscow');

const schedule_everyday = new CronJob('0 7 * * 1-5', () => { 
    let x = new Date();
    let tablename = db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`).get();
    let schedule = db.prepare(`SELECT schedule FROM ${tablename.name} WHERE day = ${x.getDay()}`).get();
    for(const x of users) {
        bot.telegram.sendMessage(x, `Расписание на сегодня\n\n${schedule.schedule}`);
    }
}, null, true, 'Europe/Moscow');

bot.command('info', (ctx) => {
    ctx.reply('Разработано @creepy0964 по заказу @creepy0964 за бюджет в банку энергетика');
});

bot.command('start', (ctx) => {
    ctx.reply(`Команды:\n/schedule — расписание на сегодня\n/schedule_tomorrow — расписание на завтра\n/info — инфо`);
});

bot.command('schedule', (ctx) => {
    let x = new Date();
    let tablename = db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`).get();
    let schedule = db.prepare(`SELECT schedule FROM ${tablename.name} WHERE day = ${x.getDay()}`).get();
    ctx.reply(`Расписание на сегодня\n\n${schedule.schedule}`);
});

bot.command('schedule_tomorrow', (ctx) => {
    let x = new Date();
    let tablename = db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`).get();
    let schedule = db.prepare(`SELECT schedule FROM ${tablename.name} WHERE day = ${x.getDay() + 1}`).get();
    ctx.reply(`Расписание на завтра\n\n${schedule.schedule}`);
});

bot.catch((err) => {
    appendFileSync('errors.log', err);
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
