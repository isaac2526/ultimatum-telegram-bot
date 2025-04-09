require('dotenv').config();
const req = require("request-promise");

const _required = (variable) => {
  if (variable === "" || variable === undefined) {
    throw ("Parameters can't be blank");
  }
};

const clean = (data) => {
  let regex = /(<([^>]+)>)/ig;
  data = data.replace(/(<br?\s?\/>)/ig, ' \n');
  return data.replace(regex, '');
};

const format_graphql = `query SearchQuery($query: String!, $first: Int!, $after: ID) {\n  questionSearch(query: $query, first: $first, after: $after) {\n    edges {\n      node {\n        content\n        attachments {\n          url\n        }\n        answers {\n          nodes {\n            content\n            attachments {\n              url\n            }\n          }\n        }\n      }\n    }\n  }\n}`;

const Brainly = async (query, count = 10) => {
  // Check if value is null or not
  _required(count);
  _required(query);

  let service = {
    uri: 'https://brainly.co.id/graphql/id',
    json: true,
    strictSSL: false,
    headers: {
      'host': 'brainly.co.id',
      "content-type": "application/json; charset=utf-8",
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36"
    },
    body: {
      "operationName": "SearchQuery",
      "variables": {
        "query": query,
        "after": null,
        "first": count
      },
      "query": format_graphql
    }
  };

  return await req.post(service).then(response => {
    let question_list = response.data.questionSearch.edges;

    if (question_list.length) {
      let final_data = [];
      question_list.forEach(question => {
        let answers = [];
        let answerNodes = question.node.answers.nodes;

        if (answerNodes.length) {
          // Extract answers
          answerNodes.forEach(answer => {
            answers.push({
              text: clean(answer.content)
            });
          });
        }
        final_data.push({
          "question": clean(question.node.content),
          "answers": answers,
        });
      });
      return {
        'success': true,
        'length': final_data.length,
        'message': 'Request Success',
        'data': final_data
      };
    } else {
      return {
        'success': false,
        'length': 0,
        'message': 'Data not found',
        'data': []
      };
    }
  });
};

async function getBrainlyAnswer(bot, chatId, input, userName) {
  if (!input) return bot.sendMessage(chatId, `Please enter a question you want to search on Brainly, example\n/brainly What is the geographic location of Nigeria?`);

  try {
    bot.sendChatAction(chatId, 'typing');
    let getdata = await Brainly(input, 10);
    let results = ``;

    if (getdata.success) {
      results = getdata.data.map(data => {
        const answerArray = data.answers.map(answer => '• ' + answer.text);
        const answerString = answerArray.join('\n');
        return `Question: ${data.question.trim()}\nAnswers:\n${answerString.trim()}`;
      }).join('\n═════════════════════\n');

      const chunkSize = 2500;
      for (let i = 0; i < results.length; i += chunkSize) {
        const chunk = results.substring(i, i + chunkSize);
        await bot.sendMessage(chatId, chunk, {
          disable_web_page_preview: true
        });
      }
    } else if (!getdata.success) {
      return bot.sendMessage(chatId, 'Data not found');
    }
  } catch (err) {
    await bot.sendMessage(String(process.env.DEV_ID), `[ ERROR MESSAGE ]\n\n• Username: @${userName}\n• File: funcs/brainly.js\n• Function: getBrainlyAnswer()\n• Input: ${input}\n\n${err}`.trim());
    return bot.sendMessage(chatId, 'An error occurred!');
  }
}

module.exports = {
  getBrainlyAnswer
};