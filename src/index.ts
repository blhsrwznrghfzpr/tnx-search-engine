import HttpRequestEvent = GoogleAppsScript.Events.AppsScriptHttpRequestEvent;
import TextOutput = GoogleAppsScript.Content.TextOutput;
import { SpreadsheetRepository } from './sheet-repository';
import { SkillSearchService } from './skill-search.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let global: any;

type Parameter = SkillParameter;

interface SkillParameter {
  type: 'skill';
  query: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isParam = (param: any): param is Parameter => param.query && param.type;

const isSkillParam = (param: Parameter): param is SkillParameter => param.type === 'skill';

const skillSearchOutput = (param: SkillParameter): TextOutput => {
  const sheetRepository = new SpreadsheetRepository();
  const skillSearchService = new SkillSearchService(sheetRepository);

  const query = param.query;
  const skills = skillSearchService.search(query);
  const data = { ok: true, skills };
  const payload = JSON.stringify(data);
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
};

const errorOutput = (reason: string): TextOutput => {
  const data = { ok: false, reason };
  const payload = JSON.stringify(data);
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
};

global.doGet = (e: HttpRequestEvent): TextOutput => {
  const param = e.parameter;
  if (!isParam(param)) {
    return errorOutput('param is falty');
  }
  if (isSkillParam(param)) {
    return skillSearchOutput(param);
  }
  return errorOutput('invalid type');
};
