import HttpRequestEvent = GoogleAppsScript.Events.AppsScriptHttpRequestEvent;
import TextOutput = GoogleAppsScript.Content.TextOutput;
import { SpreadsheetRepository } from './sheet-repository';
import { SkillOption, SkillSearchService } from './skill-search.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let global: any;

type Parameter = {
  type: 'skill';
  query: string;
};

type Parameters = {
  [K in keyof Parameter]: Array<Parameter[K]>;
};

type SkillParameter = Parameter & Partial<SkillOption>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isParams = (param: any): param is Parameters => param.query && param.type;

const isSkillParam = (param: Parameter): param is SkillParameter => param.type === 'skill';

const skillSearchOutput = (param: SkillParameter): TextOutput => {
  const sheetRepository = new SpreadsheetRepository();
  const skillSearchService = new SkillSearchService(sheetRepository);

  const query = param.query;
  const option: SkillOption = {
    skillTypes: param.skillTypes ?? [],
    books: param.books ?? []
  };
  const skills = skillSearchService.search(query, option);

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
  const params = e.parameters;
  if (!isParams(params)) {
    return errorOutput('param is falty');
  }
  const param: Parameter = {
    ...params,
    type: params.type[0],
    query: params.query.join(' ')
  };
  if (isSkillParam(param)) {
    return skillSearchOutput(param);
  }
  return errorOutput('invalid type');
};
