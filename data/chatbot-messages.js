const defaultMessages = [
  {
    role: "assistant",
    content: "您好！我是您的专业留学顾问助手。我可以为您提供以下服务：\n\n" +
             "📚 学校选择与申请指导\n" +
             "📝 文书写作建议\n" +
             "🎓 专业课程咨询\n" +
             "✈️ 签证办理指南\n" +
             "🏠 海外生活适应\n" +
             "💰 留学费用规划\n\n" +
             "请问您想了解哪方面的信息？"
  },
  {
    role: "system",
    content: "这是一个专业的留学咨询助手，擅长解答留学相关问题，提供准确的留学建议和信息指导。"
  }
];

const commonQuestions = [
  "各国留学申请流程是怎样的？",
  "如何选择适合的留学国家和学校？",
  "留学申请需要准备哪些材料？",
  "雅思/托福考试应该如何准备？",
  "留学费用预算怎么规划？",
  "如何提高名校申请成功率？",
  "海外生活需要注意什么？",
  "实习和就业机会如何？"
];

export { defaultMessages, commonQuestions }; 