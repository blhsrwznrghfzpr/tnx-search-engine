import HttpRequestEvent = GoogleAppsScript.Events.AppsScriptHttpRequestEvent;
import TextOutput = GoogleAppsScript.Content.TextOutput;
import { SpreadsheetRepository } from './sheet-repository';
import { SkillOption, SkillSearchService } from './skill-search.service';
import { OutfitOption, OutfitSearchService } from './outfit-search.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let global: any;

type Parameter = {
  type: 'skill' | 'outfit';
  query: string;
};

type Parameters = {
  [K in keyof Parameter]: Array<Parameter[K]>;
};

type SkillParameter = Parameter & Partial<SkillOption>;
type OutfitParameter = Parameter & Partial<OutfitOption>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isParams = (param: any): param is Parameters =>
  Array.isArray(param.query) &&
  param.query.length > 0 &&
  Array.isArray(param.type) &&
  param.type.length > 0;

const isSkillParam = (param: Parameter): param is SkillParameter => param.type === 'skill';
const isOutfitParam = (param: Parameter): param is OutfitParameter => param.type === 'outfit';

const skillSearchOutput = (param: SkillParameter): TextOutput => {
  const query = param.query;
  const option: SkillOption = {
    styles: param.styles ?? [],
    skillTypes: param.skillTypes ?? [],
    books: param.books ?? [],
  };
  if (!param.query && option.styles.length < 1) {
    return errorOutput('query is falsy');
  }

  const sheetRepository = new SpreadsheetRepository('技能');
  const skillSearchService = new SkillSearchService(sheetRepository);
  const skills = skillSearchService.search(query, option);

  const data = { ok: true, skills };
  const payload = JSON.stringify(data);
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
};

const outfitSearchOutput = (param: OutfitParameter): TextOutput => {
  const query = param.query;
  const option: OutfitOption = {
    styles: param.styles ?? [],
    majorCategories: param.majorCategories ?? [],
    companies: param.companies ?? [],
    books: param.books ?? [],
  };
  if (!param.query) {
    return errorOutput('query is falsy');
  }

  const sheetRepository = new SpreadsheetRepository('アウトフィット');
  const outfitSearchService = new OutfitSearchService(sheetRepository);
  const outfits = outfitSearchService.search(query, option);

  const data = { ok: true, outfits };
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
    return errorOutput('invalid params');
  }
  const param: Parameter = {
    ...params,
    type: params.type[0],
    query: params.query.join(' ').trim(),
  };
  if (isSkillParam(param)) {
    return skillSearchOutput(param);
  }
  if (isOutfitParam(param)) {
    return outfitSearchOutput(param);
  }
  return errorOutput('invalid type');
};

global.updateRefs = (): void => {
  const skillSheetRepository = new SpreadsheetRepository('技能');
  const skillSearchService = new SkillSearchService(skillSheetRepository);
  skillSearchService.refGroupUpdate();

  const outfitSheetRepository = new SpreadsheetRepository('アウトフィット');
  const outfitSearchService = new OutfitSearchService(outfitSheetRepository);
  outfitSearchService.refGroupUpdate();
};
