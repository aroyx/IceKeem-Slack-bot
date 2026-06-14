require("dotenv").config();

const { App } = require("@slack/bolt");
const { default: axios } = require("axios");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/icekeem-ping", async ({ command, ack, respond }) => {
  const start = Date.now();

  await ack();

  const args_str = command.text
  if (args_str === '') {
    const latency = Date.now() - start;
    await respond({ text: `Ping: Pong! Latency: ${latency}ms` });
    return
  }

  const args = args_str.split(' ')

  if (args.length > 1) {
    await respond({ text: 'Ping Error: Only one argument allowed!' });
    return
  }

  const time = Number(args[0])
  if (!time) {
    await respond({ text: 'Ping Error: Input a valid number!' });
    return
  }

  setTimeout(() => { }, time)

  const latency = Date.now() - start;
  await respond({ text: `Ping: Pong! Latency: ${latency}ms` });
});

app.command("/icekeem-blog", async ({ ack, respond }) => {
  await ack()

  try {
    const response = await axios.get("https://home.onkush.dev/api/blogs")

    await respond({
      text:
        `Ankush's latest blog is *${response.data[0].meta.title}*
*Desc*: ${response.data[0].meta.desc}
*Date*: ${formatDate(response.data[0].meta.date)}
      `
    })
  } catch (err) {
    console.log("Blog fetch error:", err.message);
    await respond({
      text: `Failed to fetch latest blog!`
    })
  }
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();

// https://github.com/aroyx/onkush-dev/blob/main/src/routes/blog/+page.svelte#L6-L21
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  const day = date.getDate();
  let daySuffix = "th";

  if (day < 11 || day > 13) {
    const a = day % 10;
    if (a === 1) daySuffix = "st";
    else if (a === 2) daySuffix = "nd";
    else if (a === 3) daySuffix = "rd";
  }

  return `${day}${daySuffix} ${month}, ${year}`;
}