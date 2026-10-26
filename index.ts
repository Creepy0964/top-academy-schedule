import process from "process"
import { Bot } from "grammy"
import { getDaySchedule, testConnection, updateLogin } from "./utils.ts"
import type { InputRichBlockTable } from "grammy/types"

const token = process.env.TOKEN
if (!token) {
    process.exit(1)
}

const username: string = process.env.JOURNAL_USERNAME!
const password: string = process.env.JOURNAL_PASSWORD!

await updateLogin({username: username, password: password, cityId: null}, "https://journalka.top-academy.ru/api/auth/login")
let userInfo = await testConnection();
console.log(userInfo.user.fullName);

const bot = new Bot(token)

bot.on('message', async (ctx) => {
  let blocks: InputRichBlockTable = {
    type: "table",
    cells: [
      [{text: "Пара", is_header: true, align: "center", valign: "middle"}, {text: "Предмет", is_header: true, align: "center", valign: "middle"}, {text: "Преподаватель", is_header: true, align: "center", valign: "middle"}, {text: "Аудитория", is_header: true, align: "center", valign: "middle"}, {text: "Время", is_header: true, align: "center", valign: "middle"}]
    ],
    is_compact: true
  };
  if(ctx.message.text == "!расп") {
    const date = new Date(Date.now())
    const schedule = await getDaySchedule(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`)

    for(let i = 0; i < schedule.items.length; i++) {
      if(schedule.items[i].teacher == "Самостоятельная работа") continue;
      blocks.cells.push([{text: `${(i + 1).toString()}`, align: "center", valign: "middle"}, {text: schedule.items[i].subjectFallback, align: "center", valign: "middle"}, {text: schedule.items[i].teacher, align: "center", valign: "middle"}, {text: schedule.items[i].room, align: "center", valign: "middle"}, {text: `${schedule.items[i].startTime}-${schedule.items[i].endTime}`, align: "center", valign: "middle"}])
    }

    bot.api.sendRichMessage(ctx.message.chat.id, {
      blocks: [blocks],
    })
  }
})

bot.start()
console.log(`bot started`)