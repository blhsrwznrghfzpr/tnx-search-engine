import HttpRequestEvent = GoogleAppsScript.Events.AppsScriptHttpRequestEvent;
import TextOutput = GoogleAppsScript.Content.TextOutput;
import { SpreadsheetRepository } from './sheet-repository';
import { SkillOption, SkillSearchService } from './skill-search.service';
import { OutfitOption, OutfitSearchService } from './outfit-search.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let global: any;

type Type<T extends string> = {
  type: T;
};

type SkillParameter = Type<'skill'> & Partial<SkillOption>;
type OutfitParameter = Type<'outfit'> & Partial<OutfitOption>;

type Parameter = SkillParameter | OutfitParameter;
type Parameters = {
  [K in keyof Pick<Parameter, 'type'>]: Array<Parameter[K]>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isParams = (param: any): param is Parameters =>
  Array.isArray(param.type) && param.type.length > 0;

const skillSearchOutput = (param: SkillParameter): TextOutput => {
  const option: SkillOption = {
    query: param.query?.filter((q) => q.trim()) ?? [],
    styles: param.styles ?? [],
    skillTypes: param.skillTypes ?? [],
    books: param.books ?? [],
  };
  if (option.query.length < 1 && option.styles.length < 1) {
    return errorOutput('query is empty');
  }

  const sheetRepository = new SpreadsheetRepository('技能');
  const skillSearchService = new SkillSearchService(sheetRepository);
  const skills = skillSearchService.search(option);

  const data = { ok: true, skills };
  const payload = JSON.stringify(data);
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
};

const outfitSearchOutput = (param: OutfitParameter): TextOutput => {
  const option: OutfitOption = {
    query: param.query?.filter((q) => q.trim()) ?? [],
    styles: param.styles ?? [],
    majorCategories: param.majorCategories ?? [],
    companies: param.companies ?? [],
    books: param.books ?? [],
  };
  if (option.query.length < 1) {
    return errorOutput('query is empty');
  }

  const sheetRepository = new SpreadsheetRepository('アウトフィット');
  const outfitSearchService = new OutfitSearchService(sheetRepository);
  const outfits = outfitSearchService.search(option);

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
  };
  if (param.type === 'skill') {
    return skillSearchOutput(param);
  }
  if (param.type === 'outfit') {
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
