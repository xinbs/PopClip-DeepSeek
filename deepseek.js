// #popclip extension for deepseek
// name: deepseek
// icon: iconify:logos:openai-icon
// language: javascript
// module: true
// entitlements: [network, shell]
// options: [{
// identifier: apikey, label: API Key, type: string,
// description: 'Obtain API key from https://platform.openai.com/account/api-keys'
// }]

const openai = require("axios").create({
    baseURL: "https://api.deepseek.com/v1/"
});

const model = "deepseek-chat";

async function callOpenAI(temperature, input, options, contentPrefix) {
    openai.defaults.headers.common.Authorization = `Bearer ${options.apikey}`;
    const content = `${contentPrefix}: \n\n${input.text.trim()}`;
    const messages = [{ "role": "user", "content": content }];
    const { data } = await openai.post("chat/completions", {
        model: model,
        temperature: temperature,
        messages
    });
    return data.choices[0].message.content.trim();
}


async function prompt(input, options) {
    try {
        const response = await callOpenAI(
            0.7,
            input,
            options,
            "你现在是一个百科全书，请用简洁的中文解释这个问题。"
        );

        // 复制到剪贴板并显示
        popclip.pasteText(response);
        popclip.showText(`${response}\n(已复制)`);

        return response;
    } catch (error) {
        console.error('提问功能出错:', error);
        popclip.showText('错误: ' + error.message);
        throw error;
    }
};


async function rewrite(input, options) {
    return await callOpenAI(
        0.2,
        input,
        options,
        "请用专业的语气重写以下文本，保持原文语言不变。"
    );
};

async function summarize(input, options) {
    return await callOpenAI(
        0.7,
        input,
        options,
        "请用中文尽可能简洁地总结以下内容："
    );
};


async function translate(input, options) {
    return await callOpenAI(
        0,
        input,
        options,
        "你现在是一位专业的中英互译翻译官。请将内容翻译成相反的语言：如果是中文就翻译成英文，如果是英文就翻译成中文。只需要翻译，不需要解释。待翻译内容是："
    );
};

async function grammar(input, options) {
    return await callOpenAI(
        0,
        input,
        options,
        "你现在是一位专业的英语语法专家。请检查以下英文文本是否有语法错误或者是单词拼写错误。如果有错误，请直接返回修正后的文本；如果没有错误，请直接返回原文。不需要解释。待检查内容是："
    );
};

exports.actions = [
    {
        title: "问答",
        after: "preview-result",
        code: prompt,
        icon: "symbol:wand.and.stars"
    },
    {
        title: "改写",
        after: "copy-result",
        code: rewrite,
        icon: "symbol:pencil.and.outline"
    }, {
        title: "总结",
        after: "preview-result",
        code: summarize,
        icon: "iconify:carbon:summary-kpi"
    }, {
        title: "翻译",
        after: "preview-result",
        code: translate,
        icon: "iconify:ri:translate"
    }, {
        title: "语法",
        after: "preview-result",
        code: grammar,
        icon: "symbol:checkmark.bubble"
    }
];