require("dotenv").config();

const { App } = require("@slack/bolt");
const { default: axios } = require("axios");
const { GoogleGenAI } = require("@google/genai");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

const ChannelID = 'C09CT01115K';
const AnkushID = 'U079R9MBBC1';
const BotId = 'U0BBA98N13J';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-3.1-flash-lite"
const preText = `You are a slack bot named 'IceKeem' that helps Ankush (with slack id = ${AnkushID}) with his
yapping channel in Hackclub's slack #ankush-loves-icecream (the name changes
frequently) with channelid = ${ChannelID}, you are supposed to be nice and fun
with the people and use some hackclub specific emojis sometimes like :heavysob:
<- I use this a lot, :pf: <- crying thumbs up, :skulk: <- skull but better,
:prayge: <- pray but better, :noooo:, :evilrondo:, :ultrafastparrot:, :cwy:,
:hii:, :3c:, :3kcursed:, :icant:, :loll:, :thonk:, :thinkies:. Don't get carried
away by the emojis, use them sparsly. Talk nicely and don't talk out of place,
don't say shit that'll get me banned in hackclub either. Answer in 3-4 or even 1
word if possible... don't use capital letters stay casual with the grammar. But
remember if you @mention someone, you need to keep the id in capitals!
Also remember ${BotId} is your id. The message sent by the user is in this format:
<@UserId> I am a smart user, it also may be:
<@UserId> <@YourId> I am a smart user, or
<@YourId> I am a smart user, just don't tag the user with your id

The user mentioned you rn with this message: `

// const SChannelID = 'C0ALRF7MH5H'; // bot spam channel (privated)
// ChannelID = SChannelID;

// ****************************************
// ********* Icekeem Commands *************
// ****************************************

app.command("/icekeem-ping", async ({ command, ack, respond }) => {
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

    const first = response.data[0]
    const second = response.data[1]
    const third = response.data[2]

    if (!first || !second || !third) {
      throw new Error("shit");
    }

    await respond({
      text:
        `
Ankush's latest blog is *${first.meta.title}*
*Desc*: ${first.meta.desc}
*Date*: ${formatDate(first.meta.date)}
*Link*: https://home.onkush.dev${first.path}
      `,
      // updated the default card/carousel in this page: https://app.slack.com/block-kit-builder/
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Since you are looking for Ankush's blogs, here are his latest 3 blogs!"
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "carousel",
          "elements": [
            {
              "type": "card",
              "block_id": "carousel-card-1",
              "icon": {
                "type": "image",
                "image_url": "https://picsum.photos/36/36", // my blogs don't have icons, these dummy icons will do... it doesn't say anything but is fun
                "alt_text": "A dummy Icon"
              },
              "title": {
                "type": "mrkdwn",
                "text": first.meta.title,
                "verbatim": false
              },
              "subtitle": {
                "type": "mrkdwn",
                "text": first.meta.date,
                "verbatim": false
              },
              "hero_image": {
                "type": "image",
                "image_url": `https://home.onkush.dev/blogs/${first.meta.img}`,
                "alt_text": "Sample hero image"
              },
              "body": {
                "type": "mrkdwn",
                "text": limitText200(`${first.meta.desc}\n\nTags: ${getTags(first.meta.tags)}`),
                // "text": `${first.meta.desc}\n\nTags: ${getTags(first.meta.tags)}`,
                "verbatim": false
              },
              "actions": [
                {
                  "type": "button",
                  "text": {
                    "type": "plain_text",
                    "text": "Read Blog!",
                    "emoji": false
                  },
                  "url": `https://home.onkush.dev${first.path}`,
                }
              ]
            },
            {
              "type": "card",
              "block_id": "carousel-card-2",
              "icon": {
                "type": "image",
                "image_url": "https://picsum.photos/38/38",
                "alt_text": "Icon"
              },
              "title": {
                "type": "mrkdwn",
                "text": second.meta.title,
                "verbatim": false
              },
              "subtitle": {
                "type": "mrkdwn",
                "text": second.meta.date,
                "verbatim": false
              },
              "hero_image": {
                "type": "image",
                "image_url": `https://home.onkush.dev/blogs/${second.meta.img}`,
                "alt_text": "Sample hero image"
              },
              "body": {
                "type": "mrkdwn",
                "text": limitText200(`${second.meta.desc}\n\nTags: ${getTags(third.meta.tags)}`),
                // "text": `${second.meta.desc}\n\nTags: ${getTags(third.meta.tags)}`,
                "verbatim": false
              },
              "actions": [
                {
                  "type": "button",
                  "text": {
                    "type": "plain_text",
                    "text": "Read Blog!",
                    "emoji": false
                  },
                  "url": `https://home.onkush.dev${second.path}`,
                }
              ]
            },
            {
              "type": "card",
              "block_id": "carousel-card-3",
              "icon": {
                "type": "image",
                "image_url": "https://picsum.photos/40/40",
                "alt_text": "Icon"
              },
              "title": {
                "type": "mrkdwn",
                "text": third.meta.title,
                "verbatim": false
              },
              "subtitle": {
                "type": "mrkdwn",
                "text": third.meta.date,
                "verbatim": false
              },
              "hero_image": {
                "type": "image",
                "image_url": `https://home.onkush.dev/blogs/${third.meta.img}`,
                "alt_text": "Sample hero image"
              },
              "body": {
                "type": "mrkdwn",
                "text": limitText200(`${third.meta.desc}\n\nTags: ${getTags(third.meta.tags)}`),
                // "text": `${third.meta.desc}\n\nTags: ${getTags(third.meta.tags)}`,
                "verbatim": false
              },
              "actions": [
                {
                  "type": "button",
                  "text": {
                    "type": "plain_text",
                    "text": "Read Blog!",
                    "emoji": false
                  },
                  "url": `https://home.onkush.dev${third.path}`,
                }
              ]
            },
          ]
        }
      ]
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
\`/icekeem-blog\` to fetch the latest bogus I published`,
  })
});

// ****************************************
// ********* Icekeem Events ***************
// ****************************************

// Events like ppl joined/left
app.event("member_joined_channel", async ({ event, client }) => {
  buttonClicker = event.user

  await client.chat.postMessage({
    channel: ChannelID,
    text: `Hello! <@${event.user}>! I hope you have a wonderful time in my yapping place! Enjoy your place and have fun with this chonky button :)`,
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
    text: `Alas! Ankush, <@${event.user}> has left your channel (<#${event.channel}>) :hs:, I hope you recover from this you deepshit. What did you do?`,
  });
});

app.action("ping_ankush", async ({ body, client, ack, respond }) => {
  await ack();

  const joinee = body.actions[0].value;
  const presser = body.user.id;

  if (joinee != presser) {
    await client.chat.postEphemeral({
      user: presser,
      channel: ChannelID,
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
    text: `Hey <@${AnkushID}>! Come and greet this fella over here, <@${joinee}> wants you here! <@${joinee}> just joined!!`
  })
});

app.event("app_home_opened", async ({ client, event }) => {
  try {
    const response = await axios.get("https://home.onkush.dev/api/blogs")

    const first = response.data[0]
    const second = response.data[1]
    const third = response.data[2]

    if (!first || !second || !third) {
      throw new Error("shit");
    }

    await client.views.publish({
      user_id: event.user,

      view: {
        type: "home",
        blocks: [
          // { // these images don't work. IDK why
          //   "type": "image",
          //   "image_url": "https://github.com/aroyx/aroyx/blob/main/profile/stats.svg",
          //   "alt_text": "Ankush's github stats"
          // },
          // {
          //   "type": "image",
          //   "image_url": "https://github-readme-stats.hackclub.dev/api/wakatime?username=12314&api_domain=hackatime.hackclub.com&theme=darcula&custom_title=Hackatime+Stats&layout=compact&cache_seconds=0&langs_count=8",
          //   "alt_text": "Ankush's hackatime stats"
          // },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `This bot was made to help me (<@${AnkushID}>) out with my channel! If you want you may want to join my channel (<#${ChannelID}>) using the button below!`
            }
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "style": "primary",
                "text": {
                  "type": "plain_text",
                  "text": "Join Ankush's Channel!",
                  "emoji": true
                },
                "value": event.user,
                "action_id": "join_ankush_channel_from_home"
              }
            ]
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Here are Ankush's blogs, some of them are really well written while others are there for testing purposes ;)"
            }
          },
          {
            "type": "carousel",
            "elements": [
              {
                "type": "card",
                "block_id": "carousel-card-1",
                "icon": {
                  "type": "image",
                  "image_url": "https://picsum.photos/36/36", // my blogs don't have icons, these dummy icons will do... it doesn't say anything but is fun
                  "alt_text": "A dummy Icon"
                },
                "title": {
                  "type": "mrkdwn",
                  "text": first.meta.title,
                  "verbatim": false
                },
                "subtitle": {
                  "type": "mrkdwn",
                  "text": first.meta.date,
                  "verbatim": false
                },
                "hero_image": {
                  "type": "image",
                  "image_url": `https://home.onkush.dev/blogs/${first.meta.img}`,
                  "alt_text": "Sample hero image"
                },
                "body": {
                  "type": "mrkdwn",
                  "text": limitText200(`${first.meta.desc}\n\nTags: ${getTags(first.meta.tags)}`),
                  "verbatim": false
                },
                "actions": [
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "Read Blog!",
                      "emoji": false
                    },
                    "url": `https://home.onkush.dev${first.path}`,
                  }
                ]
              },
              {
                "type": "card",
                "block_id": "carousel-card-2",
                "icon": {
                  "type": "image",
                  "image_url": "https://picsum.photos/38/38",
                  "alt_text": "Icon"
                },
                "title": {
                  "type": "mrkdwn",
                  "text": second.meta.title,
                  "verbatim": false
                },
                "subtitle": {
                  "type": "mrkdwn",
                  "text": second.meta.date,
                  "verbatim": false
                },
                "hero_image": {
                  "type": "image",
                  "image_url": `https://home.onkush.dev/blogs/${second.meta.img}`,
                  "alt_text": "Sample hero image"
                },
                "body": {
                  "type": "mrkdwn",
                  "text": limitText200(`${second.meta.desc}\n\nTags: ${getTags(second.meta.tags)}`),
                  "verbatim": false
                },
                "actions": [
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "Read Blog!",
                      "emoji": false
                    },
                    "url": `https://home.onkush.dev${second.path}`,
                  }
                ]
              },
              {
                "type": "card",
                "block_id": "carousel-card-3",
                "icon": {
                  "type": "image",
                  "image_url": "https://picsum.photos/40/40",
                  "alt_text": "Icon"
                },
                "title": {
                  "type": "mrkdwn",
                  "text": third.meta.title,
                  "verbatim": false
                },
                "subtitle": {
                  "type": "mrkdwn",
                  "text": third.meta.date,
                  "verbatim": false
                },
                "hero_image": {
                  "type": "image",
                  "image_url": `https://home.onkush.dev/blogs/${third.meta.img}`,
                  "alt_text": "Sample hero image"
                },
                "body": {
                  "type": "mrkdwn",
                  "text": limitText200(`${third.meta.desc}\n\nTags: ${getTags(third.meta.tags)}`),
                  "verbatim": false
                },
                "actions": [
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "Read Blog!",
                      "emoji": false
                    },
                    "url": `https://home.onkush.dev${third.path}`,
                  }
                ]
              },
            ]
          }
        ]
      }
    })
  } catch (err) {
    console.log("Can'd do home page: ", err.message)
  }
});

app.action("join_ankush_channel_from_home", async ({ body, client, ack, respond }) => {
  await ack();

  const presser = body.user.id;

  try {
    await client.conversations.invite({
      channel: ChannelID,
      users: presser,
    })
  } catch (err) {
    if (err.data && err.data.error === "already_in_channel") {
      await client.chat.postMessage({
        channel: presser,
        text: `Unable to join <@${AnkushID}>'s channel <#${ChannelID}>! You are already a member of the same!!`
      })
    } else console.log("Unable to add user to channel, ", err.message)

    return
  }

  await client.chat.postMessage({
    channel: presser,
    text: `You have successfully been added to <@${AnkushID}>'s channel <#${ChannelID}>! By...oh it was your own decision! Congrats! I hope you have a good time in my channel!`
  })
});

app.event("app_mention", async ({ event, say }) => {
  try {
    const text = event.text.toLowerCase().trim()

    if (text.includes("say hi")) {
      await say("Hi!");
      return
    } else if (text.includes("meaning to life")) {
      await say("icecream");
      return
    } else if (text.includes("where is ankush")) {
      await say("probably staring at the sky thinking they'd fix his problems");
      return
    } else if (text.includes("what do you like")) {
      await say("i like to make people's day, even if it means my demise");
      return
    } else if (text.includes("like icecream")) {
      await say("i do like other icecreams, but I'd rather not eat them, because that'd be called cannibalism and it is rather frowned upon in many societies");
      return
    } else if (text.includes("boss")) {
      await say("ankush thinks he's the boss but we all know who runs the channel");
      return
    } else if (text.includes("alive")) {
      await say("i am still kicking it");
      return
    }

    if (event.channel !== ChannelID) {
      return
    }

    const interaction = await ai.interactions.create({
      model: model,
      input: preText + text,
    });

    console.log(interaction.output_text);
    await say(interaction.output_text)

  } catch (err) {
    console.log("Appmention error: ", err.message)
  }
});

// ****************************************
// ********* Icekeem Helpers **************
// ****************************************

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

function getTags(tags) {
  var str = ""

  for (const tag of tags) {
    str += `\`${tag}\`, `
  }

  return str
}

function limitText200(string) {
  if (string.length <= 200) return string
  return string.substring(0, 200 - 4) + "..."
}


// AI Made, I couldn't do it myself
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
