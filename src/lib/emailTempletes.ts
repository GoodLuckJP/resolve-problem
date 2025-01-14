import { EmailTemplateData } from "@/type/email";

const styles = {
  container: `
    font-family: 'Arial', sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
  `,
  header: `
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
  `,
  title: `
    color: #1a1a1a;
    font-size: 24px;
    font-weight: bold;
    margin: 0;
    padding: 0;
  `,
  section: `
    background-color: #ffffff;
    padding: 20px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    margin-bottom: 16px;
  `,
  label: `
    color: #495057;
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 8px;
    display: block;
  `,
  content: `
    color: #212529;
    font-size: 15px;
    line-height: 1.6;
    margin: 0;
  `,
  footer: `
    text-align: center;
    padding-top: 24px;
    color: #6c757d;
    font-size: 14px;
  `,
};

const renderSection = (label: string, content: string) => {
  if (!content) return "";
  return `
    <div style="${styles.section}">
      <div style="${styles.label}">${label}</div>
      <div style="${styles.content}">${content}</div>
    </div>
  `;
};

const baseTemplate = (title: string, content: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.title}">${title}</h1>
        </div>
        ${content}
        <div style="${styles.footer}">
          このメールは自動送信されています。
        </div>
      </div>
    </body>
  </html>
`;

export const generateSpecificationTemplate = (data: EmailTemplateData) => {
  const content = `
    ${renderSection("プラン", data.plan || "")}
    ${renderSection("確認内容", data.confirmation || "")}
  `;
  return baseTemplate(data.title, content);
};

export const generateDevelopmentTemplate = (data: EmailTemplateData) => {
  const content = `
    ${renderSection("やりたいこと", data.goal || "")}
    ${renderSection("わかっていること", data.known_info || "")}
    ${renderSection("質問内容", data.question || "")}
  `;
  return baseTemplate(data.title, content);
};
