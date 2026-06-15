require("dotenv").config();
const { App } = require("@slack/bolt");
const { default: axios } = require("axios");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

const ChannelID = 'C09CT01115K';
const AnkushID = 'U079R9MBBC1';

// const SChannelID = 'C0ALRF7MH5H'; // bot spam channel (privated)
// ChannelID = SChannelID;

app.command("/icekeem-ping", async ({ command, client, ack, respond }) => {
  const start = Date.now();

  await ack();

  const args_str = command.text

  if (args_str === '') {
    const latency = Date.now() - start;
    await respond({ text: `Pong! Latency: ${latency}ms` });
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

  await sleep(time)

  const latency = Date.now() - start;
  await respond({ text: `Pong! Latency: ${latency}ms, slept for ${time}ms` });
});

app.command("/icekeem-blog", async ({ command, client, ack, respond }) => {
  await ack()

  try {
    const response = await axios.get("https://home.onkush.dev/api/blogs")

    await client.chat.postMessage({
      channel: ChannelID,
      text:
        `<@${command.user_id}> is looking for Ankush's latest blog.\n
Ankush's latest blog is *${response.data[0].meta.title}*
*Desc*: ${response.data[0].meta.desc}
*Date*: ${formatDate(response.data[0].meta.date)}
*Link*: https://home.onkush.dev${response.data[0].path}
      `
    })
  } catch (err) {
    console.log("Blog fetch error:", err.message);
    await respond({
      text: `Failed to fetch latest blog!`
    })
  }
});

app.command("/icekeem-help", async ({ ack, respond }) => {
  await ack()
  await respond({
    text:
      ` Help for Ankush's bot *IceKeem*!
\`/icekeem-help\` for this help
\`/icekeem-ping\` to check life
\`/icekeem-blog\` to fetch the latest bogus I published`
  })
});

// Events like ppl joined/left
app.event("member_joined_channel", async ({ event, client }) => {
  buttonClicker = event.user
  await client.chat.postMessage({
    channel: ChannelID,
    text: "this",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hello! <@${event.user}>! I hope you have a wonderful time in my yapping place! Enjoy your place and have fun with this chonky button :)`
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            style: "primary",
            value: event.user,
            action_id: "ping_ankush",
            text: {
              type: "plain_text",
              text: "Ping Ankush! <- DO IT!!"
            }
          },
        ]
      }
    ]
  });
});

app.event("member_left_channel", async ({ event, client }) => {
  await client.chat.postMessage({
    channel: AnkushID,
    text: `Alas! Ankush, <@${event.user}> has left your channel (<#${event.channel}>) :hs:, I hope you recover from this you deepshit. What did you do? Text1`,
  });
});

app.action("ping_ankush", async ({ body, client, ack, respond }) => {
  await ack();

  const joinee = body.actions[0].value;
  const presser = body.user.id;

  if (joinee != presser) {
    await client.chat.postMessage({
      channel: ChannelID,
      thread_ts: body.message.ts,
      text: `Hey, <@${presser}>! You can't press this prestigious button :/ unfortunately this is reserved for <@${joinee}> who just joined. It is a special moment for them, let them have at it!\n\n> _PSss if you really want to press this button, leave and join again!_`
    })
    return;
  }

  await respond({
    // don't ask me why 0 works.
    text: `Hello! <@${joinee}>! I hope you have a wonderful time in my yapping place! Unfortunately the button can only be pressed once ;)`
  })

  await client.chat.postMessage({
    channel: ChannelID,
    thread_ts: body.message.ts,
    text: `Hey <@${AnkushID}>! Come and greet this fella over here, <@${presser}> wants you here! <@${joinee}> just joined!!`
  })
});

// start the bot, now it listens to the events and shit
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

// AI Made, I couldn't do it myself
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));